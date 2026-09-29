import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export interface ChartTooltipItem {
  label: string;
  /** Valor ya formateado (con separadores y sufijo). */
  value: string;
  /** Token de color de la serie (`--sys-color-*`). */
  token: string;
}

/**
 * Tooltip de los gráficos (Figma UI KIT, nodo 22758:6756 «Tooltip-graph»): caja oscura con un título (la categoría)
 * y una fila por serie con su cuadrado de color y el valor. Solo dibuja la caja: la muestra y la posiciona el
 * gráfico que la usa al pasar el puntero o recorrer los datos con el teclado.
 *
 * @figma 22758:6756 Tooltip-graph
 * @usar
 * - Dentro de los gráficos del kit: `siaf-bar-chart`, `siaf-line-chart` y `siaf-diverging-chart` la pintan sobre la
 *   categoría activa.
 * - En un gráfico propio del kit, para mostrar los valores de un punto con el mismo diseño.
 * @evitar
 * - Como tooltip de texto de un botón o de algo truncado: usar `siafTooltip`.
 * - Con contenido interactivo: el tooltip no recibe el puntero ni el foco.
 * @teclado
 * - No recibe foco: la abre y la cierra el gráfico (flechas para recorrer, Escape para cerrarla).
 * @accesibilidad
 * - **1.3.1 Información y relaciones (A)**: cada serie es un párrafo con su nombre y su valor en texto; el cuadrado de
 *   color va con `aria-hidden`.
 * - **1.4.3 Contraste mínimo (AA)**: texto `text-brand-white` sobre `bg-on-surfaces-high` (12.85:1) en claro; en
 *   oscuro, sobre `bg-snackbar` (15.71:1), porque el fondo del Figma se funde con la superficie oscura.
 * - **4.1.3 Mensajes de estado (AA)**: la caja no es región viva: el gráfico anuncia los valores en su propia región
 *   `aria-live` cuando se recorren con el teclado.
 */
@Component({
  selector: 'siaf-chart-tooltip',
  standalone: true,
  host: { class: 'block' },
  template: `
    <div
      class="flex w-max max-w-80 flex-col justify-center gap-siaf-xxs rounded-siaf-sm bg-[var(--sys-color-bg-snackbar,var(--sys-color-bg-on-surfaces-high))] px-siaf-md py-siaf-xs text-xs leading-[normal] text-[var(--sys-color-text-brand-white)] shadow-siaf-elevation-6"
    >
      @if (title) {
        <p class="m-0 font-bold">{{ title }}</p>
      }
      @for (item of items; track item.label) {
        <p class="m-0 flex items-center gap-siaf-xxs">
          <span class="size-3 shrink-0 border border-[var(--sys-color-border-states-white)]" [style.background-color]="'var(' + item.token + ')'" aria-hidden="true"></span>
          <span class="min-w-0 flex-1">{{ item.label }}: {{ item.value }}</span>
        </p>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartTooltipComponent {
  /** Título: la categoría del punto (por ejemplo «Mar»). */
  @Input() title = '';
  @Input() items: readonly ChartTooltipItem[] = [];
}
