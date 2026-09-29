import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { ButtonComponent } from '../button/button.component';
import { MessageBoxComponent } from '../message-box/message-box.component';

/**
 * Bloque de estado vacío de una sección: título, botón de acción (lupa por defecto) y recuadro
 * con el mensaje; `[message]` se reemplaza por el valor una vez que el usuario elige uno.
 *
 * Es el componente canónico para ese patrón: úsalo SIEMPRE en vez de rehacer el título + botón +
 * `message-box` a mano (ya se reinventó una vez en el proyecto).
 *
 * @usar
 * - Para un dato que se elige desde un panel lateral: título, lupa y recuadro que pasa a mostrar lo elegido
 *   (atributos del evento en el catálogo de eventos, «Buscar evento» en el catálogo de eventos contables).
 * - Para selección múltiple, pasando en `message` los valores elegidos separados por comas («Ámbito
 *   institucional», «Conceptos para eventos contables»).
 * - Con `disabled` mientras no se puede elegir: en una modificación de vigencia o cuando el campo depende de
 *   otro que aún no tiene valor.
 * @evitar
 * - Rehacer a mano el título, el botón y el `message-box`: este es el componente canónico.
 * - Cuando ya hay un ítem elegido con varios datos: pasar a `siaf-summary-card` (como «Buscar evento» en el
 *   catálogo de eventos contables) o a la grilla estándar con `siaf-table-controls` si son dos o más.
 * - Para una pantalla de consulta sin resultados: usar `siaf-empty-state`.
 * @teclado
 * - **Tab**: enfoca el botón de acción; deshabilitado no recibe el foco.
 * - **Enter / Espacio**: emiten `actionClicked` (el botón sigue `siaf-button`).
 * @accesibilidad
 * - **1.3.1 Información y relaciones (A)**: es un `<section>` con el título en un `<h3>` de nivel fijo y el
 *   mensaje en un párrafo (`message-box`).
 * - **4.1.2 Nombre, función y valor (A)**: el botón de ícono recibe `title` como `ariaLabel`, así que nombra la
 *   sección y no la acción; sin `title` se leería el nombre del ícono. El padre debe dar siempre `title`.
 * - **1.1.1 Contenido no textual (A)**: la lupa es decorativa; el nombre del botón sale de `ariaLabel`.
 * - **4.1.3 Mensajes de estado (AA)**: el recuadro no es región viva: al elegir un valor, el texto nuevo no se
 *   anuncia.
 * - **1.4.3 Contraste mínimo (AA)**: título `text-neutral-high` 16.29:1 (16.53:1 en oscuro) y mensaje
 *   `text-neutral-medium` sobre `bg-surfaces-surface-low` 13.46:1 (12.09:1).
 * - **2.4.7 Foco visible (AA)**: el botón muestra el borde `border-states-focus` (5.35:1) y la capa de foco.
 * - **2.5.8 Tamaño del objetivo (AA)**: el botón mide 40 × 40 px.
 */
@Component({
  selector: 'empty-section',
  standalone: true,
  imports: [ButtonComponent, MessageBoxComponent],
  template: `
    <section class="grid gap-siaf-md">
      <div class="flex min-h-10 items-center justify-between gap-siaf-md">
        <h3 class="m-0 text-sm font-bold uppercase text-text">{{ title }}</h3>
        <siaf-button
          variant="accent"
          size="md"
          [icon]="actionIcon"
          [ariaLabel]="title"
          [iconOnly]="true"
          [disabled]="disabled"
          (click)="actionClicked.emit()"
        />
      </div>
      <message-box [text]="message" />
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptySectionComponent {
  @Input() title = '';
  @Input() actionIcon = 'search';
  @Input() disabled = false;
  /** Texto del recuadro: se reemplaza por el valor una vez seleccionado. */
  @Input() message = 'No se ha seleccionado ningún tipo. Haga clic en el botón para realizar una selección.';
  @Output() actionClicked = new EventEmitter<void>();
}

