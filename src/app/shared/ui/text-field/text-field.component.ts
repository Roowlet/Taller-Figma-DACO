import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, forwardRef, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { IconComponent } from '../icon/icon.component';
import { SelectOption, SelectOptionsComponent } from '../select-options/select-options.component';
import { TooltipDirective } from '../tooltip/tooltip.directive';
import { FocoDirective } from '../foco/foco.directive';

export interface TextFieldOption {
  label: string;
  value: string;
}

/**
 * `number` usa el `<input type="number">` nativo y solo sirve para **enteros**:
 * el navegador devuelve cadena vacía en los estados intermedios de un decimal
 * ("10." → "") y con coma nunca entrega valor, así que el campo se vacía justo
 * al teclear el separador. Para importes y cantidades con decimales usar
 * `decimal`, que es un input de texto con `inputmode="decimal"`.
 */
export type TextFieldType = 'text' | 'number' | 'decimal' | 'email' | 'correo' | 'password' | 'select' | 'select-multiple';
export type TextFieldState = 'enabled' | 'error' | 'success';

/**
 * Input canónico del design system: texto, número, decimal, correo, contraseña y select simple/múltiple,
 * con etiqueta flotante, borde verde de éxito al escribir e integración con formularios reactivos.
 *
 * Usarlo para TODO campo de formulario y también para los buscadores de la app, ya migrados a él;
 * para mostrar un dato de solo lectura, el mismo componente con `[disabled]`.
 *
 * @usar
 * - Para los campos de una línea de las solicitudes y de Admin: nombre de clase de ajuste, número de documento o
 *   correo institucional del usuario.
 * - `type="select"` o `select-multiple` para listas cortas y cerradas: tipo de plan contable, tipo de libro y mes,
 *   ámbitos institucionales o estados en los paneles de búsqueda.
 * - `type="decimal"` para importes, como el importe de cada cuenta del asiento de ajuste; `number` solo para enteros.
 * - `select-multiple` con `selectAllLabel="Seleccionar todo"` en los paneles de parámetros de las consultas: casillas,
 *   la fila para marcar todas y el valor en una línea.
 * - Con `trailingIcon` y `trailingButtonLabel` para una acción dentro del campo: «Buscar» en la bandeja de documentos
 *   y en `siaf-records-search-toolbar`, «Mostrar contraseña» en el login.
 * @evitar
 * - Para fechas: usar `siaf-date-time-picker`, no `trailingIcon="calendar_today"` (como la vigencia del formulario de
 *   cuenta contable).
 * - Para textos largos (justificación, glosa, descripción): usar `text-area-control`.
 * - Para elegir de un catálogo largo que hay que buscar (los atributos del evento, por ejemplo): usar `empty-section`
 *   con `siaf-selection-side-nav`; para un Sí/No, `siaf-radio-group` con `[inline]`.
 * - `type="number"` para importes: el campo se vacía al teclear el separador; usar `decimal`.
 * @teclado
 * - **Tab**: enfoca el campo o el botón del select; el botón de `trailingIcon` es otra parada.
 * - **Texto, número, decimal, correo y contraseña**: el teclado nativo del `<input>`; en `decimal` se descarta lo que
 *   no sea dígito o separador (la coma se guarda como punto) y al salir se completan los decimales.
 * - **Enter / Espacio** (select): abren o cierran la lista; al abrir, el foco entra en la opción elegida (o en la
 *   primera), que siguen `siaf-select-options` (flechas, Inicio y Fin).
 * - **Escape** (select): cierra la lista y el foco vuelve al botón del campo; salir de la lista con Tab también la
 *   cierra. Con la lista abierta, Escape no cierra el panel que contiene al campo.
 * @accesibilidad
 * - **Pendiente · 1.3.1 Información y relaciones (A)**: en los tipos de texto el `<label>` envuelve el `<input>`, pero
 *   la etiqueta flotante solo existe con foco o valor, y la ayuda y el error, dentro del mismo `<label>`, se suman al
 *   nombre en vez de ir por `aria-describedby`. Con `hint` y el campo vacío, la ayuda desplaza al `placeholder` como
 *   nombre.
 * - **Pendiente · 3.3.1 Identificación de errores (A)**: el error se ve (borde rojo de 2 px, ícono y texto), pero el
 *   `<input>` no publica `aria-invalid` y el texto no se anuncia al aparecer; con `state="error"` y sin `error`, el
 *   aviso es solo el color del borde.
 * - **Pendiente · 3.3.2 Etiquetas o instrucciones (A)**: el `<input>` de texto publica `aria-required`, pero en `select`
 *   y `select-multiple` el obligatorio es solo el asterisco: el botón no lo publica.
 * - **4.1.2 Nombre, función y valor (A)**: el select es un `<button>` con `aria-haspopup="listbox"`, `aria-expanded` y
 *   `aria-label` con la etiqueta. El botón de `trailingIcon` se nombra con `trailingButtonLabel`: el padre debe darlo
 *   o queda sin nombre.
 * - **Pendiente · 4.1.2 Nombre, función y valor (A)**: el `aria-label` del select tapa el valor elegido, que no se
 *   anuncia; «Limpiar» y la X de cada chip son `span` con `role="button"` anidados dentro del botón, cuyos hijos son
 *   presentacionales.
 * - **Pendiente · 2.1.1 Teclado (A)**: «Limpiar» (`clearable`) y «Quitar» de cada chip tienen `tabindex="-1"`: solo
 *   funcionan con el mouse (en `select-multiple` se puede desmarcar desde la lista).
 * - **2.4.3 Orden del foco (A)**: con `siafFoco`, al abrir el select el foco entra en la opción elegida y al elegir en
 *   `select`, cerrar con Escape o salir con Tab vuelve al botón del campo.
 * - **2.4.7 Foco visible (AA)**: el foco pinta el borde de 2 px `border-states-focus` (5.35:1 claro / 10.15:1 oscuro),
 *   también en éxito (el select con valor) y al llegar con Tab al botón del select. Con error, el borde sigue rojo y el
 *   foco se ve en un contorno azul de 2 px por fuera.
 * - **Pendiente · 1.4.11 Contraste no textual (AA)**: el borde del campo vacío es `border-states-enabled` (2.44:1
 *   claro, 2.59:1 oscuro).
 * - **1.4.3 Contraste mínimo (AA)**: texto `text-neutral-medium` 14.53:1, valor del select `text-neutral-high` 16.29:1,
 *   etiqueta y `placeholder` `text-neutral-low` 5.01:1 y error `text-feedback-danger` 9.84:1.
 */
@Component({
  selector: 'siaf-input',
  standalone: true,
  imports: [FocoDirective, IconComponent, SelectOptionsComponent, TooltipDirective],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextFieldComponent),
      multi: true
    }
  ],
  styles: `
    /* El campo nunca debe crecer con el contenido: mantiene el ancho de su
       contenedor y el valor largo se trunca con "…" (span.truncate). */
    :host {
      display: block;
      min-width: 0;
    }
  `,
  template: `
    <label class="grid w-full min-w-0 gap-1.5">
      <span class="relative block w-full min-w-0">
        @if (floatingLabel) {
          <span class="absolute -top-2.5 left-3 z-[1] rounded-siaf-sm bg-surface px-siaf-xxs text-xs font-medium leading-normal" [class]="labelClass">
            {{ labelText }}@if (required) { <span class="text-[var(--sys-color-text-feedback-danger)]">*</span> }
          </span>
        }

        @if (type === 'select') {
          <button
            class="flex h-10 w-full items-center rounded-siaf-md border bg-surface px-siaf-md text-left text-sm text-text outline-none transition disabled:cursor-not-allowed disabled:border-[var(--sys-color-border-states-disabled)] disabled:bg-[var(--sys-color-bg-surfaces-disabled)] disabled:text-[var(--sys-color-text-neutral-disabled)]"
            [class]="controlClass"
            type="button"
            [disabled]="disabled"
            [attr.aria-expanded]="selectOpen"
            [attr.aria-label]="labelText"
            aria-haspopup="listbox"
            (click)="toggleSelect()"
            (keydown.escape)="cerrarSelectConEscape($event)"
          >
            <span class="min-w-0 flex-1 truncate" siafTooltip [class.text-[var(--sys-color-text-neutral-low)]]="!hasValue">
              {{ selectDisplayText }}@if (!hasValue && required) { <span class="text-[var(--sys-color-text-feedback-danger)]">*</span> }
            </span>
            @if (clearable && hasValue && !required) {
              <span
                class="inline-flex size-6 shrink-0 items-center justify-center rounded-siaf-sm text-[var(--sys-color-text-neutral-medium)] transition hover:bg-[var(--sys-color-bg-states-light-enabled)]"
                role="button"
                tabindex="-1"
                [attr.aria-label]="'Limpiar ' + labelText"
                (click)="clearSelectValue($event)"
              >
                <siaf-icon name="close" [size]="18" />
              </span>
            }
            <siaf-icon class="shrink-0 text-text transition" [class.rotate-180]="selectOpen" name="expand_more" [size]="24" />
          </button>

          @if (selectOpen) {
            <button class="fixed inset-0 z-30 cursor-default bg-transparent" type="button" data-capa-cierre tabindex="-1" aria-hidden="true" (mousedown)="$event.preventDefault()" (click)="closeSelect()"></button>
            <div class="relative z-40 mt-siaf-xs sm:absolute sm:left-0 sm:right-0 sm:top-[calc(100%+4px)] sm:mt-0" siafFoco [siafFocoAtrapar]="false" (siafFocoEscape)="closeSelect()" (siafFocoSalida)="closeSelect()">
              <siaf-select-options
                [options]="selectOptions"
                [selectedValue]="selectValue"
                [selectedValues]="selectValues"
                (selected)="onOptionSelected($event)"
              />
            </div>
          }
        } @else if (type === 'select-multiple') {
          <button
            class="flex min-h-10 w-full flex-wrap items-center gap-siaf-xs rounded-siaf-md px-siaf-md py-siaf-xs text-left text-sm outline-none transition"
            [class]="controlClass"
            type="button"
            [disabled]="disabled"
            [attr.aria-expanded]="selectOpen"
            [attr.aria-label]="labelText"
            aria-haspopup="listbox"
            (click)="toggleSelect()"
            (keydown.escape)="cerrarSelectConEscape($event)"
          >
            @if (!hasValue) {
              <span class="flex-1 text-[var(--sys-color-text-neutral-low)]">{{ labelText }}@if (required) { <span class="text-[var(--sys-color-text-feedback-danger)]">*</span> }</span>
            } @else if (selectAllLabel) {
              <!-- Con casillas (Figma «Parámetros de consulta») el valor va en una línea, como el select simple. -->
              <span class="min-w-0 flex-1 truncate leading-6 text-text" siafTooltip data-resumen-multiple>{{ selectDisplayText }}</span>
            }
            @for (val of selectAllLabel ? [] : selectValues; track val) {
              <span class="inline-flex items-center gap-siaf-xxs rounded-siaf-md border border-[var(--sys-color-border-states-enabled)] px-siaf-xs py-0 text-text">
                <span class="text-sm leading-6">{{ labelForValue(val) }}</span>
                @if (!disabled) {
                  <span
                    class="inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-full transition hover:bg-[var(--sys-color-bg-states-light-hover)]"
                    role="button"
                    tabindex="-1"
                    [attr.aria-label]="'Quitar ' + labelForValue(val)"
                    (click)="removeValue($event, val)"
                  >
                    <siaf-icon name="close" [size]="16" />
                  </span>
                }
              </span>
            }
            @if (clearable && hasValue && !required) {
              <span
                class="inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-siaf-sm text-[var(--sys-color-text-neutral-medium)] transition hover:bg-[var(--sys-color-bg-states-light-enabled)]"
                role="button"
                tabindex="-1"
                [attr.aria-label]="'Limpiar ' + labelText"
                (click)="clearSelectValue($event)"
              >
                <siaf-icon name="close" [size]="18" />
              </span>
            }
            <siaf-icon class="ml-auto shrink-0 text-text transition" [class.rotate-180]="selectOpen" name="expand_more" [size]="24" />
          </button>

          @if (selectOpen) {
            <button class="fixed inset-0 z-30 cursor-default bg-transparent" type="button" data-capa-cierre tabindex="-1" aria-hidden="true" (mousedown)="$event.preventDefault()" (click)="closeSelect()"></button>
            <div class="relative z-40 mt-siaf-xs sm:absolute sm:left-0 sm:right-0 sm:top-[calc(100%+4px)] sm:mt-0" siafFoco [siafFocoAtrapar]="false" (siafFocoEscape)="closeSelect()" (siafFocoSalida)="closeSelect()">
              <siaf-select-options
                [options]="selectOptions"
                [selectedValues]="selectValues"
                [multiple]="true"
                [checkboxes]="!!selectAllLabel"
                [selectAllLabel]="selectAllLabel"
                (selected)="onOptionSelected($event)"
                (allSelected)="onAllSelected($event)"
              />
            </div>
          }
        } @else {
          <span
            class="flex h-10 w-full items-center gap-siaf-xs rounded-siaf-md px-siaf-md text-sm text-text outline-none transition"
            [class]="controlClass"
          >
            @if (leadingIcon) {
              <siaf-icon class="shrink-0 text-[var(--sys-color-text-neutral-medium)]" [name]="leadingIcon" [size]="24" />
            }

            @if (!floatingLabel && required) {
              <span class="pointer-events-none shrink-0 text-[var(--sys-color-text-neutral-low)]">
                {{ labelText }}<span class="text-[var(--sys-color-text-feedback-danger)]">*</span>
              </span>
            }

            <input
              class="min-w-0 flex-1 bg-transparent text-sm leading-6 tracking-[0.0249px] text-[var(--sys-color-text-neutral-medium)] outline-none placeholder:text-[var(--sys-color-text-neutral-low)] disabled:cursor-not-allowed disabled:text-[var(--sys-color-text-neutral-disabled)]"
              [type]="inputType"
              [attr.inputmode]="inputMode"
              [placeholder]="floatingLabel || required ? '' : labelText"
              [attr.aria-required]="required"
              [disabled]="disabled"
              [value]="internalValue"
              [attr.autocomplete]="autocomplete || null"
              (focus)="focused = true"
              (blur)="onBlur()"
              (input)="onInput($event)"
            />

            @if (error && !trailingIcon) {
              <siaf-icon class="shrink-0 text-[var(--sys-color-text-feedback-danger)]" name="error" [size]="20" aria-hidden="true" />
            }

            @if (trailingIcon) {
              <button
                class="inline-flex size-6 shrink-0 items-center justify-center rounded-siaf-sm text-[var(--sys-color-text-neutral-medium)] transition hover:bg-[var(--sys-color-bg-states-light-hover)] active:bg-[var(--sys-color-bg-states-light-pressed)] focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sys-color-border-states-focus)] disabled:cursor-not-allowed disabled:text-[var(--sys-color-text-neutral-disabled)]"
                type="button"
                [disabled]="disabled"
                [attr.aria-label]="trailingButtonLabel || null"
                (click)="onTrailingAction($event)"
              >
                <siaf-icon [name]="trailingIcon" [size]="24" />
              </button>
            }
          </span>
        }
      </span>

      @if (hint && !error) {
        <span class="text-xs" [class]="supportingClass">{{ hint }}</span>
      }

      @if (error) {
        <span class="text-xs text-[var(--sys-color-text-feedback-danger)]">{{ error }}</span>
      }
    </label>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextFieldComponent implements OnChanges, ControlValueAccessor {
  private readonly cdr = inject(ChangeDetectorRef);

  @Input() label = '';
  @Input() placeholder = '';
  @Input() hint = '';
  @Input() error = '';
  @Input() state: TextFieldState = 'enabled';
  @Input() value: string | number | string[] = '';
  @Input() type: TextFieldType = 'text';
  @Input() options: TextFieldOption[] = [];
  @Input() disabled = false;
  @Input() leadingIcon = '';
  @Input() trailingIcon = '';
  @Input() trailingButtonLabel = '';
  @Input() autocomplete = '';
  @Input() clearable = false;
  @Input() required = false;
  /** Mantiene el borde neutro después de escribir cuando el contexto no representa una validación. */
  @Input() autoSuccess = true;
  /** Decimales admitidos cuando `type="decimal"` (importes contables: 2). */
  @Input() decimals = 2;
  /**
   * En `select-multiple`, la lista del Figma «Parámetros de consulta»: una casilla por opción, arriba esta fila para
   * marcar o desmarcar todas, y el valor en una sola línea en vez de chips.
   */
  @Input() selectAllLabel = '';

  @Output() valueChange = new EventEmitter<string | number | string[]>();
  @Output() trailingAction = new EventEmitter<void>();

  focused = false;
  selectOpen = false;
  internalValue: string | number | string[] = '';

  private onChange: (value: string | number | string[]) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['value']) {
      return;
    }

    // En `decimal` el texto que el usuario tiene escrito manda sobre el eco del
    // padre. Sin esto el ciclo "emito 10.5 → el padre guarda 10.5 → me lo
    // devuelve" reescribe el campo a mitad de tipeo y borra el separador.
    if (this.type === 'decimal' && this.ecoEquivalente()) {
      return;
    }

    this.internalValue = Array.isArray(this.value) ? this.value : this.inputValue;
  }

  /** ¿El valor que llega del padre es el mismo que el usuario ya tiene escrito? */
  private ecoEquivalente(): boolean {
    if (this.focused) {
      return true;
    }

    const escrito = parseFloat(String(this.internalValue ?? ''));
    const entrante = parseFloat(String(this.value ?? ''));

    // "10.00" (escrito) vs 10 (guardado) son la misma cantidad: no repintar.
    return !Number.isNaN(escrito) && escrito === entrante;
  }

  get labelText(): string {
    return this.label || this.placeholder;
  }

  get placeholderText(): string {
    return `${this.labelText}${this.required ? ' *' : ''}`;
  }

  get floatingLabel(): boolean {
    return this.focused || this.hasValue;
  }

  get effectiveState(): TextFieldState {
    if (this.error) {
      return 'error';
    }

    if (this.state === 'success' || (this.autoSuccess && this.hasValue && !this.focused)) {
      return 'success';
    }

    return this.state;
  }

  get controlClass(): string {
    if (this.disabled) {
      return 'cursor-not-allowed border border-[var(--sys-color-border-states-disabled)] bg-[var(--sys-color-bg-surfaces-disabled)] text-[var(--sys-color-text-neutral-disabled)]';
    }

    // Con error, el borde sigue rojo al enfocar y el foco se ve en un contorno azul por fuera (WCAG 2.4.7).
    if (this.effectiveState === 'error') {
      return 'border-2 border-[var(--sys-color-border-feedback-danger)] bg-surface hover:border-[var(--sys-color-border-feedback-danger)] focus:border-[var(--sys-color-border-feedback-danger)] focus-within:border-[var(--sys-color-border-feedback-danger)] focus:ring-0 focus:outline-solid focus:outline-2 focus:outline-offset-2 focus:outline-[var(--sys-color-border-states-focus)] focus-within:outline-solid focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--sys-color-border-states-focus)]';
    }

    // El éxito solo marca que hay valor: con el foco manda el borde azul, como en un campo sin estado.
    if (this.effectiveState === 'success') {
      return 'border-2 border-[var(--sys-color-border-feedback-success)] bg-surface hover:border-[var(--sys-color-border-feedback-success)] focus:border-[var(--sys-color-border-states-focus)] focus-within:border-[var(--sys-color-border-states-focus)] focus:ring-0';
    }

    return 'border border-[var(--sys-color-border-states-enabled)] bg-surface hover:border-2 hover:border-[var(--sys-color-border-states-hover)] focus:border-2 focus:border-[var(--sys-color-border-states-focus)] focus-within:border-2 focus-within:border-[var(--sys-color-border-states-focus)] focus:ring-0';
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

    return this.focused ? 'text-[var(--sys-color-text-neutral-activated)]' : 'text-[var(--sys-color-text-neutral-low)]';
  }

  get supportingClass(): string {
    if (this.effectiveState === 'success') {
      return 'text-[var(--sys-color-text-feedback-success)]';
    }

    return 'text-text-muted';
  }

  get hasValue(): boolean {
    return Array.isArray(this.internalValue) ? this.internalValue.length > 0 : String(this.internalValue || '').length > 0;
  }

  get isSelect(): boolean {
    return this.type === 'select';
  }

  labelForValue(value: string): string {
    return this.options.find((o) => o.value === value)?.label ?? value;
  }

  removeValue(event: MouseEvent, value: string): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.disabled) return;
    const next = this.selectValues.filter((v) => v !== value);
    this.internalValue = next;
    this.emitValue(next);
  }

  clearSelectValue(event: MouseEvent): void {
    if (this.required) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.internalValue = this.type === 'select-multiple' ? [] : '';
    this.emitValue(this.internalValue);
    this.closeSelect();
  }

  get inputType(): 'text' | 'number' | 'email' | 'password' {
    if (this.type === 'correo') {
      return 'email';
    }

    // `decimal` es un input de texto: el type=number nativo no deja escribir
    // los estados intermedios de un decimal (ver TextFieldType).
    if (this.type === 'select' || this.type === 'select-multiple' || this.type === 'decimal') {
      return 'text';
    }

    return this.type;
  }

  /** Teclado numérico en móvil para el tipo decimal. */
  get inputMode(): string | null {
    return this.type === 'decimal' ? 'decimal' : null;
  }

  get inputValue(): string | number {
    return Array.isArray(this.value) ? this.value.join(', ') : this.value;
  }

  get selectValue(): string {
    if (Array.isArray(this.internalValue)) {
      return '';
    }

    return String(this.internalValue || '');
  }

  get selectValues(): string[] {
    return Array.isArray(this.internalValue) ? this.internalValue : [];
  }

  get selectOptions(): SelectOption[] {
    return this.options;
  }

  get selectDisplayText(): string {
    if (!this.hasValue) {
      return this.labelText;
    }

    if (Array.isArray(this.internalValue)) {
      const selectedValues = this.internalValue;
      const selectedLabels = this.options
        .filter((option) => selectedValues.includes(option.value))
        .map((option) => option.label);

      return selectedLabels.join(', ');
    }

    return this.options.find((option) => option.value === this.selectValue)?.label || this.selectValue;
  }

  isSelected(value: string): boolean {
    return Array.isArray(this.internalValue) ? this.internalValue.includes(value) : this.internalValue === value;
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    if (this.type === 'decimal') {
      const limpio = this.sanitizarDecimal(value);

      // Rechazar la tecla inválida sin mandar el cursor al final: si el usuario
      // corrige en medio del número, escribir siempre al final sería inusable.
      if (limpio !== value) {
        const cursor = input.selectionStart ?? limpio.length;
        const destino = Math.max(0, cursor - (value.length - limpio.length));
        input.value = limpio;
        input.setSelectionRange(destino, destino);
        value = limpio;
      }
    }

    this.internalValue = value;
    this.emitValue(value);
  }

  /**
   * Deja solo dígitos y un separador decimal, con el máximo de decimales
   * configurado. La coma se acepta como separador (es la tecla del teclado
   * numérico) y se guarda como punto.
   */
  private sanitizarDecimal(texto: string): string {
    let limpio = texto.replace(',', '.').replace(/[^\d.]/g, '');

    const partes = limpio.split('.');
    if (partes.length > 2) {
      limpio = `${partes[0]}.${partes.slice(1).join('')}`;
    }

    const [entero, decimales] = limpio.split('.');
    if (decimales === undefined) {
      return limpio;
    }

    return `${entero}.${decimales.slice(0, this.decimals)}`;
  }

  /** Al salir del campo, deja el importe con sus decimales completos (10 → 10.00). */
  private normalizarDecimal(): void {
    const texto = String(this.internalValue ?? '').trim();
    const numero = parseFloat(texto);

    // Vacío o basura ("." suelto) se limpia: equivale a "sin importe".
    if (!texto || Number.isNaN(numero)) {
      if (texto) {
        this.internalValue = '';
        this.emitValue('');
      }
      return;
    }

    const formateado = numero.toFixed(this.decimals);
    if (formateado !== texto) {
      this.internalValue = formateado;
      this.emitValue(formateado);
    }
  }

  onTrailingAction(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.trailingAction.emit();
  }

  toggleSelect(): void {
    if (this.disabled) {
      return;
    }

    this.selectOpen = !this.selectOpen;
    this.focused = this.selectOpen;
    this.cdr.markForCheck();
  }

  /** Escape cierra la lista abierta y lo marca como atendido; con la lista cerrada deja pasar la tecla (el panel que la contiene se cierra). */
  cerrarSelectConEscape(evento: Event): void {
    if (!this.selectOpen) return;
    evento.preventDefault();
    this.closeSelect();
  }

  closeSelect(): void {
    this.selectOpen = false;
    this.focused = false;
    this.onTouched();
    this.cdr.markForCheck();
  }

  onOptionSelected(value: string): void {
    if (this.type === 'select-multiple') {
      const currentValues = new Set(this.selectValues);
      if (currentValues.has(value)) {
        currentValues.delete(value);
      } else {
        currentValues.add(value);
      }

      const nextValue = Array.from(currentValues);
      this.internalValue = nextValue;
      this.emitValue(nextValue);
      return;
    }

    this.internalValue = value;
    this.emitValue(value);
    this.closeSelect();
  }

  /** «Seleccionar todo»: marca todas las opciones habilitadas (conserva las deshabilitadas ya elegidas) o las quita. */
  onAllSelected(todas: boolean): void {
    const deshabilitadas = this.selectValues.filter((v) => this.options.some((o) => o.value === v && (o as SelectOption).disabled));
    const next = todas ? [...deshabilitadas, ...this.options.filter((o) => !(o as SelectOption).disabled).map((o) => o.value)] : deshabilitadas;
    this.internalValue = next;
    this.emitValue(next);
  }

  writeValue(value: string | number | string[] | null): void {
    this.internalValue = value ?? '';
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: string | number | string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }

  onBlur(): void {
    this.focused = false;

    if (this.type === 'decimal') {
      this.normalizarDecimal();
    }

    this.onTouched();
  }

  private emitValue(value: string | number | string[]): void {
    this.valueChange.emit(value);
    this.onChange(value);
  }
}
