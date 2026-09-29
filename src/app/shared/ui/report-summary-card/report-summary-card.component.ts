import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { IconComponent } from '../icon/icon.component';
import { TooltipDirective } from '../tooltip/tooltip.directive';

export interface ReportSummaryField {
  label: string;
  value: string;
}

/**
 * «Card resumen» del resultado de un reporte (Guía de Estructura de Pantallas, nodo 22402:16450): sobre un fondo gris
 * con borde, una etiqueta en versalitas, el ítem consultado con su ícono, título y descripción, y a la derecha sus
 * datos clave, cada uno con su etiqueta encima y el valor destacado.
 *
 * @figma 22402:16450 Card resumen
 * @usar
 * - En «Resultado de reporte» de `siaf-query-report-page`, entre las pestañas y el buscador, para resumir de qué es el
 *   reporte: la entidad, la cuenta o el pliego consultado y sus totales.
 * - Con dos o tres `fields` cortos (código, saldo, periodo); la descripción se corta en una línea con tooltip.
 * @evitar
 * - Para el ítem elegido desde un panel lateral en una solicitud: usar `siaf-summary-card`, con indicador y ✕.
 * - Para los criterios que el usuario aplicó: van en `siaf-parametros-aplicados`.
 * - Para un monto con su avance: usar `siaf-kpi-card`.
 * - Con muchos datos: no hace scroll; más de tres campos se apilan en pantallas angostas pero cansan la lectura.
 * @teclado
 * - No recibe foco: no es interactiva. Si la descripción está cortada, su texto completo aparece con el puntero.
 * @accesibilidad
 * - **1.3.1 Información y relaciones (A)**: es una `section` nombrada con la etiqueta; los datos son una lista de
 *   definiciones (`dl`), así cada valor se lee con su etiqueta.
 * - **1.1.1 Contenido no textual (A)**: el ícono es decorativo (`aria-hidden`): el título dice qué es.
 * - **1.4.3 Contraste mínimo (AA)**: título, descripción y valores `text-neutral-medium` sobre `surface-low` (13.46:1
 *   claro / 12.09:1 oscuro) y etiquetas `text-neutral-low` (4.64:1 / 8.32:1), la más justa en claro.
 * - **1.4.12 Espaciado del texto (AA)**: los textos no tienen alto fijo; el título y los valores pasan a otra línea si
 *   no entran.
 */
@Component({
  selector: 'siaf-report-summary-card',
  standalone: true,
  imports: [IconComponent, TooltipDirective],
  host: { class: 'block' },
  template: `
    <section
      class="flex flex-col gap-siaf-xxs rounded-siaf-md border border-[var(--sys-color-border-states-enabled)] bg-[var(--sys-color-bg-surfaces-surface-low)] pb-siaf-xs pt-siaf-md"
      [attr.aria-label]="label || title"
    >
      @if (label) {
        <p class="m-0 px-siaf-md text-[11px] font-medium uppercase leading-normal tracking-[0.66px] text-[var(--sys-color-text-neutral-low)]" aria-hidden="true">
          {{ label }}
        </p>
      }
      <div class="flex flex-col gap-siaf-xs md:flex-row md:items-end">
        <div class="flex min-h-12 min-w-0 items-center gap-siaf-md px-siaf-md py-siaf-sm md:w-[46%] md:shrink-0">
          @if (icon) {
            <siaf-icon class="shrink-0 text-[var(--sys-color-text-neutral-medium)]" [name]="icon" [size]="24" />
          }
          <div class="flex min-w-0 flex-1 flex-col gap-siaf-xxs text-[var(--sys-color-text-neutral-medium)]">
            <p class="m-0 break-words text-lg font-bold uppercase leading-normal tracking-[-0.11px]" data-resumen-titulo>{{ title }}</p>
            @if (description) {
              <p class="m-0 truncate text-xs leading-normal" siafTooltip>{{ description }}</p>
            }
          </div>
        </div>
        @if (fields.length) {
          <dl class="m-0 flex min-w-0 flex-1 flex-col gap-siaf-xs sm:flex-row">
            @for (field of fields; track field.label) {
              <div class="flex min-w-0 flex-1 flex-col gap-siaf-xxs px-siaf-md py-siaf-xs">
                <dt class="text-xs font-medium leading-normal text-[var(--sys-color-text-neutral-low)]">{{ field.label }}</dt>
                <dd class="m-0 break-words text-lg font-bold uppercase leading-normal tracking-[-0.11px] text-[var(--sys-color-text-neutral-medium)]">{{ field.value }}</dd>
              </div>
            }
          </dl>
        }
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportSummaryCardComponent {
  /** Qué se resume, en versalitas sobre el ítem («Entidad»); también nombra la sección. */
  @Input() label = '';
  /** Ícono de Material Icons del ítem. */
  @Input() icon = '';
  /** Nombre del ítem consultado. */
  @Input({ required: true }) title = '';
  /** Línea de apoyo bajo el título; si no entra, se corta con tooltip. */
  @Input() description = '';
  /** Datos clave a la derecha, con su etiqueta encima. */
  @Input() fields: readonly ReportSummaryField[] = [];
}
