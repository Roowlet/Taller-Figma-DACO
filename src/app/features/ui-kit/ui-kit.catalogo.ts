/**
 * Lo único curado a mano del catálogo: en qué categoría va cada componente y en qué orden.
 *
 * Todo lo demás (selector, descripción, entradas, eventos, si tiene uso) sale del código
 * vía `scripts/generar-ui-kit.mjs`. El spec `ui-kit.catalogo.spec.ts` falla si un
 * componente nuevo no tiene categoría, así que agregar uno a `shared/` sin declararlo
 * aquí rompe los tests: esa es la regla de "sin ficha no está terminado".
 *
 * Criterio: una familia va entera en una sola categoría (todos los paneles laterales en
 * Overlays, todas las tarjetas en Superficies) y los componentes que se parecen van uno
 * junto al otro, para que su ficha explique la diferencia en vez de parecer duplicados.
 * Una pantalla que se repite entre procesos y se arma solo con configuración va en Plantillas
 * de pantalla; un armazón donde cada pantalla pone su propio contenido, en Layouts de página.
 */

export type CategoriaId =
  | 'fundamentos'
  | 'acciones'
  | 'formularios'
  | 'datos'
  | 'graficos'
  | 'feedback'
  | 'navegacion'
  | 'superficies'
  | 'trazabilidad'
  | 'overlays'
  | 'paginas'
  | 'plantillas'
  | 'armazon';

export interface CategoriaUiKit {
  id: CategoriaId;
  titulo: string;
  descripcion: string;
}

export const CATEGORIAS_UI_KIT: readonly CategoriaUiKit[] = [
  { id: 'fundamentos', titulo: 'Fundamentos', descripcion: 'Iconografía, separadores y ayuda contextual.' },
  { id: 'acciones', titulo: 'Botones y acciones', descripcion: 'Botones, grupos de botones y menús de acciones.' },
  { id: 'formularios', titulo: 'Formularios', descripcion: 'Campos, selectores, carga de archivos y datos de solo lectura.' },
  { id: 'datos', titulo: 'Datos y tablas', descripcion: 'Tablas, paginación, filtros, búsqueda y listas.' },
  { id: 'graficos', titulo: 'Gráficos', descripcion: 'Visualización de datos: secciones con gráfico, indicadores KPI, barras (también apiladas), líneas, divergente, dona, leyenda y tooltip.' },
  { id: 'feedback', titulo: 'Estado y feedback', descripcion: 'Etiquetas de estado, alertas, avisos, cargas y estados vacíos.' },
  { id: 'navegacion', titulo: 'Navegación', descripcion: 'Migas y pestañas.' },
  { id: 'superficies', titulo: 'Superficies', descripcion: 'Tarjetas y contenedores: resúmenes, acordeones y popovers.' },
  { id: 'trazabilidad', titulo: 'Trazabilidad del documento', descripcion: 'Quién hizo qué y cuándo: detalle, historial, pasos y líneas de tiempo.' },
  { id: 'overlays', titulo: 'Overlays', descripcion: 'Modales y paneles laterales que se abren sobre la pantalla.' },
  { id: 'paginas', titulo: 'Layouts de página', descripcion: 'Armazones y cabeceras de las pantallas de solicitud y de consulta: cada pantalla pone dentro su propio contenido.' },
  { id: 'plantillas', titulo: 'Plantillas de pantalla', descripcion: 'Flujos completos que se repiten entre procesos: cada pantalla solo pasa su configuración (título, textos, columnas y filtros).' },
  { id: 'armazon', titulo: 'Armazón de la aplicación', descripcion: 'Piezas del shell autenticado: barra superior, menús y bandeja.' },
];

export const CATEGORIA_POR_SELECTOR: Readonly<Record<string, CategoriaId>> = {
  // Fundamentos
  'siaf-icon': 'fundamentos',
  'siaf-divider': 'fundamentos',
  '[siafTooltip]': 'fundamentos',
  // Botones y acciones
  'siaf-button': 'acciones',
  'siaf-buttons-group': 'acciones',
  'siaf-menu': 'acciones',
  'siaf-icon-dropdown-menu': 'acciones',
  'siaf-cascading-menu': 'acciones',
  // Formularios
  'siaf-input': 'formularios',
  'text-area-control': 'formularios',
  'siaf-checkbox': 'formularios',
  'siaf-switch': 'formularios',
  'siaf-radio-group': 'formularios',
  'siaf-select-options': 'formularios',
  'siaf-date-time-picker': 'formularios',
  'siaf-uploader': 'formularios',
  'siaf-uploaded-file-card': 'formularios',
  'readonly-field': 'formularios',
  'siaf-readonly': 'formularios',
  // Datos y tablas
  'siaf-table': 'datos',
  'siaf-data-table': 'datos',
  'siaf-report-table': 'datos',
  'siaf-documents-records-table': 'datos',
  'siaf-table-controls': 'datos',
  'siaf-pagination': 'datos',
  'siaf-table-skeleton': 'datos',
  'siaf-records-search-toolbar': 'datos',
  'siaf-form-table-search': 'datos',
  'siaf-filter-pill': 'datos',
  'siaf-consultas-filtros-chips': 'datos',
  'siaf-parametros-aplicados': 'datos',
  'siaf-custom-filter': 'datos',
  'siaf-tree-view': 'datos',
  'siaf-list': 'datos',
  // Gráficos
  'siaf-chart-section': 'graficos',
  'siaf-kpi-card': 'graficos',
  'siaf-bar-chart': 'graficos',
  'siaf-line-chart': 'graficos',
  'siaf-diverging-chart': 'graficos',
  'siaf-donut-chart': 'graficos',
  'siaf-chart-legend': 'graficos',
  'siaf-chart-tooltip': 'graficos',
  // Estado y feedback
  'siaf-status-tag': 'feedback',
  'siaf-flow-status-tag': 'feedback',
  'siaf-record-status-tag': 'feedback',
  'siaf-tag': 'feedback',
  'siaf-badge': 'feedback',
  'siaf-alert': 'feedback',
  'message-box': 'feedback',
  'siaf-snackbar': 'feedback',
  'siaf-loader': 'feedback',
  'siaf-loader-overlay': 'feedback',
  'siaf-loading-progress': 'feedback',
  'siaf-progress-circular': 'feedback',
  'empty-section': 'feedback',
  'siaf-empty-state': 'feedback',
  // Navegación
  'siaf-breadcrumb': 'navegacion',
  'siaf-tabs': 'navegacion',
  'siaf-records-tabs': 'navegacion',
  // Superficies
  'siaf-card': 'superficies',
  'siaf-solicitude-form-card': 'superficies',
  'siaf-solicitude-info-card': 'superficies',
  'siaf-summary-card': 'superficies',
  'siaf-report-summary-card': 'superficies',
  'siaf-document-summary-card': 'superficies',
  'siaf-stepper-card': 'superficies',
  'siaf-desk-card': 'superficies',
  'siaf-accordion': 'superficies',
  'siaf-expansion-panel': 'superficies',
  'siaf-collapsible-card': 'superficies',
  'siaf-popover': 'superficies',
  // Trazabilidad del documento
  'siaf-action-tracker': 'trazabilidad',
  'siaf-detail-history-tabs': 'trazabilidad',
  'siaf-document-history-panel': 'trazabilidad',
  'siaf-account-history-panel': 'trazabilidad',
  'siaf-asiento-history-panel': 'trazabilidad',
  'siaf-timeline': 'trazabilidad',
  'siaf-steps': 'trazabilidad',
  // Overlays
  'siaf-modal': 'overlays',
  'siaf-request-approval-modals': 'overlays',
  'siaf-annulment-modal': 'overlays',
  'siaf-side-nav': 'overlays',
  'siaf-side-panel': 'overlays',
  'siaf-selection-side-nav': 'overlays',
  'siaf-upload-side-nav': 'overlays',
  'siaf-timeline-detail-panel': 'overlays',
  'siaf-column-visibility-panel': 'overlays',
  'siaf-query-parameters-panel': 'overlays',
  '[siafFoco]': 'overlays',
  // Layouts de página
  'siaf-solicitude-page-layout': 'paginas',
  'siaf-solicitude-header': 'paginas',
  'siaf-page-shell': 'paginas',
  'siaf-page-header': 'paginas',
  'siaf-create-document': 'paginas',
  // Plantillas de pantalla
  'siaf-documents-records-page': 'plantillas',
  'siaf-query-report-page': 'plantillas',
  // Armazón de la aplicación
  'siaf-navbar': 'armazon',
  'siaf-sidebar': 'armazon',
  'siaf-mobile-navigation-menu': 'armazon',
  'siaf-process-menu-tree': 'armazon',
  'siaf-notifications-panel': 'armazon',
  'siaf-tray-menu': 'armazon',
  'siaf-tray-documents-view': 'armazon',
  'siaf-tray-notifications-view': 'armazon',
};

/** Pantallas completas, no piezas reutilizables: no se listan en el catálogo. */
export const SELECTORES_OCULTOS: readonly string[] = ['siaf-app-shell', 'siaf-virtual-desk'];
