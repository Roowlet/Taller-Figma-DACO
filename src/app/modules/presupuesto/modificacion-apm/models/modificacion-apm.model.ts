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

/** Años de la asignación presupuestaria multianual (columnas de monto de la tabla). */
export const ANIOS_APM = [2027, 2028, 2029];

/** Una línea de gasto de la APM (pestaña «Gastos» de la solicitud). */
export interface GastoApm {
  codigoFuente: string;
  fuenteFinanciamiento: string;
  codigoCategoria: string;
  categoriaGasto: string;
  codigoGenerica: string;
  generica: string;
  /** Montos propuestos por año, en soles (paralelo a `ANIOS_APM`). */
  montos: number[];
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
  { codigoFuente: '1', fuenteFinanciamiento: 'Recursos ordinarios', codigoCategoria: '5', categoriaGasto: 'Gastos corrientes', codigoGenerica: '1', generica: 'Personal y obligaciones sociales', montos: [183115348, 183313009, 184043956] },
  { codigoFuente: '1', fuenteFinanciamiento: 'Recursos ordinarios', codigoCategoria: '5', categoriaGasto: 'Gastos corrientes', codigoGenerica: '2', generica: 'Pensiones y otras prestaciones sociales', montos: [1501030, 1501030, 1501030] },
  { codigoFuente: '1', fuenteFinanciamiento: 'Recursos ordinarios', codigoCategoria: '5', categoriaGasto: 'Gastos corrientes', codigoGenerica: '3', generica: 'Bienes y servicios', montos: [165642053, 165642053, 165642053] },
  { codigoFuente: '1', fuenteFinanciamiento: 'Recursos ordinarios', codigoCategoria: '5', categoriaGasto: 'Gastos corrientes', codigoGenerica: '4', generica: 'Donaciones y transferencias', montos: [147977758, 147977758, 147977758] },
  { codigoFuente: '1', fuenteFinanciamiento: 'Recursos ordinarios', codigoCategoria: '5', categoriaGasto: 'Gastos corrientes', codigoGenerica: '5', generica: 'Otros gastos', montos: [374077456, 374077456, 374077456] },
];

/** Formatea un monto como soles con dos decimales (S/ 1,234,567.00). */
export function formatearSoles(monto: number): string {
  return `S/ ${monto.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
