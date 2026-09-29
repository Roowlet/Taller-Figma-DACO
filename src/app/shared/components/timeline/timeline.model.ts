/**
 * Un hito de la línea de tiempo. La barra horizontal usa `label` y `date` (tooltip del punto); el detalle
 * vertical («Ver detalle») muestra además `dateInfo` bajo la fecha y `description` bajo el nombre.
 */
export interface TimelineItem {
  label: string;
  /** Fecha ya formateada (ej. «10/10/25»). En el detalle solo se ve cuando el hito está cumplido. */
  date?: string;
  /** Texto bajo la fecha de un hito cumplido (ej. «Aprobado»). */
  dateInfo?: string;
  /** Resumen del hito en el detalle (ej. «5,000 ítems inventariados»). Sin él: «En proceso» / «Aún no iniciado». */
  description?: string;
}

export type TimelineItemState = 'done' | 'current' | 'pending';

/** Estado de un hito según el índice del hito en curso: los anteriores cumplidos, ese en curso y el resto pendientes. */
export function estadoDeHito(indice: number, actual: number): TimelineItemState {
  return indice < actual ? 'done' : indice === actual ? 'current' : 'pending';
}

/** Hitos cumplidos: los anteriores al actual, entre 0 y el total. */
export function hitosCumplidos(total: number, actual: number): number {
  return Math.min(Math.max(actual, 0), total);
}
