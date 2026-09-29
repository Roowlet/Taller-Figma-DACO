import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { LoaderComponent } from '../loader/loader.component';
import { FocoDirective } from '../foco/foco.directive';

/**
 * Capa a pantalla completa que oscurece la vista y muestra el `siaf-loader` con un mensaje.
 *
 * Úsalo para bloquear la interacción mientras se procesa una acción del usuario (grabar, verificar,
 * aprobar). Para una espera localizada que no debe bloquear la pantalla, usa `siaf-loader` directo.
 *
 * @usar
 * - Mientras se ejecuta una acción de la solicitud (grabar, verificar, aprobar): ya lo pinta
 *   `siaf-request-approval-modals` con `saving`.
 * - Mientras carga un documento existente que no se debe tocar hasta que termine: «Cargando documento...» en la
 *   carga masiva del Plan de Cuentas.
 * - Con un `message` corto que diga qué se procesa y un `label` para el lector de pantalla.
 * @evitar
 * - Para esperas locales que no deben bloquear la pantalla: usar `siaf-loader` o `siaf-table-skeleton`.
 * - Agregar otro en páginas que ya usan `siaf-request-approval-modals`: ese ya trae el suyo.
 * - Como única barrera contra un doble envío: el teclado sigue llegando a la página (ver Notas).
 * @teclado
 * - **Tab**: mientras está abierta, el foco queda en la capa y no llega a la página de atrás; al cerrarse vuelve al
 *   control que lo tenía. No se cierra con Escape: la cierra el padre al terminar.
 * @accesibilidad
 * - **4.1.3 Mensajes de estado (AA)**: la capa es `role="status"` con `aria-live="polite"`, `aria-label` y el
 *   mensaje dentro; como se crea ya llena (bloque if), no todos los lectores la anuncian.
 * - **2.4.3 Orden del foco (A)**: con `siafFoco`, al abrirse el foco pasa a la capa y Tab no sale de ella; al cerrarse
 *   vuelve al control que lo tenía. El lector de pantalla todavía puede recorrer la página de atrás con su cursor
 *   virtual: el padre debe deshabilitar las acciones mientras dura, como `confirmDisabled` en
 *   `siaf-request-approval-modals`.
 * - **Pendiente · 1.4.3 Contraste mínimo (AA)**: el mensaje es blanco sobre negro al 40 % (`bg-black/40`); encima
 *   de una superficie clara no llega a 4.5:1. En oscuro cumple.
 * - **1.1.1 Contenido no textual (A)**: el `siaf-loader` interno va `decorative` (`aria-hidden`); la espera se
 *   comunica con el mensaje y `label`.
 */
@Component({
  selector: 'siaf-loader-overlay',
  standalone: true,
  imports: [FocoDirective, LoaderComponent],
  template: `
    @if (open) {
      <div
        class="fixed inset-0 z-[60] grid place-items-center bg-black/40 p-siaf-md"
        role="status"
        aria-live="polite"
        [attr.aria-label]="label"
        [siafFoco]="open"
      >
        <div class="grid place-items-center gap-siaf-md text-[var(--sys-color-text-brand-white)]">
          <siaf-loader [size]="size" [dotSize]="dotSize" tone="light" [decorative]="true" />

          @if (message) {
            <p class="m-0 text-center text-sm font-medium text-[var(--sys-color-text-brand-white)]">
              {{ message }}
            </p>
          }
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoaderOverlayComponent {
  @Input() open = false;
  @Input() message = 'Procesando...';
  @Input() label = 'Procesando';
  @Input() size = 32;
  @Input() dotSize = 6;
}
