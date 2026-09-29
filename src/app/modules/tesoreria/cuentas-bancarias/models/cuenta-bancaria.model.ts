/**
 * Proceso de ejemplo del taller: «Registro de cuentas bancarias».
 *
 * Una solicitud (documento SRCB) propone UNA cuenta bancaria de la entidad. El creador la graba y la verifica; el
 * aprobador la aprueba, la observa o la rechaza. Al aprobarse, la cuenta pasa a los registros (pestaña Registros) y a
 * la consulta.
 */

export type Moneda = 'PEN' | 'USD';
export type TipoCuenta = 'CORRIENTE' | 'AHORROS';
export type EstadoRegistro = 'Activo' | 'Inactivo';

export interface OpcionCatalogo {
  value: string;
  label: string;
}

export const BANCOS: OpcionCatalogo[] = [
  { value: '018', label: 'Banco de la Nación' },
  { value: '002', label: 'Banco de Crédito del Perú' },
  { value: '003', label: 'Interbank' },
  { value: '011', label: 'BBVA Perú' },
  { value: '009', label: 'Scotiabank Perú' },
];

export const MONEDAS: OpcionCatalogo[] = [
  { value: 'PEN', label: 'Soles' },
  { value: 'USD', label: 'Dólares' },
];

export const TIPOS_CUENTA: OpcionCatalogo[] = [
  { value: 'CORRIENTE', label: 'Corriente' },
  { value: 'AHORROS', label: 'Ahorros' },
];

/** Código del documento en el catálogo de documentos. */
export const CODIGO_DOCUMENTO = 'SRCB';
export const NOMBRE_DOCUMENTO = 'Solicitud de Registro de Cuenta Bancaria';

/** Lo que el creador llena en la solicitud. */
export interface CuentaBancariaDatos {
  bancoCodigo: string;
  tipoCuenta: TipoCuenta;
  moneda: Moneda;
  /** Solo dígitos, de 10 a 20. */
  numeroCuenta: string;
  /** Nombre con el que se identifica la cuenta. */
  denominacion: string;
  /** Fecha de apertura (yyyy-mm-dd). */
  fechaApertura: string;
  /** ¿Recauda ingresos de la entidad? */
  esRecaudadora: boolean;
}

/** Una cuenta bancaria aprobada: la pestaña Registros y la consulta. */
export interface CuentaBancariaRegistro extends CuentaBancariaDatos {
  id: string;
  /** Código correlativo del registro (CB-0001). */
  codigo: string;
  estado: EstadoRegistro;
  entidadSiglas: string;
  /** Solicitud que la creó. */
  documentoId: string;
  numeroDocumento: string;
  /** Fecha de aprobación (ISO). */
  fechaRegistro: string;
}

export function nombreBanco(codigo: string): string {
  return BANCOS.find((b) => b.value === codigo)?.label ?? codigo;
}

export function nombreMoneda(codigo: string): string {
  return MONEDAS.find((m) => m.value === codigo)?.label ?? codigo;
}

export function nombreTipoCuenta(codigo: string): string {
  return TIPOS_CUENTA.find((t) => t.value === codigo)?.label ?? codigo;
}
