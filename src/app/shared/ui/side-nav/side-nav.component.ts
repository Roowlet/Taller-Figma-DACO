import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

import { ButtonComponent } from '../button/button.component';
import { FocoDirective } from '../foco/foco.directive';
import { IconComponent } from '../icon/icon.component';
import { SidePanelAnimacion } from '../side-panel-animacion';

let siguienteId = 0;

/**
 * Side nav del kit (Figma UI KIT, «Sidenav»): panel lateral de 420 px con el título en mayúsculas, la X, el contenido
 * proyectado con su propio scroll y el pie Cancelar / Aceptar. Por defecto es un diálogo que entra desde la derecha,
 * sobre la página y a la derecha del riel, con la animación de los paneles laterales (`SidePanelAnimacion`). Con
 * `embedded` se pinta dentro de otro contenedor, sin fondo oscuro ni diálogo y sobre `surface-highest`: así lo usa
 * `siaf-side-panel` para su panel de filtros.
 *
 * No conoce el dominio: el padre controla `open`, pone el contenido y decide qué hacer con cada evento.
 *
 * @figma 8856:7121 Sidenav
 * @figma 7839:20537 Assets/sidenav/header
 * @figma 7839:20542 Assets/sidenav/footer
 * @usar
 * - Para un panel lateral con contenido libre y, si hace falta, confirmación: un detalle breve, ayuda contextual o un
 *   formulario corto que no tiene ya su panel propio.
 * - `showFooter` en false para un panel de solo lectura; `confirmDisabled` mientras falte algo para aceptar.
 * - `showReturn` cuando el panel es un segundo paso y la flecha vuelve al anterior (emite `returned`).
 * - `embedded` para pintarlo dentro de otro contenedor, como el panel de filtros de `siaf-side-panel`.
 * @evitar
 * - Para elegir registros de un catálogo: usar `siaf-selection-side-nav`; para adjuntar archivos, `siaf-upload-side-nav`;
 *   para los parámetros de una consulta, `siaf-query-parameters-panel`.
 * - Para el historial de un documento o registro: usar `siaf-document-history-panel`, `siaf-account-history-panel` o
 *   `siaf-asiento-history-panel`.
 * - Cuando el contenido necesita todo el ancho de la pantalla (una tabla, un documento): usar `siaf-side-panel`.
 * - Para una confirmación corta: usar `siaf-modal`.
 * @teclado
 * - **Tab / Shift + Tab**: al abrir, el foco entra en el primer control del encabezado (la flecha o la X); recorren el
 *   contenido y Cancelar / Aceptar, y dan la vuelta sin salir del panel.
 * - **Escape**: cierra el panel (emite `closed`) y el foco vuelve al control que lo abrió.
 * - **Enter / Espacio**: la flecha emite `returned`, la X emite `closed`, Cancelar emite `canceled` (y `closed` si no es
 *   `embedded`) y Aceptar emite `confirmed`.
 * - `embedded` no atrapa el foco ni cierra con Escape: sigue el orden de la página que lo contiene.
 * @accesibilidad
 * - **4.1.2 Nombre, función y valor (A)**: el panel es `role="dialog"` con `aria-modal="true"` y `aria-labelledby` al
 *   título; la X se llama «Cerrar» más el título y la flecha, «Volver». Con `embedded` es una sección nombrada por su
 *   título, sin diálogo.
 * - **1.3.1 Información y relaciones (A)**: el título es un `h2`; con `embedded`, un `h3`, porque va dentro de otro
 *   panel con título propio.
 * - **2.4.3 Orden del foco (A)**: con `siafFoco`, al abrir lleva el foco al encabezado y al cerrar lo devuelve al control
 *   que lo abrió; Tab no sale a la página de atrás.
 * - **2.1.2 Sin trampas de teclado (A)**: Tab queda dentro mientras está abierto, pero Escape siempre lo cierra.
 * - **2.4.7 Foco visible (AA)**: la flecha y la X muestran el anillo `border-states-focus` de 2 px (5.35:1 claro /
 *   10.15:1 oscuro); Cancelar y Aceptar siguen `siaf-button`.
 * - **2.5.8 Tamaño del objetivo (AA)**: la flecha y la X miden 40 px.
 * - **1.4.3 Contraste mínimo (AA)**: título `text-neutral-high` sobre la superficie (16.29:1 claro / 16.53:1 oscuro).
 */
@Component({
  selector: 'siaf-side-nav',
  standalone: true,
  imports: [ButtonComponent, FocoDirective, IconComponent, NgTemplateOutlet],
  template: `
    <!-- Encabezado, cuerpo y pie del Figma («Assets/sidenav/header» y «footer»); el contenido se proyecta una sola vez. -->
    <ng-template #panel>
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
        @if (embedded) {
          <h3 class="m-0 min-w-0 flex-1 text-base font-bold uppercase leading-normal tracking-[0.02px] text-[var(--sys-color-text-neutral-high)]" [id]="idTitulo">{{ title }}</h3>
        } @else {
          <h2 class="m-0 min-w-0 flex-1 text-base font-bold uppercase leading-normal tracking-[0.02px] text-[var(--sys-color-text-neutral-high)]" [id]="idTitulo">{{ title }}</h2>
        }
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

      <!-- Sin líneas entre título, contenido y botones, como el resto de los side navs. -->
      <div class="min-h-0 flex-1 overflow-y-auto px-siaf-md pb-siaf-md pt-siaf-sm" data-side-nav-cuerpo>
        <ng-content />
      </div>

      @if (showFooter) {
        <footer class="flex shrink-0 items-center justify-end gap-siaf-xs px-siaf-md py-siaf-sm">
          <siaf-button variant="outline" (click)="cancelar()">{{ cancelLabel }}</siaf-button>
          <siaf-button variant="filled" [disabled]="confirmDisabled" (click)="confirmed.emit()">{{ confirmLabel }}</siaf-button>
        </footer>
      }
    </ng-template>

    @if (embedded) {
      <!-- El Figma da surface-highest al cuerpo; va en todo el panel para que en oscuro el título y el pie no queden
           en otra franja (en claro los dos fondos son blancos). -->
      <section class="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-[var(--sys-color-bg-surfaces-surface-highest)]" [attr.aria-labelledby]="idTitulo">
        <ng-container [ngTemplateOutlet]="panel" />
      </section>
    } @else if (anim.visible()) {
      <section
        class="siaf-sidepanel-overlay fixed inset-y-0 left-0 right-0 z-50 bg-black/55 pl-0 lg:pl-[65px]"
        [class.cerrando]="anim.cerrando()"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="idTitulo"
        (click)="closed.emit()"
      >
        <aside
          class="absolute bottom-0 right-0 top-0 flex w-full max-w-[420px] flex-col overflow-hidden border-l border-[var(--sys-color-divider-default)] bg-surface shadow-siaf-elevation-8"
          [siafFoco]="open"
          (siafFocoEscape)="closed.emit()"
          (click)="$event.stopPropagation()"
        >
          <ng-container [ngTemplateOutlet]="panel" />
        </aside>
      </section>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SideNavComponent implements OnChanges {
  /** Render animado del panel (entra por la derecha y sale en reverso). */
  readonly anim = new SidePanelAnimacion();

  /** Abierto o cerrado; con `embedded` no se usa: el panel se pinta siempre. */
  @Input() open = false;
  @Input() title = '';
  /** Se pinta dentro de otro contenedor, sin fondo oscuro, diálogo ni animación. */
  @Input() embedded = false;
  @Input() showClose = true;
  /** Flecha «Volver» antes del título. */
  @Input() showReturn = false;
  @Input() showFooter = true;
  @Input() cancelLabel = 'Cancelar';
  @Input() confirmLabel = 'Aceptar';
  @Input() confirmDisabled = false;

  /** La X, Escape, el fondo oscuro o Cancelar (este último, salvo con `embedded`). */
  @Output() closed = new EventEmitter<void>();
  @Output() canceled = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<void>();
  @Output() returned = new EventEmitter<void>();

  readonly idTitulo = `siaf-side-nav-titulo-${++siguienteId}`;

  ngOnChanges(changes: SimpleChanges): void {
    if ('open' in changes) this.anim.actualizar(this.open);
  }

  cancelar(): void {
    this.canceled.emit();
    if (!this.embedded) this.closed.emit();
  }
}
