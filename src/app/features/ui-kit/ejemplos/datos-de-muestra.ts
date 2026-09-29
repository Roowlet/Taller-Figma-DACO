/**
 * Datos de muestra para los ejemplos de componentes que en la app piden sus datos a la API.
 *
 * Esos componentes no reciben los datos por entradas: los consultan a un servicio al
 * abrirse. Para pintarlos en /ui-kit (sin sesión) se les da, a nivel del componente de
 * ejemplos, un servicio con la misma forma que devuelve datos fijos sin tocar la red.
 * Los almacenes que solo guardan señales (usuario, permisos, solicitudes) se usan reales,
 * en una instancia propia sembrada con estos datos. Nada de esto se usa fuera del catálogo.
 *
 * Las respuestas de la API son tipos grandes: aquí se arma solo lo que el componente pinta
 * y se convierte con `as unknown as`. Si un componente empieza a leer otro campo, el ejemplo
 * lo mostrará vacío, no fallará.
 */
import { Injectable, Provider, computed, signal } from '@angular/core';
import { Observable, of } from 'rxjs';

import { AperturaContableApiService, ConfiguracionAmbitoResponse } from '../../../core/api/apertura-contable-api.service';
import { PerfilItem } from '../../../core/api/auth-api.service';
import { NotificacionResponse, NotificacionesApiService } from '../../../core/api/notificaciones-api.service';
import { CuentaContableResponse, CuentaHistorialEntry, PlanesApiService } from '../../../core/api/planes-api.service';
import { SolicitudResponse, SolicitudesApiService } from '../../../core/api/solicitudes-api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { CurrentUserService } from '../../../core/auth/current-user.service';
import { PermissionService } from '../../../core/auth/permission.service';
import { ESTADO } from '../../../core/models/documento.model';
import { NotificationsStateService } from '../../../core/realtime/notifications-state.service';
import { SolicitudesFacadeService } from '../../../core/state/solicitudes-facade.service';
import { SolicitudDemo, SolicitudesStateService } from '../../../core/state/solicitudes-state.service';
import { DocumentHistoryRow } from '../../../shared/components/document-history-panel/document-history-panel.component';
import { DocumentsRecordsColumn, DocumentsRecordsConfig } from '../../../shared/types/documents-records.types';

const hace = (horas: number): string => new Date(Date.now() - horas * 3_600_000).toISOString();

// ── Usuario ──────────────────────────────────────────────────────────

export const USUARIO_DE_MUESTRA = {
  name: 'Juan Carlos Pérez',
  office: 'Dirección General de Contabilidad Pública',
  entidadId: 'ent-mef',
  entidadSiglas: 'MEF',
  entidadCodigo: '0001',
  entidadAmbitoId: 'amb-gn',
};

// ── Historial de un documento (panel sin API: acepta filas estáticas) ──

export const HISTORIAL_DOCUMENTO_DE_MUESTRA: DocumentHistoryRow[] = [
  { usuario: 'Juan Carlos Pérez', rol: 'Creador', fecha: '15/01/2026', hora: '10:00:00', estado: 'ELABORADO', comentario: '' },
  { usuario: 'Juan Carlos Pérez', rol: 'Creador', fecha: '18/01/2026', hora: '09:20:00', estado: 'VERIFICADO', comentario: '' },
  { usuario: 'Miguel Ángel Rojas', rol: 'Aprobador', fecha: '19/01/2026', hora: '16:45:00', estado: 'APROBADO', comentario: 'Conforme' },
];

// ── Plan de cuentas: detalle e historial de una cuenta ───────────────

const historialEstados = [
  { id: 'h1', estadoNuevo: 'ELABORADO', comentario: null, createdAt: hace(120), creador: { nombres: 'Juan Carlos', apellidoPaterno: 'Pérez', apellidoMaterno: 'Díaz' } },
  { id: 'h2', estadoNuevo: 'VERIFICADO', comentario: null, createdAt: hace(96), creador: { nombres: 'Juan Carlos', apellidoPaterno: 'Pérez', apellidoMaterno: 'Díaz' } },
  { id: 'h3', estadoNuevo: 'APROBADO', comentario: 'Conforme', createdAt: hace(72), creador: { nombres: 'Miguel Ángel', apellidoPaterno: 'Rojas', apellidoMaterno: 'León' } },
];

const CUENTA_DE_MUESTRA = {
  id: 'cta-1101-01',
  codigoCompleto: '1101.01',
  nombre: 'Caja M/N',
  codigoAnterior: '1101.01',
  nombreAnterior: 'Caja moneda nacional',
  plan: { descripcion: 'Plan de Cuentas Gubernamental 2026', numeroPlanContable: 'PCGU-2026' },
  entidades: [{ entidad: { siglas: 'MEF', codMef: '0001', nombre: 'Ministerio de Economía y Finanzas' } }],
  ambitos: [
    { ambitoInstitucional: { codigo: 'GN', descripcion: 'Gobierno Nacional' } },
    { ambitoInstitucional: { codigo: 'GR', descripcion: 'Gobierno Regional' } },
  ],
  naturaleza: 'Deudora',
  tipoElemento: 'Activo',
  esMonetaria: true,
  aplicaExtraPresupuestaria: false,
  esReciproca: false,
  acActivo: 'Si',
  pcPasivo: 'No',
  ancActivo: 'No',
  pncPasivo: 'No',
  tieneDinamicaContable: true,
  dinamicaDebita: 'Por los ingresos de efectivo recibidos.',
  dinamicaAcredita: 'Por los depósitos y pagos realizados.',
} as unknown as CuentaContableResponse;

const HISTORIAL_CUENTA_DE_MUESTRA: CuentaHistorialEntry[] = [
  {
    documentoId: 'doc-scc-1',
    tipoDocumento: { codigo: 'SCC', nombre: 'Solicitud de cuenta contable' },
    tipoAccion: 'creacion',
    numeroDocumento: 'PCC-SCC-00001-2026-MEF-DGCP',
    fechaRequerimiento: hace(120),
    justificacion: '[DGCP] Alta de la cuenta de caja',
    sustento: { nombreOriginal: 'sustento-cuenta-caja.pdf' },
    esModificacion: false,
    historialEstados,
  } as unknown as CuentaHistorialEntry,
];

/** La fila de la pestaña Registros que abre el panel de historial de la cuenta. */
export const REGISTRO_CUENTA_DE_MUESTRA = {
  recordId: 'cta-1101-01',
  status: 'Activo',
  element: '1',
  group: '1',
  account: '01',
  subAccount1: '01',
  subAccount2: '-',
  subAccount3: '-',
  accountName: 'Caja M/N',
  imputable: 'Si',
  previousCode: '1101.01',
};

// ── Asiento de ajuste ────────────────────────────────────────────────

const SOLICITUD_ASIENTO_DE_MUESTRA = {
  id: 'doc-sraa-12',
  numero: 'PAA-SRAA-00012-2026-MEF-DGCP',
  numeroAsientoContable: 'AA-001-2026-12',
  tipoAccion: 'creacion',
  estado: 'APROBADO',
  fechaRegistro: hace(48),
  createdAt: hace(48),
  catDocumento: { nombre: 'Solicitud de Registro de Asiento de Ajuste' },
  entidadCreadora: { id: 'ent-mef' },
  historialEstados,
  detalleAsientoAjuste: {
    periodoLabel: '2026 - 03',
    fechaAsiento: '2026-03-31',
    glosa: 'Regularización de la depreciación del periodo',
    tipoAsientoAjuste: {
      codigo: 'TAA-0004',
      ambitos: [{ ambitoInstitucionalId: 'amb-gn', ambitoInstitucional: { codigo: 'GN', descripcion: 'Gobierno Nacional' } }],
      claseAjuste: { codigo: '02', descripcion: 'Ajustes por depreciación' },
      detalleAjuste: { codigo: '01', descripcion: 'Depreciación de edificios' },
    },
    movimientos: [
      { tipoMovimiento: 'Debe', monto: 12500, cuentaContable: { codigoCompleto: '5801.0101', nombre: 'Depreciación de edificios' } },
      { tipoMovimiento: 'Haber', monto: 12500, cuentaContable: { codigoCompleto: '1508.0101', nombre: 'Depreciación acumulada de edificios' } },
    ],
  },
} as unknown as SolicitudResponse;

export const REGISTRO_ASIENTO_DE_MUESTRA = { recordId: 'doc-sraa-12', status: 'Activo' };

const CONFIGURACION_APERTURA_DE_MUESTRA = [
  {
    ambitoId: 'ent-mef',
    periodos: [{ etiqueta: '2026 - 03', fechaInicio: '2026-03-01', fechaFin: '2026-03-31', fechaVigenciaAdicional: '2026-04-10' }],
  },
] as unknown as ConfiguracionAmbitoResponse[];

// ── Notificaciones ───────────────────────────────────────────────────

/** Sin `documento`: al hacer clic el componente no navega y el catálogo no se abandona. */
export const NOTIFICACIONES_DE_MUESTRA: NotificacionResponse[] = [
  { id: 'n1', tipo: 'APROBACION', titulo: 'Solicitud aprobada', mensaje: 'PCC-SCC-00001-2026-MEF-DGCP fue aprobada.', leida: false, leidaEn: null, createdAt: hace(0.3), documento: null },
  { id: 'n2', tipo: 'OBSERVACION', titulo: 'Solicitud observada', mensaje: 'PAA-SRAA-00012-2026-MEF-DGCP tiene observaciones.', leida: false, leidaEn: null, createdAt: hace(5), documento: null },
  { id: 'n3', tipo: 'VERIFICACION', titulo: 'Documento por aprobar', mensaje: 'Llegó una solicitud de catálogo de eventos.', leida: true, leidaEn: hace(20), createdAt: hace(30), documento: null },
];

// ── Bandeja ──────────────────────────────────────────────────────────

const solicitud = (numero: string, tipoDocumento: string, estado: SolicitudDemo['estado'], fecha: string): SolicitudDemo => ({
  id: numero,
  numero,
  tipoDocumento,
  tipoAccion: 'Creación',
  estado,
  fecha,
  entidad: '0001 - Ministerio de Economía y Finanzas',
  entidadCodigo: '0001',
  unidad: 'Dirección General de Contabilidad Pública',
  creador: 'Juan Carlos Pérez',
  justificacion: 'Ejemplo del catálogo de componentes',
  organoLinea: 'DGCP',
  plan: 'PCGU-2026',
  cuentas: [],
  archivos: [],
  historial: [],
});

export const BANDEJA_DE_MUESTRA: SolicitudDemo[] = [
  solicitud('PCC-SCC-00003-2026-MEF-DGCP', 'Solicitud de cuenta contable', ESTADO.ELABORADO, '20/01/2026'),
  solicitud('PAA-SRAA-00013-2026-MEF-DGCP', 'Solicitud de registro de asiento de ajuste', ESTADO.ELABORADO, '19/01/2026'),
  solicitud('PCE-SCE-00002-2026-MEF-DGCP', 'Solicitud de eventos', ESTADO.OBSERVADO, '18/01/2026'),
  solicitud('PCC-SCC-00002-2026-MEF-DGCP', 'Solicitud de cuenta contable', ESTADO.VERIFICADO, '17/01/2026'),
];

// ── Servicios que en la app llaman a la API ──────────────────────────

/** Estado de notificaciones con la misma forma que el real, sin socket ni REST. */
@Injectable()
export class EstadoNotificacionesDeMuestra {
  private readonly _notifications = signal<NotificacionResponse[]>(NOTIFICACIONES_DE_MUESTRA);
  readonly notifications = this._notifications.asReadonly();
  readonly unreadCount = computed(() => this._notifications().filter((n) => !n.leida).length);
  readonly loading = signal(false).asReadonly();
  readonly hasUnread = computed(() => this.unreadCount() > 0);

  start(): void {}
  stop(): void {}
  async refresh(): Promise<void> {}
  async marcarLeidas(): Promise<void> {
    const leidaEn = new Date().toISOString();
    this._notifications.update((lista) => lista.map((n) => ({ ...n, leida: true, leidaEn })));
  }
  async marcarLeidaPorDocumento(): Promise<void> {}
}

const nada = <T>(valor: T): Observable<T> => of(valor);

/** Servicios falsos de los paneles de historial (cuenta y asiento). */
export const PROVEEDORES_HISTORIAL_DE_MUESTRA: Provider[] = [
  { provide: PlanesApiService, useValue: { obtenerCuenta: () => nada(CUENTA_DE_MUESTRA), obtenerHistorialCuenta: () => nada(HISTORIAL_CUENTA_DE_MUESTRA) } },
  { provide: SolicitudesApiService, useValue: { obtenerDetalle: () => nada(SOLICITUD_ASIENTO_DE_MUESTRA), cambiarEstado: () => nada({ message: 'ok' }) } },
  { provide: AperturaContableApiService, useValue: { listarConfiguracion: () => nada(CONFIGURACION_APERTURA_DE_MUESTRA) } },
  CurrentUserService,
];

/** Servicios falsos del shell: notificaciones, bandeja y sesión. Los almacenes de señales van reales, sembrados. */
export const PROVEEDORES_SHELL_DE_MUESTRA: Provider[] = [
  { provide: NotificationsStateService, useClass: EstadoNotificacionesDeMuestra },
  { provide: NotificacionesApiService, useValue: { obtenerHistorial: () => nada(NOTIFICACIONES_DE_MUESTRA), marcarLeidas: () => nada(undefined) } },
  {
    provide: SolicitudesFacadeService,
    useValue: { cargarBandejaCreador: () => undefined, cargarBandejaAprobador: () => undefined, recargarBandeja: () => undefined },
  },
  {
    provide: AuthService,
    useValue: {
      perfilesDisponibles: signal<PerfilItem[]>([]).asReadonly(),
      cambiarPerfil: () => nada(undefined),
      logout: () => nada(undefined),
    },
  },
  SolicitudesStateService,
  PermissionService,
  CurrentUserService,
];

// ── Pantalla de bandeja (Documentos y registros) ─────────────────────

const columnasDocumentos: DocumentsRecordsColumn[] = [
  { key: 'document', label: 'Documento', visibility: 'visible', group: 'default', widthClass: 'w-[300px]', kind: 'document-link' },
  { key: 'number', label: 'Número', visibility: 'visible', group: 'default', widthClass: 'w-[260px]' },
  { key: 'actionType', label: 'Tipo de acción', visibility: 'visible', group: 'default', widthClass: 'w-[160px]' },
  { key: 'status', label: 'Estado', visibility: 'visible', group: 'default', widthClass: 'w-[140px]', kind: 'flow-status' },
  { key: 'date', label: 'Fecha de registro', visibility: 'visible', group: 'default', widthClass: 'w-[170px]' },
  { key: 'creator', label: 'Creador', visibility: 'hidden', group: 'more', widthClass: 'w-[200px]' },
];

const columnasRegistros: DocumentsRecordsColumn[] = [
  { key: 'status', label: 'Estado', visibility: 'visible', group: 'default', widthClass: 'w-[130px]', kind: 'record-status' },
  { key: 'accountCode', label: 'Código', visibility: 'visible', group: 'default', widthClass: 'w-[140px]' },
  { key: 'accountName', label: 'Denominación', visibility: 'visible', group: 'default', widthClass: 'w-[280px]' },
  { key: 'imputable', label: 'Imputable', visibility: 'visible', group: 'default', widthClass: 'w-[120px]' },
];

/** Enlaces de documento y rutas de creación apuntan al catálogo: el ejemplo no lleva a pantallas autenticadas. */
export const BANDEJA_CONFIG_DE_MUESTRA: DocumentsRecordsConfig = {
  modoConsulta: true,
  title: 'Plan de cuentas contable',
  processId: 'ui-kit-plan-cuentas',
  defaultRequestRoute: '/ui-kit',
  createDocumentOptions: [],
  breadcrumbs: [{ label: 'Inicio', href: '/ui-kit' }, { label: 'Gestión contable', href: '/ui-kit' }, { label: 'Plan de cuentas contable' }],
  documentRows: BANDEJA_DE_MUESTRA.map((s) => ({
    document: s.tipoDocumento,
    number: s.numero,
    linkRoute: '/ui-kit',
    actionType: s.tipoAccion,
    status: s.estado,
    date: s.fecha,
    creator: s.creador,
  })),
  recordRows: [
    { ...REGISTRO_CUENTA_DE_MUESTRA, accountCode: '1101.01' },
    { recordId: 'cta-1101-02', status: 'Activo', accountCode: '1101.02', accountName: 'Caja M/E', imputable: 'Si' },
  ],
  documentColumns: columnasDocumentos,
  recordColumns: columnasRegistros,
  documentTableMinWidthClass: 'min-w-[1030px]',
  recordTableMinWidthClass: 'min-w-[670px]',
  recordTrackKey: 'accountCode',
  recordHistoryDocumentLabel: 'Solicitud de cuenta contable',
  statusFilterOptions: [ESTADO.ELABORADO, ESTADO.VERIFICADO, ESTADO.OBSERVADO],
  actionTypeFilterOptions: ['Creación'],
  filterCampoOptions: [
    { label: 'Documento', value: 'document' },
    { label: 'Estado', value: 'status' },
  ],
  filterValorOptions: [
    { label: ESTADO.ELABORADO, value: ESTADO.ELABORADO },
    { label: ESTADO.VERIFICADO, value: ESTADO.VERIFICADO },
  ],
  fieldsMenuOptions: [{ label: 'Documento' }, { label: 'Estado' }, { label: 'Fecha de registro' }],
};

/** Servicios falsos de la pantalla de bandeja: acciones sobre documentos e historial de la pestaña Registros. */
export const PROVEEDORES_BANDEJA_DE_MUESTRA: Provider[] = [
  ...PROVEEDORES_HISTORIAL_DE_MUESTRA,
  { provide: SolicitudesFacadeService, useValue: { recargarBandeja: () => undefined } },
  PermissionService,
];

/** Siembra las instancias reales de usuario, rol y bandeja que dan los proveedores de muestra. */
export function sembrarSesionDeMuestra(usuario: CurrentUserService, permisos?: PermissionService, bandeja?: SolicitudesStateService): void {
  usuario.setUser(USUARIO_DE_MUESTRA);
  permisos?.setRole('creator');
  bandeja?.loadAll(BANDEJA_DE_MUESTRA);
}
