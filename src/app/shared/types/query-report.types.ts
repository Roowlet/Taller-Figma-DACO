import type { BreadcrumbItem } from '../components/breadcrumb/breadcrumb.component';
import type { FilterPillOption } from '../components/filter-pill/filter-pill.component';
import type { KpiCardTone } from '../ui/kpi-card/kpi-card.component';
import type { ReportSummaryField } from '../ui/report-summary-card/report-summary-card.component';
import type { ReportTableColumn, ReportTableRow } from '../ui/report-table/report-table.component';
import type { TabItem } from '../ui/tabs/tabs.component';
import type { TextFieldOption } from '../ui/text-field/text-field.component';

/** Campo del panel «Parámetros de consulta». */
export interface QueryReportParameterField {
  key: string;
  label: string;
  /** `date` usa el selector de fecha; `select-multiple`, la lista con casillas y «Seleccionar todo». */
  type: 'date' | 'select' | 'select-multiple';
  options?: TextFieldOption[];
  required?: boolean;
  /** Ícono de Material Icons de su tarjeta en «Parámetros aplicados». */
  icon: string;
}

/** Valores aplicados: la fecha (aaaa-mm-dd, como la entrega `siaf-date-time-picker`), el valor elegido o la lista. */
export type QueryReportParameters = Record<string, string | string[]>;

/** Píldora de «Filtros predeterminados»: filtra las filas cuya columna `key` tiene el valor elegido. */
export interface QueryReportPresetFilter {
  key: string;
  label: string;
  options: FilterPillOption[];
}

export interface QueryReportSummary {
  /** Etiqueta en versalitas («Entidad»). */
  label: string;
  icon: string;
  title: string;
  description?: string;
  fields: ReportSummaryField[];
}

/** Lo que devuelve la consulta de la pantalla para los parámetros aplicados. */
export interface QueryReportResult {
  rows: ReportTableRow[];
  summary?: QueryReportSummary | null;
}

export type QueryReportColumn = ReportTableColumn;
export type QueryReportRow = ReportTableRow;

/** `sum` suma una columna de importes («1,031,200.00»); `count` cuenta filas. */
export type QueryReportAggregate = 'sum' | 'count';

/** Solo las filas cuya columna tiene exactamente ese valor. */
export interface QueryReportRowFilter {
  column: string;
  value: string;
}

/** Tarjeta KPI de la vista de gráficas, calculada con las filas del resultado. */
export interface QueryReportKpi {
  title: string;
  icon?: string;
  tone?: KpiCardTone;
  /** Columna a sumar; con `count` no hace falta. */
  column?: string;
  aggregate?: QueryReportAggregate;
  /** Con filtro, la barra muestra qué parte del total de la columna representan esas filas; sin él, el 100 %. */
  where?: QueryReportRowFilter;
  /** Texto antes del monto («S/ »). */
  prefix?: string;
}

export type QueryReportChartType = 'bar' | 'line' | 'donut' | 'diverging';

/** Gráfico de la vista de gráficas: agrupa las filas por una columna y suma otra (o las cuenta). */
export interface QueryReportChart {
  title: string;
  description?: string;
  type: QueryReportChartType;
  /** Columna que forma las categorías, en el orden en que aparecen. */
  groupBy: string;
  /** Con una columna de fecha dd/mm/aaaa, agrupa por mes («ENE», «FEB»…) en orden cronológico. */
  byMonth?: boolean;
  column?: string;
  aggregate?: QueryReportAggregate;
  where?: QueryReportRowFilter;
  /**
   * `index`: cada valor como porcentaje del primero (base = 100). `change`: variación porcentual de cada categoría
   * respecto de la primera, sin la primera.
   */
  transform?: 'index' | 'change';
  /** Nombre de la serie en la leyenda y el tooltip. */
  seriesName?: string;
  /** Nombre de las categorías en la tabla de datos del gráfico («Mes»). */
  categoryLabel?: string;
  /** Con `diverging`, qué significa cada lado; por defecto «Disminución» y «Aumento». */
  negativeLabel?: string;
  positiveLabel?: string;
  /** `narrow` va en la columna angosta (336 px) a la derecha del `wide` anterior, como en el Figma. */
  width?: 'wide' | 'narrow';
}

export interface QueryReportChartsConfig {
  kpis: QueryReportKpi[];
  charts: QueryReportChart[];
}

export type QueryReportExportFormat = 'excel' | 'csv' | 'pdf';

/**
 * Configuración de una pantalla «Consultas y reportes» armada con `siaf-query-report-page`: la pantalla solo pasa sus
 * textos, sus parámetros, sus columnas y el resultado de cada consulta.
 */
export interface QueryReportConfig {
  title: string;
  breadcrumbs: BreadcrumbItem[];
  parameterFields: QueryReportParameterField[];
  columns: QueryReportColumn[];
  /** Clave que identifica cada fila del resultado. */
  rowKey: string;
  /** Título de la tarjeta del resultado; por defecto «Resultado de reporte». */
  resultTitle?: string;
  /** Pestañas sobre el resultado; la pantalla recibe `tabChanged` y entrega el resultado de la pestaña. */
  tabs?: TabItem[];
  presetFilters?: QueryReportPresetFilter[];
  /** KPI y gráficos de la vista de gráficas; sin ellos no aparece el selector de vista. */
  charts?: QueryReportChartsConfig;
  /** Nombre de la tabla para el lector de pantalla. */
  tableLabel?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}
