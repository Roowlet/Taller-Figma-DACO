/**
 * Entorno de DESARROLLO del taller (`npm start`).
 * No hay backend: todas las llamadas HTTP a `apiBaseUrl` las responde el backend simulado de `src/app/mock/`.
 */
export const environment = {
  production: false,
  apiBaseUrl: '/api/v1',
  socketUrl: '',
  mock: true,
};
