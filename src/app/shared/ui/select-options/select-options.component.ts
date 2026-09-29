import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, signal } from '@angular/core';

import { IconComponent } from '../icon/icon.component';
import { TooltipDirective } from '../tooltip/tooltip.directive';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

/**
 * Listbox de opciones (simple o múltiple) con check en las seleccionadas y navegación por teclado.
 *
 * Úsalo como el panel desplegable de un selector: emite el valor elegido, no guarda estado ni pinta
 * el input. Quien lo usa decide cómo abrirlo y qué hacer con la selección.
 *
 * @usar
 * - Como panel desplegable de `siaf-input` con `type="select"` o `select-multiple`: el campo lo abre, lo cierra y
 *   guarda el valor.
 * - Como lista de opciones de un componente compuesto con su propio disparador, como los select del panel «Crear
 *   documento» (`siaf-create-document`).
 * - `[multiple]` cuando se marcan varias opciones con check sin cerrar la lista.
 * - `[checkboxes]` con `selectAllLabel` en una lista múltiple como la del Figma «Parámetros de consulta»: una casilla
 *   por opción y, arriba, «Seleccionar todo», que emite `allSelected`.
 * @evitar
 * - Para un campo de formulario completo: usar `siaf-input` con `type="select"`, que ya pinta etiqueta, borde y error.
 * - Para un menú de acciones (Editar, Anular, Exportar): usar `siaf-menu` o `siaf-icon-dropdown-menu`.
 * - Para catálogos largos: no filtra ni busca; usar `siaf-selection-side-nav`.
 * @teclado
 * - **Tab**: la lista es una sola parada: entra por la última opción enfocada (al principio, la elegida o la primera
 *   habilitada) y la siguiente pulsación sale.
 * - **Flecha abajo / arriba**: pasan a la opción habilitada siguiente o anterior y dan la vuelta.
 * - **Inicio / Fin**: van a la primera o a la última opción habilitada.
 * - **Enter / Espacio**: eligen la opción enfocada (emite `selected`); abrir, cerrar y Escape los maneja quien lo usa.
 *   La opción elegida lleva `data-foco-inicial`: con `siafFoco`, el foco entra por ella al abrir la lista.
 * - Con casillas, **Enter / Espacio** en «Seleccionar todo» marca o desmarca todas (emite `allSelected`).
 * @accesibilidad
 * - **4.1.2 Nombre, función y valor (A)**: `role="listbox"` con `aria-multiselectable`; cada opción es `role="option"`
 *   con `aria-selected` y `disabled` nativo.
 * - **Pendiente · 4.1.2 Nombre, función y valor (A)**: el `listbox` no tiene nombre (`aria-label` o `aria-labelledby`)
 *   ni una entrada para recibirlo del padre.
 * - **2.1.1 Teclado (A)**: al enfocar una opción con la etiqueta cortada aparece su texto completo (`siafTooltip`).
 * - **2.4.7 Foco visible (AA)**: la opción enfocada con teclado lleva un contorno interior azul de 2 px
 *   (`border-states-focus`, 5.35:1 claro / 10.15:1 oscuro), el mismo de `siaf-menu` y `siaf-list`; no cambia el
 *   fondo, así la elegida sigue marcada mientras tiene el foco.
 * - **1.4.1 Uso del color (A)**: la opción elegida además va en negrita y con un check (`aria-hidden`); con casillas,
 *   con la casilla marcada.
 * - **1.1.1 Contenido no textual (A)**: con casillas, cada opción es un elemento con `role="option"` (un `<input>` no
 *   puede ir dentro de un botón) y la casilla nativa lleva `aria-hidden` y `tabindex="-1"`: el estado lo publica
 *   `aria-selected`.
 * - **1.4.3 Contraste mínimo (AA)**: en claro, las opciones van en `text-neutral-medium` 14.53:1 sobre la superficie;
 *   la elegida, `text-neutral-activated` sobre `bg-states-light-selected`, par que la tabla no mide.
 * - **2.5.8 Tamaño del objetivo (AA)**: cada opción mide al menos 48 px de alto (`min-h-12`) y ocupa todo el ancho.
 */
@Component({
  selector: 'siaf-select-options',
  standalone: true,
  imports: [NgClass, IconComponent, TooltipDirective],
  template: `
    <div
      class="max-h-72 w-full overflow-y-auto rounded-siaf-md bg-[var(--sys-color-bg-surfaces-floating,var(--sys-color-bg-surfaces-surface))] py-siaf-xs shadow-siaf-elevation-1"
      role="listbox"
      [attr.aria-multiselectable]="multiple"
    >
      @if (conCasillas) {
        <!-- Casillas nativas del kit, como siaf-menu: cada fila es un elemento con rol de opción, no un botón.
             El clic cancela su acción por defecto: dentro del <label> de siaf-input, un clic en algo que no es un control
             activaba el botón del campo y cerraba la lista. -->
        @if (selectAllLabel) {
          <div
            class="flex min-h-12 w-full cursor-pointer items-center gap-siaf-md px-siaf-md py-siaf-sm text-left text-sm leading-normal outline-none transition hover:bg-[var(--sys-color-bg-states-light-hover)] focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--sys-color-border-states-focus)] active:bg-[var(--sys-color-bg-states-light-pressed)]"
            role="option"
            data-seleccionar-todo
            [attr.aria-selected]="todasMarcadas"
            [attr.tabindex]="indiceTabulable === 0 ? 0 : -1"
            [class.bg-[var(--sys-color-bg-states-light-selected)]]="todasMarcadas"
            (focus)="enfocada.set(0)"
            (click)="alternarTodas(); $event.preventDefault()"
            (keydown.enter)="activar($event)"
            (keydown.space)="activar($event)"
            (keydown.arrowDown)="focusSibling($event, 1)"
            (keydown.arrowUp)="focusSibling($event, -1)"
            (keydown.home)="focusBoundary($event, 'first')"
            (keydown.end)="focusBoundary($event, 'last')"
          >
            <input class="pointer-events-none shrink-0" type="checkbox" tabindex="-1" aria-hidden="true" [checked]="todasMarcadas" [indeterminate]="algunasMarcadas" />
            <span
              class="min-w-0 flex-1 truncate"
              siafTooltip
              [class.font-bold]="todasMarcadas"
              [class.text-[var(--sys-color-text-neutral-activated)]]="todasMarcadas"
              [class.text-[var(--sys-color-text-neutral-medium)]]="!todasMarcadas"
            >{{ selectAllLabel }}</span>
          </div>
        }
        @for (option of options; track option.value; let i = $index) {
          <div
            class="flex min-h-12 w-full cursor-pointer items-center gap-siaf-md px-siaf-md py-siaf-sm text-left text-sm leading-normal outline-none transition hover:bg-[var(--sys-color-bg-states-light-hover)] focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--sys-color-border-states-focus)] active:bg-[var(--sys-color-bg-states-light-pressed)] aria-disabled:cursor-not-allowed aria-disabled:text-[var(--sys-color-text-neutral-disabled)]"
            role="option"
            [attr.aria-selected]="isSelected(option.value)"
            [attr.aria-disabled]="option.disabled ? true : null"
            [attr.data-foco-inicial]="esInicial(option.value) ? '' : null"
            [attr.tabindex]="i + desplazamiento === indiceTabulable ? 0 : -1"
            [ngClass]="optionClass(option.value)"
            (focus)="enfocada.set(i + desplazamiento)"
            (click)="elegir(option); $event.preventDefault()"
            (keydown.enter)="activar($event)"
            (keydown.space)="activar($event)"
            (keydown.arrowDown)="focusSibling($event, 1)"
            (keydown.arrowUp)="focusSibling($event, -1)"
            (keydown.home)="focusBoundary($event, 'first')"
            (keydown.end)="focusBoundary($event, 'last')"
          >
            <input class="pointer-events-none shrink-0" type="checkbox" tabindex="-1" aria-hidden="true" [checked]="isSelected(option.value)" [disabled]="!!option.disabled" />
            <span class="min-w-0 flex-1 truncate" siafTooltip [ngClass]="optionLabelClass(option.value)">{{ option.label }}</span>
          </div>
        }
      } @else {
      @for (option of options; track option.value; let i = $index) {
        <button
          class="flex min-h-12 w-full items-center gap-siaf-md px-siaf-md py-siaf-sm text-left text-sm leading-normal outline-none transition hover:bg-[var(--sys-color-bg-states-light-hover)] focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--sys-color-border-states-focus)] active:bg-[var(--sys-color-bg-states-light-pressed)] disabled:cursor-not-allowed disabled:text-[var(--sys-color-text-neutral-disabled)]"
          type="button"
          role="option"
          [disabled]="option.disabled"
          [attr.aria-selected]="isSelected(option.value)"
          [attr.data-foco-inicial]="esInicial(option.value) ? '' : null"
          [attr.tabindex]="i === indiceTabulable ? 0 : -1"
          (focus)="enfocada.set(i)"
          [ngClass]="optionClass(option.value)"
          (click)="selected.emit(option.value)"
          (keydown.arrowDown)="focusSibling($event, 1)"
          (keydown.arrowUp)="focusSibling($event, -1)"
          (keydown.home)="focusBoundary($event, 'first')"
          (keydown.end)="focusBoundary($event, 'last')"
        >
          <span class="min-w-0 flex-1 truncate" siafTooltip [ngClass]="optionLabelClass(option.value)">{{ option.label }}</span>
          @if (isSelected(option.value)) {
            <siaf-icon
              class="shrink-0 text-[var(--sys-color-text-neutral-activated)]"
              name="check"
              [size]="20"
              aria-hidden="true"
            />
          }
        </button>
      }
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectOptionsComponent {
  @Input() options: SelectOption[] = [];
  @Input() selectedValue = '';
  @Input() selectedValues: string[] = [];
  @Input() multiple = false;
  /** Con `multiple`, una casilla nativa por opción en vez del check (Figma «Menu» con casillas). */
  @Input() checkboxes = false;
  /** Con casillas, agrega arriba la fila que marca o desmarca todas («Seleccionar todo»). */
  @Input() selectAllLabel = '';

  @Output() selected = new EventEmitter<string>();
  /** «Seleccionar todo»: `true` para marcar todas las habilitadas, `false` para desmarcarlas. */
  @Output() allSelected = new EventEmitter<boolean>();

  /** Índice de la última fila enfocada: es la única parada de Tab de la lista (como `siaf-menu`). */
  readonly enfocada = signal(-1);

  get conCasillas(): boolean {
    return this.multiple && this.checkboxes;
  }

  /** Con «Seleccionar todo», esa fila ocupa el índice 0 y las opciones empiezan en 1. */
  get desplazamiento(): number {
    return this.conCasillas && this.selectAllLabel ? 1 : 0;
  }

  /** Fila con `tabindex="0"`: la última enfocada o, al principio, la elegida o la primera habilitada. */
  get indiceTabulable(): number {
    const indice = this.enfocada();
    if (this.desplazamiento && indice === 0) return 0;
    const opcion = this.options[indice - this.desplazamiento];
    if (opcion && !opcion.disabled) return indice;
    const elegida = this.options.findIndex((o) => !o.disabled && this.esInicial(o.value));
    if (elegida >= 0) return elegida + this.desplazamiento;
    return this.desplazamiento ? 0 : this.options.findIndex((o) => !o.disabled);
  }

  get todasMarcadas(): boolean {
    const habilitadas = this.options.filter((o) => !o.disabled);
    return habilitadas.length > 0 && habilitadas.every((o) => this.selectedValues.includes(o.value));
  }

  get algunasMarcadas(): boolean {
    return !this.todasMarcadas && this.options.some((o) => !o.disabled && this.selectedValues.includes(o.value));
  }

  alternarTodas(): void {
    this.allSelected.emit(!this.todasMarcadas);
  }

  elegir(option: SelectOption): void {
    if (!option.disabled) this.selected.emit(option.value);
  }

  /** Enter y Espacio en una fila con casilla (no es un botón: el navegador no la activa solo). */
  activar(event: Event): void {
    event.preventDefault();
    (event.currentTarget as HTMLElement).click();
  }

  /** La opción elegida (la primera, en múltiple) recibe el foco cuando quien lo usa abre la lista con siafFoco. */
  esInicial(value: string): boolean {
    return this.multiple ? this.selectedValues[0] === value : !!value && this.selectedValue === value;
  }

  isSelected(value: string): boolean {
    return this.multiple ? this.selectedValues.includes(value) : this.selectedValue === value;
  }

  optionClass(value: string): Record<string, boolean> {
    return {
      'bg-[var(--sys-color-bg-states-light-selected)]': this.isSelected(value)
    };
  }

  optionLabelClass(value: string): Record<string, boolean> {
    return {
      'font-bold': this.isSelected(value),
      'text-[var(--sys-color-text-neutral-activated)]': this.isSelected(value),
      'text-[var(--sys-color-text-neutral-medium)]': !this.isSelected(value)
    };
  }

  focusSibling(event: Event, direction: 1 | -1): void {
    event.preventDefault();
    const options = this.enabledOptionButtons(event);
    const currentIndex = options.indexOf(event.currentTarget as HTMLElement);
    const nextIndex = (currentIndex + direction + options.length) % options.length;
    options[nextIndex]?.focus();
  }

  focusBoundary(event: Event, boundary: 'first' | 'last'): void {
    event.preventDefault();
    const options = this.enabledOptionButtons(event);
    const index = boundary === 'first' ? 0 : options.length - 1;
    options[index]?.focus();
  }

  private enabledOptionButtons(event: Event): HTMLElement[] {
    const listbox = (event.currentTarget as HTMLElement).closest('[role="listbox"]');
    if (!listbox) {
      return [];
    }

    return Array.from(listbox.querySelectorAll<HTMLElement>('[role="option"]:not(:disabled):not([aria-disabled="true"])'));
  }
}
