import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, signal } from '@angular/core';

import { IconComponent } from '../icon/icon.component';

let siguienteId = 0;

/**
 * Tarjeta colapsable (Figma UI KIT, nodo 19632:66 «accordion/collapsible_card»): cabecera de 60 px con una
 * marca azul a la izquierda, la flecha, la información del ítem y una X para quitarlo; al abrir, el detalle
 * aparece debajo separado por una línea.
 *
 * La cabecera se proyecta con el atributo `card-info` y el detalle con el contenido sin atributo, así que
 * sirve para cualquier ítem de una lista (un documento, un asiento…). `[(expanded)]` controla si está
 * abierta; la X emite `closed` y se oculta con `[closable]="false"`. El padre decide qué hacer al cerrar.
 *
 * @usar
 * - Ítems de una lista que se revisan de a uno: un documento o un asiento con su resumen en la cabecera y todos sus
 *   datos al abrir.
 * - Cuando además el usuario puede quitar el ítem con la X y el padre decide qué pasa con `closed`.
 * - Hoy sin uso en la app; empieza cerrada y `[(expanded)]` sirve para abrir la primera o recordar el estado.
 * @evitar
 * - Para 2 o más registros comparables en una solicitud: usar la grilla estándar (`siaf-table-controls` + tabla +
 *   `siaf-pagination`).
 * - Para el único ítem elegido desde un panel lateral, sin detalle que desplegar: usar `siaf-summary-card`.
 * - Para secciones con título y menú ⋮, sin X: usar `siaf-expansion-panel`; para preguntas de solo texto,
 *   `siaf-accordion`.
 * - Con la X visible en modo consulta: ocultarla con `[closable]="false"`.
 * @teclado
 * - **Tab**: pasa por la flecha, lo que el padre proyecte en la cabecera y la X.
 * - **Enter / Espacio** en la flecha: abren o cierran el detalle y emiten `expandedChange`.
 * - **Enter / Espacio** en la X: emiten `closed`; si el padre quita la tarjeta, el foco no se mueve solo.
 * @accesibilidad
 * - **4.1.2 Nombre, función y valor (A)**: la flecha es un `button` con `aria-expanded`, `aria-controls` hacia el
 *   detalle y nombre «Expandir detalle» / «Contraer detalle»; la X toma su nombre de `closeLabel`, que el padre debe
 *   completar con el ítem (por ejemplo «Quitar documento PAA-…») cuando hay varias tarjetas.
 * - **1.3.1 Información y relaciones (A)**: el detalle abierto es `role="region"` rotulado por la cabecera
 *   (`aria-labelledby`).
 * - **1.1.1 Contenido no textual (A)**: la marca azul y los íconos de los botones son decorativos (`aria-hidden`).
 * - **1.4.1 Uso del color (A)**: abierta o cerrada se distingue por la flecha y por el detalle visible; la marca azul
 *   no indica estado.
 * - **2.4.3 Orden del foco (A)**: al quitar la tarjeta, el padre debe llevar el foco al ítem siguiente o a la acción
 *   de agregar: el componente no lo mueve.
 * - **2.4.7 Foco visible (AA)**: los dos botones muestran un contorno de 2 px `border-states-focus` separado 2 px.
 * - **1.4.11 Contraste no textual (AA)**: ese contorno es el azul del kit (`border-states-focus`, 5.35:1 claro /
 *   10.15:1 oscuro sobre la superficie).
 * - **2.5.8 Tamaño del objetivo (AA)**: flecha y X miden 32 × 32 px.
 */
@Component({
  selector: 'siaf-collapsible-card',
  standalone: true,
  imports: [IconComponent],
  template: `
    <section class="flex flex-col overflow-hidden rounded-siaf-md border border-[var(--sys-color-border-states-enabled)] text-[var(--sys-color-text-neutral-medium)]">
      <div class="relative flex min-h-[60px] items-center gap-siaf-md bg-[var(--sys-color-bg-surfaces-surface-highest)] px-siaf-lg py-siaf-xs">
        <span class="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-siaf-sm bg-[var(--sys-color-icon-states-active)]" aria-hidden="true"></span>
        <button
          class="inline-flex size-8 shrink-0 items-center justify-center rounded-siaf-md transition hover:bg-surface-muted active:bg-[var(--sys-color-bg-states-dark-pressed)] focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sys-color-border-states-focus)]"
          type="button"
          [attr.aria-expanded]="abierto()"
          [attr.aria-controls]="idCuerpo"
          [attr.aria-label]="abierto() ? 'Contraer detalle' : 'Expandir detalle'"
          (click)="alternar()"
        >
          <siaf-icon [name]="abierto() ? 'expand_less' : 'expand_more'" [size]="20" />
        </button>
        <div class="min-w-0 flex-1" [id]="idCabecera">
          <ng-content select="[card-info]" />
        </div>
        @if (closable) {
          <button
            class="inline-flex size-8 shrink-0 items-center justify-center rounded-siaf-md transition hover:bg-surface-muted active:bg-[var(--sys-color-bg-states-dark-pressed)] focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sys-color-border-states-focus)]"
            type="button"
            [attr.aria-label]="closeLabel"
            (click)="closed.emit()"
          >
            <siaf-icon name="close" [size]="20" />
          </button>
        }
      </div>

      @if (abierto()) {
        <div class="border-t border-[var(--sys-color-border-states-enabled)] bg-surface" role="region" [id]="idCuerpo" [attr.aria-labelledby]="idCabecera">
          <ng-content />
        </div>
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CollapsibleCardComponent {
  /** Muestra la X que emite `closed`. */
  @Input() closable = true;
  @Input() closeLabel = 'Quitar';

  @Input() set expanded(valor: boolean) {
    this.abierto.set(!!valor);
  }

  @Output() expandedChange = new EventEmitter<boolean>();
  @Output() closed = new EventEmitter<void>();

  readonly abierto = signal(false);
  readonly idCabecera = `siaf-collapsible-card-${siguienteId}-cabecera`;
  readonly idCuerpo = `siaf-collapsible-card-${siguienteId++}-cuerpo`;

  alternar(): void {
    this.abierto.update((v) => !v);
    this.expandedChange.emit(this.abierto());
  }
}
