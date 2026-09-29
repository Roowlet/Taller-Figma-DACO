import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { BarController, BarElement, CategoryScale, Chart, LinearScale, Tooltip } from 'chart.js';
import type { ChartData, ChartOptions } from 'chart.js';

import { ChartLegendComponent } from '../chart-legend/chart-legend.component';
import { ChartTooltipComponent } from '../chart-tooltip/chart-tooltip.component';
import { formatearValor, tokenDeSerie } from '../charts/chart-tema';
import { GraficoBase, SerieDibujada, ajustarEje } from '../charts/grafico-base';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip);

/** Paso «redondo» (1, 2, 2,5 o 5 por una potencia de 10) igual o mayor que `valor`. */
function pasoRedondo(valor: number): number {
  if (!(valor > 0) || !Number.isFinite(valor)) return 1;
  const potencia = 10 ** Math.floor(Math.log10(valor));
  const fraccion = valor / potencia;
  const redondo = fraccion <= 1 ? 1 : fraccion <= 2 ? 2 : fraccion <= 2.5 ? 2.5 : fraccion <= 5 ? 5 : 10;
  return redondo * potencia;
}

/**
 * Gráfico divergente del kit (Figma UI KIT, página «Graphics»: «Divergente»), dibujado con Chart.js: una barra
 * horizontal por categoría que sale de la línea del cero (`divider-strong`) hacia la izquierda si el valor es negativo
 * y hacia la derecha si es positivo. El eje es simétrico, con cinco marcas (−2p, −p, 0, p y 2p) y un paso redondo que
 * cubre al mayor valor, salvo que `max` fije el límite. Cada lado tiene su color y su nombre en la leyenda:
 * `negativeLabel` con el primario y `positiveLabel` con el secundario.
 *
 * @figma 22743:260 Divergente
 * @usar
 * - Para variaciones respecto de cero por mes o categoría: variación de existencias, superávit y déficit.
 * - `negativeLabel` y `positiveLabel` con lo que significa cada lado, como «Disminución» y «Aumento».
 * - Dentro de `siaf-chart-section`, que le pone título y descripción.
 * @evitar
 * - Para valores que no cambian de signo: usar `siaf-bar-chart`, horizontal si las etiquetas son largas.
 * - Para varias series por categoría: usar `siaf-bar-chart` agrupado.
 * - Para la evolución de un valor en el tiempo: usar `siaf-line-chart`.
 * @teclado
 * - **Tab**: enfoca el gráfico (una sola parada).
 * - **Flecha abajo / arriba**: recorren las categorías y muestran el tooltip con su valor; dan la vuelta.
 * - **Inicio / Fin**: van a la primera o a la última categoría.
 * - **Escape**: oculta el tooltip; salir del gráfico también lo oculta.
 * @accesibilidad
 * - **1.1.1 Contenido no textual (A)**: el lienzo es `role="img"` con `ariaLabel` y, además, hay una tabla de datos
 *   oculta (`sr-only`) con una fila por categoría y el valor en la columna de su lado.
 * - **1.3.1 Información y relaciones (A)**: la tabla usa `caption`, `th scope="col"` para los dos lados y
 *   `th scope="row"` para las categorías.
 * - **2.1.1 Teclado (A)**: los valores se recorren con las flechas; al moverse, una región `aria-live` anuncia la
 *   categoría, el lado y el valor.
 * - **2.4.7 Foco visible (AA)**: el lienzo enfocado muestra el contorno de 2 px `border-states-focus`.
 * - **1.4.1 Uso del color (A)**: el lado no depende solo del color: la barra queda a la izquierda o a la derecha del
 *   cero, el valor lleva su signo y el nombre del lado está en la leyenda, en el tooltip y en la tabla.
 * - **1.4.13 Contenido en hover o foco (AA)**: Escape oculta el tooltip sin mover el puntero ni el foco.
 * - **Pendiente · 1.4.11 Contraste no textual (AA)**: en oscuro las barras de los dos lados (`bg-brand-primary`,
 *   2.66:1, y `bg-brand-secondary`, 2.99:1) no llegan a 3:1 sobre la superficie; la paleta oscura de los gráficos está
 *   por definir con diseño.
 */
@Component({
  selector: 'siaf-diverging-chart',
  standalone: true,
  imports: [ChartLegendComponent, ChartTooltipComponent],
  host: { class: 'block' },
  template: `
    <!-- Relleno del Figma («Divergente»): 24 px arriba y a los lados, también dentro de siaf-chart-section. -->
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
export class DivergingChartComponent extends GraficoBase<'bar'> {
  /** Etiquetas de las categorías (meses, rubros), de arriba abajo. */
  @Input() categories: readonly string[] = [];
  /** Un valor con signo por categoría, en el mismo orden que `categories`. */
  @Input() values: readonly number[] = [];
  /** Qué significa el lado negativo, en color primario: nombre en la leyenda, el tooltip y la tabla. */
  @Input() negativeLabel = 'Negativo';
  /** Qué significa el lado positivo, en color secundario: nombre en la leyenda, el tooltip y la tabla. */
  @Input() positiveLabel = 'Positivo';
  /** Sufijo de los valores en el eje, el tooltip y la tabla (por ejemplo `%`). */
  @Input() valueSuffix = '';
  /** Límite del eje a cada lado del cero; sin él, el doble de un paso redondo que cubre al mayor valor absoluto. */
  @Input() max: number | null = null;
  /** Nombre accesible del gráfico y título de su tabla de datos. */
  @Input() ariaLabel = 'Gráfico divergente';
  /** Encabezado de la columna de categorías en la tabla de datos. */
  @Input() categoryLabel = 'Categoría';
  /** Alto del área del gráfico en px (sin la leyenda). */
  @Input() height = 252;

  protected readonly tipo = 'bar';

  get etiquetas(): readonly string[] {
    return this.categories;
  }

  /** Los dos lados como series: cada categoría tiene su valor en la de su signo y `null` en la otra. */
  get seriesDibujadas(): SerieDibujada[] {
    const lado = (negativo: boolean): (number | null)[] =>
      this.categories.map((_, i) => {
        const valor = this.values[i];
        return Number.isFinite(valor) && (valor < 0) === negativo ? valor : null;
      });
    return [
      { name: this.negativeLabel, values: lado(true), token: tokenDeSerie(0) },
      { name: this.positiveLabel, values: lado(false), token: tokenDeSerie(1) },
    ];
  }

  protected get categoriasEnVertical(): boolean {
    return true;
  }

  /** Límite del eje a cada lado del cero. */
  private get limite(): number {
    if (this.max !== null && this.max > 0) return this.max;
    const mayor = Math.max(0, ...this.values.filter(Number.isFinite).map(Math.abs));
    return 2 * pasoRedondo(mayor / 2);
  }

  protected datos(): ChartData<'bar'> {
    return {
      labels: [...this.etiquetas],
      datasets: this.seriesDibujadas.map((serie) => {
        const color = this.colorDe(serie.token);
        return {
          label: serie.name,
          data: serie.values.map((valor) => valor ?? null),
          backgroundColor: color,
          hoverBackgroundColor: color,
          borderRadius: 4,
          borderSkipped: 'start' as const,
          // Los dos lados comparten la fila de su categoría, donde solo uno tiene barra.
          grouped: false,
          categoryPercentage: 0.7,
          barPercentage: 1,
          maxBarThickness: 30,
        };
      }),
    };
  }

  protected opciones(): ChartOptions<'bar'> {
    const { colorTexto, colorGrilla, fuente } = this.estiloDeEjes();
    const colorCero = this.colorDe('--sys-color-divider-strong');
    const limite = this.limite;
    return {
      ...this.opcionesComunes(),
      indexAxis: 'y',
      scales: {
        x: {
          afterFit: ajustarEje,
          min: -limite,
          max: limite,
          border: { display: false },
          grid: { color: (contexto) => (contexto.tick?.value === 0 ? colorCero : colorGrilla), drawTicks: false },
          ticks: {
            color: colorTexto,
            font: fuente,
            padding: 12,
            stepSize: limite / 2,
            callback: (valor) => formatearValor(Number(valor), this.valueSuffix),
          },
        },
        y: {
          afterFit: ajustarEje,
          border: { display: false },
          grid: { display: false, drawTicks: false },
          ticks: {
            color: colorTexto,
            font: fuente,
            padding: 12,
            callback: (_valor, indice) => (this.etiquetas[indice] ?? '').toUpperCase(),
          },
        },
      },
    };
  }
}
