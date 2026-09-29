import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, forwardRef, inject, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Checkbox con etiqueta, descripción y marca de requerido, integrado a formularios vía ControlValueAccessor.
 *
 * Tiene 0 consumidores: no usarlo. Las grillas y paneles de la app usan `<input type="checkbox">`
 * nativo con clases `accent-*` (el color de un check nativo se pinta con `accent-*`, nunca `text-*`).
 *
 * @usar
 * - Para una casilla suelta de formulario que se graba con el resto, con etiqueta y ayuda debajo: por ejemplo
 *   «Habilitar verificación en dos pasos» del usuario en Admin, hoy hecha con un checkbox nativo.
 * - Para una aceptación obligatoria antes de grabar: `[required]` pinta el asterisco y publica `aria-required`.
 * - Con `formControlName`, `ngModel` o `[(checked)]`.
 * @evitar
 * - Para la selección de filas en grillas y paneles: checkbox nativo, como en `siaf-table-controls` y
 *   `siaf-selection-side-nav`.
 * - Para encender o apagar algo con efecto inmediato: usar `siaf-switch`.
 * - Para una sola opción entre varias o un Sí/No: usar `siaf-radio-group` con `[inline]`.
 * @teclado
 * - **Tab**: enfoca la casilla.
 * - **Espacio**: la marca o la desmarca (checkbox nativo).
 * @accesibilidad
 * - **1.3.1 Información y relaciones (A)**: el `<input type="checkbox">` va dentro de su `<label>`; la descripción
 *   también, así que se suma al nombre en vez de ir por `aria-describedby`.
 * - **4.1.2 Nombre, función y valor (A)**: checkbox nativo: el navegador publica el rol, el marcado y `disabled`.
 * - **3.3.2 Etiquetas o instrucciones (A)**: etiqueta visible; el obligatorio lleva asterisco y `aria-required`.
 * - **Pendiente · 3.3.1 Identificación de errores (A)**: no tiene entrada de error ni `aria-invalid`; si falta marcar
 *   una casilla obligatoria, el aviso lo tiene que pintar y asociar el padre.
 * - **2.4.7 Foco visible (AA)**: no define estilo propio (`focus:ring-brand-primary` fija el color del anillo, no su
 *   ancho); queda el anillo de foco nativo del navegador.
 * - **1.4.11 Contraste no textual (AA)**: la casilla la dibuja el estilo global de `styles.css`: borde de 2 px
 *   `icon-states-enabled` (8.70:1 claro, 12.87:1 oscuro) y, marcada, relleno `icon-states-active` (8.79:1 / 10.15:1).
 * - **1.4.3 Contraste mínimo (AA)**: etiqueta `text-neutral-high` 16.29:1, descripción `text-neutral-low` 5.01:1 y
 *   asterisco `text-feedback-danger` 9.84:1.
 * - **2.5.8 Tamaño del objetivo (AA)**: la casilla mide 16 px, pero toda la `label` es clicable; sin descripción mide
 *   20 px de alto, así que el padre debe separar las casillas.
 */
@Component({
  selector: 'siaf-checkbox',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true
    }
  ],
  template: `
    <label class="inline-flex items-start gap-3 text-sm text-text">
      <input
        class="mt-0.5 size-4 rounded border-border text-brand-primary focus:ring-brand-primary"
        type="checkbox"
        [checked]="checked"
        [disabled]="disabled"
        [attr.aria-required]="required"
        (change)="onInputChange($event)"
        (blur)="markTouched()"
      />
      <span>
        <span class="block font-medium">{{ label }}@if (required) { <span class="text-[var(--sys-color-text-feedback-danger)]">*</span> }</span>
        @if (description) {
          <span class="block text-text-muted">{{ description }}</span>
        }
      </span>
    </label>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckboxComponent implements ControlValueAccessor {
  private readonly cdr = inject(ChangeDetectorRef);

  @Input() label = '';
  @Input() description = '';
  @Input() checked = false;
  @Input() disabled = false;
  @Input() required = false;

  @Output() checkedChange = new EventEmitter<boolean>();

  private onChange: (value: boolean) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(value: boolean | null): void {
    this.checked = !!value;
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }

  onInputChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.checked = checked;
    this.checkedChange.emit(checked);
    this.onChange(checked);
  }

  markTouched(): void {
    this.onTouched();
  }
}
