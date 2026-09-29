import type { CreateDocumentProcessOption } from '../../../../shared/components/create-document/create-document.component';
import { NOMBRE_DOCUMENTO } from '../models/modificacion-apm.model';

/** Rutas e ids del proceso «Modificación de la APM». El id existe en `DEFAULT_PROCESS_TREE`. */
export const PROCESS_ROUTE = '/procesos/modificacion-apm';
export const REQUEST_SEGMENT = 'solicitud';
export const REQUEST_ROUTE = `${PROCESS_ROUTE}/${REQUEST_SEGMENT}`;

/** Hoja «Modificación de la APM» del árbol de procesos: arma las migas de pan. */
export const PROCESS_ID = 'modificacion-apm';
/** Código del proceso, usado por el shell para mapear el tipo de documento a su ruta. */
export const PROCESO_CODIGO = 'modificacion-apm';
export const PROCESO_NOMBRE = 'Modificación de la APM';

/** Opción del panel «Crear documento» (fallback del shell y del árbol). */
export const CREATE_DOCUMENT_OPTIONS: CreateDocumentProcessOption[] = [
  {
    id: PROCESO_CODIGO,
    label: PROCESO_NOMBRE,
    route: REQUEST_ROUTE,
    documents: [NOMBRE_DOCUMENTO],
    documentOptions: [{ label: NOMBRE_DOCUMENTO, route: REQUEST_ROUTE, actionTypes: ['Modificación'] }],
    actionTypes: ['Modificación'],
  },
];
