import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

import { ButtonComponent } from '../button/button.component';
import { FocoDirective } from '../foco/foco.directive';
import { IconComponent } from '../icon/icon.component';
import { SideNavComponent } from '../side-nav/side-nav.component';
import { SidePanelAnimacion } from '../side-panel-animacion';

let siguienteId = 0;

/**
 * Side panel del kit (Figma UI KIT, «Side Panel»): panel grande que entra desde la derecha y ocupa toda el área de
 * contenido, a la derecha del riel, con el título en mayúsculas, la X, el cuerpo con su propio scroll y el pie Cancelar
 * / Aceptar. Tiene la animación de los paneles laterales (`SidePanelAnimacion`), esquinas de 8 px y elevación 16.
 *
 * Con `showNav` suma a la derecha del cuerpo el panel de filtros de la variante del Figma: un `siaf-side-nav` con
 * `embedded` de 420 px, con su título, su contenido (lo que se proyecta con el atributo `sidePanelNav`) y su pie
 * Cancelar / Aplicar. Ahí el pie principal desaparece y el cuerpo lleva una línea arriba y otra abajo, como en el Figma.
 * En pantallas angostas el panel de filtros baja debajo del contenido.
 *
 * @figma 8842:12884 Side Panel
 * @figma 8856:7115 Side Panel con Sidenav
 * @usar
 * - Para trabajar sobre un contenido que necesita todo el ancho sin salir de la pantalla: una tabla grande, la vista
 *   previa de un documento o un detalle con muchas columnas.
 * - `showNav` con el contenido de los filtros en un elemento con el atributo `sidePanelNav`, cuando ese contenido se
 *   filtra ahí mismo (emite `navConfirmed` y `navCanceled`).
 * - `showFooter` en false para un panel de solo lectura; `confirmDisabled` mientras falte algo para aceptar.
 * @evitar
 * - Para un formulario corto o un detalle breve: usar `siaf-side-nav`, de 420 px.
 * - Para elegir registros, adjuntar archivos o los parámetros de una consulta: usar `siaf-selection-side-nav`,
 *   `siaf-upload-side-nav` o `siaf-query-parameters-panel`.
 * - Para una confirmación corta: usar `siaf-modal`.
 * @teclado
 * - **Tab / Shift + Tab**: al abrir, el foco entra en el primer control del encabezado (la flecha o la X); recorren el
 *   contenido, el panel de filtros y los botones del pie, y dan la vuelta sin salir del panel.
 * - **Escape**: cierra el panel (emite `closed`) y el foco vuelve al control que lo abrió.
 * - **Enter / Espacio**: la flecha emite `returned`, la X emite `closed`, Cancelar emite `canceled` y `closed`, Aceptar
 *   emite `confirmed`, y en el panel de filtros Cancelar y Aplicar emiten `navCanceled` y `navConfirmed`.
 * @accesibilidad
 * - **4.1.2 Nombre, función y valor (A)**: el panel es `role="dialog"` con `aria-modal="true"` y `aria-labelledby` al
 *   título; la X se llama «Cerrar» más el título y la flecha, «Volver».
 * - **1.3.1 Información y relaciones (A)**: el título es un `h2` y el del panel de filtros, un `h3` dentro de una
 *   sección nombrada por él.
 * - **2.4.3 Orden del foco (A)**: con `siafFoco`, al abrir lleva el foco al encabezado y al cerrar lo devuelve al control
 *   que lo abrió; Tab no sale a la página de atrás.
 * - **2.1.2 Sin trampas de teclado (A)**: Tab queda dentro mientras está abierto, pero Escape siempre lo cierra.
 * - **1.4.10 Reajuste del contenido (AA)**: en pantallas angostas ocupa todo el ancho y el panel de filtros baja
 *   debajo del contenido, sin desplazamiento horizontal.
 * - **2.4.7 Foco visible (AA)**: la flecha y la X muestran el anillo `border-states-focus` de 2 px (5.35:1 claro /
 *   10.15:1 oscuro); los botones del pie siguen `siaf-button`.
 * - **2.5.8 Tamaño del objetivo (AA)**: la flecha y la X miden 40 px.
 * - **1.4.3 Contraste mínimo (AA)**: título `text-neutral-high` sobre la superficie (16.29:1 claro / 16.53:1 oscuro).
 */
@Component({
  selector: 'siaf-side-panel',
  standalone: true,
  imports: [ButtonComponent, FocoDirective, IconComponent, SideNavComponent],
  template: `
    @if (anim.visible()) {
      <section
        class="siaf-sidepanel-overlay fixed inset-0 z-50 bg-black/55"
        [class.cerrando]="anim.cerrando()"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="idTitulo"
        (click)="closed.emit()"
      >
        <aside
          class="absolute inset-y-0 left-0 right-0 flex flex-col overflow-hidden rounded-siaf-md bg-surface shadow-siaf-elevation-16 lg:left-[65px]"
          [siafFoco]="open"
          (siafFocoEscape)="closed.emit()"
          (click)="$event.stopPropagation()"
        >
          <header class="flex h-14 shrink-0 items-center gap-siaf-xs px-siaf-md">
            @if (showReturn) {
              <button
                class="inline-flex size-10 shrink-0 items-center justify-center rounded-siaf-md text-[var(--sys-color-text-neutral-high)] transition hover:bg-surface-muted active:bg-[var(--sys-color-bg-states-light-pressed)] focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sys-color-border-states-focus)]"
                type="button"
                aria-label="Volver"
                (click)="returned.emit()"
              >
                <siaf-icon name="arrow_back" [size]="24" />
              </button>
            }
            <h2 class="m-0 min-w-0 flex-1 text-base font-bold uppercase leading-normal tracking-[0.02px] text-[var(--sys-color-text-neutral-high)]" [id]="idTitulo">{{ title }}</h2>
            @if (showClose) {
              <button
                class="inline-flex size-10 shrink-0 items-center justify-center rounded-siaf-md text-[var(--sys-color-text-neutral-high)] transition hover:bg-surface-muted active:bg-[var(--sys-color-bg-states-light-pressed)] focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sys-color-border-states-focus)]"
                type="button"
                [attr.aria-label]="title ? 'Cerrar ' + title : 'Cerrar'"
                (click)="closed.emit()"
              >
                <siaf-icon name="close" [size]="24" />
              </button>
            }
          </header>

          <!-- Con el panel de filtros, el cuerpo lleva una línea arriba y otra abajo (Figma 8856:7115). -->
          <div
            class="flex min-h-0 flex-1 flex-col lg:flex-row"
            [class.border-y]="showNav"
            [class.border-[var(--sys-color-divider-default)]]="showNav"
            data-side-panel-cuerpo
          >
            <div class="min-h-0 min-w-0 flex-1 overflow-y-auto p-siaf-md">
              <ng-content />
            </div>

            @if (showNav) {
              <div
                class="flex max-h-[50%] min-h-0 shrink-0 flex-col border-t border-[var(--sys-color-divider-strong)] lg:max-h-none lg:w-[420px] lg:border-l lg:border-t-0"
                data-side-panel-filtros
              >
                <siaf-side-nav
                  class="flex min-h-0 flex-1 flex-col"
                  [embedded]="true"
                  [showClose]="false"
                  [title]="navTitle"
                  [cancelLabel]="navCancelLabel"
                  [confirmLabel]="navConfirmLabel"
                  [confirmDisabled]="navConfirmDisabled"
                  (canceled)="navCanceled.emit()"
                  (confirmed)="navConfirmed.emit()"
                >
                  <ng-content select="[sidePanelNav]" />
                </siaf-side-nav>
              </div>
            }
          </div>

          @if (showFooter && !showNav) {
            <footer class="flex shrink-0 items-center justify-end gap-siaf-xs px-siaf-md py-siaf-sm">
              <siaf-button variant="outline" (click)="cancelar()">{{ cancelLabel }}</siaf-button>
              <siaf-button variant="filled" [disabled]="confirmDisabled" (click)="confirmed.emit()">{{ confirmLabel }}</siaf-button>
            </footer>
          }
        </aside>
      </section>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidePanelComponent implements OnChanges {
  /** Render animado del panel (entra por la derecha y sale en reverso). */
  readonly anim = new SidePanelAnimacion();

  @Input() open = false;
  @Input() title = '';
  @Input() showClose = true;
  /** Flecha «Volver» antes del título. */
  @Input() showReturn = false;
  /** Pie Cancelar / Aceptar; con `showNav` no se muestra, como en el Figma. */
  @Input() showFooter = true;
  @Input() cancelLabel = 'Cancelar';
  @Input() confirmLabel = 'Aceptar';
  @Input() confirmDisabled = false;
  /** Panel de filtros a la derecha del cuerpo, con el contenido que lleva el atributo `sidePanelNav`. */
  @Input() showNav = false;
  @Input() navTitle = 'Filtros';
  @Input() navCancelLabel = 'Cancelar';
  @Input() navConfirmLabel = 'Aplicar';
  @Input() navConfirmDisabled = false;

  /** La X, Escape, el fondo oscuro o Cancelar. */
  @Output() closed = new EventEmitter<void>();
  @Output() canceled = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<void>();
  @Output() returned = new EventEmitter<void>();
  /** Cancelar del panel de filtros. */
  @Output() navCanceled = new EventEmitter<void>();
  /** Aplicar del panel de filtros. */
  @Output() navConfirmed = new EventEmitter<void>();

  readonly idTitulo = `siaf-side-panel-titulo-${++siguienteId}`;

  ngOnChanges(changes: SimpleChanges): void {
    if ('open' in changes) this.anim.actualizar(this.open);
  }

  cancelar(): void {
    this.canceled.emit();
    this.closed.emit();
  }
}
