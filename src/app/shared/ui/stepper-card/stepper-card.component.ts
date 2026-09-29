import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { TooltipDirective } from '../tooltip/tooltip.directive';

export interface StepperCardField {
  label: string;
  value: string | number;
  weight?: 'regular' | 'bold';
}

/**
 * Card seleccionable en forma de paso, con lista de campos etiqueta/valor e indicador lateral.
 *
 * Sin elegir lleva borde y ninguna sombra; elegida (`selected`), sombra y una barra azul de 80 px arriba a la
 * izquierda. Mide 200 px de ancho dentro de `siaf-steps` con `variant="cards"`, que la pinta una por versión con su
 * punto a la derecha. No es la card de "ítem seleccionado" — esa es `siaf-summary-card`.
 *
 * @usar
 * - Para elegir una entre varias solicitudes o versiones de un mismo registro mostradas como tarjetas (N° de
 *   documento, tipo de acción y fecha) y ver su detalle al lado.
 * - Como columna de navegación de un historial, dentro de `siaf-steps` con `variant="cards"`: la tarjeta elegida queda
 *   marcada y el padre pinta su detalle. Así la usan `siaf-account-history-panel` y `siaf-asiento-history-panel`.
 * @evitar
 * - Para el ítem elegido desde un panel lateral: usar `siaf-summary-card`, que no es seleccionable.
 * - Para pasos numerados de un flujo: usar `siaf-steps`; para los responsables de una solicitud,
 *   `siaf-action-tracker`.
 * - Con enlaces o botones adentro: toda la tarjeta ya es un `button` y no admite otros controles.
 * - Para elegir entre opciones de un formulario: usar `siaf-radio-group` o `siaf-buttons-group`.
 * @teclado
 * - **Tab**: enfoca la tarjeta completa (es un `button`).
 * - **Enter / Espacio**: emiten `selectedChange` con el valor contrario a `selected`; el padre actualiza la selección.
 * @accesibilidad
 * - **4.1.2 Nombre, función y valor (A)**: es un `button` nativo con `aria-pressed` según `selected`; su nombre es el
 *   texto de todas sus etiquetas y valores.
 * - **1.4.1 Uso del color (A)**: la elegida no depende del color: suma la barra lateral y la sombra.
 * - **1.4.3 Contraste mínimo (AA)**: etiquetas `text-neutral-low` 5.01:1 (oscuro 8.86:1) y valores
 *   `text-neutral-medium` 14.53:1 (12.87:1) sobre la superficie.
 * - **2.4.7 Foco visible (AA)**: contorno de 2 px `border-states-focus` separado 2 px (5.35:1 claro / 10.15:1 oscuro).
 * - **Pendiente · 1.4.11 Contraste no textual (AA)**: en oscuro la barra de la elegida usa `bg-brand-primary`, 2.66:1
 *   sobre la superficie, y el borde de las demás (`divider-strong`) no llega a 3:1 en ningún tema.
 * - **1.4.13 Contenido en hover o foco (AA)**: desde `sm` los valores truncados se completan con `siafTooltip`, que
 *   también aparece al enfocar la tarjeta, se cierra con Escape y se puede recorrer con el puntero. Si se cortan la
 *   etiqueta y el valor, con el foco solo se ve el primero (el lector de pantalla lee los dos).
 * - **2.5.8 Tamaño del objetivo (AA)**: toda la tarjeta es el objetivo, de al menos 180 px de ancho.
 */
@Component({
  selector: 'siaf-stepper-card',
  standalone: true,
  imports: [NgClass, TooltipDirective],
  template: `
    <button
      class="relative flex w-full min-w-[180px] flex-col items-stretch overflow-hidden rounded-siaf-md border bg-surface text-left transition focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sys-color-border-states-focus)] sm:max-w-[210px]"
      [class]="selected ? 'border-[var(--sys-color-divider-default)] shadow-siaf-elevation-2' : 'border-[var(--sys-color-divider-strong)] hover:shadow-siaf-elevation-1'"
      type="button"
      [attr.aria-pressed]="selected"
      (click)="selectedChange.emit(!selected)"
    >
      <div class="relative flex w-full flex-col gap-siaf-md px-siaf-xl py-siaf-md">
        @for (field of fields; track field.label) {
          <div class="flex w-full min-w-0 flex-col gap-siaf-xxs">
            <span class="min-h-4 text-[11px] font-medium uppercase tracking-[0.66px] text-[var(--sys-color-text-neutral-low)] sm:truncate" siafTooltip>
              {{ field.label }}
            </span>
            <span
              class="min-h-6 break-words text-sm tracking-[-0.02px] text-[var(--sys-color-text-neutral-medium)] sm:h-6 sm:truncate" siafTooltip
              [ngClass]="field.weight === 'regular' ? 'font-normal tracking-[0.024px]' : 'font-bold'"
            >
              {{ field.value }}
            </span>
          </div>
        }

        @if (selected) {
          <span class="absolute left-0 top-5 h-20 max-h-[calc(100%-40px)] w-[3px] rounded-r-siaf-sm bg-brand-primary" aria-hidden="true" data-stepper-barra></span>
        }
      </div>
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepperCardComponent {
  @Input() fields: StepperCardField[] = [];
  @Input() selected = false;
  @Output() selectedChange = new EventEmitter<boolean>();
}
