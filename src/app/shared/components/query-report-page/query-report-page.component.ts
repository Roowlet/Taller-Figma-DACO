import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';

import type {
  QueryReportChartType,
  QueryReportConfig,
  QueryReportExportFormat,
  QueryReportParameters,
  QueryReportResult,
  QueryReportRow,
} from '../../types/query-report.types';
import { BarChartComponent } from '../../ui/bar-chart/bar-chart.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { ButtonGroupItem, ButtonsGroupComponent } from '../../ui/buttons-group/buttons-group.component';
import { ChartSectionComponent } from '../../ui/chart-section/chart-section.component';
import type { ChartSeries } from '../../ui/charts/grafico-base';
import { DivergingChartComponent } from '../../ui/diverging-chart/diverging-chart.component';
import { DonutChartComponent } from '../../ui/donut-chart/donut-chart.component';
import { EmptyStateComponent } from '../../ui/empty-state/empty-state.component';
import { IconDropdownMenuComponent, IconDropdownMenuItem } from '../../ui/icon-dropdown-menu/icon-dropdown-menu.component';
import { KpiCardComponent } from '../../ui/kpi-card/kpi-card.component';
import { LineChartComponent } from '../../ui/line-chart/line-chart.component';
import { MessageBoxComponent } from '../../ui/message-box/message-box.component';
import { ReportSummaryCardComponent } from '../../ui/report-summary-card/report-summary-card.component';
import { ReportTableColumn, ReportTableComponent } from '../../ui/report-table/report-table.component';
import { TableSkeletonComponent } from '../../ui/table-skeleton/table-skeleton.component';
import { TabsComponent } from '../../ui/tabs/tabs.component';
import { FilterPillComponent } from '../filter-pill/filter-pill.component';
import { FormTableSearchComponent } from '../form-table-search/form-table-search.component';
import { PageHeaderComponent } from '../page-header/page-header.component';
import { PageShellComponent } from '../page-shell/page-shell.component';
import { PaginationComponent } from '../pagination/pagination.component';
import { ParametroAplicado, ParametrosAplicadosComponent } from '../parametros-aplicados/parametros-aplicados.component';
import { QueryParametersPanelComponent, tieneValor } from '../query-parameters-panel/query-parameters-panel.component';
import { GraficoCalculado, calcularGrafico, calcularKpis } from './query-report-charts';

/** Lo que recibe la pantalla al elegir un formato en «Exportar»: los parámetros y las filas que quedaron tras buscar y filtrar. */
export interface QueryReportExportEvent {
  format: QueryReportExportFormat;
  parameters: QueryReportParameters;
  rows: QueryReportRow[];
}

export type QueryReportView = 'datos' | 'graficas';

/** Un gráfico listo para pintar: su serie, su nombre accesible y si ocupa las dos columnas. */
interface GraficoEnVista extends GraficoCalculado {
  /** `vacio` sin categorías que dibujar: los ejes vacíos parecerían valores en cero, así que va un aviso. */
  dibujo: QueryReportChartType | 'vacio';
  series: ChartSeries[];
  ariaLabel: string;
  /** Sin pareja (un `wide` sin `narrow` a su derecha, o al revés), ocupa toda la fila. */
  clase: string;
}

const FORMATOS_EXPORTACION: readonly QueryReportExportFormat[] = ['excel', 'csv', 'pdf'];

/** Sin mayúsculas ni tildes, para buscar «credito» y encontrar «Crédito». */
const normalizar = (texto: string): string => texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

/** aaaa-mm-dd → dd/mm/aaaa, como lo muestra el selector de fecha. */
const fechaVisible = (valor: string): string => {
  const [anio, mes, dia] = valor.split('-');
  return anio && mes && dia ? `${dia}/${mes}/${anio}` : valor;
};

let siguienteId = 0;

/**
 * Plantilla de pantalla «Consultas y reportes» (Guía de Estructura de Pantallas, nodo 9455:107865): la nueva versión de
 * las consultas, armada desde un `QueryReportConfig`. Antes de consultar muestra el estado vacío; «Parámetros» abre
 * `siaf-query-parameters-panel` y, al aplicar, emite `queried` para que la pantalla traiga el resultado. Con resultado
 * pinta «Parámetros aplicados», y en «Resultado de reporte» las pestañas, la card resumen, el buscador (Filtrar y
 * Columnas), los filtros predeterminados, la tabla de datos detallada y la paginación. Buscar, filtrar y paginar
 * ocurren sobre las filas recibidas.
 *
 * Con `charts` en la configuración, el encabezado del resultado suma el selector «Vista de datos | Vista de gráficas»
 * (nodo 22715:21316) y la vista de gráficas (nodo 22402:16766): tarjetas KPI y gráficos calculados con las mismas filas
 * que muestra la tabla, es decir, después de buscar y filtrar; un gráfico que se queda sin datos muestra un aviso en vez
 * de ejes vacíos. Esa vista se carga con `@defer` al abrirla, así Chart.js
 * no pesa en la pantalla hasta que alguien la usa. «Exportar» abre el menú Excel, CSV y PDF y emite `exported` con el
 * formato.
 *
 * No llama a la API: la pantalla consulta y entrega `result` (con `loading` mientras tanto).
 *
 * @figma 9455:107865 Query and Report
 * @figma 22715:21316 Content head
 * @figma 22402:16766 Query and report - Charts result - 01
 * @usar
 * - Para una pantalla «Consultas y reportes» de un proceso: título, migas, campos de parámetros, columnas (con grupos y
 *   la última fija), pestañas y filtros predeterminados en la configuración.
 * - `tabs` cuando el reporte tiene varias vistas del mismo resultado: la pantalla recibe `tabChanged` y entrega el
 *   resultado de esa pestaña.
 * - `charts` para la vista de gráficas: cada KPI suma una columna (o cuenta filas), con un filtro opcional por valor, y
 *   cada gráfico agrupa por una columna (o por mes, con una fecha), en valores, índice respecto de la primera categoría
 *   (`index`) o variación respecto de ella (`change`). `width: 'narrow'` pone un gráfico en la columna de 336 px a la
 *   derecha del anterior, como en el Figma.
 * - `exported` para generar el archivo: trae el formato elegido y las filas que quedaron tras buscar y filtrar.
 * - `favoritesRequested`, `advancedFiltersRequested` y `columnsRequested` para lo que la pantalla resuelve por su cuenta
 *   mientras la plantilla no traiga esos paneles.
 * @evitar
 * - Para la bandeja de documentos y registros de un proceso: usar `siaf-documents-records-page`.
 * - Para una vista de solo lectura que no es un reporte: usar `siaf-page-shell` con `siaf-page-header`.
 * - Maquetar otra consulta con estado vacío, panel de búsqueda y tabla a mano: pasar su configuración a esta
 *   plantilla.
 * - Calcular los KPI o los gráficos en la pantalla y pintarlos aparte: declararlos en `charts`, así siguen a la búsqueda
 *   y a los filtros de la tabla.
 * @teclado
 * - **Tab**: recorre las migas, «Favoritos» y «Parámetros», las tarjetas de parámetros aplicados, el selector de vista,
 *   «Exportar», las pestañas y, en la vista de datos, el buscador y sus botones, los filtros, la tabla y la paginación;
 *   en la de gráficas, cada gráfico.
 * - **Enter** en el buscador: busca en todas las columnas (sin distinguir mayúsculas ni tildes) y vuelve a la primera
 *   página.
 * - El panel de parámetros, el selector de vista, el menú «Exportar», las pestañas, las píldoras, la tabla y los
 *   gráficos siguen su componente.
 * @accesibilidad
 * - **1.3.1 Información y relaciones (A)**: el título de la pantalla es el `h1` de `siaf-page-header`; el de la tarjeta
 *   del resultado, un `h2`, y el de cada gráfico, el `h3` de `siaf-chart-section`.
 * - **4.1.2 Nombre, función y valor (A)**: el selector de vista es un grupo «Vista del resultado» con `aria-pressed` en
 *   cada botón, nombrado como su tooltip; «Exportar» anuncia su menú con `aria-haspopup` y `aria-expanded`.
 * - **4.1.3 Mensajes de estado (AA)**: el total de filas tras buscar o filtrar se anuncia en una región
 *   `aria-live="polite"` que no se ve.
 * - **2.4.3 Orden del foco (A)**: al cerrar el panel de parámetros el foco vuelve a «Parámetros».
 * - **3.2.2 Al introducir datos (A)**: escribir en el buscador no cambia la tabla hasta pulsar Enter; elegir un filtro
 *   predeterminado sí filtra al momento, y se anuncia.
 * - **1.1.1 Contenido no textual (A)**: cada gráfico se llama como su título y lleva su tabla de datos oculta; con una
 *   búsqueda o un filtro activos, una nota avisa con cuántas filas se calcularon.
 * - **1.4.10 Reajuste del contenido (AA)**: en pantallas angostas las acciones del encabezado bajan, las tarjetas KPI
 *   y los gráficos pasan a una columna y la tabla se desplaza dentro de su zona, sin desplazar la página.
 */
@Component({
  selector: 'siaf-query-report-page',
  standalone: true,
  imports: [
    BarChartComponent,
    ButtonComponent,
    ButtonsGroupComponent,
    ChartSectionComponent,
    DivergingChartComponent,
    DonutChartComponent,
    EmptyStateComponent,
    FilterPillComponent,
    FormTableSearchComponent,
    IconDropdownMenuComponent,
    KpiCardComponent,
    LineChartComponent,
    MessageBoxComponent,
    PageHeaderComponent,
    PageShellComponent,
    PaginationComponent,
    ParametrosAplicadosComponent,
    QueryParametersPanelComponent,
    ReportSummaryCardComponent,
    ReportTableComponent,
    TableSkeletonComponent,
    TabsComponent,
  ],
  template: `
    <siaf-page-shell [breadcrumbs]="configuracion().breadcrumbs">
      <siaf-page-header pageHeader [title]="configuracion().title">
        <div actions class="flex flex-wrap items-center justify-end gap-siaf-sm">
          <siaf-button variant="outline" icon="bookmark_border" [disabled]="!parametros()" (click)="favoritesRequested.emit()">Favoritos</siaf-button>
          <siaf-button variant="filled" icon="manage_search" (click)="panelAbierto.set(true)">Parámetros</siaf-button>
        </div>
      </siaf-page-header>

      @if (!parametros()) {
        <section class="flex min-h-[320px] flex-1 flex-col justify-center rounded-siaf-md bg-surface px-siaf-lg py-siaf-xl" data-consulta-vacia>
          <siaf-empty-state
            illustration="no-records"
            [title]="configuracion().emptyTitle ?? 'Aún no se encontraron resultados'"
            [description]="configuracion().emptyDescription ?? 'Ingrese los parámetros de consulta para visualizar la información disponible.'"
          />
        </section>
      } @else {
        <div class="flex flex-col gap-siaf-sm">
          <section class="rounded-siaf-md bg-surface p-siaf-md" data-parametros>
            <siaf-parametros-aplicados [parametros]="parametrosAplicados()" />
          </section>

          <section class="flex flex-col rounded-siaf-md bg-surface" [attr.aria-labelledby]="idTitulo" data-resultado>
            <!-- Figma «Content head» (22715:21316): título, selector de vista y «Exportar», con 16 px entre ellos. -->
            <header class="flex min-h-14 flex-wrap items-center gap-siaf-md px-siaf-lg pt-siaf-md">
              <h2 class="m-0 min-w-0 flex-1 text-base font-bold uppercase leading-normal tracking-[0.02px] text-[var(--sys-color-text-neutral-high)]" [id]="idTitulo">
                {{ configuracion().resultTitle ?? 'Resultado de reporte' }}
              </h2>
              <div class="flex flex-wrap items-center gap-siaf-md">
                @if (configuracion().charts) {
                  <siaf-buttons-group
                    [items]="opcionesVista"
                    [value]="vistaActiva()"
                    [iconOnly]="true"
                    ariaLabel="Vista del resultado"
                    (valueChange)="cambiarVista($event)"
                    data-selector-vista
                  />
                }
                <siaf-icon-dropdown-menu
                  label="Exportar"
                  icon="open_in_new"
                  density="standard"
                  [items]="opcionesExportacion"
                  [menuWidth]="200"
                  [disabled]="loading || !filasFiltradas().length"
                  (selected)="exportar($event)"
                  data-exportar
                />
              </div>
            </header>

            <div class="flex flex-col gap-siaf-lg px-siaf-lg pb-siaf-md pt-siaf-md">
              @if (configuracion().tabs?.length) {
                <siaf-tabs
                  [tabs]="configuracion().tabs ?? []"
                  [activeId]="pestana()"
                  [border]="false"
                  [idBase]="idTitulo + '-pestanas'"
                  [ariaLabel]="configuracion().resultTitle ?? 'Resultado de reporte'"
                  (activeIdChange)="cambiarPestana($event)"
                />
              }

              @if (loading) {
                <siaf-table-skeleton [columns]="configuracion().columns.length" [rows]="6" ariaLabel="Cargando el resultado del reporte" />
              } @else if (vistaActiva() === 'graficas') {
                <!-- Los gráficos (y Chart.js) llegan en su propio chunk la primera vez que se abre la vista. -->
                @defer (on immediate) {
                  <div class="flex flex-col gap-siaf-lg" data-vista-graficas>
                    @if (!filasFiltradas().length) {
                      <siaf-empty-state
                        illustration="no-records"
                        title="No hay filas para graficar"
                        [description]="hayBusquedaOFiltros() ? 'La búsqueda o los filtros de la vista de datos no dejaron filas.' : 'La consulta no devolvió filas para estos parámetros.'"
                      />
                    } @else {
                      @if (hayBusquedaOFiltros()) {
                        <message-box [text]="notaGraficas()" data-nota-graficas />
                      }

                      @if (kpis().length) {
                        <div class="grid gap-siaf-lg sm:grid-cols-2" [class]="claseKpis()" data-kpis>
                          @for (kpi of kpis(); track $index) {
                            <siaf-kpi-card
                              [title]="kpi.title"
                              [amount]="kpi.amount"
                              [progress]="kpi.progress"
                              [progressLabel]="kpi.title + ' respecto del total'"
                              [tone]="kpi.tone"
                              [icon]="kpi.icon"
                            />
                          }
                        </div>
                      }

                      @if (graficos().length) {
                        <div class="grid gap-siaf-lg" [class]="claseGraficos()" data-graficos>
                          @for (grafico of graficos(); track $index) {
                            <siaf-chart-section class="min-w-0" [class]="grafico.clase" [title]="grafico.title" [description]="grafico.description" [attr.data-grafico]="grafico.type">
                              @switch (grafico.dibujo) {
                                @case ('vacio') {
                                  <message-box [text]="hayBusquedaOFiltros() ? 'No hay datos suficientes para este gráfico con la búsqueda o los filtros actuales.' : 'No hay datos suficientes para este gráfico en el resultado.'" data-grafico-vacio />
                                }
                                @case ('line') {
                                  <siaf-line-chart
                                    [categories]="grafico.categories"
                                    [series]="grafico.series"
                                    [valueSuffix]="grafico.valueSuffix"
                                    [ariaLabel]="grafico.ariaLabel"
                                    [categoryLabel]="grafico.categoryLabel"
                                  />
                                }
                                @case ('donut') {
                                  <siaf-donut-chart
                                    [categories]="grafico.categories"
                                    [values]="grafico.values"
                                    [valueSuffix]="grafico.valueSuffix"
                                    [ariaLabel]="grafico.ariaLabel"
                                    [categoryLabel]="grafico.categoryLabel"
                                    [valueLabel]="grafico.seriesName"
                                  />
                                }
                                @case ('diverging') {
                                  <siaf-diverging-chart
                                    [categories]="grafico.categories"
                                    [values]="grafico.values"
                                    [negativeLabel]="grafico.negativeLabel"
                                    [positiveLabel]="grafico.positiveLabel"
                                    [valueSuffix]="grafico.valueSuffix"
                                    [ariaLabel]="grafico.ariaLabel"
                                    [categoryLabel]="grafico.categoryLabel"
                                  />
                                }
                                @default {
                                  <siaf-bar-chart
                                    [categories]="grafico.categories"
                                    [series]="grafico.series"
                                    [valueSuffix]="grafico.valueSuffix"
                                    [ariaLabel]="grafico.ariaLabel"
                                    [categoryLabel]="grafico.categoryLabel"
                                  />
                                }
                              }
                            </siaf-chart-section>
                          }
                        </div>
                      }
                    }
                  </div>
                } @placeholder {
                  <siaf-table-skeleton [columns]="4" [rows]="6" ariaLabel="Cargando las gráficas" />
                }
              } @else {
                @if (resultado()?.summary; as resumen) {
                  <siaf-report-summary-card
                    [label]="resumen.label"
                    [icon]="resumen.icon"
                    [title]="resumen.title"
                    [description]="resumen.description ?? ''"
                    [fields]="resumen.fields"
                  />
                }

                <siaf-form-table-search
                  variant="reports"
                  [value]="busqueda()"
                  ariaLabel="Buscar en el resultado"
                  (valueChange)="buscar($event)"
                  (filter)="advancedFiltersRequested.emit()"
                  (columns)="columnsRequested.emit()"
                />

                @if (configuracion().presetFilters?.length) {
                  <div class="flex flex-wrap items-center gap-siaf-sm" data-filtros-predeterminados>
                    @for (filtro of configuracion().presetFilters ?? []; track filtro.key) {
                      <siaf-filter-pill
                        [label]="filtro.label"
                        [options]="filtro.options"
                        [selectedValue]="filtros()[filtro.key] || ''"
                        (selectedValueChange)="filtrar(filtro.key, $event)"
                      />
                    }
                  </div>
                }

                <siaf-report-table
                  [columns]="configuracion().columns"
                  [rows]="filasPagina()"
                  [rowKey]="configuracion().rowKey"
                  [ariaLabel]="configuracion().tableLabel ?? configuracion().title"
                  (linkClicked)="linkClicked.emit($event)"
                />

                <siaf-pagination
                  navigation="Activate"
                  position="Bottom"
                  [rowPage]="true"
                  [page]="pagina()"
                  [pageSize]="tamanoPagina()"
                  [rowsPerPage]="tamanoPagina()"
                  [rowsPerPageOptions]="opcionesTamano"
                  [totalItems]="filasFiltradas().length"
                  [totalPages]="totalPaginas()"
                  (previous)="pagina.set(pagina() - 1)"
                  (next)="pagina.set(pagina() + 1)"
                  (rowsPerPageChange)="cambiarTamano($event)"
                />

                <p class="sr-only" aria-live="polite" data-anuncio-filas>{{ anuncio() }}</p>
              }
            </div>
          </section>
        </div>
      }
    </siaf-page-shell>

    <siaf-query-parameters-panel
      [open]="panelAbierto()"
      [fields]="configuracion().parameterFields"
      [values]="parametros()"
      (closed)="panelAbierto.set(false)"
      (applied)="aplicar($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QueryReportPageComponent {
  @Input({ required: true }) set config(valor: QueryReportConfig) {
    this.configuracion.set(valor);
    if (!this.pestana() && valor.tabs?.length) this.pestana.set(valor.tabs[0].id);
  }
  /** Resultado de la consulta (o de la pestaña) para los parámetros aplicados. */
  @Input() set result(valor: QueryReportResult | null) {
    this.resultado.set(valor);
    this.pagina.set(1);
  }
  /** Mientras la pantalla consulta: la tabla o las gráficas pasan a esqueleto y «Exportar» se deshabilita. */
  @Input() loading = false;
  /** Pestaña activa al empezar; por defecto, la primera. */
  @Input() set activeTab(valor: string) {
    if (valor) this.pestana.set(valor);
  }

  /** «Aplicar consulta»: la pantalla consulta con estos parámetros y entrega `result`. */
  @Output() queried = new EventEmitter<QueryReportParameters>();
  @Output() tabChanged = new EventEmitter<string>();
  /** Un formato de «Exportar»: la pantalla genera el archivo con las filas recibidas. */
  @Output() exported = new EventEmitter<QueryReportExportEvent>();
  @Output() favoritesRequested = new EventEmitter<void>();
  /** «Filtrar» del buscador (Filtros avanzados). */
  @Output() advancedFiltersRequested = new EventEmitter<void>();
  /** «Columnas» del buscador (Columnas visibles). */
  @Output() columnsRequested = new EventEmitter<void>();
  @Output() linkClicked = new EventEmitter<{ row: QueryReportRow; column: ReportTableColumn }>();

  readonly configuracion = signal<QueryReportConfig>({ title: '', breadcrumbs: [], parameterFields: [], columns: [], rowKey: '' });
  readonly resultado = signal<QueryReportResult | null>(null);
  readonly parametros = signal<QueryReportParameters | null>(null);
  readonly panelAbierto = signal(false);
  readonly pestana = signal('');
  readonly vista = signal<QueryReportView>('datos');
  readonly busqueda = signal('');
  readonly filtros = signal<Record<string, string>>({});
  readonly pagina = signal(1);
  readonly tamanoPagina = signal(25);
  readonly opcionesTamano = [10, 25, 50, 100];
  readonly idTitulo = `siaf-consulta-resultado-${++siguienteId}`;

  /** Figma 22715:21316: `info` para la tabla e `insert_chart` para las gráficas; la etiqueta va en el tooltip. */
  readonly opcionesVista: ButtonGroupItem[] = [
    { label: 'Vista de datos', value: 'datos', icon: 'info' },
    { label: 'Vista de gráficas', value: 'graficas', icon: 'insert_chart' },
  ];

  /**
   * Figma «Opciones de tabla» (22402:16485). Material Icons no trae los archivos XLS y PDF del Figma: Excel usa
   * `table_view`, como el resto del kit, y PDF `picture_as_pdf`; CSV es el `table_chart` del Figma.
   */
  readonly opcionesExportacion: IconDropdownMenuItem[] = [
    { label: 'Excel', value: 'excel', icon: 'table_view' },
    { label: 'CSV', value: 'csv', icon: 'table_chart' },
    { label: 'PDF', value: 'pdf', icon: 'picture_as_pdf' },
  ];

  /** Sin `charts` en la configuración no hay selector y siempre se ve la tabla. */
  readonly vistaActiva = computed<QueryReportView>(() => (this.configuracion().charts ? this.vista() : 'datos'));

  readonly parametrosAplicados = computed<ParametroAplicado[]>(() => {
    const valores = this.parametros() ?? {};
    return this.configuracion()
      .parameterFields.filter((campo) => tieneValor(valores[campo.key]))
      .map((campo) => {
        const valor = valores[campo.key];
        const etiqueta = (v: string): string => campo.options?.find((o) => o.value === v)?.label ?? v;
        const texto = Array.isArray(valor)
          ? valor.map(etiqueta).join(', ')
          : campo.type === 'date'
            ? fechaVisible(valor)
            : etiqueta(valor);
        return { label: campo.label, value: texto, icon: campo.icon };
      });
  });

  readonly filasFiltradas = computed<QueryReportRow[]>(() => {
    const filas = this.resultado()?.rows ?? [];
    const termino = normalizar(this.busqueda().trim());
    const filtros = Object.entries(this.filtros()).filter(([, valor]) => !!valor);
    const columnas = this.configuracion().columns;
    return filas.filter(
      (fila) =>
        filtros.every(([clave, valor]) => fila[clave] === valor) &&
        (!termino || columnas.some((c) => normalizar(fila[c.key] ?? '').includes(termino))),
    );
  });

  readonly hayBusquedaOFiltros = computed(() => !!this.busqueda().trim() || Object.values(this.filtros()).some((valor) => !!valor));

  readonly totalPaginas = computed(() => Math.max(1, Math.ceil(this.filasFiltradas().length / this.tamanoPagina())));

  readonly filasPagina = computed(() => {
    const pagina = Math.min(this.pagina(), this.totalPaginas());
    const inicio = (pagina - 1) * this.tamanoPagina();
    return this.filasFiltradas().slice(inicio, inicio + this.tamanoPagina());
  });

  readonly anuncio = computed(() => {
    const total = this.filasFiltradas().length;
    return total === 1 ? '1 fila en el resultado' : `${total} filas en el resultado`;
  });

  readonly kpis = computed(() => calcularKpis(this.filasFiltradas(), this.configuracion().charts?.kpis ?? []));

  readonly graficos = computed<GraficoEnVista[]>(() => {
    const calculados = (this.configuracion().charts?.charts ?? []).map((grafico) => calcularGrafico(this.filasFiltradas(), grafico));
    return calculados.map((grafico, i) => {
      const emparejado =
        grafico.width === 'wide' ? calculados[i + 1]?.width === 'narrow' : calculados[i - 1]?.width === 'wide';
      return {
        ...grafico,
        dibujo: grafico.categories.length ? grafico.type : 'vacio',
        series: [{ name: grafico.seriesName, values: grafico.values }],
        ariaLabel: grafico.title,
        clase: emparejado ? '' : 'xl:col-span-2',
      };
    });
  });

  private readonly hayGraficoAngosto = computed(() => this.graficos().some((grafico) => grafico.width === 'narrow'));

  /** Dos columnas angostas en tablet y hasta cuatro por fila en escritorio; con un gráfico angosto, la última mide 336 px. */
  readonly claseKpis = computed(() => {
    const columnas = Math.min(this.kpis().length, 4);
    if (columnas === 4) return this.hayGraficoAngosto() ? 'xl:grid-cols-[repeat(3,minmax(0,1fr))_336px]' : 'xl:grid-cols-4';
    if (columnas === 3) return this.hayGraficoAngosto() ? 'xl:grid-cols-[repeat(2,minmax(0,1fr))_336px]' : 'xl:grid-cols-3';
    return '';
  });

  /** En escritorio, el gráfico ancho y a su derecha el angosto de 336 px (Figma 22402:16766); en pantallas menores, uno por fila. */
  readonly claseGraficos = computed(() => (this.hayGraficoAngosto() ? 'xl:grid-cols-[minmax(0,1fr)_336px]' : ''));

  readonly notaGraficas = computed(() => {
    const total = this.filasFiltradas().length;
    return total === 1
      ? 'Las gráficas usan la única fila que quedó tras buscar o filtrar en la vista de datos.'
      : `Las gráficas usan las ${total} filas que quedaron tras buscar o filtrar en la vista de datos.`;
  });

  aplicar(valores: QueryReportParameters): void {
    this.parametros.set(valores);
    this.busqueda.set('');
    this.filtros.set({});
    this.pagina.set(1);
    this.panelAbierto.set(false);
    this.queried.emit(valores);
  }

  cambiarPestana(id: string): void {
    this.pestana.set(id);
    this.pagina.set(1);
    this.tabChanged.emit(id);
  }

  cambiarVista(valor: string): void {
    this.vista.set(valor === 'graficas' ? 'graficas' : 'datos');
  }

  buscar(termino: string): void {
    this.busqueda.set(termino);
    this.pagina.set(1);
  }

  filtrar(clave: string, valor: string): void {
    this.filtros.update((actual) => ({ ...actual, [clave]: valor }));
    this.pagina.set(1);
  }

  cambiarTamano(tamano: number): void {
    this.tamanoPagina.set(tamano);
    this.pagina.set(1);
  }

  exportar(formato: string): void {
    const format = FORMATOS_EXPORTACION.find((f) => f === formato);
    if (!format) return;
    this.exported.emit({ format, parameters: this.parametros() ?? {}, rows: this.filasFiltradas() });
  }
}
