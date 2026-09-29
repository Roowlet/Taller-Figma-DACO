import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, HostListener, Input, Output, inject } from '@angular/core';
import { FocoDirective } from '../foco/foco.directive';

/** Botón de texto al pie del popover. `action` emite `value`, o `label` si no lo tiene. */
export interface PopoverAction {
  label: string;
  value?: string;
}

let siguienteId = 0;

/**
 * Popover: panel flotante anclado a un disparador, con título, texto y acciones de texto al pie
 * (Figma UI KIT, nodo 9059:20300: «Full», «Title + Content» y «Content + Actions»).
 *
 * El disparador se proyecta con el atributo `popover-trigger` y el padre controla `open`. Se arman los
 * tres tipos con `title`, `text` y `actions`; para contenido más rico, lo que se proyecte sin atributo va
 * debajo del texto. Emite `closed` con Escape o al pulsar fuera, y `action` al elegir un botón.
 *
 * Para el texto completo de algo truncado va `siafTooltip`; para una lista de opciones, `siaf-menu` o
 * `siaf-icon-dropdown-menu`.
 *
 * @usar
 * - Para una explicación breve anclada a un control que el usuario abre con un clic: la ayuda de un campo de la
 *   solicitud o qué significa un estado.
 * - Para una confirmación liviana con una o dos acciones de texto al pie («Ver detalle», «Cerrar») sin bloquear la
 *   pantalla.
 * - Hoy sin uso en la app: el padre controla `open` desde el disparador proyectado con `popover-trigger`.
 * @evitar
 * - Para el texto completo de algo truncado: usar `siafTooltip`.
 * - Para una lista de opciones o comandos: usar `siaf-menu` o `siaf-icon-dropdown-menu`.
 * - Para confirmar acciones irreversibles (Eliminar, Anular) o pedir datos: usar `siaf-modal` o
 *   `siaf-annulment-modal`.
 * - Para contenido largo o formularios: usar `siaf-side-nav` (o `siaf-side-panel` si necesita todo el ancho).
 * @teclado
 * - **Escape**: emite `closed` si está abierto; el padre pone `open` en false.
 * - **Tab**: al abrir, el foco entra en la primera acción (o en el panel, si no tiene); salir con Tab emite `closed`.
 * - **Enter / Espacio** en una acción: emiten `action` con su `value` (o su `label`).
 * @accesibilidad
 * - **4.1.2 Nombre, función y valor (A)**: el panel es `role="dialog"` con nombre desde `title` (`aria-labelledby`) o
 *   desde `ariaLabel`; el padre debe dar `ariaLabel` si no hay título y poner `aria-expanded` en el disparador, que el
 *   componente no toca.
 * - **1.4.13 Contenido en hover o foco (AA)**: no depende del hover: queda visible hasta Escape, un clic fuera o que
 *   el padre lo cierre, y se puede recorrer con el puntero sin que desaparezca.
 * - **2.1.2 Sin trampas de teclado (A)**: no retiene el foco; Tab sale del panel y Escape lo cierra.
 * - **2.4.3 Orden del foco (A)**: con `siafFoco`, al abrir el foco entra en el panel y al cerrarse (Escape, una acción
 *   o salir con Tab) vuelve al disparador.
 * - **2.4.7 Foco visible (AA)**: las acciones muestran un contorno de 2 px `border-states-focus` separado 2 px.
 * - **1.4.11 Contraste no textual (AA)**: ese contorno es el azul del kit (`border-states-focus`, 5.35:1 claro /
 *   10.15:1 oscuro sobre la superficie).
 * - **2.5.8 Tamaño del objetivo (AA)**: cada acción mide al menos 32 px de alto.
 */
@Component({
  selector: 'siaf-popover',
  standalone: true,
  imports: [FocoDirective],
  template: `
    <div class="relative inline-block">
      <ng-content select="[popover-trigger]" />
      @if (open) {
        <div
          class="absolute top-full z-20 mt-2 flex w-[268px] max-w-[calc(100vw-32px)] flex-col gap-siaf-sm rounded-siaf-sm bg-[var(--sys-color-bg-surfaces-surface-highest)] pb-siaf-xs pt-siaf-sm text-left shadow-siaf-elevation-6"
          [class.right-0]="align === 'end'"
          [class.left-0]="align === 'start'"
          role="dialog"
          [attr.aria-labelledby]="title ? idTitulo : null"
          [attr.aria-label]="title ? null : ariaLabel || null"
          siafFoco
          [siafFocoAtrapar]="false"
          (siafFocoSalida)="closed.emit()"
        >
          <div class="flex flex-col gap-siaf-xxs px-siaf-md text-[var(--sys-color-text-neutral-medium)]">
            @if (title) {
              <p class="m-0 text-sm font-bold leading-[normal]" [id]="idTitulo">{{ title }}</p>
            }
            @if (text) {
              <p class="m-0 text-sm leading-[normal] tracking-[0.025px]">{{ text }}</p>
            }
            <ng-content />
          </div>

          @if (actions.length) {
            <div class="flex flex-wrap gap-siaf-xs px-siaf-xxs">
              @for (accion of actions; track accion.value ?? accion.label) {
                <button
                  class="inline-flex min-h-8 items-center justify-center rounded-siaf-md px-siaf-md py-siaf-xxs text-sm font-medium leading-[normal] text-[var(--sys-color-text-neutral-medium)] transition hover:bg-surface-muted active:bg-[var(--sys-color-bg-states-dark-pressed)] focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sys-color-border-states-focus)]"
                  type="button"
                  (click)="action.emit(accion.value ?? accion.label)"
                >
                  {{ accion.label }}
                </button>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PopoverComponent {
  private readonly host = inject(ElementRef<HTMLElement>);

  @Input() open = false;
  @Input() title = '';
  @Input() text = '';
  @Input() actions: PopoverAction[] = [];
  /** Borde del disparador con el que se alinea el panel: `end` (derecha, por defecto) o `start`. */
  @Input() align: 'start' | 'end' = 'end';
  /** Nombre accesible del panel cuando no tiene `title`. */
  @Input() ariaLabel = '';

  @Output() closed = new EventEmitter<void>();
  @Output() action = new EventEmitter<string>();

  readonly idTitulo = `siaf-popover-titulo-${siguienteId++}`;

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open) this.closed.emit();
  }

  @HostListener('document:click', ['$event'])
  onClickFuera(event: MouseEvent): void {
    if (this.open && !this.host.nativeElement.contains(event.target as Node)) this.closed.emit();
  }
}
