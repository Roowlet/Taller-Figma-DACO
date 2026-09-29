import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, signal } from '@angular/core';

import { IconDropdownMenuComponent, IconDropdownMenuItem } from '../icon-dropdown-menu/icon-dropdown-menu.component';
import { IconComponent } from '../icon/icon.component';

let siguienteId = 0;

/**
 * Panel expandible de una sola sección (Figma UI KIT, nodo 9214:5839 «Expansion panels»): tarjeta con borde,
 * cabecera con la flecha, el título y un menú ⋮ opcional, y el contenido proyectado debajo al expandir.
 *
 * Se apilan varios para armar un acordeón con contenido libre. `[(expanded)]` controla si está abierto; el
 * menú aparece solo con `actions` (reusa `siaf-icon-dropdown-menu`) y emite `action` con el valor elegido.
 * Para una lista de preguntas de solo texto va `siaf-accordion`; con marca lateral y X, `siaf-collapsible-card`.
 *
 * @usar
 * - Bloques repetibles con contenido rico que el usuario pliega: cada asiento contable del formulario de eventos
 *   contables, con su grilla de cuentas adentro.
 * - Cuando cada bloque necesita acciones propias en el menú ⋮ (por ejemplo, «Eliminar asiento») mediante `actions`.
 * - Secciones largas de consulta que conviene plegar, como la paleta tonal en los fundamentos de `/ui-kit`.
 * @evitar
 * - Para preguntas frecuentes de solo texto: usar `siaf-accordion`.
 * - Para ítems de una selección con marca lateral que se quitan con X: usar `siaf-collapsible-card`.
 * - Para secciones obligatorias de la solicitud que siempre deben verse: usar `siaf-solicitude-form-card` sin plegar.
 * - Para un menú de acciones sin contenido plegable: usar `siaf-icon-dropdown-menu` directamente.
 * @teclado
 * - **Tab**: pasa por la flecha, el menú ⋮ (si hay `actions`) y después por el contenido abierto.
 * - **Enter / Espacio** en la flecha: abren o cierran el panel y emiten `expandedChange`.
 * - El título también abre y cierra con clic, pero no recibe foco: con teclado se usa la flecha. El menú ⋮ sigue
 *   `siaf-icon-dropdown-menu`; si una acción quita el panel, el padre debe mover el foco.
 * @accesibilidad
 * - **4.1.2 Nombre, función y valor (A)**: la flecha es un `button` con `aria-expanded`, `aria-controls` hacia el
 *   contenido y nombre «Expandir …» / «Contraer …» con el `title`; el ⋮ se llama «Más opciones de …».
 * - **1.3.1 Información y relaciones (A)**: el título es un `h3` y el contenido abierto un `role="region"` rotulado
 *   por él; el padre debe ubicar el panel donde un `h3` respete la jerarquía.
 * - **2.1.1 Teclado (A)**: el clic en el título tiene su equivalente en la flecha, que es un botón nativo.
 * - **1.4.1 Uso del color (A)**: abierto o cerrado se distingue por la flecha, no por color.
 * - **1.4.3 Contraste mínimo (AA)**: título y contenido en `text-neutral-medium` sobre la superficie, 14.53:1 (oscuro
 *   12.87:1).
 * - **2.4.7 Foco visible (AA)**: la flecha muestra un contorno de 2 px `border-states-focus` separado 2 px.
 * - **1.4.11 Contraste no textual (AA)**: ese contorno es el azul del kit (`border-states-focus`, 5.35:1 claro /
 *   10.15:1 oscuro sobre la superficie).
 * - **2.5.8 Tamaño del objetivo (AA)**: flecha y ⋮ miden 40 × 40 px.
 */
@Component({
  selector: 'siaf-expansion-panel',
  standalone: true,
  imports: [IconComponent, IconDropdownMenuComponent],
  template: `
    <section class="flex flex-col rounded-siaf-sm border border-[var(--sys-color-divider-strong)] bg-surface text-[var(--sys-color-text-neutral-medium)]">
      <div class="flex items-center gap-siaf-xs px-siaf-md py-siaf-xxs">
        <button
          class="inline-flex size-10 shrink-0 items-center justify-center rounded-siaf-md transition hover:bg-surface-muted active:bg-[var(--sys-color-bg-states-dark-pressed)] focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sys-color-border-states-focus)]"
          type="button"
          [attr.aria-expanded]="abierto()"
          [attr.aria-controls]="idCuerpo"
          [attr.aria-label]="(abierto() ? 'Contraer ' : 'Expandir ') + title"
          (click)="alternar()"
        >
          <siaf-icon [name]="abierto() ? 'expand_less' : 'expand_more'" [size]="24" />
        </button>
        <h3 class="m-0 flex min-h-10 min-w-0 flex-1 cursor-pointer items-center text-sm font-medium leading-[normal]" [id]="idTitulo" (click)="alternar()">
          {{ title }}
        </h3>
        @if (actions.length) {
          <siaf-icon-dropdown-menu
            class="shrink-0"
            icon="more_vert"
            align="right"
            [ariaLabel]="'Más opciones de ' + title"
            [items]="actions"
            [menuWidth]="menuWidth"
            (selected)="action.emit($event)"
          />
        }
      </div>

      @if (abierto()) {
        <div class="p-siaf-md" role="region" [id]="idCuerpo" [attr.aria-labelledby]="idTitulo">
          <div class="flex min-h-10 flex-col justify-center px-siaf-xs text-sm leading-[normal] tracking-[0.025px]">
            <ng-content />
          </div>
        </div>
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExpansionPanelComponent {
  @Input() title = '';
  /** Opciones del menú ⋮. Sin opciones no se muestra el botón. */
  @Input() actions: IconDropdownMenuItem[] = [];
  /** Ancho del menú ⋮ en px. */
  @Input() menuWidth = 200;

  @Input() set expanded(valor: boolean) {
    this.abierto.set(!!valor);
  }

  @Output() expandedChange = new EventEmitter<boolean>();
  @Output() action = new EventEmitter<string>();

  readonly abierto = signal(false);
  readonly idTitulo = `siaf-expansion-panel-${siguienteId}-titulo`;
  readonly idCuerpo = `siaf-expansion-panel-${siguienteId++}-cuerpo`;

  alternar(): void {
    this.abierto.update((v) => !v);
    this.expandedChange.emit(this.abierto());
  }
}
