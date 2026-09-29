import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { IconComponent } from '../icon/icon.component';
import { TooltipDirective } from '../tooltip/tooltip.directive';

export interface SummaryCardField {
  label: string;
  value: string | number;
  icon?: string;
  iconLabel?: string;
}

/**
 * Card resumen de campos etiqueta/valor, con indicador lateral, borde opcional y ✕ para limpiar.
 *
 * Es LA card canónica del "ítem seleccionado" que llega desde un side panel: usarla `bordered` con
 * indicador, y la ✕ solo en edición. Regla del proyecto: 0 ítems → placeholder gris, 1 → esta card,
 * 2 o más → grilla estándar (`siaf-table-controls` + `siaf-pagination Bottom`).
 *
 * @usar
 * - Para el único ítem elegido desde un panel lateral en una solicitud: plan de cuentas, cuenta contable anterior o
 *   entidad del estado (plan de cuentas); ámbito, período, clase y detalle (catálogo de ajustes y asiento de ajuste);
 *   evento (eventos contables).
 * - `bordered` con indicador y la ✕ solo en edición (`[showClose]="!isReadOnly"`), con un `closeLabel` que nombre el
 *   ítem («Quitar plan contable»).
 * - Para datos precargados de solo lectura con la misma forma, sin ✕: pliego, unidad ejecutora y período mensual en
 *   apertura contable, o la cuenta en uso de una modificación.
 * @evitar
 * - Para 2 o más ítems: usar la grilla estándar (`siaf-table-controls` + tabla + `siaf-pagination` Bottom); sin
 *   ítems, el placeholder gris o `empty-section`.
 * - Para el N° y el estado del documento abierto: usar `siaf-document-summary-card`.
 * - Para ítems con detalle que se despliega: usar `siaf-collapsible-card`.
 * - Para elegir entre tarjetas: usar `siaf-stepper-card`; esta no es seleccionable.
 * @teclado
 * - **Tab**: enfoca la ✕ cuando `showClose` está activo; sin ella la tarjeta no recibe foco.
 * - **Enter / Espacio** en la ✕: emiten `closed`; el foco no se mueve solo: al quitar el ítem, el padre debe
 *   llevarlo, por ejemplo, al botón de búsqueda.
 * @accesibilidad
 * - **4.1.2 Nombre, función y valor (A)**: la ✕ es un `button` con nombre desde `closeLabel` (por defecto «Cerrar»);
 *   el padre debe nombrar el ítem, como «Quitar entidad del estado».
 * - **1.1.1 Contenido no textual (A)**: la barra lateral y el ícono de la ✕ son decorativos (`aria-hidden`); el ícono
 *   de un campo solo se anuncia si trae `iconLabel` y, si no, queda decorativo.
 * - **1.4.3 Contraste mínimo (AA)**: etiquetas `text-neutral-low` 5.01:1 (oscuro 8.86:1) y valores
 *   `text-neutral-medium` 14.53:1 (12.87:1) sobre la superficie.
 * - **2.4.7 Foco visible (AA)**: la ✕ muestra un contorno de 2 px `border-states-focus` separado 2 px.
 * - **1.4.11 Contraste no textual (AA)**: ese contorno es el azul del kit (`border-states-focus`, 5.35:1 claro /
 *   10.15:1 oscuro sobre la superficie).
 * - **1.4.13 Contenido en hover o foco (AA)**: desde `sm` los valores truncados se completan con `siafTooltip`, que
 *   se cierra con Escape y se puede recorrer con el puntero.
 * - **Pendiente · 2.1.1 Teclado (A)**: ese texto no recibe foco, así que con teclado el globo no aparece (el lector de
 *   pantalla sí lo lee entero).
 * - **2.5.8 Tamaño del objetivo (AA)**: la ✕ mide 40 × 40 px.
 */
@Component({
  selector: 'siaf-summary-card',
  standalone: true,
  imports: [IconComponent, TooltipDirective],
  template: `
    <section
      class="relative flex w-full flex-col gap-siaf-md rounded-siaf-md bg-surface p-siaf-md sm:flex-row sm:items-center"
      [class.shadow-siaf-elevation-2]="!bordered"
      [class.border]="bordered"
      [class.border-border]="bordered"
      [class.pl-siaf-md]="showIndicator"
    >
      @if (showIndicator) {
        <span class="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r bg-brand-primary" aria-hidden="true"></span>
      }

      <div class="flex min-w-0 flex-1 flex-wrap items-center gap-siaf-md px-siaf-md">
        @for (field of fields; track field.label) {
          <div class="flex min-w-[160px] flex-1 basis-full flex-col gap-siaf-xxs sm:basis-[calc(50%-var(--sys-gap-base-md))] lg:basis-0">
            <span class="min-h-4 text-[11px] font-medium uppercase tracking-[0.66px] text-[var(--sys-color-text-neutral-low)] sm:truncate" siafTooltip>
              {{ field.label }}
            </span>

            <!-- Móvil: el valor envuelve (no hay hover); desde sm vuelve a truncarse. -->
            <div class="flex min-h-6 min-w-0 items-center gap-siaf-xs sm:h-6 sm:overflow-hidden">
              <span class="break-words text-sm font-bold tracking-[-0.02px] text-[var(--sys-color-text-neutral-medium)] sm:truncate" siafTooltip>
                {{ field.value }}
              </span>

              @if (field.icon) {
                <siaf-icon
                  class="shrink-0 text-[var(--sys-color-text-neutral-low)]"
                  [name]="field.icon"
                  [size]="24"
                  [label]="field.iconLabel || field.icon"
                  [decorative]="!field.iconLabel"
                />
              }
            </div>
          </div>
        }
      </div>

      @if (showClose) {
        <button
          class="grid size-10 shrink-0 place-items-center self-end rounded-siaf-md text-[var(--sys-color-text-neutral-medium)] transition hover:bg-surface-muted focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sys-color-border-states-focus)] sm:self-center"
          type="button"
          [attr.aria-label]="closeLabel"
          (click)="closed.emit()"
        >
          <siaf-icon name="close" [size]="20" />
        </button>
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SummaryCardComponent {
  @Input() fields: SummaryCardField[] = [];
  @Input() showClose = true;
  @Input() showIndicator = true;
  /** Estilo con borde (sin sombra) en vez del elevado por defecto. */
  @Input() bordered = false;
  @Input() closeLabel = 'Cerrar';
  @Output() closed = new EventEmitter<void>();
}
