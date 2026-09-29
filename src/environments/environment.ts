/**
 * Entorno del taller (build de producción).
 * No hay backend: todas las llamadas HTTP a `apiBaseUrl` las responde el backend simulado de `src/app/mock/`.
 */
export const environment = {
  production: true,
  /** URL base del API. El interceptor mock responde todo lo que empieza con esta ruta. */
  apiBaseUrl: '/api/v1',
  /** Sin servidor de sockets en el taller. */
  socketUrl: '',
  /** Datos simulados: siempre activos en el taller. */
  mock: true,
};
