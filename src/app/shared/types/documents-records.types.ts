export type DocumentsRecordsTab = 'documents' | 'records';
export type DocumentFlowStatus = 'Elaborado' | 'Verificado';
export type RecordStatus = 'Activo';
export type ColumnVisibility = 'visible' | 'hidden' | 'internal';
export type ColumnGroup = 'default' | 'more' | 'internal';

export type DocumentsRecordsBreadcrumbItem = {
  label: string;
  href?: string;
};

export type DocumentsRecordsCreateDocumentOption = {
  label: string;
  route?: string;
  actionTypes?: string[];
};

export type DocumentsRecordsCreateProcessOption = {
  id: string;
  label: string;
  route?: string;
  documents: string[];
  documentOptions?: DocumentsRecordsCreateDocumentOption[];
  actionTypes: string[];
};

export type DocumentsRecordsRow = {
  selected?: boolean;
  [key: string]: string | boolean | undefined;
};

export type DocumentsRecordsColumn = {
  key: string;
  label: string;
  visibility: ColumnVisibility;
  group: ColumnGroup;
  widthClass?: string;
  align?: 'left' | 'right' | 'center';
  kind?: 'text' | 'document-link' | 'flow-status' | 'record-status';
};

export type DocumentsRecordsFilterOption = {
  label: string;
  value: string;
};

export type DocumentsRecordsMenuOption = {
  label: string;
  hasChildren?: boolean;
};

/**
 * Consulta remota de la pestaña Documentos: búsqueda + paginación resueltas
 * por el backend. La emite `siaf-documents-records-page` vía `(documentsQueryChange)`
 * cuando la config declara `serverQuery`.
 */
export type DocumentsQuery = {
  search: string;
  page: number;
  limit: number;
};

export type DocumentsRecordsConfig = {
  title: string;
  processId: string;
  defaultRequestRoute: string;
  createDocumentOptions: DocumentsRecordsCreateProcessOption[];
  breadcrumbs: DocumentsRecordsBreadcrumbItem[];
  documentRows: DocumentsRecordsRow[];
  /**
   * Modo servidor para la pestaña Documentos: `documentRows` ya viene
   * filtrado y paginado por el backend, así que la página no filtra por texto
   * ni pagina en memoria — emite `(documentsQueryChange)` y muestra `total`
   * en el paginador. Sin este campo, todo sigue en memoria (módulos mock).
   */
  serverQuery?: { total: number };
  /**
   * Modo servidor para la pestaña Registros — mismo contrato que
   * `serverQuery` pero para `recordRows`, emitiendo `(recordsQueryChange)`.
   */
  serverRecordsQuery?: { total: number };
  recordRows: DocumentsRecordsRow[];
  documentColumns: DocumentsRecordsColumn[];
  recordColumns: DocumentsRecordsColumn[];
  documentTableMinWidthClass: string;
  recordTableMinWidthClass: string;
  recordTrackKey: string;
  recordHistoryDocumentLabel: string;
  /** Variante del panel "Historial del registro" de la pestaña Registros:
   *  'cuenta' (default, plan de cuentas) o 'asiento' (asiento de ajuste). */
  recordHistoryKind?: 'cuenta' | 'asiento' | 'documento';
  // Filtros para tab Documentos
  statusFilterOptions: string[];
  actionTypeFilterOptions: string[];
  filterCampoOptions: DocumentsRecordsFilterOption[];
  filterValorOptions: DocumentsRecordsFilterOption[];
  fieldsMenuOptions: DocumentsRecordsMenuOption[];
  // Filtros específicos para tab Registros (reemplazan Estado/Tipo de acción)
  recordFilter1Options?: string[];
  recordFilter1Label?: string;
  recordFilter1Key?: string;
  recordFilter2Options?: string[];
  recordFilter2Label?: string;
  recordFilter2Key?: string;
  // Filtros personalizados (+) específicos de Registros
  recordFilterCampoOptions?: DocumentsRecordsFilterOption[];
  recordFilterValorOptions?: DocumentsRecordsFilterOption[];
  // Controla el botón de acción principal en la sección de documentos
  // 'verificar' = rol CREADOR (selecciona Elaborados y verifica)
  // 'aprobar'   = rol APROBADOR (selecciona Verificados y aprueba)
  accionPrincipal?: 'verificar' | 'aprobar';
  /**
   * Proceso de solo consulta: sin botón "+Crear documento" ni acción
   * principal (Verificar/Aprobar), y sin filtrar las filas por los
   * estados del rol. Útil para procesos cuyos documentos genera un
   * motor externo (p.ej. pedidos de contabilización).
   */
  modoConsulta?: boolean;
  /**
   * Personaliza el "Historial del documento" de una fila: permite
   * aportar atributos propios y filas de historial pre-resueltas
   * (documentos que no son solicitudes del workflow, ej. asientos de
   * apertura anual). Lo devuelto se mezcla sobre el summary estándar.
   */
  buildDocumentHistory?: (row: DocumentsRecordsRow) => Record<string, unknown> | null | undefined;
};
