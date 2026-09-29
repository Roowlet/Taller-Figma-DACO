import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, forwardRef, inject, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface RadioOption {
  label: string;
  value: string;
}

/**
 * Grupo de radios (`siaf-radio-group`) con leyenda, marca de requerido y `ControlValueAccessor`.
 *
 * Úsalo para toda selección excluyente; con `[inline]` las opciones van en una sola línea, que es
 * el formato de las preguntas Si/No. El color de la marca se pinta con `accent-*`, nunca con
 * `text-*` (eso exigiría el plugin de forms de Tailwind).
 *
 * @usar
 * - Para las preguntas Sí/No en una línea con `[inline]`: «Cuenta Única del Tesoro (CUT)» y «¿Vigente?» en el catálogo
 *   de eventos, «¿Tiene vigencia?» en el de eventos contables.
 * - Para una sola opción entre pocas (2 a 5) que conviene ver todas a la vez; sin `inline` van apiladas.
 * - Con `label`, para que el grupo tenga `legend`, y con un `name` propio por grupo.
 * @evitar
 * - Para listas largas o que vienen de un catálogo: usar `siaf-input` con `type="select"` o, si hay que buscar,
 *   `siaf-selection-side-nav`.
 * - Para marcar varias opciones o encender algo al instante: casillas o `siaf-switch`.
 * - Repetir a mano los `input type="radio"` con `accent-brand-primary`, como aún hacen las secciones de vigencia y de
 *   dinámica del formulario de cuenta contable.
 * - Dos grupos en la misma pantalla con el `name` por defecto: comparten `radio-group` y se desmarcan entre sí.
 * @teclado
 * - **Tab**: entra al grupo por la opción marcada y sale de él.
 * - **Flechas**: pasan a la opción anterior o siguiente y la marcan (radio nativo).
 * - **Espacio**: marca la opción enfocada.
 * @accesibilidad
 * - **1.3.1 Información y relaciones (A)**: `fieldset` con `legend` (el `label`) y cada radio dentro de su `<label>`.
 *   El padre debe dar `label`: sin él el grupo queda sin nombre, como hoy en los formularios de eventos, que ponen la
 *   pregunta fuera del componente.
 * - **4.1.2 Nombre, función y valor (A)**: radios nativos: el navegador publica el rol, el marcado y `disabled`. El
 *   padre debe dar un `name` único por grupo.
 * - **Pendiente · 3.3.2 Etiquetas o instrucciones (A)**: el asterisco solo existe en la `legend`, y `aria-required` va
 *   en cada radio, rol que no lo admite en ARIA 1.2 (sí `radiogroup`).
 * - **Pendiente · 3.3.1 Identificación de errores (A)**: no tiene entrada de error ni `aria-invalid`; el aviso de un
 *   grupo obligatorio sin respuesta lo tiene que pintar y asociar el padre.
 * - **2.4.7 Foco visible (AA)**: no define estilo propio; queda el anillo de foco nativo del navegador.
 * - **Pendiente · 1.4.11 Contraste no textual (AA)**: el círculo lo dibuja el navegador y, marcado, lo pinta
 *   `accent-brand-primary`: 8.79:1 en claro, pero 2.66:1 en oscuro.
 * - **2.5.8 Tamaño del objetivo (AA)**: cada opción es una `label` de 40 px de alto, clicable entera.
 * - **1.4.3 Contraste mínimo (AA)**: opciones y `legend` en `text-neutral-high` 16.29:1; asterisco
 *   `text-feedback-danger` 9.84:1.
 */
@Component({
  selector: 'siaf-radio-group',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RadioComponent),
      multi: true
    }
  ],
  template: `
    <!-- 16px entre opciones, apiladas o en línea (sys/gap/base/md). -->
    <fieldset [class]="inline ? 'flex flex-wrap items-center gap-siaf-md' : 'grid gap-siaf-md'">
      @if (label) {
        <legend class="text-sm font-medium text-text">{{ label }}@if (required) { <span class="text-[var(--sys-color-text-feedback-danger)]">*</span> }</legend>
      }
      @for (option of options; track option.value) {
        <label class="inline-flex h-10 items-center gap-siaf-xs text-sm text-text">
          <input
            class="size-4 accent-brand-primary"
            type="radio"
            [name]="name"
            [value]="option.value"
            [checked]="option.value === value"
            [disabled]="disabled"
            [attr.aria-required]="required"
            (change)="selectValue(option.value)"
            (blur)="markTouched()"
          />
          <span>{{ option.label }}</span>
        </label>
      }
    </fieldset>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RadioComponent implements ControlValueAccessor {
  private readonly cdr = inject(ChangeDetectorRef);

  @Input() label = '';
  @Input() name = 'radio-group';
  @Input() value = '';
  @Input() options: RadioOption[] = [];
  @Input() disabled = false;
  @Input() required = false;
  /** Opciones en una sola línea (ej. Si/No), en vez de apiladas. */
  @Input() inline = false;

  @Output() valueChange = new EventEmitter<string>();

  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(value: string | null): void {
    this.value = value ?? '';
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }

  selectValue(value: string): void {
    if (this.disabled) {
      return;
    }

    this.value = value;
    this.valueChange.emit(value);
    this.onChange(value);
  }

  markTouched(): void {
    this.onTouched();
  }
}
