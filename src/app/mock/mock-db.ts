import type { NotificacionResponse } from '../core/api/notificaciones-api.service';
import type { HistorialItem, SolicitudResponse } from '../core/api/solicitudes-api.service';
import type { EstadoDocumento } from '../core/models/documento.model';
import {
  CODIGO_DOCUMENTO,
  CuentaBancariaDatos,
  CuentaBancariaRegistro,
  NOMBRE_DOCUMENTO,
} from '../modules/tesoreria/cuentas-bancarias/models/cuenta-bancaria.model';
import {
  CODIGO_DOCUMENTO as CODIGO_DOCUMENTO_APM,
  GASTOS_APM,
  ModificacionApmDatos,
  NOMBRE_DOCUMENTO as NOMBRE_DOCUMENTO_APM,
} from '../modules/presupuesto/modificacion-apm/models/modificacion-apm.model';
import { USUARIOS_DEMO, UsuarioDemo } from './usuarios-demo';

/**
 * «Base de datos» del backend simulado: vive en el `localStorage` del navegador, así lo que hace un usuario lo ve
 * otro al iniciar sesión (en el mismo navegador). `reiniciarDatosDemo()` vuelve a los datos iniciales.
 */

const CLAVE = 'taller-siaf-rp:datos';
const VERSION = 3;

export interface NotificacionMock extends NotificacionResponse {
  /** Destinatario: un usuario puntual o, si no hay, todos los perfiles con este rol. */
  paraUsuarioId?: string;
  paraRolCodigo?: 'CREADOR' | 'APROBADOR';
}

export interface DatosTaller {
  version: number;
  solicitudes: SolicitudResponse[];
  registros: CuentaBancariaRegistro[];
  notificaciones: NotificacionMock[];
  correlativoDocumento: number;
  /** Correlativo propio de los documentos SMAPM, independiente del de SRCB. */
  correlativoDocumentoApm: number;
  correlativoRegistro: number;
  secuencia: number;
}

export const TIPO_DOCUMENTO = { id: 'td-srcb', codigo: CODIGO_DOCUMENTO, nombre: NOMBRE_DOCUMENTO };
export const TIPO_DOCUMENTO_APM = { id: 'td-smapm', codigo: CODIGO_DOCUMENTO_APM, nombre: NOMBRE_DOCUMENTO_APM };
export const ENTIDAD_CREADORA = { id: 'ent-mef', codMef: '0001', siglas: 'MEF', nombre: 'Ministerio de Economía y Finanzas' };
export const UNIDAD_CREADORA = { id: 'uo-oga', sigla: 'OGA', nombre: 'Oficina General de Administración' };

export function leerDatos(): DatosTaller {
  try {
    const guardados = localStorage.getItem(CLAVE);
    if (guardados) {
      const datos = JSON.parse(guardados) as DatosTaller;
      if (datos.version === VERSION) return datos;
    }
  } catch {
    // Datos corruptos o sin acceso al almacenamiento: se empieza de nuevo.
  }
  const iniciales = crearDatosIniciales();
  guardarDatos(iniciales);
  return iniciales;
}

export function guardarDatos(datos: DatosTaller): void {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(datos));
  } catch {
    // Sin almacenamiento (modo privado estricto): los cambios duran lo que dure la pestaña.
  }
}

/** Vuelve a los datos iniciales de la demo. */
export function reiniciarDatosDemo(): void {
  guardarDatos(crearDatosIniciales());
}

export function nuevoId(datos: DatosTaller, prefijo: string): string {
  datos.secuencia += 1;
  return `${prefijo}-${datos.secuencia}`;
}

export function numeroDocumento(correlativo: number, fecha: Date, prefijo = 'PCB-SRCB'): string {
  return `${prefijo}-${String(correlativo).padStart(5, '0')}-${fecha.getFullYear()}-MEF-OGA`;
}

/** Prefijo del número formal según el código del tipo de documento. */
export function prefijoDocumento(codigo: string): string {
  return codigo === CODIGO_DOCUMENTO_APM ? 'PMA-SMAPM' : 'PCB-SRCB';
}

/** Tipo de documento (con id garantizado) para el campo `documento.catDocumento` de una notificación. */
export function catDocumentoNotificacion(s: SolicitudResponse): { id: string; codigo: string; nombre: string } {
  const c = s.catDocumento;
  return c?.id ? { id: c.id, codigo: c.codigo, nombre: c.nombre } : TIPO_DOCUMENTO;
}

export function filaHistorial(
  datos: DatosTaller,
  anterior: EstadoDocumento | null,
  nuevo: EstadoDocumento,
  fecha: string,
  usuario: UsuarioDemo,
  rol: { codigo: string; nombre: string },
  comentario: string | null = null,
): HistorialItem {
  return {
    id: nuevoId(datos, 'hist'),
    estadoAnterior: anterior,
    estadoNuevo: nuevo,
    comentario,
    createdAt: fecha,
    creador: { nombres: usuario.nombres, apellidoPaterno: usuario.apellidoPaterno, apellidoMaterno: usuario.apellidoMaterno },
    perfil: { cfgPerfil: { rol } },
  };
}

// ─── Datos iniciales ───────────────────────────────────────────────

const ROL_CREADOR = { codigo: 'CREADOR', nombre: 'Creador' };
const ROL_APROBADOR = { codigo: 'APROBADOR', nombre: 'Aprobador' };

interface Semilla {
  datos: CuentaBancariaDatos;
  /** Día en que se creó la solicitud (yyyy-mm-dd). */
  creada: string;
  estado: 'ELABORADO' | 'VERIFICADO' | 'APROBADO' | 'OBSERVADO' | 'RECHAZADO';
  justificacion: string;
  comentario?: string;
  registroInactivo?: boolean;
}

function cuenta(banco: string, tipo: 'CORRIENTE' | 'AHORROS', moneda: 'PEN' | 'USD', n: number, denominacion: string, apertura: string, recaudadora: boolean): CuentaBancariaDatos {
  return {
    bancoCodigo: banco,
    tipoCuenta: tipo,
    moneda,
    numeroCuenta: `${banco}100${String(58213400000000 + n * 7919).slice(-14)}`,
    denominacion,
    fechaApertura: apertura,
    esRecaudadora: recaudadora,
  };
}

const SEMILLAS: Semilla[] = [
  { creada: '2026-01-16', estado: 'APROBADO', justificacion: 'Cuenta para la recaudación de tasas por procedimientos administrativos.', datos: cuenta('018', 'CORRIENTE', 'PEN', 1, 'Recaudación de tasas administrativas', '2026-01-15', true) },
  { creada: '2026-02-04', estado: 'APROBADO', justificacion: 'Cuenta para pagos a proveedores del exterior en dólares.', datos: cuenta('002', 'CORRIENTE', 'USD', 2, 'Pagos a proveedores del exterior', '2026-02-03', false) },
  { creada: '2026-02-23', estado: 'APROBADO', justificacion: 'Cuenta de ahorros para el fondo de caja chica de la oficina.', datos: cuenta('003', 'AHORROS', 'PEN', 3, 'Fondo de caja chica', '2026-02-20', false) },
  { creada: '2026-03-12', estado: 'APROBADO', justificacion: 'Cuenta para la recaudación de multas administrativas.', datos: cuenta('011', 'CORRIENTE', 'PEN', 4, 'Recaudación de multas', '2026-03-11', true) },
  { creada: '2026-04-09', estado: 'APROBADO', justificacion: 'Cuenta para las transferencias a unidades ejecutoras.', datos: cuenta('018', 'CORRIENTE', 'PEN', 5, 'Transferencias a unidades ejecutoras', '2026-04-08', false) },
  { creada: '2026-05-20', estado: 'APROBADO', justificacion: 'Cuenta para garantías recibidas en moneda extranjera.', datos: cuenta('009', 'AHORROS', 'USD', 6, 'Garantías en moneda extranjera', '2026-05-19', false), registroInactivo: true },
  { creada: '2026-06-03', estado: 'APROBADO', justificacion: 'Cuenta para la recaudación de servicios no exclusivos.', datos: cuenta('018', 'CORRIENTE', 'PEN', 7, 'Recaudación de servicios no exclusivos', '2026-06-02', true) },
  { creada: '2026-07-15', estado: 'APROBADO', justificacion: 'Cuenta de ahorros para encargos a las oficinas desconcentradas.', datos: cuenta('002', 'AHORROS', 'PEN', 8, 'Encargos a oficinas desconcentradas', '2026-07-14', false) },
  { creada: '2026-08-06', estado: 'RECHAZADO', justificacion: 'Cuenta para la recaudación de derechos de trámite.', datos: cuenta('009', 'CORRIENTE', 'PEN', 9, 'Recaudación de derechos de trámite', '2026-08-05', true), comentario: '[Información incorrecta] La cuenta ya está registrada con el código CB-0004.' },
  { creada: '2026-08-24', estado: 'VERIFICADO', justificacion: 'Cuenta en dólares para los fondos de cooperación internacional.', datos: cuenta('003', 'CORRIENTE', 'USD', 10, 'Fondos de cooperación internacional', '2026-08-21', false) },
  { creada: '2026-09-02', estado: 'OBSERVADO', justificacion: 'Cuenta para la recaudación por alquiler de ambientes.', datos: cuenta('011', 'CORRIENTE', 'PEN', 11, 'Recaudación de alquileres', '2026-09-01', true), comentario: 'Adjunte la constancia de apertura emitida por el banco.' },
  { creada: '2026-09-09', estado: 'ELABORADO', justificacion: 'Cuenta de ahorros para el fondo de viáticos.', datos: cuenta('018', 'AHORROS', 'PEN', 12, 'Fondo de viáticos', '2026-09-08', false) },
];

interface SemillaApm {
  creada: string;
  estado: 'ELABORADO' | 'VERIFICADO' | 'APROBADO' | 'OBSERVADO' | 'RECHAZADO';
  detalle: string;
  comentario?: string;
}

const SEMILLAS_APM: SemillaApm[] = [
  { creada: '2026-08-19', estado: 'APROBADO', detalle: 'Modificación de la APM por incremento de la genérica Bienes y servicios para el ejercicio.' },
  { creada: '2026-09-01', estado: 'VERIFICADO', detalle: 'Modificación de la APM por reasignación entre genéricas de gasto corriente.' },
  { creada: '2026-09-08', estado: 'OBSERVADO', detalle: 'Modificación de la APM por ajuste en Otros gastos.', comentario: 'Adjunte el sustento del ajuste en la genérica Otros gastos.' },
  { creada: '2026-09-12', estado: 'ELABORADO', detalle: 'Modificación de la APM por actualización de Donaciones y transferencias.' },
];

function modificacionApm(detalle: string): ModificacionApmDatos {
  return { gastos: GASTOS_APM.map((g) => ({ ...g })), detalle };
}

function enFecha(dia: string, horas: number, dias = 0): string {
  const fecha = new Date(`${dia}T00:00:00`);
  fecha.setDate(fecha.getDate() + dias);
  fecha.setHours(horas, 15 + dias * 7, 0, 0);
  return fecha.toISOString();
}

function crearDatosIniciales(): DatosTaller {
  const datos: DatosTaller = {
    version: VERSION,
    solicitudes: [],
    registros: [],
    notificaciones: [],
    correlativoDocumento: 0,
    correlativoDocumentoApm: 0,
    correlativoRegistro: 0,
    secuencia: 0,
  };
  const ana = USUARIOS_DEMO[0];
  const luis = USUARIOS_DEMO[1];

  for (const semilla of SEMILLAS) {
    const id = nuevoId(datos, 'sol');
    datos.correlativoDocumento += 1;
    const creada = enFecha(semilla.creada, 9);
    const numero = numeroDocumento(datos.correlativoDocumento, new Date(creada));
    const historial: HistorialItem[] = [
      filaHistorial(datos, null, 'NUEVO', creada, ana, ROL_CREADOR),
      filaHistorial(datos, 'NUEVO', 'ELABORADO', enFecha(semilla.creada, 9, 0), ana, ROL_CREADOR),
    ];
    if (semilla.estado !== 'ELABORADO') {
      historial.push(filaHistorial(datos, 'ELABORADO', 'VERIFICADO', enFecha(semilla.creada, 10, 1), ana, ROL_CREADOR));
    }
    if (['APROBADO', 'OBSERVADO', 'RECHAZADO'].includes(semilla.estado)) {
      historial.push(filaHistorial(datos, 'VERIFICADO', semilla.estado, enFecha(semilla.creada, 11, 2), luis, ROL_APROBADOR, semilla.comentario ?? null));
    }
    const ultima = historial[historial.length - 1].createdAt;

    const solicitud: SolicitudResponse = {
      id,
      numero,
      catDocumento: TIPO_DOCUMENTO,
      tipoAccion: 'creacion',
      estado: semilla.estado,
      asuntoMotivo: `[OFICINA GENERAL DE ADMINISTRACIÓN] ${semilla.justificacion}`,
      entidadCreadora: ENTIDAD_CREADORA,
      unidadCreadora: UNIDAD_CREADORA,
      creador: { id: ana.id, nombres: ana.nombres, apellidoPaterno: ana.apellidoPaterno, apellidoMaterno: ana.apellidoMaterno },
      fechaRegistro: creada,
      createdAt: creada,
      updatedAt: ultima,
      itemsCuenta: [],
      detalleCuentaBancaria: { documentoId: id, ...semilla.datos },
      sustentos: [
        {
          id: nuevoId(datos, 'sus'),
          tipoSustento: 'sustento',
          archivo: { nombreOriginal: `Constancia de apertura ${String(datos.correlativoDocumento).padStart(2, '0')}.pdf`, storagePath: 'taller' },
        },
      ],
      historialEstados: historial,
    };
    datos.solicitudes.push(solicitud);

    if (semilla.estado === 'APROBADO') {
      datos.correlativoRegistro += 1;
      datos.registros.push({
        id: nuevoId(datos, 'cb'),
        codigo: `CB-${String(datos.correlativoRegistro).padStart(4, '0')}`,
        estado: semilla.registroInactivo ? 'Inactivo' : 'Activo',
        entidadSiglas: 'MEF',
        documentoId: id,
        numeroDocumento: numero,
        fechaRegistro: ultima,
        ...semilla.datos,
      });
    }
  }

  // ── Solicitudes de Modificación de la APM (SMAPM) ──
  for (const semilla of SEMILLAS_APM) {
    const id = nuevoId(datos, 'sol');
    datos.correlativoDocumentoApm += 1;
    const creada = enFecha(semilla.creada, 9);
    const numero = numeroDocumento(datos.correlativoDocumentoApm, new Date(creada), prefijoDocumento(CODIGO_DOCUMENTO_APM));
    const historial: HistorialItem[] = [
      filaHistorial(datos, null, 'NUEVO', creada, ana, ROL_CREADOR),
      filaHistorial(datos, 'NUEVO', 'ELABORADO', enFecha(semilla.creada, 9, 0), ana, ROL_CREADOR),
    ];
    if (semilla.estado !== 'ELABORADO') {
      historial.push(filaHistorial(datos, 'ELABORADO', 'VERIFICADO', enFecha(semilla.creada, 10, 1), ana, ROL_CREADOR));
    }
    if (['APROBADO', 'OBSERVADO', 'RECHAZADO'].includes(semilla.estado)) {
      historial.push(filaHistorial(datos, 'VERIFICADO', semilla.estado, enFecha(semilla.creada, 11, 2), luis, ROL_APROBADOR, semilla.comentario ?? null));
    }
    const ultima = historial[historial.length - 1].createdAt;

    datos.solicitudes.push({
      id,
      numero,
      catDocumento: TIPO_DOCUMENTO_APM,
      tipoAccion: 'modificacion',
      estado: semilla.estado,
      asuntoMotivo: `[DIRECCIÓN GENERAL DE PRESUPUESTO PÚBLICO] ${semilla.detalle}`,
      entidadCreadora: ENTIDAD_CREADORA,
      unidadCreadora: UNIDAD_CREADORA,
      creador: { id: ana.id, nombres: ana.nombres, apellidoPaterno: ana.apellidoPaterno, apellidoMaterno: ana.apellidoMaterno },
      fechaRegistro: creada,
      createdAt: creada,
      updatedAt: ultima,
      itemsCuenta: [],
      detalleModificacionApm: { documentoId: id, ...modificacionApm(semilla.detalle) },
      sustentos: [
        {
          id: nuevoId(datos, 'sus'),
          tipoSustento: 'sustento',
          archivo: { nombreOriginal: `Sustento de modificación APM ${String(datos.correlativoDocumentoApm).padStart(2, '0')}.pdf`, storagePath: 'taller' },
        },
      ],
      historialEstados: historial,
    });
  }

  // Notificaciones: el aprobador tiene una solicitud por aprobar; el creador, una observada y otras ya leídas.
  const aviso = (s: SolicitudResponse, tipo: string, titulo: string, mensaje: string, leida: boolean, destino: Pick<NotificacionMock, 'paraUsuarioId' | 'paraRolCodigo'>): NotificacionMock => ({
    id: nuevoId(datos, 'not'),
    tipo,
    titulo,
    mensaje,
    leida,
    leidaEn: leida ? s.updatedAt ?? null : null,
    createdAt: s.updatedAt ?? s.createdAt,
    documento: { id: s.id, numero: s.numero, catDocumento: catDocumentoNotificacion(s) },
    ...destino,
  });
  const porEstado = (estado: string) => datos.solicitudes.filter((s) => s.estado === estado);
  for (const s of porEstado('VERIFICADO')) {
    datos.notificaciones.push(aviso(s, 'DOCUMENTO_VERIFICADO', 'Solicitud por aprobar', `La solicitud ${s.numero} fue verificada y espera su aprobación.`, false, { paraRolCodigo: 'APROBADOR' }));
  }
  for (const s of porEstado('OBSERVADO')) {
    datos.notificaciones.push(aviso(s, 'DOCUMENTO_OBSERVADO', 'Solicitud observada', `La solicitud ${s.numero} fue observada: revise el comentario y subsane.`, false, { paraUsuarioId: ana.id }));
  }
  for (const s of porEstado('RECHAZADO')) {
    datos.notificaciones.push(aviso(s, 'DOCUMENTO_RECHAZADO', 'Solicitud rechazada', `La solicitud ${s.numero} fue rechazada.`, true, { paraUsuarioId: ana.id }));
  }
  const ultimaAprobada = porEstado('APROBADO').at(-1);
  if (ultimaAprobada) {
    datos.notificaciones.push(aviso(ultimaAprobada, 'DOCUMENTO_APROBADO', 'Solicitud aprobada', `La solicitud ${ultimaAprobada.numero} fue aprobada.`, true, { paraUsuarioId: ana.id }));
  }

  return datos;
}
