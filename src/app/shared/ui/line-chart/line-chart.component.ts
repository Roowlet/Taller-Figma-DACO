import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CategoryScale, Chart, LinearScale, LineController, LineElement, PointElement, Tooltip } from 'chart.js';
import type { ChartData, ChartOptions } from 'chart.js';

import { ChartLegendComponent } from '../chart-legend/chart-legend.component';
import { ChartTooltipComponent } from '../chart-tooltip/chart-tooltip.component';
import { formatearValor, tokenDeSerie } from '../charts/chart-tema';
import { ChartSeries, GraficoBase, SerieDibujada, ajustarEje } from '../charts/grafico-base';

Chart.register(CategoryScale, LinearScale, LineController, LineElement, PointElement, Tooltip);

/** Radio del punto activo (con el puntero o el teclado); el tooltip se apoya encima. */
const RADIO_ACTIVO = 8;

/**
 * Gráfico de línea del kit (Figma UI KIT, página «Graphics»: «Line»), dibujado con Chart.js: por serie, una línea de
 * 4 px con un punto de 12 px en cada categoría, para seguir cómo evoluciona un valor. El eje de valores no arranca en
 * cero, porque la línea compara la forma y no el largo: Chart.js elige un rango redondo alrededor de los datos, que se
 * fija con `min` y `max`. Comparte con `siaf-bar-chart` la paleta del kit, la leyenda, el tooltip, el teclado y la
 * tabla de datos.
 *
 * @figma 22743:299 Line
 * @usar
 * - Para la evolución de uno o más valores a lo largo de meses o periodos, como activos y existencias por mes.
 * - Dentro de `siaf-chart-section`, que le pone título y descripción.
 * - `min` y `max` para fijar el rango del eje (en el Figma, de 100 a 500), y `valueSuffix="%"` para porcentajes.
 * @evitar
 * - Para comparar cantidades entre categorías sin un orden en el tiempo: usar `siaf-bar-chart`.
 * - Para variaciones que suben y bajan respecto de cero: usar `siaf-diverging-chart`.
 * - Con más de cuatro series: la paleta da la vuelta y los colores se repiten.
 * @teclado
 * - **Tab**: enfoca el gráfico (una sola parada).
 * - **Flecha derecha / izquierda**: recorren las categorías y muestran el tooltip con el valor de cada serie; dan la
 *   vuelta.
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
 * - **1.4.1 Uso del color (A)**: las líneas se distinguen solo por color (el Figma no usa trazos distintos), pero sus
 *   nombres están en la leyenda, en el tooltip y en la tabla de datos.
 * - **1.4.13 Contenido en hover o foco (AA)**: Escape oculta el tooltip sin mover el puntero ni el foco.
 * - **Pendiente · 1.4.11 Contraste no textual (AA)**: en oscuro las líneas de las series 1 y 2 (`bg-brand-primary`,
 *   2.66:1, y `bg-brand-secondary`, 2.99:1) no llegan a 3:1 sobre la superficie; la paleta oscura de los gráficos está
 *   por definir con diseño.
 */
@Component({
  selector: 'siaf-line-chart',
  standalone: true,
  imports: [ChartLegendComponent, ChartTooltipComponent],
  host: { class: 'block' },
  template: `
    <!-- Mismo relleno que las barras: 24 px arriba y a los lados, también dentro de siaf-chart-section. -->
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
export class LineChartComponent extends GraficoBase<'line'> {
  /** Etiquetas de las categorías, en orden (meses, periodos). */
  @Input() categories: readonly string[] = [];
  @Input() series: readonly ChartSeries[] = [];
  /** Sufijo de los valores en el eje, el tooltip y la tabla (por ejemplo `%`). */
  @Input() valueSuffix = '';
  /** Mínimo del eje de valores; sin él, Chart.js elige uno redondo por debajo del menor valor. */
  @Input() min: number | null = null;
  /** Máximo del eje de valores; sin él, Chart.js elige uno redondo por encima del mayor valor. */
  @Input() max: number | null = null;
  /** Nombre accesible del gráfico y título de su tabla de datos. */
  @Input() ariaLabel = 'Gráfico de línea';
  /** Encabezado de la columna de categorías en la tabla de datos. */
  @Input() categoryLabel = 'Categoría';
  /** Alto del área del gráfico en px (sin la leyenda). */
  @Input() height = 252;

  protected readonly tipo = 'line';

  get etiquetas(): readonly string[] {
    return this.categories;
  }

  get seriesDibujadas(): SerieDibujada[] {
    return this.series.map((serie, i) => ({ name: serie.name, values: serie.values, token: tokenDeSerie(i) }));
  }

  protected get categoriasEnVertical(): boolean {
    return false;
  }

  protected datos(): ChartData<'line'> {
    return {
      labels: [...this.etiquetas],
      datasets: this.series.map((serie, i) => {
        const color = this.colorDe(tokenDeSerie(i));
        return {
          label: serie.name,
          data: [...serie.values],
          borderColor: color,
          backgroundColor: color,
          borderWidth: 4,
          borderCapStyle: 'round' as const,
          borderJoinStyle: 'round' as const,
          pointRadius: 6,
          pointHoverRadius: RADIO_ACTIVO,
          pointBackgroundColor: color,
          pointHoverBackgroundColor: color,
          pointBorderWidth: 0,
          pointHoverBorderWidth: 0,
          // Un punto en el borde del rango (con `min` o `max`) se ve entero, no cortado por el área del gráfico.
          clip: RADIO_ACTIVO,
        };
      }),
    };
  }

  protected opciones(): ChartOptions<'line'> {
    const { colorTexto, colorGrilla, fuente } = this.estiloDeEjes();
    return {
      ...this.opcionesComunes(),
      // Aire arriba para el punto más alto al activarse.
      layout: { padding: { top: RADIO_ACTIVO } },
      scales: {
        x: {
          afterFit: ajustarEje,
          // Los puntos van al centro de su categoría, como en el Figma, y no pegados a los bordes.
          offset: true,
          border: { display: false },
          grid: { display: false, drawTicks: false },
          ticks: {
            color: colorTexto,
            font: fuente,
            padding: 12,
            callback: (_valor, indice) => (this.etiquetas[indice] ?? '').toUpperCase(),
          },
        },
        y: {
          afterFit: ajustarEje,
          beginAtZero: false,
          min: this.min ?? undefined,
          max: this.max ?? undefined,
          border: { display: false },
          grid: { color: colorGrilla, drawTicks: false },
          ticks: {
            color: colorTexto,
            font: fuente,
            padding: 12,
            maxTicksLimit: 6,
            callback: (valor) => formatearValor(Number(valor), this.valueSuffix),
          },
        },
      },
    };
  }
}
