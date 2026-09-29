import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ArcElement, Chart, DoughnutController, Interaction, Tooltip } from 'chart.js';
import type { ChartData, ChartOptions, InteractionItem, InteractionModeFunction } from 'chart.js';
import { TAU, _angleBetween, getAngleFromPoint, getRelativePosition } from 'chart.js/helpers';

import { ChartLegendComponent, ChartLegendItem } from '../chart-legend/chart-legend.component';
import { formatearPorcentaje, formatearValor, tokenDeTramo } from '../charts/chart-tema';
import { GraficoBase, SerieDibujada } from '../charts/grafico-base';

Chart.register(ArcElement, DoughnutController, Tooltip);

declare module 'chart.js' {
  interface InteractionModeMap {
    /** Tramo de la dona bajo el puntero, con un margen que no depende de si el tramo está activo. */
    siafTramo: InteractionModeFunction;
  }
}

/** Radio del anillo del Figma («.a.progress» mide 150 px). */
const RADIO = 75;
/** Borde del mismo color que engrosa el tramo activo y le redondea las puntas, como el estado hover del Figma. */
const BORDE_ACTIVO = 10;
/** Relleno inferior del marco del Figma (24 px), que la figura no tiene: sin él, el anillo quedaría 12 px más abajo. */
const AIRE_INFERIOR = 24;

/**
 * El tramo cuyo anillo contiene al puntero, con medio borde activo de margen a cada lado. El `inRange` de Chart.js
 * corre el anillo según el borde vigente del tramo: al engrosarse el activo, el puntero en su borde interior quedaba
 * afuera, el tramo se apagaba y volvía a encenderse, y el porcentaje del centro aparecía a veces sí y a veces no.
 */
Interaction.modes.siafTramo = (grafico, evento, _opciones, posicionFinal): InteractionItem[] => {
  const puntero = getRelativePosition(evento, grafico);
  const margen = BORDE_ACTIVO / 2;
  return grafico.getSortedVisibleDatasetMetas().flatMap((meta) =>
    meta.data.flatMap((arco, index) => {
      const { x, y, startAngle, endAngle, innerRadius, outerRadius } = arco.getProps(['x', 'y', 'startAngle', 'endAngle', 'innerRadius', 'outerRadius'], posicionFinal);
      const { angle, distance } = getAngleFromPoint({ x, y }, puntero);
      const enAngulo = endAngle - startAngle >= TAU || (startAngle !== endAngle && _angleBetween(angle, startAngle, endAngle));
      const enAnillo = distance >= innerRadius - margen && distance <= outerRadius + margen;
      return enAngulo && enAnillo ? [{ element: arco, datasetIndex: meta.index, index }] : [];
    }),
  );
};

/**
 * Gráfico de dona del kit (Figma UI KIT, página «Graphics»: «Progress» y su pieza «.a.progress»), dibujado con
 * Chart.js: un anillo de 150 px con las partes de un total, cada una con su color y su nombre en la leyenda. Al pasar el
 * puntero sobre un tramo, o al llegar a él con el teclado, el tramo se engrosa con las puntas redondeadas y el centro
 * muestra su nombre y su porcentaje del total. Los colores siguen el orden del Figma: primario, éxito y advertencia, y
 * el secundario al final (`TOKENS_DONA`).
 *
 * @figma 22743:343 Progress
 * @figma 22743:245 .a.progress
 * @usar
 * - Para ver cómo se reparte un total entre pocas partes: activos, patrimonio y pasivos de un balance.
 * - Dentro de `siaf-chart-section`, que le pone título y descripción.
 * - `valueSuffix` cuando los valores llevan unidad en la tabla de datos; el centro siempre muestra el porcentaje.
 * @evitar
 * - Para un avance de 0 a 100 %: usar `siaf-progress-circular`.
 * - Para comparar cantidades entre categorías: usar `siaf-bar-chart`.
 * - Para la composición de un total en una barra, con el porcentaje de cada parte a la vista: usar `siaf-bar-chart` con
 *   `stacked` y una sola categoría.
 * - Con más de cuatro partes: la paleta da la vuelta y los colores se repiten.
 * @teclado
 * - **Tab**: enfoca el gráfico (una sola parada).
 * - **Flecha derecha / izquierda**: recorren los tramos y muestran al centro el nombre y el porcentaje de cada uno; dan la
 *   vuelta.
 * - **Inicio / Fin**: van al primer o al último tramo.
 * - **Escape**: oculta el centro; salir del gráfico también lo oculta.
 * @accesibilidad
 * - **1.1.1 Contenido no textual (A)**: el lienzo es `role="img"` con `ariaLabel` y, además, hay una tabla de datos
 *   oculta (`sr-only`) con el valor y el porcentaje de cada parte.
 * - **1.3.1 Información y relaciones (A)**: la tabla usa `caption`, `th scope="col"` y `th scope="row"` para cada parte.
 * - **2.1.1 Teclado (A)**: los tramos se recorren con las flechas; al moverse, una región `aria-live` anuncia la parte, su
 *   porcentaje y su valor.
 * - **2.4.7 Foco visible (AA)**: el lienzo enfocado muestra el contorno de 2 px `border-states-focus`.
 * - **1.4.1 Uso del color (A)**: las partes se distinguen por color, pero sus nombres están en la leyenda, en el centro y
 *   en la tabla de datos.
 * - **1.4.3 Contraste mínimo (AA)**: el centro va en `text-neutral-medium` sobre la superficie.
 * - **1.4.13 Contenido en hover o foco (AA)**: Escape oculta el centro sin mover el puntero ni el foco.
 * - **Pendiente · 1.4.11 Contraste no textual (AA)**: en oscuro los tramos primario (`bg-brand-primary`, 2.66:1) y
 *   secundario (`bg-brand-secondary`, 2.99:1) no llegan a 3:1 sobre la superficie; la paleta oscura de los gráficos está
 *   por definir con diseño.
 */
@Component({
  selector: 'siaf-donut-chart',
  standalone: true,
  imports: [ChartLegendComponent],
  host: { class: 'block' },
  template: `
    <!-- Relleno del Figma («Progress»): 24 px arriba y a los lados, también dentro de siaf-chart-section. -->
    <figure class="m-0 flex flex-col gap-siaf-md px-siaf-lg pt-siaf-lg">
      @if (categories.length) {
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
        @if (tooltip(); as activo) {
          <!-- Centro del anillo («.a.progress», estado hover): nombre y porcentaje del tramo activo. -->
          <div
            class="pointer-events-none absolute left-1/2 flex w-20 -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center leading-[normal] text-[var(--sys-color-text-neutral-medium)]"
            [style.top.px]="centroY"
            aria-hidden="true"
            data-centro
          >
            <p class="m-0 line-clamp-2 w-full text-xs font-medium leading-[normal]">{{ activo.titulo }}</p>
            <p class="m-0 text-[22px] font-bold leading-[normal] tracking-[-0.19px]">{{ porcentaje(activo.indice) }}</p>
          </div>
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
              <th scope="col">{{ valueLabel }}</th>
              <th scope="col">Porcentaje</th>
            </tr>
          </thead>
          <tbody>
            @for (categoria of etiquetas; track $index; let i = $index) {
              <tr>
                <th scope="row">{{ categoria }}</th>
                <td>{{ valorDe(i) }}</td>
                <td>{{ porcentaje(i) }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </figure>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DonutChartComponent extends GraficoBase<'doughnut'> {
  /** Nombres de las partes, en el orden de la leyenda y del anillo (sentido horario desde arriba). */
  @Input() categories: readonly string[] = [];
  /** Un valor por parte, en el mismo orden que `categories`; los negativos o vacíos no dibujan tramo. */
  @Input() values: readonly number[] = [];
  /** Sufijo de los valores en la tabla de datos y el anuncio (por ejemplo `%`). */
  @Input() valueSuffix = '';
  /** Nombre accesible del gráfico y título de su tabla de datos. */
  @Input() ariaLabel = 'Gráfico de dona';
  /** Encabezado de la columna de las partes en la tabla de datos. */
  @Input() categoryLabel = 'Categoría';
  /** Encabezado de la columna de los valores en la tabla de datos. */
  @Input() valueLabel = 'Valor';
  /** Alto del área del gráfico en px (sin la leyenda). */
  @Input() height = 252;

  protected readonly tipo = 'doughnut';

  get etiquetas(): readonly string[] {
    return this.categories;
  }

  /** Una sola serie con el valor de cada parte (`null` si no dibuja tramo): la recorren el teclado y el anuncio. */
  get seriesDibujadas(): SerieDibujada[] {
    return [{ name: this.valueLabel, values: this.categories.map((_, i) => this.valorPositivo(i)), token: tokenDeTramo(0) }];
  }

  /** La leyenda nombra cada parte con el color de su tramo. */
  override get leyenda(): ChartLegendItem[] {
    return this.categories.map((label, i) => ({ label, token: tokenDeTramo(i) }));
  }

  /** Altura del centro del anillo dentro del área del gráfico, donde va el nombre y el porcentaje del tramo activo. */
  get centroY(): number {
    return (this.height - AIRE_INFERIOR) / 2;
  }

  /** Suma de las partes con valor positivo. */
  get total(): number {
    return this.categories.reduce((suma, _, i) => suma + (this.valorPositivo(i) ?? 0), 0);
  }

  porcentaje(indice: number): string {
    return formatearPorcentaje(this.valorPositivo(indice) ?? 0, this.total);
  }

  valorDe(indice: number): string {
    return formatearValor(this.values[indice], this.valueSuffix);
  }

  protected get categoriasEnVertical(): boolean {
    return false;
  }

  protected override textoDelAnuncio(indice: number): string {
    return this.valorPositivo(indice) === null
      ? `${this.categories[indice]}: sin datos`
      : `${this.categories[indice]}: ${this.porcentaje(indice)} (${this.valorDe(indice)})`;
  }

  protected datos(): ChartData<'doughnut'> {
    const colores = this.categories.map((_, i) => this.colorDe(tokenDeTramo(i)));
    return {
      labels: [...this.categories],
      datasets: [
        {
          label: this.valueLabel,
          data: this.categories.map((_, i) => this.valorPositivo(i) ?? 0),
          backgroundColor: colores,
          hoverBackgroundColor: colores,
          borderWidth: 0,
          hoverBorderWidth: BORDE_ACTIVO,
          hoverBorderColor: colores,
          borderJoinStyle: 'round',
          hoverOffset: 0,
        },
      ],
    };
  }

  protected opciones(): ChartOptions<'doughnut'> {
    return {
      ...this.opcionesComunes(),
      // El tramo se activa al pasar el puntero sobre su anillo (modo propio, estable al engrosarse el tramo activo).
      interaction: { mode: 'siafTramo', intersect: true },
      radius: RADIO,
      cutout: '70%',
      layout: { padding: { top: BORDE_ACTIVO, right: BORDE_ACTIVO, bottom: BORDE_ACTIVO + AIRE_INFERIOR, left: BORDE_ACTIVO } },
    };
  }

  private valorPositivo(indice: number): number | null {
    const valor = Number(this.values[indice]);
    return Number.isFinite(valor) && valor > 0 ? valor : null;
  }
}
