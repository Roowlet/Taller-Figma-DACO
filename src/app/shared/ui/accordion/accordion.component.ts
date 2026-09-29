import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { IconComponent } from '../icon/icon.component';

export interface AccordionItem {
  id: string;
  title: string;
  content: string;
  disabled?: boolean;
}

export type AccordionVariant = 'default' | 'landing';

/**
 * Lista de secciones colapsables (details/summary) a partir de un arreglo de ítems.
 *
 * Usarlo para preguntas frecuentes o bloques de contenido plegable. Variante `default` para
 * pantallas internas y `landing` para la portada pública. Un ítem con `disabled` no se abre.
 *
 * @usar
 * - Preguntas frecuentes de la portada pública con la variante `landing` (pantalla de Preguntas frecuentes).
 * - Ayudas o notas de solo texto en pantallas internas que el usuario abre a demanda (variante `default`).
 * - Cuando cada sección es un título y un párrafo: `openId` elige cuál empieza abierta y el resto lo maneja el
 *   `details` nativo (pueden quedar varias abiertas).
 * @evitar
 * - Para contenido rico (formularios, grillas, botones): el ítem solo acepta texto; usar `siaf-expansion-panel`.
 * - Para ítems de una selección que se quitan con X: usar `siaf-collapsible-card`.
 * - Para secciones obligatorias de una solicitud: dejarlas visibles en `siaf-solicitude-form-card`.
 * - Marcar `disabled` para esconder un ítem: sigue enfocable y se despliega vacío; mejor no incluirlo.
 * @teclado
 * - **Tab**: pasa de un título a otro (cada título es un `summary` nativo).
 * - **Enter / Espacio**: abren o cierran la sección enfocada (comportamiento nativo de `details`).
 * @accesibilidad
 * - **Pendiente · 4.1.2 Nombre, función y valor (A)**: `details` y `summary` nativos anuncian cada título como
 *   desplegable con su estado, sin ARIA extra; pero un ítem `disabled` solo se atenúa (`opacity-50`): su `summary`
 *   sigue recibiendo foco, se despliega vacío al pulsarlo y no publica `aria-disabled`.
 * - **1.1.1 Contenido no textual (A)**: la flecha y los íconos más / menos de `landing` son `siaf-icon` decorativos
 *   (`aria-hidden`).
 * - **1.4.1 Uso del color (A)**: abierto o cerrado se ve en la flecha que gira o en el cambio de más a menos, no solo
 *   en el fondo.
 * - **1.4.3 Contraste mínimo (AA)**: en `default`, título `text-neutral-high` 16.29:1 (oscuro 16.53:1) y contenido
 *   `text-neutral-low` 5.01:1 (8.86:1) sobre la superficie; `landing` usa colores fijos (`#555`, `#d52d50`) fuera de
 *   los tokens, así que su contraste depende del fondo de la portada.
 * - **2.4.7 Foco visible (AA)**: no define estilo de foco ni lo quita: el `summary` muestra el contorno por defecto
 *   del navegador.
 * - **2.5.8 Tamaño del objetivo (AA)**: cada título ocupa todo el ancho y mide al menos 48 px de alto (72 px en
 *   `landing`).
 */
@Component({
  selector: 'siaf-accordion',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div [class]="containerClass">
      @for (item of items; track item.id) {
        <details class="group" [open]="item.id === openId && !item.disabled">
          <summary
            [class]="summaryClass"
            [class.cursor-not-allowed]="item.disabled"
            [class.opacity-50]="item.disabled"
          >
            <span>{{ item.title }}</span>
            @if (variant === 'landing') {
              <span class="grid size-10 shrink-0 place-items-center rounded-lg bg-[#d52d50] text-white">
                <siaf-icon class="group-open:hidden" name="add" [size]="24" />
                <siaf-icon class="hidden group-open:block" name="remove" [size]="24" />
              </span>
            } @else {
              <siaf-icon class="text-text-muted transition group-open:rotate-180" name="expand_more" [size]="20" />
            }
          </summary>
          @if (!item.disabled) {
            <div [class]="contentClass">
              {{ item.content }}
            </div>
          }
        </details>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccordionComponent {
  @Input() items: AccordionItem[] = [];
  @Input() openId = '';
  @Input() variant: AccordionVariant = 'default';

  get containerClass(): string {
    return this.variant === 'landing'
      ? 'divide-y divide-[#a8a8a8] bg-transparent'
      : 'divide-y divide-border overflow-hidden rounded-siaf-lg border border-border bg-surface';
  }

  get summaryClass(): string {
    return this.variant === 'landing'
      ? 'flex min-h-[72px] cursor-pointer list-none items-center justify-between gap-3 py-4 text-left text-base font-medium leading-6 tracking-[-0.11px] text-[var(--sys-color-text-neutral-high)] sm:min-h-[80px] sm:gap-6 sm:text-[18px]'
      : 'flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 text-sm font-semibold text-text transition hover:bg-surface-muted group-open:bg-surface-muted';
  }

  get contentClass(): string {
    return this.variant === 'landing'
      ? 'max-w-[960px] pb-5 pr-14 text-sm leading-6 text-[#555]'
      : 'px-4 pb-4 text-sm leading-6 text-text-muted';
  }
}
