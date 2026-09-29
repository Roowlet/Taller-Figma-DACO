import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { APP_CONFIG } from '../config/app.config';
import { EstadoDocumento } from '../models/documento.model';
import type { CuentaBancariaDatos } from '../../modules/tesoreria/cuentas-bancarias/models/cuenta-bancaria.model';
import type { ModificacionApmDatos } from '../../modules/presupuesto/modificacion-apm/models/modificacion-apm.model';

// ─────────────────────────────────────────────────────────────
// DTOs de creación — mantienen los nombres viejos por compat
// con el formulario actual; el backend hace el mapping interno
// (cuentas[].entidades[*].entidadPublicaId → entidadId, etc.).
// ─────────────────────────────────────────────────────────────

export interface CuentaSolicitudDto {
  planContableId?: string;
  cuentaContableOrigenId?: string;
  codigoCompleto: string;
  elemento: string;
  grupo?: string;
  cuenta?: string;
  subcuenta1?: string;
  subcuenta2?: string;
  subcuenta3?: string;
  nivel: number;
  nombre: string;
  esImputable: boolean;
  naturaleza: string;
  tipoElemento: string;
  esMonetaria: boolean;
  tieneDinamicaContable?: boolean;
  dinamicaDebita?: string;
  dinamicaAcredita?: string;
  esVigente?: boolean;
  esVisible?: boolean;
  fechaFin?: string;
  ambitos?: { ambitoInstitucionalId: string }[];
  /** El backend lo recibe como `entidadPublicaId` y lo guarda como `entidadId`. */
  entidades?: { entidadPublicaId: string }[];
  acActivo?: string;
  pcPasivo?: string;
  ancActivo?: string;
  pncPasivo?: string;
  seccionesModificadas?: string[];
}

export interface CreateSolicitudDto {
  /** Apunta al catDocumento.id (SCC, SCMPC, STAA, SCA, SRAA). */
  tipoDocumentoId: string;
  tipoAccion: string;
  fechaRequerimiento: string;
  organoLinea: string;
  justificacion: string;
  provieneEntidadExterna?: boolean;
  entidadExternaId?: string;
  // ── SCMPC ──
  fechaInicioVigor?: string;
  tipoPlan?: string;
  planNombre?: string;
  planDescripcion?: string;
  planContableReemplazarId?: string;
  /** Documento origen para SRAA reversión — mapea a documentoOrigenId. */
  solicitudReferenciaId?: string;
  cuentas: CuentaSolicitudDto[];
}

export interface CambiarEstadoDto {
  estadoNuevo: EstadoDocumento;
  comentario?: string;
  /** Motivo estructurado del rechazo (antes viajaba incrustado en el comentario). */
  motivo?: string;
}

// ─────────────────────────────────────────────────────────────
// Respuestas — reflejan el modelo v2 del backend
// ─────────────────────────────────────────────────────────────

export interface HistorialItem {
  id: string;
  estadoAnterior: EstadoDocumento | null;
  estadoNuevo: EstadoDocumento;
  comentario: string | null;
  createdAt: string;
  creador: {
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
  } | null;
  /**
   * En el modelo v2 el perfilId apunta a SegUsuarioPerfil. Solo tenemos rol
   * directo (vía cfgPerfil). La entidad/unidad del perfil ya no viene en el
   * historial — se deriva del usuario si se necesita.
   */
  perfil: {
    cfgPerfil: {
      rol: { codigo: string; nombre: string } | null;
    } | null;
  } | null;
}

export interface SustentoItem {
  id: string;
  tipoSustento: string;
  archivo: { nombreOriginal: string; storagePath: string } | null;
}

/**
 * Item de cuenta dentro de un documento SCC/SCMPC.
 * Reemplaza al viejo `SolicitudCuentaContable`.
 */
export interface CuentaItemResponse {
  id: string;
  cuentaContableOrigenId: string | null;
  codigoCompleto: string;
  elemento: string;
  grupo: string | null;
  cuenta: string | null;
  subcuenta1: string | null;
  subcuenta2: string | null;
  subcuenta3: string | null;
  nivel: number;
  nombre: string;
  esImputable: boolean;
  naturaleza: string;
  tipoElemento: string;
  esMonetaria: boolean;
  esVigente: boolean;
  esVisible?: boolean;
  fechaFin?: string | null;
  ambitos: {
    ambitoInstitucionalId: string;
    ambitoInstitucional?: { codigo: string; descripcion: string } | null;
  }[];
  /** Ahora la pivote tiene `entidadId` (era `entidadPublicaId`). */
  entidades: { entidadId: string; entidad?: { codMef: string; siglas: string; nombre: string } | null }[];
  acActivo?: string | null;
  pcPasivo?: string | null;
  ancActivo?: string | null;
  pncPasivo?: string | null;
  tieneDinamicaContable?: boolean | null;
  dinamicaDebita?: string | null;
  dinamicaAcredita?: string | null;
  dinamicaObjeto?: string | null;
  dinamicaSaldos?: string | null;
  aplicaExtraPresupuestaria?: boolean;
  esReciproca?: boolean;
  esParaEntidadEstado?: boolean;
  seccionesModificadas?: string[] | null;
  codigoAnterior?: string | null;
  nombreAnterior?: string | null;
  /** True si la cuenta origen está referenciada en otros procesos (STAA/SRAA). */
  estaEnUso?: boolean;
  /** Plan contable de la cuenta origen — restaura el plan referenciado en modificación. */
  planContableOrigenId?: string | null;
}

export interface ClaseAjusteItemResponse {
  id: string;
  /** Antes solicitudId. */
  docClaseAjusteId: string;
  orden: number;
  codigoClase: string;
  descripcionClase: string;
  codigoDetalle: string | null;
  descripcionDetalle: string | null;
  /** Vigencia propuesta (RN-022) — se materializa al aprobar. */
  vigente?: boolean;
  fechaInicio?: string | null;
  fechaFin?: string | null;
  /** Patrón de modificación: false = seleccionado pero aún no editado. */
  modificado?: boolean;
}

export interface TipoAsientoItemResponse {
  id: string;
  /** Antes solicitudId. */
  docTipoAsientoAjusteId: string;
  orden: number;
  ambitoId: string;
  claseAjusteId: string;
  detalleAjusteId: string;
  /** Vigencia propuesta (RN-013) — se materializa al aprobar. */
  vigente?: boolean;
  fechaInicio?: string | null;
  fechaFin?: string | null;
  /** Patrón de modificación: false = seleccionado pero aún no editado. */
  modificado?: boolean;
  cuentas: {
    id: string;
    cuentaContableId: string;
    tipoMovimiento: string;
    /** El detalle la incluye — sin ella el frontend no puede pintar código/nombre. */
    cuentaContable?: { codigoCompleto: string; nombre: string } | null;
  }[];
  // Relations expandidas (cuando el detalle las trae)
  ambito?: { codigo: string; descripcion: string } | null;
  claseAjuste?: { codigo: string; descripcion: string } | null;
  detalleAjuste?: { codigo: string; descripcion: string } | null;
}

/** SRAA — DocAsientoAjuste (1:1 con documento) + movimientos. */
export interface AsientoAjusteResponse {
  documentoId: string;
  tipoAsientoAjusteId: string;
  fechaAsiento: string;
  glosa: string;
  movimientos: {
    id: string;
    cuentaContableId: string;
    tipoMovimiento: string;
    monto: string | number;
    glosaDetalle: string | null;
    orden: number;
    cuentaContable?: { codigoCompleto: string; nombre: string };
  }[];
  /** Etiqueta del período presupuestal elegido (ej. "2026 - 08"). */
  periodoLabel?: string | null;
  tipoAsientoAjuste?: {
    /** El backend hace `include` del row completo, así que el id siempre viene. */
    id: string;
    codigo: string;
    ambito?: { codigo: string; descripcion: string };
    /** Todos los ámbitos del tipo (pivote) — la UI muestra el del usuario. */
    ambitos?: { ambitoInstitucionalId: string; ambitoInstitucional?: { id?: string; codigo: string; descripcion: string } }[];
    claseAjuste?: { codigo: string; descripcion: string };
    detalleAjuste?: { codigo: string; descripcion: string };
    /** Cuentas configuradas del tipo (el detalle las incluye desde BE #16). */
    cuentas?: { cuentaContableId: string; tipoMovimiento: string; cuentaContable?: { codigoCompleto: string; nombre: string } }[];
  };
}

/**
 * Documento — reemplaza al viejo `SolicitudResponse`.
 * Mantenemos el alias del nombre porque casi todo el frontend usa
 * `SolicitudResponse` como tipo. Los campos legacy (`numeroSolicitud`,
 * `tipoDocumento`, `cuentas`, `justificacion`) se conservan como opcionales
 * para compat: el código UI puede leer estos o los nuevos según necesidad.
 */
export interface SolicitudResponse {
  id: string;

  // ── Identificación nueva ──
  /** Número formal generado al pasar a ELABORADO (ej. "PCC-SCC-00001-2026-MEF-DGCP"). */
  numero: string | null;
  catDocumento: { id?: string; codigo: string; nombre: string } | null;
  catDocumentoId?: string;
  tipoAccion: string;
  estado: EstadoDocumento;

  // ── Contexto ──
  sistemaId?: string;
  sistema?: { nombreCorto?: string; nombre: string } | null;
  /** Razón / motivo del documento (antes "justificacion"). */
  asuntoMotivo: string;
  esInterno?: boolean;
  entidadCreadora: { id: string; codMef: string; siglas: string; nombre: string } | null;
  unidadCreadora: { id: string; sigla?: string; nombre: string } | null;
  creador: {
    id: string;
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
  } | null;

  // ── Destino ──
  entidadDestinoId?: string | null;
  unidadDestinoId?: string | null;
  rolDestinoId?: string | null;

  // ── Fechas del flujo ──
  fechaRegistro?: string;
  fechaEvaluacion?: string | null;
  fechaAprobacion?: string | null;
  createdAt: string;
  updatedAt?: string;

  // ── Contabilización Motor MEF ──
  estadoContabilizacion?: string;
  fechaContabilizacion?: string | null;
  numeroAsientoContable?: string | null;

  // ── Generación automática / reversión ──
  documentoOrigenId?: string | null;
  documentoOrigen?: { id: string; numero: string | null } | null;
  esGeneradoAutomaticamente?: boolean;

  // ── Items y extensiones ──
  itemsCuenta?: CuentaItemResponse[];
  detalleCuentaContable?: { documentoId: string } | null; // SCC
  detallePlanCuentas?: {
    documentoId: string;
    fechaInicioVigor: string;
    planContableNuevoId: string | null;
    planContableReemplazarId: string | null;
    planContableNuevo?: { id: string; numeroPlanContable: string; descripcion: string } | null;
    planContableReemplazar?: { id: string; numeroPlanContable: string; descripcion: string } | null;
  } | null; // SCMPC
  detalleClaseAjuste?: { documentoId: string; tipoModificacion?: string | null; items: ClaseAjusteItemResponse[] } | null; // SCA
  detalleTipoAsiento?: { documentoId: string; tipoModificacion?: string | null; items: TipoAsientoItemResponse[] } | null; // STAA
  detalleEvento?: { documentoId: string; tipoModificacion?: string | null; items: EventoItemResponse[] } | null; // SCE / SCM
  detalleConcepto?: { documentoId: string; tipoModificacion?: string | null; items: ConceptoItemResponse[] } | null; // SCEC
  detalleEventoContable?: {
    documentoId: string;
    tipoModificacion?: string | null;
    nombreCatalogo?: string | null;
    descripcionCatalogo?: string | null;
    catalogoReemplazadoId?: string | null;
    fechaInicioCatalogo?: string | null;
    catalogoReemplazado?: { id: string; nombre: string } | null;
    items: EventoContableItemResponse[];
  } | null; // SEC / SCMEC
  detalleAsientoAjuste?: AsientoAjusteResponse | null; // SRAA
  /** Taller: cuenta bancaria propuesta en la solicitud SRCB (proceso de ejemplo). */
  detalleCuentaBancaria?: (CuentaBancariaDatos & { documentoId: string }) | null; // SRCB
  /** Taller: modificación de la APM propuesta en la solicitud SMAPM. */
  detalleModificacionApm?: (ModificacionApmDatos & { documentoId: string }) | null; // SMAPM
  detalleConfiguracionMensual?: {
    documentoId: string;
    periodoContableId: string;
    fechaVigenciaAdicionalAnterior: string;
    fechaVigenciaAdicionalPropuesta: string;
    estaAbiertoPropuesto?: boolean;
    periodo?: {
      etiqueta: string;
      fechaInicio: string;
      fechaFin: string;
      ejercicio?: {
        entidad?: { nombre: string } | null;
        unidadEjecutora?: { nombre: string } | null;
      } | null;
    } | null;
  } | null; // CAM

  // ── Anexos ──
  sustentos?: SustentoItem[];
  historialEstados?: HistorialItem[];
  notificaciones?: {
    id: string;
    tipo: string;
    titulo: string;
    mensaje: string;
    leida: boolean;
    createdAt: string;
  }[];

  _count?: { itemsCuenta?: number; sustentos?: number };

  // ── Aliases legacy (consumidos por código UI que aún no se migró) ──
  /** @deprecated Usa `numero`. Se entrega para compat. */
  numeroSolicitud?: string | null;
  /** @deprecated Usa `catDocumento`. */
  tipoDocumento?: { nombre: string; codigo?: string } | null;
  tipoDocumentoId?: string;
  /** @deprecated Usa `asuntoMotivo` (sin el prefijo [organo]). */
  justificacion?: string;
  /** @deprecated El órgano se serializa en `asuntoMotivo` con prefijo `[organo]`. */
  organoLinea?: string;
  /** @deprecated Usa `itemsCuenta`. */
  cuentas?: CuentaItemResponse[];
  /** @deprecated Usa `detalleClaseAjuste.items`. */
  claseAjusteItems?: ClaseAjusteItemResponse[];
  /** @deprecated Usa `detalleTipoAsiento.items`. */
  tipoAsientoItems?: TipoAsientoItemResponse[];
  /** @deprecated Usa `detalleAsientoAjuste`. */
  asientoItems?: AsientoAjusteResponse[];
  /** @deprecated Usa `numero` o `numeroAsientoContable`. */
  numeroDocumentoContable?: string | null;
  /** @deprecated Usa `documentoOrigen`. */
  solicitudReferencia?: { id: string; numeroDocumentoContable: string | null; numeroSolicitud: string | null } | null;
  /** @deprecated Usa `documentoOrigenId`. */
  solicitudReferenciaId?: string | null;
  provieneEntidadExterna?: boolean | null;
  entidadExternaId?: string | null;
  /** Entidad externa seleccionada — para restaurar la card al reabrir. */
  entidadExterna?: { id: string; codMef: string; siglas: string; nombre: string } | null;
}

// ── Catálogo de Eventos (SCE / SCM) y de Conceptos (SCEC) ──

/** Columnas de atributo del evento; los valores son ids de `CatLista`. */
export const ATRIBUTOS_EVENTO = [
  'tipoOperacionId', 'clasificadorIngresoId', 'medioPercepcionId', 'fuenteFinanciamientoId',
  'categoriaGastoId', 'clasificadorObjetoGastoId', 'clasificadorProgramaticoId', 'tipoProyectoId',
  'tipoAdministracionId', 'tipoObraId', 'tipoModalidadId', 'proyectoInversionId', 'medioPagoId',
  'tipoCommodityId', 'usoId', 'tipoIngresoId', 'tipoSalidaId', 'tipoBienId', 'clasificacionActivoId',
] as const;
export type AtributoEvento = (typeof ATRIBUTOS_EVENTO)[number];

/** Evento propuesto en una solicitud SCE/SCM (payload de `guardarEventoItems`). */
export interface EventoItemDto {
  orden: number;
  /** Modificación: id del evento del catálogo que se modifica. */
  eventoOrigenId?: string | null;
  /** Etapa del menú ("1.1", "2.3"…). */
  etapaCodigo: string;
  descripcion: string;
  atributos?: Partial<Record<AtributoEvento, string | null>>;
  cut?: boolean | null;
  ambitoIds: string[];
  conceptoIds: string[];
  vigente?: boolean;
  fechaInicio?: string | null;
  fechaFin?: string | null;
  modificado?: boolean;
}

/** Ítem tal como lo devuelve `obtenerDetalle` (`detalleEvento.items`). */
export type EventoItemResponse = Partial<Record<AtributoEvento, string | null>> & {
  id: string;
  orden: number;
  eventoOrigenId: string | null;
  claseEventoId: string;
  etapaEventoId: string;
  descripcion: string;
  cut: boolean | null;
  /** Foto del texto de cada atributo al grabar; el documento conserva lo que decía al aprobarse. */
  atributosTexto?: Partial<Record<AtributoEvento, { codigo: string; valor: string }>> | null;
  claveUnicidad: string | null;
  vigente: boolean;
  fechaInicio: string | null;
  fechaFin: string | null;
  modificado: boolean;
  claseEvento?: { codigo: string; nombre: string } | null;
  etapaEvento?: { codigoMenu: string; nombre: string } | null;
  eventoOrigen?: { id: string; codigo: string; descripcion: string } | null;
  ambitos: { ambitoInstitucionalId: string; ambitoInstitucional?: { id: string; codigo: string; descripcion: string } | null }[];
  conceptos: { conceptoId: string; concepto?: { id: string; codigo: string; denominacion: string } | null }[];
};

export interface ConceptoItemDto {
  orden: number;
  conceptoOrigenId?: string | null;
  codigo: string;
  denominacion: string;
  vigente?: boolean;
  fechaInicio?: string | null;
  fechaFin?: string | null;
  modificado?: boolean;
}

export interface ConceptoItemResponse {
  id: string;
  orden: number;
  conceptoOrigenId: string | null;
  codigo: string;
  denominacion: string;
  vigente: boolean;
  fechaInicio: string | null;
  fechaFin: string | null;
  modificado: boolean;
  conceptoOrigen?: { id: string; codigo: string; denominacion: string } | null;
}

// ── Catálogo de Eventos Contables (SEC / SCMEC) ──

export interface EventoContableAsientoItemDto {
  /** Consecutivo dentro del asiento; el backend lo renumera 1..n. */
  item?: number;
  naturaleza: 'Debe' | 'Haber';
  cuentaContableId: string;
  /** Uno de los conceptos asociados al evento. */
  conceptoId: string;
}

export interface EventoContableAsientoDto {
  /** 1 a 9. */
  numero: number;
  items: EventoContableAsientoItemDto[];
}

/** Evento contable propuesto en un SEC/SCMEC (payload de `guardarEventoContableItems`). */
export interface EventoContableItemDto {
  orden: number;
  /** Modificación por vigencia: evento contable que se modifica. */
  eventoContableOrigenId?: string | null;
  eventoId: string;
  /** Reemplazo (RN-024): evento contable que queda sin vigencia al aprobar. */
  eventoContableAnteriorId?: string | null;
  asientos: EventoContableAsientoDto[];
  vigente?: boolean;
  fechaInicio?: string | null;
  fechaFin?: string | null;
  modificado?: boolean;
}

/** Sección I del MFD: datos del catálogo nuevo (solo carga masiva). */
export interface DatosCatalogoEventoContableDto {
  nombre: string;
  descripcion?: string | null;
  catalogoReemplazadoId?: string | null;
  fechaInicio?: string | null;
}

/** Ítem tal como lo devuelve `obtenerDetalle` (`detalleEventoContable.items`). */
export interface EventoContableItemResponse {
  id: string;
  orden: number;
  eventoContableOrigenId: string | null;
  eventoId: string;
  eventoContableAnteriorId: string | null;
  vigente: boolean;
  fechaInicio: string | null;
  fechaFin: string | null;
  modificado: boolean;
  evento: {
    id: string; codigo: string; descripcion: string; vigente: boolean;
    claseEvento: { codigo: string; nombre: string };
    etapaEvento: { codigoMenu: string; nombre: string };
    ambitos: { ambitoInstitucionalId: string; ambitoInstitucional: { id: string; codigo: string; descripcion: string } }[];
    conceptos: { conceptoId: string; concepto: { id: string; codigo: string; denominacion: string } }[];
  };
  eventoContableOrigen?: { id: string; codigo: string } | null;
  eventoContableAnterior?: { id: string; codigo: string } | null;
  asientos: {
    id: string; numero: number;
    items: { id: string; item: number; naturaleza: 'Debe' | 'Haber'; cuentaContableId: string; conceptoId: string;
      /** Foto del texto al grabar; el documento conserva lo que decía al aprobarse. */
      cuentaCodigo?: string | null; cuentaNombre?: string | null;
      conceptoCodigo?: string | null; conceptoDenominacion?: string | null;
      cuentaContable: { id: string; codigoCompleto: string; nombre: string }; concepto: { id: string; codigo: string; denominacion: string } }[];
  }[];
}

export interface RegistroAsientoResponse {
  id: string;
  /** Número formal del documento SRAA. */
  numero: string | null;
  /** N° de Documento Contable (ej: AA-093-2026-01), asignado al aprobar. */
  numeroAsientoContable?: string | null;
  tipoAccion: string;
  fechaAprobacion?: string | null;
  documentoOrigenId?: string | null;
  detalleAsientoAjuste: AsientoAjusteResponse | null;
  /** @deprecated Usa `numero`. */
  numeroDocumentoContable?: string | null;
  /** @deprecated Usa `detalleAsientoAjuste`. */
  asientoItems?: AsientoAjusteResponse[];
}

@Injectable({ providedIn: 'root' })
export class SolicitudesApiService {
  private readonly http = inject(HttpClient);
  private readonly base = APP_CONFIG.api.baseUrl;

  crear(dto: CreateSolicitudDto): Observable<SolicitudResponse> {
    return this.http.post<SolicitudResponse>(`${this.base}/solicitudes`, dto);
  }

  bandejaCreador(tipos?: string[], query?: BandejaQuery): Observable<SolicitudResponse[] | BandejaPaginada> {
    return this.http.get<SolicitudResponse[] | BandejaPaginada>(
      `${this.base}/solicitudes/bandeja-creador${armarQueryBandeja(tipos, query)}`,
    );
  }

  bandejaAprobador(tipos?: string[], query?: BandejaQuery): Observable<SolicitudResponse[] | BandejaPaginada> {
    return this.http.get<SolicitudResponse[] | BandejaPaginada>(
      `${this.base}/solicitudes/bandeja-aprobador${armarQueryBandeja(tipos, query)}`,
    );
  }

  obtenerDetalle(id: string): Observable<SolicitudResponse> {
    return this.http.get<SolicitudResponse>(`${this.base}/solicitudes/${id}`);
  }

  cambiarEstado(id: string, dto: CambiarEstadoDto): Observable<{ message: string; numero?: string | null }> {
    return this.http.patch<{ message: string; numero?: string | null }>(
      `${this.base}/solicitudes/${id}/estado`,
      dto,
    );
  }

  listarSraaAprobados(): Observable<SolicitudResponse[]> {
    return this.http.get<SolicitudResponse[]>(`${this.base}/solicitudes/sraa-aprobados`);
  }

  listarRegistrosAsiento(): Observable<RegistroAsientoResponse[]> {
    return this.http.get<RegistroAsientoResponse[]>(`${this.base}/solicitudes/registros-asiento`);
  }

  guardarAsientoItems(
    solicitudId: string,
    items: {
      tipoAsientoAjusteId: string;
      glosa?: string;
      fechaContabilizacion?: string;
      periodoLabel?: string;
      cuentas: { cuentaContableId: string; tipoMovimiento: string; importe: number }[];
    }[],
  ): Observable<{ message: string; movimientos?: number }> {
    return this.http.post<{ message: string; movimientos?: number }>(
      `${this.base}/solicitudes/${solicitudId}/asiento-items`,
      { items },
    );
  }

  guardarTipoAsientoItems(
    solicitudId: string,
    items: {
      orden: number;
      ambitoId: string;
      claseAjusteId: string;
      detalleAjusteId: string;
      cuentas: { cuentaContableId: string; tipoMovimiento: string }[];
      vigente?: boolean;
      fechaInicio?: string | null;
      fechaFin?: string | null;
      modificado?: boolean;
    }[],
    tipoModificacion?: string,
  ): Observable<{ message: string; count: number }> {
    return this.http.post<{ message: string; count: number }>(
      `${this.base}/solicitudes/${solicitudId}/tipo-asiento-items`,
      { items, tipoModificacion },
    );
  }

  guardarClaseAjusteItems(
    solicitudId: string,
    items: {
      orden: number;
      codigoClase: string;
      descripcionClase: string;
      codigoDetalle?: string;
      descripcionDetalle?: string;
      vigente?: boolean;
      fechaInicio?: string | null;
      fechaFin?: string | null;
      modificado?: boolean;
    }[],
    tipoModificacion?: string,
  ): Observable<{ message: string; count: number }> {
    return this.http.post<{ message: string; count: number }>(
      `${this.base}/solicitudes/${solicitudId}/clase-ajuste-items`,
      { items, tipoModificacion },
    );
  }

  /** POST /solicitudes/:id/evento-items — eventos propuestos de un SCE/SCM (reemplazo completo). */
  guardarEventoItems(
    solicitudId: string,
    items: EventoItemDto[],
    tipoModificacion?: string,
  ): Observable<{ message: string; count: number }> {
    return this.http.post<{ message: string; count: number }>(
      `${this.base}/solicitudes/${solicitudId}/evento-items`,
      { items, tipoModificacion },
    );
  }

  /** POST /solicitudes/:id/concepto-items — conceptos propuestos de un SCEC. */
  guardarConceptoItems(
    solicitudId: string,
    items: ConceptoItemDto[],
    tipoModificacion?: string,
  ): Observable<{ message: string; count: number }> {
    return this.http.post<{ message: string; count: number }>(
      `${this.base}/solicitudes/${solicitudId}/concepto-items`,
      { items, tipoModificacion },
    );
  }

  /** POST /solicitudes/:id/evento-contable-items — eventos contables propuestos de un SEC/SCMEC (reemplazo completo). */
  guardarEventoContableItems(
    solicitudId: string,
    items: EventoContableItemDto[],
    tipoModificacion?: string,
    catalogo?: DatosCatalogoEventoContableDto,
  ): Observable<{ message: string; count: number }> {
    return this.http.post<{ message: string; count: number }>(
      `${this.base}/solicitudes/${solicitudId}/evento-contable-items`,
      { items, tipoModificacion, catalogo },
    );
  }

  /**
   * POST /solicitudes/:id/cuentas — reemplaza las cuentas de un SCC/SCMPC.
   *
   * Necesario para editar un documento existente: sin esto la página tenía que
   * crear uno nuevo para persistir cuentas modificadas.
   */
  guardarCuentas(id: string, cuentas: unknown[]): Observable<{ total: number }> {
    return this.http.post<{ total: number }>(`${this.base}/solicitudes/${id}/cuentas`, { cuentas });
  }

  /** PATCH /solicitudes/:id — actualizar campos editables (CREADOR en OBSERVADO/ELABORADO). */
  actualizar(
    id: string,
    dto: { justificacion?: string; organoLinea?: string },
  ): Observable<SolicitudResponse> {
    return this.http.patch<SolicitudResponse>(`${this.base}/solicitudes/${id}`, dto);
  }
}

/** Búsqueda y paginación de bandeja, resueltas por el backend. */
export interface BandejaQuery {
  search?: string;
  page?: number;
  limit?: number;
}

/** Respuesta de bandeja cuando se pide paginada (con page/limit). */
export interface BandejaPaginada {
  data: SolicitudResponse[];
  total: number;
  page: number;
  limit: number;
}

function armarQueryBandeja(tipos?: string[], query?: BandejaQuery): string {
  const params = new URLSearchParams();
  if (tipos?.length) params.set('tipos', tipos.join(','));
  if (query?.search?.trim()) params.set('search', query.search.trim());
  if (query?.page != null) params.set('page', String(query.page));
  if (query?.limit != null) params.set('limit', String(query.limit));
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

/** Alias legacy para el modelo viejo `CuentaResponse` (usado en algunos lugares). */
export type CuentaResponse = CuentaItemResponse;
