import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, forwardRef, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Interruptor on/off con etiqueta al costado. Al pulsarlo el círculo se desliza y el riel cambia de
 * color con una transición de 200 ms (sin animación si el sistema pide reducir movimiento).
 *
 * Admite `[(checked)]` y formularios (`formControl`/`ngModel`). Se opera con el teclado como un
 * checkbox (Tab y Espacio) y se anuncia con `role="switch"`.
 *
 * Sin consumidores: ninguna pantalla usa switch. Las preguntas Sí/No se resuelven con
 * `siaf-radio-group` y su `[inline]` para dejarlas en una sola línea.
 *
 * @usar
 * - Para activar o desactivar una opción con efecto inmediato, sin pasar por Grabar (por ejemplo, «Notificar por
 *   correo» en una configuración).
 * - Dentro de un ítem de `siaf-list`, al inicio o al final, que le pasa el título del ítem como `ariaLabel`.
 * @evitar
 * - Para las preguntas Sí/No de una solicitud, que se graban con el documento: usar `siaf-radio-group` con `[inline]`.
 * - Para seleccionar filas o varias opciones de una lista: checkbox nativo, como en `siaf-table-controls`.
 * - Sin `label` visible ni `ariaLabel`: el interruptor queda sin nombre.
 * @teclado
 * - **Tab**: enfoca el interruptor; el riel muestra un contorno de 2 px en `brand-primary`.
 * - **Espacio**: lo enciende o lo apaga (checkbox nativo con `role="switch"`; Enter no lo cambia).
 * @accesibilidad
 * - **4.1.2 Nombre, función y valor (A)**: `<input type="checkbox" role="switch">` con `aria-checked` y `disabled`
 *   nativo; se nombra con el `label` que lo envuelve o con `ariaLabel` (el padre debe dar uno de los dos).
 * - **2.4.7 Foco visible (AA)**: el input está oculto con `sr-only` y el foco con teclado pinta en el riel un contorno
 *   de 2 px separado 2 px (`peer-focus-visible`).
 * - **Pendiente · 1.4.11 Contraste no textual (AA)**: apagado, el riel es `bg-border` (`border-states-enabled`, 2.44:1
 *   claro y 2.59:1 oscuro); en oscuro, el riel encendido y el contorno de foco (`brand-primary`) quedan en 2.66:1.
 * - **1.4.1 Uso del color (A)**: además del color, el círculo cambia de lado.
 * - **2.5.8 Tamaño del objetivo (AA)**: el riel mide 44 × 24 px y toda la `label` es clicable.
 * - **1.4.3 Contraste mínimo (AA)**: la etiqueta va en `text-neutral-high` 16.29:1; deshabilitado baja al 50 % de
 *   opacidad (exento).
 */
@Component({
  selector: 'siaf-switch',
  standalone: true,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SwitchComponent), multi: true }],
  template: `
    <label
      class="inline-flex items-center gap-3 text-sm text-text"
      [class.cursor-pointer]="!deshabilitado()"
      [class.cursor-not-allowed]="deshabilitado()"
      [class.opacity-50]="deshabilitado()"
    >
      <input
        class="peer sr-only"
        type="checkbox"
        role="switch"
        [checked]="activo()"
        [disabled]="deshabilitado()"
        [attr.aria-checked]="activo()"
        [attr.aria-label]="label ? null : ariaLabel || null"
        (change)="alternar($event)"
        (blur)="onTouched()"
      />
      <span
        aria-hidden="true"
        class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ease-out peer-focus-visible:outline-solid peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--sys-color-border-states-focus)] motion-reduce:transition-none"
        [class.bg-brand-primary]="activo()"
        [class.bg-border]="!activo()"
      >
        <span
          class="inline-block size-5 rounded-full bg-[var(--sys-color-bg-switch-thumb)] shadow-siaf-sm transition-transform duration-200 ease-out motion-reduce:transition-none"
          [class.translate-x-[2px]]="!activo()"
          [class.translate-x-[22px]]="activo()"
        ></span>
      </span>
      @if (label) {
        <span class="font-medium">{{ label }}</span>
      }
    </label>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwitchComponent implements ControlValueAccessor {
  @Input() label = '';
  /** Nombre accesible cuando no hay `label` visible (ej. un switch dentro de un ítem de lista). */
  @Input() ariaLabel = '';

  @Input() set checked(valor: boolean) {
    this.activo.set(!!valor);
  }

  @Input() set disabled(valor: boolean) {
    this.deshabilitado.set(!!valor);
  }

  @Output() checkedChange = new EventEmitter<boolean>();

  readonly activo = signal(false);
  readonly deshabilitado = signal(false);

  private avisarCambio: (valor: boolean) => void = () => undefined;
  onTouched: () => void = () => undefined;

  alternar(event: Event): void {
    const valor = (event.target as HTMLInputElement).checked;
    this.activo.set(valor);
    this.checkedChange.emit(valor);
    this.avisarCambio(valor);
  }

  writeValue(valor: boolean | null): void {
    this.activo.set(!!valor);
  }

  registerOnChange(fn: (valor: boolean) => void): void {
    this.avisarCambio = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(deshabilitado: boolean): void {
    this.deshabilitado.set(deshabilitado);
  }
}
