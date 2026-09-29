import { Injectable, signal, computed } from '@angular/core';
import { ESTADO, ESTADOS_RESPUESTA_APROBADOR, EstadoSolicitudUi } from '../models/documento.model';

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────

/** Alias del estado de UI; los valores viven en `ESTADO` (documento.model). */
export type EstadoSolicitudDemo = EstadoSolicitudUi;

export interface CuentaDemo {
  recordId: string;
  status: string;
  element: string;
  group: string;
  account: string;
  subAccount1: string;
  subAccount2: string;
  subAccount3: string;
  accountName: string;
  imputable: string;
  previousCode: string;
  institutionalScopes: string;
  aep: string;
  reciprocal: string;
}

export interface HistorialDemo {
  estado: EstadoSolicitudDemo;
  fecha: string;
  usuario: string;
  perfil: string;
  comentario?: string;
}

export interface SolicitudDemo {
  id: string;
  numero: string;
  tipoDocumento: string;
  tipoAccion: string;
  estado: EstadoSolicitudDemo;
  fecha: string;
  entidad: string;
  /** Código MEF de la entidad creadora (ej. "0001", "1011"). */
  entidadCodigo: string;
  unidad: string;
  creador: string;
  justificacion: string;
  organoLinea: string;
  plan: string;
  cuentas: CuentaDemo[];
  archivos: string[];
  historial: HistorialDemo[];
}

// ─────────────────────────────────────────────
// SERVICIO
// ─────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class SolicitudesStateService {

  private readonly _solicitudes = signal<SolicitudDemo[]>([]);

  // ── Lecturas ──────────────────────────────────

  readonly solicitudes = this._solicitudes.asReadonly();

  // Bandeja del CREADOR — todas sus solicitudes
  readonly bandejaCreador = computed(() => this._solicitudes());

  // Bandeja del APROBADOR — excluye ELABORADO y ELIMINADO (internos del creador)
  readonly bandejaAprobador = computed(() =>
    this._solicitudes().filter(s =>
      s.estado === ESTADO.VERIFICADO ||
      s.estado === ESTADO.OBSERVADO ||
      s.estado === ESTADO.APROBADO ||
      s.estado === ESTADO.RECHAZADO
    )
  );

  // ── Contadores por sección ─────────────────────

  // Creador
  readonly creadorRecibidosCount = computed(() =>
    this._solicitudes().filter(s => ESTADOS_RESPUESTA_APROBADOR.includes(s.estado)).length
  );
  readonly creadorEnviadosCount = computed(() =>
    this._solicitudes().filter(s => s.estado === ESTADO.VERIFICADO).length
  );
  readonly creadorBorradoresCount = computed(() =>
    this._solicitudes().filter(s => s.estado === ESTADO.ELABORADO).length
  );
  readonly creadorPapeleraCount = computed(() =>
    this._solicitudes().filter(s => s.estado === ESTADO.ELIMINADO).length
  );

  // Aprobador
  readonly aprobadorRecibidosCount = computed(() =>
    this._solicitudes().filter(s => s.estado === ESTADO.VERIFICADO).length
  );
  readonly aprobadorEnviadosCount = computed(() =>
    this._solicitudes().filter(s => ESTADOS_RESPUESTA_APROBADOR.includes(s.estado)).length
  );

  /**
   * Total de documentos en el backend para la consulta vigente. Con la
   * bandeja paginada, `solicitudes()` es solo la página cargada: el total
   * real para el paginador viene del servidor.
   */
  private readonly _bandejaTotal = signal(0);
  readonly bandejaTotal = this._bandejaTotal.asReadonly();

  loadAll(items: SolicitudDemo[], total?: number): void {
    this._solicitudes.set(items);
    this._bandejaTotal.set(total ?? items.length);
  }

  /**
   * Inserta o actualiza un único elemento en la lista sin reemplazar el resto.
   * Usado cuando se carga el detalle de una solicitud por acceso directo al URL.
   */
  upsertOne(item: SolicitudDemo): void {
    const lista = this._solicitudes();
    const idx = lista.findIndex(s => s.id === item.id);
    if (idx === -1) {
      this._solicitudes.set([item, ...lista]);
    } else {
      this._solicitudes.set(lista.map(s => s.id === item.id ? item : s));
    }
  }

  obtenerPorId(id: string): SolicitudDemo | undefined {
    return this._solicitudes().find(s => s.id === id);
  }

}
