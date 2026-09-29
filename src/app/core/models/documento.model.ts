/**
 * Estados del flujo de documentos — espejo del enum EstadoDocumento
 * del backend (schema.prisma). Única fuente de verdad en el frontend:
 * un typo en un estado ahora es error de compilación, no un bug en runtime.
 */
export const ESTADOS_DOCUMENTO = [
  'NUEVO',
  'ELABORADO',
  'VERIFICADO',
  'OBSERVADO',
  'APROBADO',
  'RECHAZADO',
  'ELIMINADO',
] as const;

export type EstadoDocumento = (typeof ESTADOS_DOCUMENTO)[number];

/**
 * Los mismos estados tal como los muestra y compara la UI (capitalizados).
 *
 * Van aquí, junto a `ESTADOS_DOCUMENTO`, para que quien agregue un estado vea
 * las dos representaciones de una sola vez: el backend manda `'OBSERVADO'` y
 * la UI trabaja con `'Observado'`, y la traducción entre ambas vive en
 * `SolicitudesFacadeService`. Tener las listas separadas y sin cruzar fue lo
 * que dejó pasar durante meses que el mapa del facade conociera 6 de los 7
 * estados y mostrara los `NUEVO` como "Elaborado".
 *
 * Usar `ESTADO.OBSERVADO` en lugar del literal `'Observado'`: un typo pasa a
 * ser error de compilación, y renombrar la etiqueta es un único punto.
 */
export const ESTADO = {
  ELABORADO: 'Elaborado',
  VERIFICADO: 'Verificado',
  APROBADO: 'Aprobado',
  RECHAZADO: 'Rechazado',
  OBSERVADO: 'Observado',
  ELIMINADO: 'Eliminado',
} as const;

export type EstadoSolicitudUi = (typeof ESTADO)[keyof typeof ESTADO];

/**
 * Estados en los que el aprobador ya emitió su respuesta. Es el trío que
 * define "Recibidos" para el creador y "Enviados" para el aprobador, y estaba
 * repetido literal en `solicitudes-state`, `tray-documents-view` y
 * `virtual-desk`.
 */
export const ESTADOS_RESPUESTA_APROBADOR: EstadoSolicitudUi[] = [
  ESTADO.APROBADO,
  ESTADO.OBSERVADO,
  ESTADO.RECHAZADO,
];

/**
 * Etiqueta del área responsable del registro contable en las solicitudes.
 *
 * Antes se llamaba "Órgano de línea"; el término funcional correcto es **Ente
 * rector** (cambio pedido el 21/08/2026). La propiedad del backend sigue
 * llamándose `organoLinea` y el prefijo de `asuntoMotivo` sigue siendo
 * `[organo]`: solo cambia lo que ve el usuario.
 *
 * Es una constante porque cada request-page declara el campo y además lo
 * busca por su etiqueta para rellenarlo (`findIndex(f => f.label === …)`).
 * Con el texto suelto, cambiarlo en la declaración y olvidar la búsqueda
 * dejaba el campo con su valor de ejemplo y sin fallar en ningún lado.
 */
export const ETIQUETA_ENTE_RECTOR = 'Ente rector';

/** Motivos de rechazo que ofrece el modal de rechazo (compartidos por todos los procesos). */
export const MOTIVOS_RECHAZO = [
  'Información incompleta',
  'Datos incorrectos',
  'No procede',
  'Otros',
] as const;

export type MotivoRechazo = (typeof MOTIVOS_RECHAZO)[number];
