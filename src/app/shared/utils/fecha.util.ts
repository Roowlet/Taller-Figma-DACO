/**
 * Conversiones y formatos de fecha compartidos por todos los módulos.
 *
 * Convenciones del proyecto:
 *  - El backend entrega fechas ISO (yyyy-MM-dd o datetime completo).
 *  - `siaf-date-time-picker` consume yyyy-MM-dd.
 *  - La UI y los MFD muestran dd/mm/yyyy (es-PE).
 */

/** dd/mm/yyyy → yyyy-MM-dd (formato del date-picker). '' si es inválida. */
export function ddmmyyyyToIso(fecha: string): string {
  const [dd, mm, yyyy] = fecha.split('/');
  if (!dd || !mm || !yyyy) return '';
  return `${yyyy}-${mm}-${dd}`;
}

/** yyyy-MM-dd o ISO datetime → dd/mm/yyyy. '' si es inválida. */
export function isoToDdmmyyyy(iso: string): string {
  const [yyyy, mm, dd] = iso.slice(0, 10).split('-');
  if (!dd || !mm || !yyyy) return '';
  return `${dd}/${mm}/${yyyy}`;
}

/** ISO datetime → "dd/mm/yyyy, hh:mm" (es-PE). '—' si viene vacío. */
export function formatFechaHora(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('es-PE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

/** ISO datetime → "dd/mm/yyyy" (es-PE). '—' si viene vacío. */
export function formatFechaCorta(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('es-PE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}
