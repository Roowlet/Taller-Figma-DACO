import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { BarController, BarElement, CategoryScale, Chart, LinearScale, Tooltip } from 'chart.js';
import type { ActiveDataPoint, ChartData, ChartOptions, Plugin } from 'chart.js';

import { ChartLegendComponent } from '../chart-legend/chart-legend.component';
import { ChartTooltipComponent } from '../chart-tooltip/chart-tooltip.component';
import { colorDeTextoSobre, formatearPorcentaje, formatearValor, tokenDeSerie } from '../charts/chart-tema';
import { ChartSeries, GraficoBase, SerieDibujada, ajustarEje, tieneValor } from '../charts/grafico-base';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip);

export type BarChartOrientation = 'vertical' | 'horizontal';

/**
 * Aire bajo la barra 100 %: los nombres de sus tramos (8 px de separación y una línea de 12 px) más los 24 px de relleno
 * inferior del marco del Figma, que la figura no tiene. Así la barra queda a la misma altura que en el Figma.
 */
const AIRE_BAJO_LA_BARRA = 47;

/**
 * Gráfico de barras del kit (Figma UI KIT, página «Graphics»: «Bar», «Bar grouped», «Comparative bars» y «Stacked
 * bar»), dibujado con Chart.js. Con una serie son barras simples; con dos o más, agrupadas por categoría; y con una sola
 * categoría (o ninguna), el comparativo: las series lado a lado, sin etiqueta de categoría y con un tooltip por barra.
 * `orientation="horizontal"`
 * pone las categorías a la izquierda. Con `stacked` las series se apilan en cada categoría, con 2 px de aire entre
 * tramos y el porcentaje de cada tramo adentro cuando entra; con una sola categoría es la barra 100 % del Figma: una
 * barra horizontal que llena el ancho, sin ejes, con el nombre de cada tramo debajo. Los colores salen de la paleta del
 * kit (`TOKENS_SERIES`) y se vuelven a leer al cambiar de tema; la leyenda y el tooltip son `siaf-chart-legend` y
 * `siaf-chart-tooltip`.
 *
 * @figma 22743:375 Bar
 * @figma 22743:507 Bar grouped
 * @figma 22743:622 Comparative bars
 * @figma 22743:356 Stacked bar
 * @usar
 * - Para comparar cantidades entre categorías o meses (recaudación, documentos por estado), con pocas series.
 * - Dentro de `siaf-chart-section`, que le pone título y descripción.
 * - `valueSuffix="%"` cuando los valores son porcentajes, y `ariaLabel` con lo que muestra el gráfico.
 * - `stacked` para las partes de un total en cada categoría y, con una sola categoría, para la composición de un total
 *   en una barra (activos y patrimonio).
 * @evitar
 * - Para la evolución de un valor a lo largo del tiempo: usar `siaf-line-chart`.
 * - Para variaciones que suben y bajan respecto de cero: usar `siaf-diverging-chart`.
 * - Para las partes de un total en un anillo, con el porcentaje de cada parte al centro: usar `siaf-donut-chart`.
 * - Con más de cuatro series: la paleta da la vuelta y los colores se repiten.
 * - Para un solo número destacado: usar `siaf-kpi-card`.
 * @teclado
 * - **Tab**: enfoca el gráfico (una sola parada).
 * - **Flecha derecha / izquierda** (vertical) o **abajo / arriba** (horizontal): recorren las categorías y muestran el
 *   tooltip con el valor de cada serie; dan la vuelta.
 * - En el comparativo, las flechas pasan de una barra a la siguiente y el tooltip muestra solo su valor.
 * - **Inicio / Fin**: van a la primera o a la última categoría.
 * - **Escape**: oculta el tooltip; salir del gráfico también lo oculta.
 * @accesibilidad
 * - **1.1.1 Contenido no textual (A)**: el lienzo es `role="img"` con `ariaLabel` y, además, hay una tabla de datos
 *   oculta (`sr-only`) con una fila por categoría y una columna por serie.
 * - **1.3.1 Información y relaciones (A)**: la tabla usa `caption`, `th scope="col"` para las series y
 *   `th scope="row"` para las categorías.
 * - **2.1.1 Teclado (A)**: los valores se recorren con las flechas; al moverse, una región `aria-live` anuncia la
 *   categoría y los valores.
 * - **2.4.7 Foco visible (AA)**: el lienzo enfocado muestra el contorno de 2 px `border-states-focus`.
 * - **1.4.1 Uso del color (A)**: las series se distinguen por color, pero sus nombres están en la leyenda, en el
 *   tooltip y en la tabla de datos.
 * - **1.4.3 Contraste mínimo (AA)**: el porcentaje dentro de un tramo apilado toma, entre blanco, `text-neutral-high` y la
 *   superficie, el de más contraste con su color (4.71:1 como mínimo, en claro y en oscuro); lo dibujado en el lienzo
 *   está también en la tabla de datos.
 * - **1.4.13 Contenido en hover o foco (AA)**: Escape oculta el tooltip sin mover el puntero ni el foco.
 * - **Pendiente · 1.4.11 Contraste no textual (AA)**: en oscuro las barras de las series 1 y 2 (`bg-brand-primary`,
 *   2.66:1, y `bg-brand-secondary`, 2.99:1) no llegan a 3:1 sobre la superficie y la 2 y la 3 quedan del mismo tono;
 *   la paleta oscura de los gráficos está por definir con diseño.
 */
@Component({
  selector: 'siaf-bar-chart',
  standalone: true,
  imports: [ChartLegendComponent, ChartTooltipComponent],
  host: { class: 'block' },
  template: `
    <!-- Relleno del Figma («Bar»): 24 px arriba y a los lados, también dentro de siaf-chart-section. -->
    <figure class="m-0 flex flex-col gap-siaf-md px-siaf-lg pt-siaf-lg">
      @if (seriesDibujadas.length) {
        <siaf-chart-legend [items]="leyenda" />
      }
      <div class="relative w-full" [style.height.px]="height">
        <canvas
          #lienzo
          class="rounded-siaf-sm outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sys-color-border-states-focus)]"
          tabindex="0"
          role="img"
          [attr.aria-label]="ariaLabel"
          (keydown)="alTeclado($event)"
          (blur)="ocultarTooltip()"
        ></canvas>
        @if (tooltip(); as visible) {
          <siaf-chart-tooltip
            class="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full"
            [style.left.px]="visible.x"
            [style.top.px]="visible.y - 8"
            [title]="visible.titulo"
            [items]="visible.items"
          />
        }
      </div>
      <p class="sr-only" aria-live="polite">{{ anuncio() }}</p>
      <!-- sr-only en un div y no en la tabla: una tabla crece hasta su contenido aunque declare 1 px, y su caja invisible
           ensanchaba la página en columnas angostas. -->
      <div class="sr-only">
        <table>
          <caption>{{ ariaLabel }}</caption>
          <thead>
            <tr>
              <th scope="col">{{ categoryLabel }}</th>
              @for (serie of seriesDibujadas; track $index) {
                <th scope="col">{{ serie.name }}</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (categoria of etiquetas; track $index; let i = $index) {
              <tr>
                <th scope="row">{{ categoria }}</th>
                @for (serie of seriesDibujadas; track $index) {
                  <td>{{ valor(serie, i) }}</td>
                }
              </tr>
            }
          </tbody>
        </table>
      </div>
    </figure>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarChartComponent extends GraficoBase<'bar'> {
  /** Etiquetas de las categorías (meses, estados). Con una sola, o ninguna, es el comparativo o la barra 100 %. */
  @Input() categories: readonly string[] = [];
  @Input() series: readonly ChartSeries[] = [];
  @Input() orientation: BarChartOrientation = 'vertical';
  /** Sufijo de los valores en el eje, el tooltip y la tabla (por ejemplo `%`). */
  @Input() valueSuffix = '';
  /** Máximo del eje de valores; sin él, Chart.js elige uno redondo por encima del mayor valor. */
  @Input() max: number | null = null;
  /** Nombre accesible del gráfico y título de su tabla de datos. */
  @Input() ariaLabel = 'Gráfico de barras';
  /** Encabezado de la columna de categorías en la tabla de datos. */
  @Input() categoryLabel = 'Categoría';
  /** Alto del área del gráfico en px (sin la leyenda). */
  @Input() height = 252;
  /**
   * Apila las series de cada categoría. Con una sola categoría es la barra 100 % del Figma («Stacked bar»): horizontal,
   * sin ejes, con el porcentaje de cada tramo adentro y su nombre debajo.
   */
  @Input() stacked = false;

  protected readonly tipo = 'bar';
  /** Color del porcentaje sobre cada serie apilada (el de más contraste), leído junto con la paleta. */
  private textoSobreSerie: string[] = [];

  get etiquetas(): readonly string[] {
    return this.categories.length ? this.categories : [''];
  }

  get seriesDibujadas(): SerieDibujada[] {
    return this.series.map((serie, i) => ({ name: serie.name, values: serie.values, token: tokenDeSerie(i) }));
  }

  get comparativo(): boolean {
    return !this.stacked && this.categories.length <= 1;
  }

  /** Barra apilada con una sola categoría: la barra 100 % del Figma. */
  get barraUnica(): boolean {
    return this.stacked && this.categories.length <= 1;
  }

  /** Rótulo del tramo `datasetIndex` en la categoría `indice`: su parte de la pila; `null` si no tiene valor. */
  textoDeTramo(datasetIndex: number, indice: number): string | null {
    const valor = this.series[datasetIndex]?.values[indice];
    if (!(Number(valor) > 0)) return null;
    const total = this.series.reduce((suma, serie) => suma + Math.max(0, Number(serie.values[indice]) || 0), 0);
    return formatearPorcentaje(valor, total);
  }

  protected get categoriasEnVertical(): boolean {
    return this.horizontal;
  }

  /** En el comparativo cada barra es una posición del teclado. */
  protected override get totalPosiciones(): number {
    return this.comparativo ? this.series.length : super.totalPosiciones;
  }

  protected override activosEn(posicion: number): ActiveDataPoint[] {
    if (!this.comparativo) return super.activosEn(posicion);
    return tieneValor(this.series[posicion]?.values[0]) ? [{ datasetIndex: posicion, index: 0 }] : [];
  }

  protected override textoDelAnuncio(posicion: number): string {
    if (!this.comparativo) return super.textoDelAnuncio(posicion);
    const serie = this.seriesDibujadas[posicion];
    return serie ? `${serie.name} ${this.valor(serie, 0)}` : '';
  }

  private get horizontal(): boolean {
    return this.barraUnica || this.orientation === 'horizontal';
  }

  protected override complementos(): Plugin<'bar'>[] {
    return [{ id: 'siafTramosApilados', afterDatasetsDraw: (grafico) => this.rotularTramos(grafico) }];
  }

  protected datos(): ChartData<'bar'> {
    const cantidad = Math.max(this.series.length, 1);
    const ultima = this.series.length - 1;
    const colores = this.series.map((_, i) => this.colorDe(tokenDeSerie(i)));
    this.textoSobreSerie = this.stacked ? colores.map((color) => colorDeTextoSobre(this.host.nativeElement, color)) : [];
    return {
      labels: [...this.etiquetas],
      datasets: this.series.map((serie, i) => {
        const comun = { label: serie.name, data: [...serie.values], backgroundColor: colores[i], hoverBackgroundColor: colores[i], maxBarThickness: 62 };
        if (this.stacked) {
          // Tramos rectos con 2 px de aire hacia el siguiente (un borde transparente de ese lado), como en el Figma.
          const aire = i < ultima ? 2 : 0;
          return {
            ...comun,
            borderRadius: 0,
            borderSkipped: false as const,
            borderColor: 'transparent',
            borderWidth: this.horizontal ? { top: 0, right: aire, bottom: 0, left: 0 } : { top: aire, right: 0, bottom: 0, left: 0 },
            categoryPercentage: this.barraUnica ? 1 : this.horizontal ? 0.7 : 0.6,
            barPercentage: 1,
          };
        }
        return {
          ...comun,
          borderRadius: 4,
          borderSkipped: 'start' as const,
          // Comparativo: las series ocupan el centro, con barras de ~62 px y aire entre ellas, como en el Figma; en
          // horizontal las barras del Figma ocupan dos tercios de su fila.
          categoryPercentage: this.comparativo ? Math.min(0.16 * cantidad, 0.9) : this.orientation === 'horizontal' ? 0.7 : 0.6,
          barPercentage: this.comparativo ? 0.62 : this.series.length > 1 ? 0.85 : 1,
        };
      }),
    };
  }

  protected opciones(): ChartOptions<'bar'> {
    if (this.barraUnica) {
      const total = this.series.reduce((suma, serie) => suma + Math.max(0, Number(serie.values[0]) || 0), 0);
      return {
        ...this.opcionesComunes(),
        indexAxis: 'y',
        layout: { padding: { bottom: AIRE_BAJO_LA_BARRA } },
        scales: {
          x: { display: false, stacked: true, min: 0, max: total || 1 },
          y: { display: false, stacked: true },
        },
      };
    }
    const { colorTexto, colorGrilla, fuente } = this.estiloDeEjes();
    const ejeValores = {
      afterFit: ajustarEje,
      stacked: this.stacked,
      beginAtZero: true,
      max: this.max ?? undefined,
      border: { display: false },
      grid: { color: colorGrilla, drawTicks: false },
      ticks: {
        color: colorTexto,
        font: fuente,
        padding: 12,
        maxTicksLimit: 6,
        callback: (valor: string | number) => formatearValor(Number(valor), this.valueSuffix),
      },
    };
    const ejeCategorias = {
      afterFit: ajustarEje,
      stacked: this.stacked,
      border: { display: false },
      grid: { display: false, drawTicks: false },
      ticks: {
        display: !this.comparativo,
        color: colorTexto,
        font: fuente,
        padding: 12,
        callback: (_valor: string | number, indice: number) => (this.etiquetas[indice] ?? '').toUpperCase(),
      },
    };
    const horizontal = this.horizontal;
    return {
      ...this.opcionesComunes(),
      // Comparativo: cada serie es una barra propia y el tooltip muestra solo la más cercana al puntero.
      ...(this.comparativo ? { interaction: { mode: 'nearest' as const, intersect: false, axis: horizontal ? ('y' as const) : ('x' as const) } } : {}),
      indexAxis: horizontal ? 'y' : 'x',
      scales: horizontal ? { x: ejeValores, y: ejeCategorias } : { x: ejeCategorias, y: ejeValores },
    };
  }

  /** Porcentaje dentro de cada tramo apilado, si entra, y, en la barra 100 %, el nombre de cada tramo debajo. */
  private rotularTramos(grafico: Chart<'bar'>): void {
    if (!this.stacked) return;
    const ctx = grafico.ctx;
    const familia = getComputedStyle(this.host.nativeElement).fontFamily;
    const colorNombre = this.barraUnica ? this.colorDe('--sys-color-text-neutral-low') : '';
    const ultima = this.series.length - 1;
    const horizontal = this.horizontal;
    ctx.save();
    this.series.forEach((serie, datasetIndex) => {
      const meta = grafico.getDatasetMeta(datasetIndex);
      if (meta.hidden) return;
      meta.data.forEach((elemento, indice) => {
        const texto = this.textoDeTramo(datasetIndex, indice);
        if (!texto) return;
        const { x, y, base, width, height } = elemento.getProps(['x', 'y', 'base', 'width', 'height'], true);
        const ancho = horizontal ? Math.abs(x - base) : width;
        const alto = horizontal ? height : Math.abs(base - y);
        const centroX = horizontal ? (x + base) / 2 : x;
        ctx.font = `700 12px ${familia}`;
        if (ctx.measureText(texto).width + 16 <= ancho && alto >= 20) {
          ctx.fillStyle = this.textoSobreSerie[datasetIndex] ?? '';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(texto, centroX, horizontal ? y : (y + base) / 2);
        }
        if (!this.barraUnica) return;
        const nombre = serie.name.toUpperCase();
        ctx.font = `400 12px ${familia}`;
        if (ctx.measureText(nombre).width > ancho) return;
        ctx.fillStyle = colorNombre;
        ctx.textBaseline = 'top';
        ctx.textAlign = datasetIndex === 0 ? 'left' : datasetIndex === ultima ? 'right' : 'center';
        const xNombre = datasetIndex === 0 ? Math.min(x, base) : datasetIndex === ultima ? Math.max(x, base) : centroX;
        ctx.fillText(nombre, xNombre, y + height / 2 + 8);
      });
    });
    ctx.restore();
  }
}
