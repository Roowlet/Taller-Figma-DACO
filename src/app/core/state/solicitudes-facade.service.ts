import { Injectable, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, interval, map, tap, catchError, throwError, switchMap, of } from 'rxjs';

import {
  SolicitudesApiService,
  SolicitudResponse,
  CreateSolicitudDto,
  CuentaItemResponse,
  HistorialItem,
  BandejaQuery,
  BandejaPaginada,
} from '../api/solicitudes-api.service';
import {
  SolicitudesStateService,
  SolicitudDemo,
  CuentaDemo,
  HistorialDemo,
  EstadoSolicitudDemo,
} from './solicitudes-state.service';
import type { SolicitudeHeaderRole } from '../../shared/components/solicitude-header/solicitude-header.component';
import { ESTADO, EstadoDocumento } from '../models/documento.model';

/** Intervalo de refresco automático de la bandeja del aprobador (ms). */
const BANDEJA_POLLING_INTERVAL_MS = 30_000;

const ESTADO_MAP: Record<string, EstadoSolicitudDemo> = {
  ELABORADO: ESTADO.ELABORADO,
  VERIFICADO: ESTADO.VERIFICADO,
  APROBADO: ESTADO.APROBADO,
  RECHAZADO: ESTADO.RECHAZADO,
  OBSERVADO: ESTADO.OBSERVADO,
  ELIMINADO: ESTADO.ELIMINADO,
};

/**
 * `NUEVO` es el estado interno del documento mientras se construye: nace así
 * (`@default(NUEVO)` en schema.prisma) y recién al guardar pasa a ELABORADO,
 * que es cuando el backend le genera el número formal. Un documento que se
 * queda en NUEVO es un guardado que falló a medias — no es del usuario y no
 * debe listarse. No tiene equivalente en `EstadoSolicitudDemo` a propósito.
 */
const ESTADO_EN_CONSTRUCCION = 'NUEVO';

/**
 * La bandeja responde en dos formas: array plano (sin page/limit) u objeto
 * paginado. Se normaliza a { items, total } — el total del backend es el que
 * alimenta el paginador cuando la página solo carga una porción.
 */
function normalizarBandeja(res: SolicitudResponse[] | BandejaPaginada): { items: SolicitudResponse[]; total: number } {
  if (Array.isArray(res)) return { items: res, total: res.length };
  return { items: res.data, total: res.total };
}

/** ¿El documento es uno real del usuario, o un intento incompleto? */
function esVisible(r: { estado: string }): boolean {
  return r.estado !== ESTADO_EN_CONSTRUCCION;
}

/**
 * Traduce el estado del backend. Antes, cualquier valor no mapeado caía a
 * 'Elaborado' en silencio: así fue como los documentos en NUEVO se mostraron
 * durante meses como elaborados y sin número. Ahora un estado desconocido
 * (uno que el backend agregue después) se avisa en consola en vez de
 * disfrazarse.
 */
function mapEstado(estado: string): EstadoSolicitudDemo {
  const mapeado = ESTADO_MAP[estado];
  if (mapeado) {
    return mapeado;
  }

  if (estado !== ESTADO_EN_CONSTRUCCION) {
    console.warn(
      `[SolicitudesFacade] Estado desconocido "${estado}": se muestra como Elaborado. `
      + 'Agregarlo a ESTADO_MAP.',
    );
  }

  return ESTADO.ELABORADO;
}

function mapCuenta(c: CuentaItemResponse): CuentaDemo {
  return {
    recordId: c.id,
    status: c.esVigente ? 'Activo' : 'Inactivo',
    element: c.elemento,
    group: c.grupo ?? '',
    account: c.cuenta ?? '',
    subAccount1: c.subcuenta1 ?? '',
    subAccount2: c.subcuenta2 ?? '',
    subAccount3: c.subcuenta3 ?? '',
    accountName: c.nombre,
    imputable: c.esImputable ? 'Sí' : 'No',
    previousCode: c.codigoAnterior ?? '',
    institutionalScopes: (c.ambitos ?? []).map(a => a.ambitoInstitucionalId).join(', '),
    aep: c.aplicaExtraPresupuestaria ? 'Sí' : 'No',
    reciprocal: c.esReciproca ? 'Sí' : 'No',
  };
}

function mapHistorial(h: HistorialItem): HistorialDemo {
  // En el modelo v2 el perfil ya no incluye entidad/unidad. Solo el rol.
  const rolNombre = h.perfil?.cfgPerfil?.rol?.nombre ?? '';
  const perfil = rolNombre;
  // La aprobación automática (SCA) la ejecuta el sistema: el responsable
  // visible es SIAF - RP, no el usuario que disparó el envío.
  const esAutomatica = h.comentario === 'Aprobación automática';
  const nombreUsuario = esAutomatica
    ? 'SIAF - RP'
    : h.creador
      ? `${h.creador.nombres} ${h.creador.apellidoPaterno} ${h.creador.apellidoMaterno}`.trim()
      : 'Sistema';

  return {
    estado: mapEstado(h.estadoNuevo),
    fecha: new Date(h.createdAt).toLocaleString('es-PE'),
    usuario: nombreUsuario,
    perfil,
    comentario: h.comentario ?? undefined,
  };
}

/**
 * Toma el SolicitudResponse (modelo v2) y lo aplana al SolicitudDemo
 * que consume la UI. Acepta tanto campos nuevos (numero, itemsCuenta,
 * catDocumento, asuntoMotivo) como legacy (numeroSolicitud, cuentas,
 * tipoDocumento, justificacion).
 */
function mapResponse(r: SolicitudResponse): SolicitudDemo {
  // Reconstruir órgano y justificación desde `asuntoMotivo` con prefijo
  // "[organo]" si está; cae a campos legacy si vienen.
  let organo = r.organoLinea ?? '';
  let just = r.justificacion ?? r.asuntoMotivo ?? '';
  const match = (r.asuntoMotivo ?? '').match(/^\[([^\]]+)\]\s*(.*)$/);
  if (match) {
    organo = organo || match[1];
    just = match[2] || just;
  }

  const numeroFinal = r.numero ?? r.numeroSolicitud ?? '';
  const tipoNombre = r.catDocumento?.nombre ?? r.tipoDocumento?.nombre ?? '';
  const cuentasFuente = r.itemsCuenta ?? r.cuentas ?? [];
  const planId =
    r.detallePlanCuentas?.planContableNuevoId
    ?? cuentasFuente[0]?.cuentaContableOrigenId
    ?? '';

  const creadorNombre = r.creador
    ? `${r.creador.nombres} ${r.creador.apellidoPaterno} ${r.creador.apellidoMaterno}`.trim()
    : '';

  const entidadLabel = r.entidadCreadora
    ? `${r.entidadCreadora.siglas ?? ''} ${r.entidadCreadora.nombre ?? ''}`.trim()
    : '';

  return {
    id: r.id,
    numero: numeroFinal,
    tipoDocumento: tipoNombre,
    tipoAccion: r.tipoAccion,
    estado: mapEstado(r.estado),
    fecha: new Date(r.createdAt).toLocaleDateString('es-PE'),
    entidad: entidadLabel,
    entidadCodigo: r.entidadCreadora?.codMef ?? '',
    unidad: r.unidadCreadora?.nombre ?? '',
    creador: creadorNombre,
    justificacion: just,
    organoLinea: organo,
    plan: planId,
    cuentas: cuentasFuente.map(mapCuenta),
    archivos: (r.sustentos ?? []).map(s => s.archivo?.nombreOriginal ?? ''),
    historial: (r.historialEstados ?? []).map(mapHistorial),
  };
}

@Injectable({ providedIn: 'root' })
export class SolicitudesFacadeService {
  private readonly api = inject(SolicitudesApiService);
  private readonly state = inject(SolicitudesStateService);

  private readonly _isLoading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  /** Última bandeja cargada — para que `recargarBandeja` refresque la misma
   *  vista (rol + tipos + búsqueda/página) tras una acción masiva o el polling. */
  private _ultimoRol: 'creator' | 'approver' = 'creator';
  private _ultimosTipos?: string[];
  private _ultimaQuery?: BandejaQuery;

  /** Recarga la bandeja vigente (mismo rol, tipos y consulta de la última carga). */
  recargarBandeja(): void {
    if (this._ultimoRol === 'approver') this.cargarBandejaAprobador(this._ultimosTipos, this._ultimaQuery);
    else this.cargarBandejaCreador(this._ultimosTipos, this._ultimaQuery);
  }

  cargarBandejaCreador(tipos?: string[], query?: BandejaQuery): void {
    this._ultimoRol = 'creator';
    this._ultimosTipos = tipos;
    this._ultimaQuery = query;
    this._isLoading.set(true);
    this._error.set(null);
    this.api.bandejaCreador(tipos, query).subscribe({
      next: res => {
        const { items, total } = normalizarBandeja(res);
        this.state.loadAll(items.filter(esVisible).map(mapResponse), total);
        this._isLoading.set(false);
      },
      error: err => {
        this._error.set(err?.error?.message ?? 'Error al cargar la bandeja.');
        this._isLoading.set(false);
      },
    });
  }

  cargarBandejaAprobador(tipos?: string[], query?: BandejaQuery): void {
    this._ultimoRol = 'approver';
    this._ultimosTipos = tipos;
    this._ultimaQuery = query;
    this._isLoading.set(true);
    this._error.set(null);
    this.api.bandejaAprobador(tipos, query).subscribe({
      next: res => {
        const { items, total } = normalizarBandeja(res);
        this.state.loadAll(items.filter(esVisible).map(mapResponse), total);
        this._isLoading.set(false);
      },
      error: err => {
        this._error.set(err?.error?.message ?? 'Error al cargar la bandeja.');
        this._isLoading.set(false);
      },
    });
  }

  iniciarBandeja(role: SolicitudeHeaderRole | string, destroyRef: DestroyRef, tipos?: string[], query?: BandejaQuery): void {
    if (role === 'approver') {
      this.cargarBandejaAprobador(tipos, query);
      // El polling repite la ÚLTIMA consulta, no la inicial: si el usuario
      // buscó o cambió de página, el refresco automático no debe pisarlo.
      interval(BANDEJA_POLLING_INTERVAL_MS)
        .pipe(takeUntilDestroyed(destroyRef))
        .subscribe(() => this.cargarBandejaAprobador(this._ultimosTipos, this._ultimaQuery));
    } else {
      this.cargarBandejaCreador(tipos, query);
    }
  }

  cargarDetalle(id: string): Observable<void> {
    this._isLoading.set(true);
    this._error.set(null);
    return this.api.obtenerDetalle(id).pipe(
      tap(r => {
        this.state.upsertOne(mapResponse(r));
        this._isLoading.set(false);
      }),
      map(() => void 0),
      catchError(err => {
        this._error.set(err?.error?.message ?? 'Error al cargar el detalle.');
        this._isLoading.set(false);
        return throwError(() => err);
      }),
    );
  }

  crearSolicitud(dto: CreateSolicitudDto): Observable<SolicitudDemo> {
    return this.api.crear(dto).pipe(
      map(r => {
        const demo = mapResponse(r);
        // El documento nace en NUEVO y todavía no tiene número: no entra a la
        // lista hasta que el guardado lo lleve a ELABORADO. Igual se devuelve,
        // porque quien llama necesita el id para seguir la cadena de guardado.
        if (esVisible(r)) {
          this.state.loadAll([demo, ...this.state.solicitudes()]);
        }
        return demo;
      }),
    );
  }

  verificar(id: string): Observable<void> {
    return this.cambiarEstadoYRefrescar(id, 'VERIFICADO');
  }
  eliminar(id: string): Observable<void> {
    return this.cambiarEstadoYRefrescar(id, 'ELIMINADO');
  }
  aprobar(id: string): Observable<void> {
    return this.cambiarEstadoYRefrescar(id, 'APROBADO');
  }
  observar(id: string, comentario: string): Observable<void> {
    return this.cambiarEstadoYRefrescar(id, 'OBSERVADO', comentario);
  }
  rechazar(id: string, comentario: string, motivo?: string): Observable<void> {
    return this.cambiarEstadoYRefrescar(id, 'RECHAZADO', comentario, motivo);
  }

  /**
   * El backend ya no devuelve el documento completo en cambiarEstado
   * (solo {message, numero}). Tras el cambio, re-obtenemos el detalle
   * para refrescar la lista local con el estado nuevo.
   */
  private cambiarEstadoYRefrescar(
    id: string,
    estadoNuevo: EstadoDocumento,
    comentario?: string,
    motivo?: string,
  ): Observable<void> {
    return this.api.cambiarEstado(id, { estadoNuevo, comentario, motivo }).pipe(
      switchMap(() => this.api.obtenerDetalle(id)),
      tap(r => {
        const demo = mapResponse(r);
        const lista = this.state.solicitudes().map(s => (s.id === r.id ? demo : s));
        this.state.loadAll(lista);
      }),
      map(() => void 0),
      catchError(err => throwError(() => err)),
    );
  }
}
