import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

import { ButtonComponent } from '../button/button.component';
import { IconComponent } from '../icon/icon.component';
import { TooltipDirective } from '../tooltip/tooltip.directive';
import { FocoDirective } from '../foco/foco.directive';

export type DatePickerVariant = 'date' | 'datetime';
export type DatePickerState = 'enabled' | 'error' | 'success';

type CalendarDay = {
  label: string;
  value: string;
  disabled?: boolean;
};

/**
 * Selector de fecha (y opcionalmente hora) con calendario propio, label flotante,
 * estados de error/éxito y `[minDate]` para deshabilitar días anteriores.
 *
 * Es el control canónico de fecha del design system: úsalo en vez de un `input type="date"`
 * nativo para que el campo respete tokens, textos en español y el formato dd/mm/aaaa.
 *
 * En la cabecera del calendario, el mes y el año son botones: el mes abre los 12 meses y el año una
 * grilla de 12 años (las flechas dobles pasan de página). Al elegir, vuelve a los días de ese mes o año.
 * Con `minDate`, los meses y años que terminan antes quedan deshabilitados.
 *
 * @usar
 * - Para las fechas de vigencia de una solicitud («Fecha inicio desde» y «Fecha fin hasta» en clase de ajuste, tipo de
 *   asiento, evento y evento contable), con `[minDate]` para que el fin no quede antes del inicio.
 * - Para los rangos «Fecha desde» / «Fecha hasta» de los paneles de búsqueda de las consultas y de libros contables.
 * - Para una fecha puntual de un formulario: la fecha del asiento de ajuste o las fechas de contrato del usuario en Admin.
 * @evitar
 * - Un `input type="date"` nativo o un `siaf-input` con `trailingIcon="calendar_today"` (como la vigencia del
 *   formulario de cuenta contable): usar este componente.
 * - Dejar `defaultToToday` en `true` en filtros o fechas opcionales: pinta la fecha de hoy sin emitirla, así que el
 *   padre sigue vacío. Pasar `[defaultToToday]="false"`.
 * - `variant="datetime"` para capturar una hora: los campos de hora no están conectados; emite solo la fecha y la
 *   muestra con 00:00:00.
 * - Para mostrar una fecha que no se edita: en modo lectura va `readonly-field`, no el selector `[disabled]`.
 * @teclado
 * - **Tab**: enfoca el campo. Al abrir el calendario el foco entra en el día elegido (o en hoy); desde ahí recorre
 *   las flechas de la cabecera, el mes, el año y cada día habilitado, y salir con Tab cierra el calendario.
 * - **Enter / Espacio**: en el campo abren o cierran el calendario; dentro, activan la flecha o eligen el día, mes o
 *   año enfocado (botones nativos). Cancelar y Aceptar de `datetime` siguen `siaf-button`.
 * - **Escape**: cierra el calendario y el foco vuelve al campo.
 * - **Flechas**: no están implementadas entre los días; el calendario también se cierra al elegir un día (variante
 *   `date`) o con Cancelar o Aceptar.
 * @accesibilidad
 * - **Pendiente · 1.3.1 Información y relaciones (A)**: la etiqueta no se une al botón del campo con `aria-labelledby`
 *   ni `aria-label`: un único `<label>` envuelve etiqueta flotante, botón, ayuda, error y calendario, y con fecha
 *   elegida el botón muestra solo la fecha. En `datetime`, los tres campos de hora no tienen etiqueta.
 * - **Pendiente · 3.3.1 Identificación de errores (A)**: el texto de `error` se ve bajo el campo, pero no se asocia con
 *   `aria-describedby` ni se anuncia al aparecer; con `state="error"` y sin `error`, el aviso es solo el borde rojo.
 * - **Pendiente · 3.3.2 Etiquetas o instrucciones (A)**: el obligatorio es solo el asterisco rojo: `aria-required` va
 *   en un `<button>`, rol que no admite ese atributo en ARIA 1.2.
 * - **4.1.2 Nombre, función y valor (A)**: el campo publica `aria-haspopup="dialog"` y `aria-expanded`; el calendario
 *   es `role="dialog"` con `aria-label`, y las grillas de meses y años, `role="listbox"` con `aria-selected`.
 * - **Pendiente · 4.1.2 Nombre, función y valor (A)**: cada día se lee solo como número («05») y el día elegido no
 *   publica estado (`aria-selected` o `aria-pressed`); las grillas `listbox` no responden a flechas.
 * - **2.4.3 Orden del foco (A)**: con `siafFoco`, al abrir el foco entra en el día elegido (o en hoy) y al cerrarse
 *   (un día, Cancelar, Aceptar, Escape o salir con Tab) vuelve al campo.
 * - **2.4.7 Foco visible (AA)**: el botón del campo pasa al borde azul de 2 px (`border-states-focus`, 5.35:1 claro /
 *   10.15:1 oscuro) al recibir el foco, también con valor (éxito); con error, el borde sigue rojo y el foco se ve en un
 *   contorno azul por fuera. Los botones del calendario conservan el anillo nativo.
 * - **Pendiente · 1.4.11 Contraste no textual (AA)**: el borde del campo vacío es `border-states-enabled` (2.44:1
 *   claro, 2.59:1 oscuro).
 * - **1.4.3 Contraste mínimo (AA)**: valor `text-neutral-high` 16.29:1, etiqueta `text-neutral-low` 5.01:1, días
 *   `text-neutral-medium` 14.53:1 y día elegido en blanco sobre `bg-brand-primary` 8.79:1 (6.67:1 oscuro). Con valor,
 *   la ayuda pasa a `text-feedback-success`, par que la tabla no mide.
 * - **Pendiente · 2.5.8 Tamaño del objetivo (AA)**: las flechas de la cabecera miden 20 px (`size-5`) con 4 px entre
 *   ellas; los días miden 36 px y el campo, 40 px.
 */
@Component({
  selector: 'siaf-date-time-picker',
  standalone: true,
  imports: [FocoDirective, ButtonComponent, IconComponent, TooltipDirective],
  template: `
    <label class="grid gap-1.5">
      <span class="relative block w-full" [class.max-w-[300px]]="!fullWidth">
        @if (floatingLabel) {
          <span class="absolute -top-2.5 left-3 z-[1] rounded-siaf-sm bg-surface px-siaf-xxs text-xs font-medium leading-normal" [class]="labelClass">
            {{ labelText }}@if (required) { <span class="text-[var(--sys-color-text-feedback-danger)]">*</span> }
          </span>
        }

        <button
          class="flex h-10 w-full items-center rounded-siaf-md border bg-surface px-siaf-md text-left text-sm text-text outline-none transition disabled:cursor-not-allowed disabled:border-[var(--sys-color-border-states-disabled)] disabled:bg-[var(--sys-color-bg-surfaces-disabled)] disabled:text-[var(--sys-color-text-neutral-disabled)]"
          type="button"
          [class]="controlClass"
          [disabled]="disabled"
          [attr.aria-expanded]="pickerOpen"
          [attr.aria-required]="required"
          aria-haspopup="dialog"
          (click)="togglePicker()"
        >
          <span class="min-w-0 flex-1 truncate" siafTooltip [class.text-[var(--sys-color-text-neutral-low)]]="!hasValue">
            {{ displayValue || labelText }}@if (!hasValue && required) { <span class="text-[var(--sys-color-text-feedback-danger)]">*</span> }
          </span>
          <siaf-icon class="shrink-0 text-text-muted" name="calendar_today" [size]="20" />
        </button>

        @if (pickerOpen) {
          <button class="fixed inset-0 z-30 cursor-default bg-transparent" type="button" data-capa-cierre tabindex="-1" aria-hidden="true" (mousedown)="$event.preventDefault()" (click)="closePicker()"></button>
          <section
            class="absolute left-0 top-[calc(100%+4px)] z-40 w-[268px] rounded-siaf-md bg-surface p-siaf-xs shadow-siaf-elevation-2"
            role="dialog"
            aria-label="Seleccionar fecha"
            siafFoco
            [siafFocoAtrapar]="false"
            (siafFocoEscape)="closePicker()"
            (siafFocoSalida)="closePicker()"
            (click)="$event.stopPropagation()"
          >
            <header class="flex w-full items-center justify-between py-siaf-xs">
              <div class="flex w-11 items-center gap-siaf-xxs">
                <button class="inline-flex size-5 items-center justify-center rounded-siaf-sm hover:bg-surface-muted" type="button" [attr.aria-label]="vista === 'anios' ? 'Años anteriores' : 'Año anterior'" (click)="moveYear(vista === 'anios' ? -12 : -1, $event)">
                  <siaf-icon name="keyboard_double_arrow_left" [size]="20" />
                </button>
                @if (vista === 'dias') {
                  <button class="inline-flex size-5 items-center justify-center rounded-siaf-sm hover:bg-surface-muted" type="button" aria-label="Mes anterior" (click)="moveMonth(-1, $event)">
                    <siaf-icon name="keyboard_arrow_left" [size]="20" />
                  </button>
                }
              </div>

              <!-- Mes y año son botones: abren la grilla de meses o de años. -->
              <div class="flex items-center gap-siaf-xxs text-sm font-bold tracking-[-0.02px] text-[var(--sys-color-text-neutral-medium)]">
                @if (vista === 'anios') {
                  <button
                    class="rounded-siaf-sm bg-surface-muted px-siaf-xs py-siaf-xxs transition hover:bg-surface-muted"
                    type="button"
                    data-cabecera="anio"
                    [attr.aria-expanded]="true"
                    aria-label="Volver a los días"
                    (click)="alternarVista('anios', $event)"
                  >{{ rangoAnios[0] }} – {{ rangoAnios[rangoAnios.length - 1] }}</button>
                } @else {
                  <button
                    class="rounded-siaf-sm px-siaf-xs py-siaf-xxs transition hover:bg-surface-muted"
                    type="button"
                    data-cabecera="mes"
                    [class.bg-surface-muted]="vista === 'meses'"
                    [attr.aria-expanded]="vista === 'meses'"
                    [attr.aria-label]="'Elegir mes, ' + monthName"
                    (click)="alternarVista('meses', $event)"
                  >{{ monthName }}</button>
                  <button
                    class="rounded-siaf-sm px-siaf-xs py-siaf-xxs transition hover:bg-surface-muted"
                    type="button"
                    data-cabecera="anio"
                    [attr.aria-expanded]="false"
                    [attr.aria-label]="'Elegir año, ' + viewYear"
                    (click)="alternarVista('anios', $event)"
                  >{{ viewYear }}</button>
                }
              </div>

              <div class="flex w-11 items-center justify-end gap-siaf-xxs">
                @if (vista === 'dias') {
                  <button class="inline-flex size-5 items-center justify-center rounded-siaf-sm hover:bg-surface-muted" type="button" aria-label="Mes siguiente" (click)="moveMonth(1, $event)">
                    <siaf-icon name="keyboard_arrow_right" [size]="20" />
                  </button>
                }
                <button class="inline-flex size-5 items-center justify-center rounded-siaf-sm hover:bg-surface-muted" type="button" [attr.aria-label]="vista === 'anios' ? 'Años siguientes' : 'Año siguiente'" (click)="moveYear(vista === 'anios' ? 12 : 1, $event)">
                  <siaf-icon name="keyboard_double_arrow_right" [size]="20" />
                </button>
              </div>
            </header>

            @if (vista === 'meses') {
              <div class="grid grid-cols-3 gap-siaf-xxs py-siaf-xs" role="listbox" aria-label="Meses">
                @for (mes of monthNames; track mes; let indice = $index) {
                  <button
                    class="flex h-10 items-center justify-center rounded-siaf-md border border-transparent text-sm tracking-[0.0249px] transition hover:border-[var(--sys-color-border-states-hover)] disabled:cursor-not-allowed disabled:text-[var(--sys-color-text-neutral-disabled)] disabled:hover:border-transparent"
                    type="button"
                    role="option"
                    [attr.aria-selected]="indice === viewMonth"
                    [disabled]="mesDeshabilitado(indice)"
                    [class.bg-brand-primary]="indice === viewMonth"
                    [class.text-[var(--sys-color-text-brand-white)]]="indice === viewMonth"
                    [class.text-[var(--sys-color-text-neutral-medium)]]="indice !== viewMonth && !mesDeshabilitado(indice)"
                    [class.border-[var(--sys-color-border-states-hover)]]="esMesActual(indice)"
                    (click)="elegirMes(indice, $event)"
                  >{{ mes }}</button>
                }
              </div>
            } @else if (vista === 'anios') {
              <div class="grid grid-cols-3 gap-siaf-xxs py-siaf-xs" role="listbox" aria-label="Años">
                @for (anio of rangoAnios; track anio) {
                  <button
                    class="flex h-10 items-center justify-center rounded-siaf-md border border-transparent text-sm tracking-[0.0249px] transition hover:border-[var(--sys-color-border-states-hover)] disabled:cursor-not-allowed disabled:text-[var(--sys-color-text-neutral-disabled)] disabled:hover:border-transparent"
                    type="button"
                    role="option"
                    [attr.aria-selected]="anio === viewYear"
                    [disabled]="anioDeshabilitado(anio)"
                    [class.bg-brand-primary]="anio === viewYear"
                    [class.text-[var(--sys-color-text-brand-white)]]="anio === viewYear"
                    [class.text-[var(--sys-color-text-neutral-medium)]]="anio !== viewYear && !anioDeshabilitado(anio)"
                    [class.border-[var(--sys-color-border-states-hover)]]="anio === anioActual"
                    (click)="elegirAnio(anio, $event)"
                  >{{ anio }}</button>
                }
              </div>
            } @else {
            <div class="grid grid-cols-7">
              @for (weekday of weekdays; track weekday) {
                <span class="flex h-7 items-center justify-center text-sm font-bold tracking-[-0.02px] text-[var(--sys-color-text-neutral-medium)]">{{ weekday }}</span>
              }
            </div>

            <div class="grid grid-cols-7">
              @for (day of days; track day.value) {
                <button
                  class="flex size-9 items-center justify-center rounded-full px-siaf-xs py-siaf-xxs text-sm tracking-[0.0249px] transition hover:border hover:border-[var(--sys-color-border-states-hover)] disabled:cursor-not-allowed disabled:text-[var(--sys-color-text-neutral-disabled)]"
                  type="button"
                  [disabled]="day.disabled"
                  [attr.data-foco-inicial]="day.value === diaInicial ? '' : null"
                  [class.bg-brand-primary]="day.value === selectedDate"
                  [class.text-[var(--sys-color-text-brand-white)]]="day.value === selectedDate"
                  [class.text-[var(--sys-color-text-neutral-medium)]]="day.value !== selectedDate && !day.disabled"
                  [class.border]="day.value === todayDate"
                  [class.border-[var(--sys-color-border-states-hover)]]="day.value === todayDate"
                  (click)="selectDate(day.value, $event)"
                >
                  {{ day.label }}
                </button>
              }
            </div>
            }

            @if (variant === 'datetime') {
              <div class="mt-siaf-xs border-t border-[var(--sys-color-divider-default)] pt-siaf-xs">
                <div class="flex items-center gap-siaf-xs py-siaf-xs">
                  <span class="text-xs font-medium text-text">Hora</span>
                  <input class="h-8 w-[50px] rounded-siaf-md border border-[var(--sys-color-border-states-enabled)] bg-surface px-siaf-md text-center text-sm outline-none focus:border-2 focus:border-[var(--sys-color-border-states-focus)]" maxlength="2" value="00" />
                  <span class="text-xs font-medium text-text">:</span>
                  <input class="h-8 w-[50px] rounded-siaf-md border border-[var(--sys-color-border-states-enabled)] bg-surface px-siaf-md text-center text-sm outline-none focus:border-2 focus:border-[var(--sys-color-border-states-focus)]" maxlength="2" value="00" />
                  <span class="text-xs font-medium text-text">:</span>
                  <input class="h-8 w-[50px] rounded-siaf-md border border-[var(--sys-color-border-states-enabled)] bg-surface px-siaf-md text-center text-sm outline-none focus:border-2 focus:border-[var(--sys-color-border-states-focus)]" maxlength="2" value="00" />
                </div>

                <div class="flex justify-end gap-siaf-xs py-siaf-xs">
                  <siaf-button variant="secondary" size="sm" (click)="closePicker($event)">Cancelar</siaf-button>
                  <siaf-button variant="accent" size="sm" (click)="acceptDate($event)">Aceptar</siaf-button>
                </div>
              </div>
            }
          </section>
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
export class DateTimePickerComponent implements OnChanges, OnInit {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() hint = '';
  @Input() error = '';
  @Input() state: DatePickerState = 'enabled';
  @Input() value = '';
  @Input() disabled = false;
  @Input() variant: DatePickerVariant = 'date';
  @Input() defaultToToday = true;
  @Input() required = false;
  @Input() fullWidth = false;
  /** Fecha mínima seleccionable en formato ISO (YYYY-MM-DD). Los días anteriores quedan deshabilitados. */
  @Input() minDate = '';

  @Output() valueChange = new EventEmitter<string>();

  pickerOpen = false;
  /** Qué muestra el calendario: los días del mes, la grilla de meses o la de años. */
  vista: 'dias' | 'meses' | 'anios' = 'dias';
  selectedDate = '';
  viewYear = this.currentDate.getFullYear();
  viewMonth = this.currentDate.getMonth();

  readonly weekdays = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];
  readonly monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  ngOnInit(): void {
    this.setSelectedDate(this.value || (this.defaultToToday ? this.todayValue : ''));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value']) {
      this.setSelectedDate(this.value || (this.defaultToToday ? this.todayValue : ''));
    }
  }

  get labelText(): string {
    return this.label || this.placeholder;
  }

  get hasValue(): boolean {
    return Boolean(this.selectedDate);
  }

  get floatingLabel(): boolean {
    return this.pickerOpen || this.hasValue;
  }

  get displayValue(): string {
    if (!this.selectedDate) {
      return '';
    }

    const [year, month, day] = this.selectedDate.split('-');
    return this.variant === 'datetime' ? `${day}/${month}/${year} 00:00:00` : `${day}/${month}/${year}`;
  }

  get monthName(): string {
    return this.monthNames[this.viewMonth];
  }

  get todayDate(): string {
    return this.todayValue;
  }

  get days(): CalendarDay[] {
    const firstDay = new Date(this.viewYear, this.viewMonth, 1);
    const startOffset = firstDay.getDay();
    const daysInMonth = new Date(this.viewYear, this.viewMonth + 1, 0).getDate();
    const previousMonthDays = new Date(this.viewYear, this.viewMonth, 0).getDate();
    const calendarDays: CalendarDay[] = [];

    for (let index = startOffset - 1; index >= 0; index -= 1) {
      const day = previousMonthDays - index;
      calendarDays.push({
        label: this.pad(day),
        value: this.toDateValue(this.viewYear, this.viewMonth - 1, day),
        disabled: true
      });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const dateValue = this.toDateValue(this.viewYear, this.viewMonth, day);
      const isBeforeMin = this.minDate ? dateValue < this.minDate : false;
      calendarDays.push({
        label: this.pad(day),
        value: dateValue,
        ...(isBeforeMin ? { disabled: true } : {})
      });
    }

    const nextMonthDays = 42 - calendarDays.length;
    for (let day = 1; day <= nextMonthDays; day += 1) {
      calendarDays.push({
        label: this.pad(day),
        value: this.toDateValue(this.viewYear, this.viewMonth + 1, day),
        disabled: true
      });
    }

    return calendarDays;
  }

  get effectiveState(): DatePickerState {
    if (this.error) {
      return 'error';
    }

    if (this.state === 'success' || (this.hasValue && !this.pickerOpen)) {
      return 'success';
    }

    return this.state;
  }

  get controlClass(): string {
    if (this.disabled) {
      return '';
    }

    // Con error, el borde sigue rojo al enfocar y el foco se ve en un contorno azul por fuera (WCAG 2.4.7).
    if (this.effectiveState === 'error') {
      return 'border-2 border-[var(--sys-color-border-feedback-danger)] hover:border-[var(--sys-color-border-feedback-danger)] focus:outline-solid focus:outline-2 focus:outline-offset-2 focus:outline-[var(--sys-color-border-states-focus)]';
    }

    if (this.effectiveState === 'success') {
      return 'border-2 border-[var(--sys-color-border-feedback-success)] hover:border-[var(--sys-color-border-feedback-success)] focus:border-[var(--sys-color-border-states-focus)]';
    }

    return this.pickerOpen
      ? 'border-2 border-[var(--sys-color-border-states-focus)]'
      : 'border-[var(--sys-color-border-states-enabled)] hover:border-2 hover:border-[var(--sys-color-border-states-hover)] focus:border-2 focus:border-[var(--sys-color-border-states-focus)]';
  }

  get labelClass(): string {
    if (this.disabled) {
      return 'text-[var(--sys-color-text-neutral-disabled)]';
    }

    if (this.effectiveState === 'error') {
      return 'text-[var(--sys-color-text-feedback-danger)]';
    }

    return this.pickerOpen ? 'text-[var(--sys-color-text-neutral-activated)]' : 'text-[var(--sys-color-text-neutral-low)]';
  }

  get supportingClass(): string {
    return this.effectiveState === 'success' ? 'text-[var(--sys-color-text-feedback-success)]' : 'text-text-muted';
  }

  togglePicker(): void {
    if (this.disabled) {
      return;
    }

    this.pickerOpen = !this.pickerOpen;
    if (this.pickerOpen) {
      this.vista = 'dias';
      this.syncViewToSelection();
    }
  }

  /** Doce años con el que se está viendo en la segunda fila: 2026 → 2022…2033. */
  get rangoAnios(): number[] {
    const inicio = this.viewYear - 4;
    return Array.from({ length: 12 }, (_, i) => inicio + i);
  }

  get anioActual(): number {
    return this.currentDate.getFullYear();
  }

  esMesActual(mes: number): boolean {
    const hoy = this.currentDate;
    return this.viewYear === hoy.getFullYear() && mes === hoy.getMonth();
  }

  /** Un mes queda deshabilitado si termina antes de `minDate`. */
  mesDeshabilitado(mes: number): boolean {
    if (!this.minDate) return false;
    return this.toDateValue(this.viewYear, mes + 1, 0) < this.minDate;
  }

  /** Un año queda deshabilitado si termina antes de `minDate`. */
  anioDeshabilitado(anio: number): boolean {
    return this.minDate ? `${anio}-12-31` < this.minDate : false;
  }

  /** El mes o el año de la cabecera abren su grilla; pulsarlos otra vez vuelve a los días. */
  alternarVista(vista: 'meses' | 'anios', event?: Event): void {
    event?.stopPropagation();
    this.vista = this.vista === vista ? 'dias' : vista;
  }

  elegirMes(mes: number, event?: Event): void {
    event?.stopPropagation();
    this.viewMonth = mes;
    this.vista = 'dias';
  }

  elegirAnio(anio: number, event?: Event): void {
    event?.stopPropagation();
    this.viewYear = anio;
    this.vista = 'dias';
  }

  /** Día que recibe el foco al abrir el calendario: el elegido o, si no hay, hoy. */
  get diaInicial(): string {
    return this.selectedDate || this.todayDate;
  }

  closePicker(event?: Event): void {
    event?.stopPropagation();
    this.pickerOpen = false;
  }

  selectDate(value: string, event?: Event): void {
    event?.stopPropagation();
    this.selectedDate = value;
    this.valueChange.emit(value);

    if (this.variant === 'date') {
      this.closePicker();
    }
  }

  acceptDate(event?: Event): void {
    event?.stopPropagation();
    if (!this.selectedDate) {
      this.selectedDate = this.toDateValue(this.viewYear, this.viewMonth, 1);
      this.valueChange.emit(this.selectedDate);
    }

    this.closePicker();
  }

  moveMonth(offset: number, event?: Event): void {
    event?.stopPropagation();
    const nextDate = new Date(this.viewYear, this.viewMonth + offset, 1);
    this.viewYear = nextDate.getFullYear();
    this.viewMonth = nextDate.getMonth();
  }

  moveYear(offset: number, event?: Event): void {
    event?.stopPropagation();
    this.viewYear += offset;
  }

  private setSelectedDate(value: string): void {
    this.selectedDate = value;
    this.syncViewToSelection();
  }

  private syncViewToSelection(): void {
    const selected = this.parseDateValue(this.selectedDate) || this.currentDate;
    this.viewYear = selected.getFullYear();
    this.viewMonth = selected.getMonth();
  }

  private get currentDate(): Date {
    return new Date();
  }

  private get todayValue(): string {
    const today = this.currentDate;
    return this.toDateValue(today.getFullYear(), today.getMonth(), today.getDate());
  }

  private parseDateValue(value: string): Date | null {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) {
      return null;
    }

    const [, year, month, day] = match;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  private toDateValue(year: number, month: number, day: number): string {
    const date = new Date(year, month, day);
    return `${date.getFullYear()}-${this.pad(date.getMonth() + 1)}-${this.pad(date.getDate())}`;
  }

  private pad(value: number): string {
    return String(value).padStart(2, '0');
  }
}
