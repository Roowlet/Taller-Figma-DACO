import { DetailHistoryComment, DetailHistoryEntry } from './detail-history-tabs.component';

/**
 * Helpers compartidos para alimentar `<siaf-detail-history-tabs>` desde el
 * historial de una solicitud (HistorialDemo / HistorialItem).
 *
 * Este es el patrón ESTÁNDAR para cualquier vista de detalle de solicitud:
 * `chart-accounts-bulk-request`, `adjustment-seat-request`,
 * y futuras pantallas de procesos contables.
 */

/** Estados del flujo que listamos en el tab "Historial" (acciones de revisión). */
export const ESTADOS_HISTORIAL = new Set<string>(['OBSERVADO', 'RECHAZADO']);

/** Acción humana mostrada en la columna PROCESO. */
export const PROCESO_LABELS: Record<string, string> = {
  ELABORADO: 'Elaborar Solicitud',
  VERIFICADO: 'Verificar Solicitud',
  APROBADO: 'Aprobar Solicitud',
  OBSERVADO: 'Observar Solicitud',
  RECHAZADO: 'Rechazar Solicitud',
  ELIMINADO: 'Eliminar Solicitud',
};

/** Encabezado de la columna COMENTARIO / MOTIVO según estado. */
export const COMENTARIO_HEADERS: Record<string, string> = {
  ELABORADO: 'Comentario de elaboración',
  VERIFICADO: 'Comentario de verificación',
  APROBADO: 'Comentario de aprobación',
  OBSERVADO: 'Comentario de observación',
  RECHAZADO: 'Motivo del rechazo',
  ELIMINADO: 'Motivo de eliminación',
};

/** Etiqueta del bloque "Detalle" cuando el estado actual amerita mostrar comentario. */
export const DETALLE_LABELS: Record<string, string> = {
  OBSERVADO: 'Comentario de observación',
  RECHAZADO: 'Motivo del rechazo',
};

/** Shape minimal aceptado por los builders (compatible con HistorialDemo y HistorialItem). */
export interface HistorialSource {
  /** Estado backend en mayúsculas (ej. "OBSERVADO"). Si solo tienes el label humano, conviértelo arriba. */
  estadoBackend: string;
  /** Fecha ISO o un Date. */
  fechaISO: string | Date;
  /** Comentario opcional. */
  comentario?: string | null;
  /** Nombre completo del usuario. */
  usuario?: string;
  /** "Rol\nUnidad - Entidad" (o solo rol). Pre-formateado. */
  rol?: string;
}

/**
 * Convierte una lista de eventos de historial al shape `DetailHistoryEntry[]`
 * consumible por el componente. Filtra solo OBSERVADO/RECHAZADO y calcula
 * la iteración (incrementa con cada OBSERVADO).
 */
export function buildHistoryEntries(historial: HistorialSource[]): DetailHistoryEntry[] {
  // Ascendente cronológico para asignar iteraciones correctamente
  const cronologico = [...historial].sort(
    (a, b) => new Date(a.fechaISO).getTime() - new Date(b.fechaISO).getTime(),
  );

  let iteracion = 1;
  const entries: DetailHistoryEntry[] = cronologico
    .filter(h => ESTADOS_HISTORIAL.has(h.estadoBackend))
    .map(h => {
      const fechaObj = new Date(h.fechaISO);
      const entry: DetailHistoryEntry = {
        iteracion,
        proceso: PROCESO_LABELS[h.estadoBackend] ?? h.estadoBackend,
        comentario: COMENTARIO_HEADERS[h.estadoBackend] ?? '—',
        descripcion: h.comentario ?? '',
        fecha: fechaObj.toLocaleDateString('es-PE'),
        hora: fechaObj.toLocaleTimeString('es-PE', { hour12: false }),
        rol: h.rol ?? '',
        usuario: h.usuario ?? '',
      };
      if (h.estadoBackend === 'OBSERVADO') {
        iteracion += 1;
      }
      return entry;
    });

  // Más reciente arriba en la tabla
  return entries.reverse();
}

/**
 * Devuelve el comentario "activo" para el tab Detalle según el estado actual,
 * o `null` si el estado no requiere mostrar comentario.
 */
export function buildCurrentComment(
  estadoActual: string,
  historial: HistorialSource[],
): DetailHistoryComment | null {
  const label = DETALLE_LABELS[estadoActual];
  if (!label) return null;

  // Tomamos el comentario más reciente del estado actual
  const evento = [...historial]
    .reverse()
    .find(h => h.estadoBackend === estadoActual && h.comentario);

  if (!evento?.comentario) return null;
  return { label, texto: evento.comentario };
}
