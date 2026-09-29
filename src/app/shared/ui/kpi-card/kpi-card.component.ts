import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { IconComponent } from '../icon/icon.component';
import { LoadingProgressComponent } from '../loading-progress/loading-progress.component';
import { TooltipDirective } from '../tooltip/tooltip.directive';

export type KpiCardTone = 'informative' | 'success' | 'warning' | 'danger';

/** Fondo de la caja del ícono y color del ícono por tono (Figma «.a.kpi-icon-box»). */
const CLASES_TONO: Record<KpiCardTone, string> = {
  informative: 'bg-[var(--sys-color-bg-surfaces-highlight)] text-[var(--sys-color-icon-states-active)]',
  success: 'bg-[var(--sys-color-bg-feedback-light-success)] text-[var(--sys-color-icon-feedback-light-success)]',
  warning: 'bg-[var(--sys-color-bg-feedback-light-warning)] text-[var(--sys-color-icon-feedback-light-warning)]',
  danger: 'bg-[var(--sys-color-bg-feedback-light-danger)] text-[var(--sys-color-icon-feedback-light-danger)]',
};

/**
 * Tarjeta de indicador (Figma UI KIT, nodo 22743:662 «KPI card»): título, ícono en una caja de color, el monto
 * destacado y la barra de avance con su porcentaje, que siempre se muestra, como en el Figma (0 % sin `progress`). La
 * caja del ícono tiene cuatro tonos del Figma (`informative`, `success`, `warning` y `danger`); la barra es
 * `siaf-loading-progress`.
 *
 * @figma 22743:662 KPI card
 * @figma 22743:236 .a.kpi-icon-box
 * @usar
 * - Para un número clave de un tablero, como «Total Activos», con su avance respecto de una meta.
 * - `tone` para acompañar el sentido del dato (éxito, advertencia, riesgo), repitiéndolo en el título o el monto.
 * - En una grilla junto a otras tarjetas KPI, sobre las `siaf-chart-section` del mismo tablero.
 * @evitar
 * - Para una serie de valores o una comparación: usar `siaf-bar-chart` o `siaf-line-chart` dentro de
 *   `siaf-chart-section`.
 * - Para el resumen de un documento o registro elegido: usar `siaf-summary-card`.
 * - Para un número sin avance que medir: la barra siempre se muestra y quedaría en 0 %.
 * - Como única señal de un estado: el tono es solo color.
 * @teclado
 * - No recibe foco: no es interactiva.
 * @accesibilidad
 * - **1.3.1 Información y relaciones (A)**: es un `article` nombrado con el título; el ícono es decorativo
 *   (`aria-hidden`).
 * - **4.1.2 Nombre, función y valor (A)**: la barra es `role="progressbar"` con `aria-valuenow` y el título como
 *   nombre; el porcentaje visible va con `aria-hidden` para no leerse dos veces.
 * - **1.4.1 Uso del color (A)**: el tono del ícono no dice nada por sí solo; el sentido del dato debe estar en el
 *   título o en el monto.
 * - **1.4.3 Contraste mínimo (AA)**: monto `text-neutral-high` (16.29:1 claro / 16.53:1 oscuro), título
 *   `text-neutral-low` (5.01:1 / 8.86:1) y porcentaje `text-neutral-medium` sobre la superficie.
 * - **Pendiente · 1.4.11 Contraste no textual (AA)**: en oscuro el relleno de la barra (`bg-brand-primary`) no llega
 *   a 3:1 sobre su riel; la paleta oscura de los gráficos está por definir con diseño.
 */
@Component({
  selector: 'siaf-kpi-card',
  standalone: true,
  imports: [IconComponent, LoadingProgressComponent, NgClass, TooltipDirective],
  host: { class: 'block' },
  template: `
    <article
      class="flex flex-col gap-siaf-sm rounded-siaf-md border border-[var(--sys-color-border-states-enabled)] bg-surface p-siaf-lg"
      [attr.aria-label]="title || null"
    >
      <div class="flex items-center justify-between gap-siaf-xs">
        <p class="m-0 min-w-0 truncate text-sm font-medium leading-[normal] text-[var(--sys-color-text-neutral-low)]" siafTooltip>{{ title }}</p>
        <span class="flex shrink-0 rounded-siaf-sm p-siaf-xxs" [ngClass]="claseTono">
          <siaf-icon [name]="icon" [size]="16" />
        </span>
      </div>
      <p class="m-0 text-[22px] font-bold leading-[normal] tracking-[-0.19px] text-[var(--sys-color-text-neutral-high)]">{{ amount }}</p>
      <div class="flex items-center gap-siaf-md">
        <siaf-loading-progress class="block min-w-0 flex-1" variant="bar" [value]="porcentaje" [label]="progressLabel || title" />
        <span class="shrink-0 text-sm leading-[normal] tracking-[0.025px] text-[var(--sys-color-text-neutral-medium)]" aria-hidden="true">{{ porcentaje }}%</span>
      </div>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KpiCardComponent {
  /** Qué mide el indicador («Total Activos»); también nombra la tarjeta y la barra. */
  @Input() title = '';
  /** Monto ya formateado («$1,245,800.00»). */
  @Input() amount = '';
  /** Avance de 0 a 100 de la barra, que siempre se muestra; se recorta a ese rango. */
  @Input() progress = 0;
  /** Nombre de la barra para el lector de pantalla; por defecto, el título. */
  @Input() progressLabel = '';
  @Input() tone: KpiCardTone = 'informative';
  /** Ícono de Material Icons de la caja; por defecto la flecha del Figma. */
  @Input() icon = 'arrow_outward';

  get claseTono(): string {
    return CLASES_TONO[this.tone] ?? CLASES_TONO.informative;
  }

  get porcentaje(): number {
    return Math.round(Math.min(100, Math.max(0, this.progress || 0)));
  }
}
