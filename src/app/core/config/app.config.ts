/**
 * Configuración global de la aplicación.
 * Los valores que dependen del entorno (URLs) viven en src/environments/.
 */
import { environment } from '../../../environments/environment';

export const APP_CONFIG = {
  app: {
    name: 'SIAF-RP',
    version: '0.1.0',
    production: environment.production,
  },
  api: {
    baseUrl: environment.apiBaseUrl,
    socketUrl: environment.socketUrl,
  },
};
