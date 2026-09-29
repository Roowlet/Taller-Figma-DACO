/**
 * Proceso «Modificación de la APM» (Asignación Presupuestaria Multianual).
 *
 * Una solicitud (documento SMAPM) propone la modificación de los montos de gasto de la APM de la entidad. El creador
 * la graba y la verifica; el aprobador la aprueba, la observa o la rechaza. Sigue el mismo ciclo de estados que el
 * proceso de ejemplo de cuentas bancarias, reutilizando el backend simulado de solicitudes.
 */

/** Código del documento en el catálogo de tipos de documento. */
export const CODIGO_DOCUMENTO = 'SMAPM';
export const NOMBRE_DOCUMENTO = 'Solicitud de Modificación de la APM';

/** Una línea de gasto de la APM (pestaña «Gastos» de la solicitud). */
export interface GastoApm {
  fuenteFinanciamiento: string;
  categoriaGasto: string;
  generica: string;
  /** Monto propuesto para el año, en soles. */
  monto: number;
}

/** Lo que el creador propone en la solicitud de modificación. */
export interface ModificacionApmDatos {
  gastos: GastoApm[];
  /** Detalle de la modificación (campo obligatorio de texto libre). */
  detalle: string;
}

/**
 * Gastos base de la APM que se muestran (y editan) en la solicitud. En un backend real vendrían del presupuesto
 * vigente de la entidad; en el taller son datos simulados fijos por genérica de gasto.
 */
export const GASTOS_APM: GastoApm[] = [
  { fuenteFinanciamiento: 'Recursos ordinarios', categoriaGasto: 'Gastos corrientes', generica: 'Personal y obligaciones sociales', monto: 183115400 },
  { fuenteFinanciamiento: 'Recursos ordinarios', categoriaGasto: 'Gastos corrientes', generica: 'Pensiones y otras prestaciones sociales', monto: 1501030 },
  { fuenteFinanciamiento: 'Recursos ordinarios', categoriaGasto: 'Gastos corrientes', generica: 'Bienes y servicios', monto: 165642800 },
  { fuenteFinanciamiento: 'Recursos ordinarios', categoriaGasto: 'Gastos corrientes', generica: 'Donaciones y transferencias', monto: 147977500 },
  { fuenteFinanciamiento: 'Recursos ordinarios', categoriaGasto: 'Gastos corrientes', generica: 'Otros gastos', monto: 374077900 },
];

/** Formatea un monto como soles (S/ 1,234,567). */
export function formatearSoles(monto: number): string {
  return `S/ ${monto.toLocaleString('es-PE')}`;
}
