import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

export type TextAreaControlState = 'enabled' | 'error' | 'success';

/**
 * Textarea del design system con etiqueta flotante, contador de caracteres y estados error/éxito.
 *
 * Usarlo para los textos largos de las solicitudes (glosa, justificación, motivo de observación),
 * donde `[minlength]` exige el mínimo de 3 caracteres y solo lo reclama tras salir del campo.
 *
 * @usar
 * - Para la «Justificación del requerimiento solicitado» de las solicitudes (cuenta contable, carga masiva, clase de
 *   ajuste, tipo de asiento, asiento de ajuste, evento, evento contable y apertura contable), con `maxlength` 500.
 * - Para los textos largos de un registro: glosa del asiento de ajuste, descripción del evento o dinámica contable de
 *   la cuenta (se debita por, se acredita por, objeto, saldos).
 * - Para el motivo que pide `siaf-modal` con `requiresReason`.
 * - Con `title` cuando el campo lleva un encabezado propio en mayúsculas encima (Glosa).
 * @evitar
 * - Para textos de una línea (nombre, código, correo): usar `siaf-input`.
 * - Para mostrar el texto ya grabado en modo lectura: usar `readonly-field`, como hacen las solicitudes.
 * - Marcar el obligatorio con un `*` al final de `placeholder`: el componente lo quita; usar `[required]`.
 * @teclado
 * - **Tab**: entra y sale del campo (en un `textarea` nativo, Tab no escribe tabulaciones).
 * - **Enter**: agrega un salto de línea; al llegar a `maxlength` no deja escribir más.
 * @accesibilidad
 * - **Pendiente · 1.3.1 Información y relaciones (A)**: el `<label>` envuelve el `textarea`, pero la etiqueta flotante
 *   solo existe con foco o valor, y el error y el contador («0/500») están dentro del mismo `<label>`: se suman al
 *   nombre en vez de ir por `aria-describedby`. Sin foco ni valor, un campo sin `title` ni `required` queda nombrado
 *   por el contador y no por su `placeholder`.
 * - **3.3.1 Identificación de errores (A)**: con error publica `aria-invalid="true"`, borde rojo de 2 px y el texto (el
 *   `error` del padre o «Mínimo N caracteres», que aparece al salir del campo). Con `state="error"` y sin texto, el
 *   aviso es solo el borde.
 * - **3.3.2 Etiquetas o instrucciones (A)**: la etiqueta siempre se ve (dentro del campo o flotante), el obligatorio
 *   lleva asterisco y `aria-required`, y el contador muestra el máximo.
 * - **4.1.2 Nombre, función y valor (A)**: `textarea` nativo con `aria-required`, `aria-invalid`, `maxlength` y
 *   `disabled`.
 * - **2.4.7 Foco visible (AA)**: el `textarea` usa `outline-none` y el foco pinta el borde de 2 px
 *   `border-states-focus` (5.35:1); con un `error` del padre el borde sigue rojo y solo queda el cursor de texto.
 * - **Pendiente · 1.4.11 Contraste no textual (AA)**: el borde del campo vacío es `border-states-enabled` (2.44:1
 *   claro, 2.59:1 oscuro).
 * - **1.4.3 Contraste mínimo (AA)**: texto `text-neutral-medium` 14.53:1, etiqueta y contador `text-neutral-low`
 *   5.01:1, título `text-neutral-high` 16.29:1 y error `text-feedback-danger` 9.84:1.
 */
@Component({
  selector: 'text-area-control',
  standalone: true,
  template: `
    <label class="grid gap-siaf-md">
      @if (title) {
        <span class="text-sm font-bold uppercase text-text">
          {{ title }}@if (required) { <span class="text-[var(--sys-color-text-feedback-danger)]">*</span> }
        </span>
      }
      <span class="relative block w-full">
        @if (floatingLabel) {
          <span
            class="absolute -top-2.5 left-3 z-[1] rounded-siaf-sm bg-surface px-siaf-xxs text-xs font-medium leading-normal"
            [class]="labelClass"
          >
            {{ placeholderText }}@if (required) { <span class="text-[var(--sys-color-text-feedback-danger)]">*</span> }
          </span>
        }
        <span
          class="flex min-h-[60px] items-start rounded-siaf-md border px-siaf-md py-siaf-xs transition"
          [class]="containerClass"
        >
          @if (!floatingLabel && required) {
            <span class="pointer-events-none absolute left-siaf-md top-siaf-xs text-sm leading-6 tracking-[0.0249px] text-[var(--sys-color-text-neutral-low)]">
              {{ placeholderText }}<span class="text-[var(--sys-color-text-feedback-danger)]">*</span>
            </span>
          }
          <textarea
            class="min-h-11 flex-1 resize-none bg-transparent text-sm leading-6 tracking-[0.0249px] text-[var(--sys-color-text-neutral-medium)] outline-none placeholder:text-[var(--sys-color-text-neutral-low)] disabled:cursor-not-allowed disabled:text-[var(--sys-color-text-neutral-disabled)]"
            [attr.maxlength]="maxlength"
            [placeholder]="floatingLabel || required ? '' : placeholderText"
            [attr.aria-required]="required"
            [attr.aria-invalid]="effectiveState === 'error' ? 'true' : null"
            [value]="value"
            [disabled]="disabled"
            (focus)="onFocus()"
            (blur)="onBlur()"
            (input)="onInput($event)"
          ></textarea>
        </span>
      </span>
      <span class="-mt-1 flex items-start justify-between gap-siaf-sm text-xs">
        <span class="text-[var(--sys-color-text-feedback-danger)]">{{ errorMessage }}</span>
        <span class="shrink-0 text-text-muted">{{ charCount }}/{{ maxlength }}</span>
      </span>
    </label>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextAreaControlComponent implements OnChanges {
  private readonly cdr = inject(ChangeDetectorRef);

  @Input() title = '';
  @Input() placeholder = '';
  @Input() value = '';
  @Input() disabled = false;
  @Input() maxlength = 500;
  /** Mínimo de caracteres (sin contar espacios al inicio/fin). 0 = sin mínimo. */
  @Input() minlength = 0;
  @Input() required = false;
  @Input() error = '';
  @Input() state: TextAreaControlState = 'enabled';

  @Output() valueChange = new EventEmitter<string>();

  focused = false;
  charCount = 0;
  /** El usuario ya pasó por el campo: recién ahí se le reclama el mínimo. */
  private touched = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value']) {
      this.charCount = (this.value ?? '').length;
    }
  }

  get hasValue(): boolean {
    return (this.value ?? '').length > 0;
  }

  get placeholderText(): string {
    return this.placeholder.replace(/\s*\*$/, '');
  }

  get floatingLabel(): boolean {
    return this.focused || this.hasValue;
  }

  get labelClass(): string {
    if (this.disabled) {
      return 'text-[var(--sys-color-text-neutral-disabled)]';
    }

    if (this.effectiveState === 'error') {
      return 'text-[var(--sys-color-text-feedback-danger)]';
    }

    if (this.effectiveState === 'success') {
      return 'text-[var(--sys-color-text-neutral-low)]';
    }

    return this.focused
      ? 'text-[var(--sys-color-text-neutral-activated)]'
      : 'text-[var(--sys-color-text-neutral-low)]';
  }

  /**
   * Texto de longitud mínima incumplida. Solo cuando el usuario ya escribió
   * algo y salió del campo: reclamar el mínimo sobre un campo vacío o mientras
   * todavía está tecleando sería ruido (el asterisco ya marca el obligatorio).
   */
  get minlengthError(): string {
    if (this.minlength <= 0 || this.focused || !this.touched) {
      return '';
    }

    const largo = (this.value ?? '').trim().length;
    if (largo === 0 || largo >= this.minlength) {
      return '';
    }

    return `Mínimo ${this.minlength} caracteres`;
  }

  /** Error visible: el que manda el padre tiene prioridad sobre el del mínimo. */
  get errorMessage(): string {
    return this.error || this.minlengthError;
  }

  get effectiveState(): TextAreaControlState {
    if (this.errorMessage) {
      return 'error';
    }

    if (this.state === 'success' || (this.hasValue && !this.focused)) {
      return 'success';
    }

    return this.state;
  }

  get containerClass(): string {
    if (this.disabled) {
      return 'border-[var(--sys-color-border-states-disabled)] bg-[var(--sys-color-bg-surfaces-disabled)] cursor-not-allowed';
    }

    if (this.effectiveState === 'error') {
      return 'border-2 border-[var(--sys-color-border-feedback-danger)] bg-surface hover:border-[var(--sys-color-border-feedback-danger)]';
    }

    if (this.effectiveState === 'success') {
      return 'border-2 border-[var(--sys-color-border-feedback-success)] bg-surface hover:border-[var(--sys-color-border-feedback-success)]';
    }

    if (this.focused) {
      return 'border-2 border-[var(--sys-color-border-states-focus)] bg-surface';
    }

    return 'border-[var(--sys-color-border-states-enabled)] bg-surface hover:border-2 hover:border-[var(--sys-color-border-states-hover)]';
  }

  onFocus(): void {
    this.focused = true;
    this.cdr.markForCheck();
  }

  onBlur(): void {
    this.focused = false;
    this.touched = true;
    this.cdr.markForCheck();
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.charCount = value.length;
    this.valueChange.emit(value);
    this.cdr.markForCheck();
  }
}
