import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { IconComponent } from '../icon/icon.component';

export type AlertTone = 'neutral' | 'info' | 'success' | 'warning' | 'error';

/**
 * Mensaje de feedback en línea, con tono (neutral/info/éxito/advertencia/error), ícono y cierre opcional.
 * El título, el ícono y la × se apagan por separado (`title` vacío, `leadingIcon`, `showClose`); con varias líneas
 * de texto, el ícono y la × quedan arriba, a la altura del título.
 *
 * Usarlo para avisos fijos dentro de una pantalla o formulario. Para confirmaciones de acciones de
 * solicitud (aprobar, observar, rechazar) el canónico es `siaf-request-approval-modals` con su snackbar.
 *
 * @usar
 * - Para validar un dato en línea mientras se llena el formulario: el código de la cuenta en la solicitud del
 *   Plan de Cuentas (formato inválido, código ya registrado, validación exitosa).
 * - Para explicar por qué algo no se puede editar: «No se puede modificar la vigencia» de una cuenta en uso.
 * - Para errores de carga o de una acción que el usuario cierra con `showClose`: «No se pudo cargar el
 *   documento» en Apertura contable, o «Sin conexión con el servidor» cuando se muestran datos de demostración.
 * - Para un estado que exige atención en un detalle: «Solicitud fallida en el procesado automático» en
 *   Contabilización.
 * @evitar
 * - Para confirmar que una acción terminó (grabar, verificar, aprobar): usar `siaf-snackbar`, que en las
 *   solicitudes ya emite `siaf-request-approval-modals`.
 * - Para notas grises sin tono: usar `message-box`.
 * - Para pedir una decisión antes de seguir: usar `siaf-modal`.
 * - Para el estado de un documento o registro: usar `siaf-flow-status-tag` o `siaf-record-status-tag`.
 * @figma 6989:873 Alerts
 * @teclado
 * - **Tab**: con `showClose`, enfoca la × del aviso; sin ella, el aviso no recibe foco.
 * - **Enter / Espacio**: la × emite `closed` (botón nativo); quien retira el aviso es el padre.
 * @accesibilidad
 * - **4.1.3 Mensajes de estado (AA)**: el contenedor es `role="alert"` en todos los tonos: al insertarse se
 *   anuncia de inmediato, también los neutrales, informativos y de éxito.
 * - **1.1.1 Contenido no textual (A)**: el ícono del tono va con `aria-hidden`; el tipo de aviso tiene que quedar
 *   dicho en `title` o `description`.
 * - **1.4.1 Uso del color (A)**: cada tono cambia de color y de ícono, salvo neutral y éxito, que comparten
 *   `check_circle`: entre esos dos solo el texto los distingue.
 * - **Pendiente · 1.4.3 Contraste mínimo (AA)**: `warning` en claro pone `text-feedback-warning` sobre
 *   `bg-feedback-light-warning` con 4.43:1. Los demás cumplen (info 5.81:1, éxito 5.31:1, error 6.21:1,
 *   neutral 11.46:1) y en oscuro todos superan 8:1.
 * - **4.1.2 Nombre, función y valor (A)**: la × es un `<button>` con `aria-label="Cerrar alerta"`.
 * - **2.4.7 Foco visible (AA)**: la × muestra un contorno de 2 px del color del texto del tono (4.43:1 o más
 *   sobre el fondo del aviso).
 * - **2.5.8 Tamaño del objetivo (AA)**: la × mide 40 × 40 px.
 * - **2.4.3 Orden del foco (A)**: al cerrar, el padre retira el aviso y el foco queda en el documento; conviene
 *   llevarlo a un control cercano.
 */
@Component({
  selector: 'siaf-alert',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div
      class="flex w-full min-w-0 items-center rounded-siaf-md p-siaf-md"
      [class]="containerClass"
      role="alert"
    >
      <!-- Ícono y textos (Figma «Box»): con varias líneas, el ícono queda arriba, a la altura del título. -->
      <div class="flex min-w-0 flex-1 items-start gap-siaf-xs">
        @if (leadingIcon) {
          <siaf-icon
            class="shrink-0"
            [class]="iconClass"
            [name]="iconName"
            [size]="24"
            variant="filled"
            aria-hidden="true"
          />
        }

        <!-- Interlineado normal, como el Figma: con 1.5 el aviso crecía de 68 a 75 px. min-h-6 centra una sola línea con el ícono. -->
        <div class="flex min-h-6 min-w-0 flex-1 flex-col justify-center gap-siaf-xxs" [class]="textClass">
          @if (title) {
            <span class="text-sm font-bold leading-[normal] tracking-[-0.02px]">{{ title }}</span>
          }
          @if (description) {
            <span class="text-xs font-normal leading-[normal]">{{ description }}</span>
          }
          <ng-content />
        </div>
      </div>

      @if (showClose) {
        <button
          class="inline-flex size-10 shrink-0 items-center justify-center self-start rounded-siaf-md transition hover:bg-[var(--sys-color-bg-states-light-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          [class]="closeButtonClass"
          type="button"
          aria-label="Cerrar alerta"
          (click)="closed.emit()"
        >
          <siaf-icon name="close" [size]="24" />
        </button>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertComponent {
  @Input() tone: AlertTone = 'neutral';
  @Input() title = '';
  @Input() description = '';
  @Input() showClose = false;
  @Input() leadingIcon = true;

  @Output() closed = new EventEmitter<void>();

  get iconName(): string {
    const icons: Record<AlertTone, string> = {
      neutral: 'check_circle',
      info: 'info',
      success: 'check_circle',
      warning: 'warning',
      error: 'error'
    };

    return icons[this.tone];
  }

  get containerClass(): string {
    const classes: Record<AlertTone, string> = {
      neutral: 'bg-[var(--sys-color-bg-feedback-light-default)]',
      info: 'bg-[var(--sys-color-bg-feedback-light-info)]',
      success: 'bg-[var(--sys-color-bg-feedback-light-success)]',
      warning: 'bg-[var(--sys-color-bg-feedback-light-warning)]',
      error: 'bg-[var(--sys-color-bg-feedback-light-danger)]'
    };

    return classes[this.tone];
  }

  get iconClass(): string {
    const classes: Record<AlertTone, string> = {
      neutral: 'text-[var(--sys-color-icon-feedback-light-default)]',
      info: 'text-[var(--sys-color-icon-feedback-light-info)]',
      success: 'text-[var(--sys-color-icon-feedback-light-success)]',
      warning: 'text-[var(--sys-color-icon-feedback-light-warning)]',
      error: 'text-[var(--sys-color-icon-feedback-light-danger)]'
    };

    return classes[this.tone];
  }

  get textClass(): string {
    const classes: Record<AlertTone, string> = {
      neutral: 'text-[var(--sys-color-text-feedback-default)]',
      info: 'text-[var(--sys-color-text-feedback-info)]',
      success: 'text-[var(--sys-color-text-feedback-success)]',
      warning: 'text-[var(--sys-color-text-feedback-warning)]',
      error: 'text-[var(--sys-color-text-feedback-danger)]'
    };

    return classes[this.tone];
  }

  /** Color de la × y de su contorno de foco. El hover es la capa `bg-states-light-hover` en todos los tonos: el fondo
   *  del propio tono, que usaba antes, no se distinguía del aviso. */
  get closeButtonClass(): string {
    const classes: Record<AlertTone, string> = {
      neutral: 'text-[var(--sys-color-icon-feedback-light-default)] focus-visible:outline-[var(--sys-color-text-feedback-default)]',
      info: 'text-[var(--sys-color-icon-feedback-light-info)] focus-visible:outline-[var(--sys-color-text-feedback-info)]',
      success: 'text-[var(--sys-color-icon-feedback-light-success)] focus-visible:outline-[var(--sys-color-text-feedback-success)]',
      warning: 'text-[var(--sys-color-icon-feedback-light-warning)] focus-visible:outline-[var(--sys-color-text-feedback-warning)]',
      error: 'text-[var(--sys-color-icon-feedback-light-danger)] focus-visible:outline-[var(--sys-color-text-feedback-danger)]'
    };

    return classes[this.tone];
  }
}
