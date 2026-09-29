/**
 * Regla transversal de los campos de texto libre obligatorios de las
 * solicitudes (Glosa, Justificación del requerimiento solicitado): deben
 * tener contenido real, no una letra suelta puesta para desbloquear el botón.
 *
 * La constante se usa en los dos lados de la validación — el `[minlength]` del
 * `text-area-control` (que pinta el error) y el `isFormValid` de cada página
 * (que bloquea Grabar) — para que no puedan desincronizarse.
 */
export const MIN_CARACTERES_TEXTO_LIBRE = 3;

/** ¿El texto libre alcanza el mínimo? Los espacios no cuentan como contenido. */
export function cumpleMinimoTextoLibre(valor: string): boolean {
  return (valor ?? '').trim().length >= MIN_CARACTERES_TEXTO_LIBRE;
}
