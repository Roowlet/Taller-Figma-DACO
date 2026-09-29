/**
 * Detección de cambios para las páginas de solicitud.
 *
 * Al pulsar "Editar" sobre un documento ELABORADO u OBSERVADO, el formulario
 * ya viene completo, así que la validación de completitud (`isFormValid`) da
 * verdadero desde el primer instante y Grabar queda habilitado sin que el
 * usuario haya tocado nada. Reenviar así un OBSERVADO escribe en el historial
 * una subsanación que nunca ocurrió.
 *
 * La comparación se hace contra una foto del formulario tomada al entrar en
 * edición.
 */

/** Serializa el estado del formulario para poder compararlo después. */
export function crearSnapshotFormulario(valores: unknown): string {
  return JSON.stringify(valores ?? null);
}

/**
 * ¿El formulario cambió respecto de la foto inicial?
 *
 * **Fail-open a propósito**: sin foto (creación nueva, o algo falló al
 * tomarla) se responde que sí hay cambios. Un falso positivo solo habilita un
 * guardado inocuo; un falso negativo dejaría al usuario sin poder grabar un
 * documento que sí editó, que es mucho peor.
 */
export function hayCambiosRespectoAlSnapshot(
  snapshot: string | null | undefined,
  actual: string,
): boolean {
  if (snapshot === null || snapshot === undefined) {
    return true;
  }

  return snapshot !== actual;
}

/**
 * Identidad de un archivo adjunto para el snapshot. El objeto `File` cambia de
 * referencia en cada selección, así que se compara por lo que el usuario
 * percibe: nombre y tamaño.
 */
export function identidadArchivo(file: { name: string; size?: number } | null | undefined): string | null {
  if (!file) return null;
  return `${file.name}::${file.size ?? ''}`;
}
