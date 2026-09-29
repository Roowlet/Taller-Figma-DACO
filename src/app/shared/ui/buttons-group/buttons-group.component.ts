import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { IconComponent } from '../icon/icon.component';
import { TooltipDirective } from '../tooltip/tooltip.directive';

export interface ButtonGroupItem {
  label: string;
  value: string;
  /** Ícono de Material Icons antes del texto; con `iconOnly` en el grupo va solo, y la etiqueta pasa al nombre y al tooltip. */
  icon?: string;
}

/**
 * Grupo de botones segmentado y unido, con una sola opción activa a la vez.
 *
 * Usarlo para alternar entre pocas vistas o modos excluyentes. Para elegir un valor dentro de un
 * formulario van `siaf-radio-group` (con `[inline]` para Si/No) o un select, no este control.
 *
 * @usar
 * - Para alternar sub-vistas excluyentes de una misma sección, como «Tipo de asiento de ajuste» y «Clases de ajustes y
 *   Detalles de ajustes» en la pestaña Registros de la bandeja del catálogo de ajuste.
 * - Para filtros o modos rápidos de pocas opciones cortas que se aplican al instante, como «Todos | Igual en oscuro |
 *   Fuera de Figma» en los colores y la variante y el tamaño de los íconos, en los fundamentos del `/ui-kit`.
 * - Con `icon` en cada opción e `iconOnly` para un selector de vista compacto, como «Vista de datos | Vista de
 *   gráficas» del resultado de `siaf-query-report-page` (Guía de Estructura de Pantallas, nodo 22715:21316): la
 *   etiqueta nombra el botón y aparece en el tooltip.
 * @evitar
 * - Para elegir un valor dentro de un formulario: usar `siaf-radio-group` (con `[inline]` para Si/No) o
 *   `siaf-select-options`.
 * - Para las vistas principales de una pantalla (Documentos / Registros, Detalle / Historial): usar `siaf-records-tabs`
 *   o `siaf-tabs`.
 * - Para acciones independientes (Grabar, Cancelar): usar `siaf-button` sueltos.
 * - Con muchas opciones o textos largos: usar `siaf-filter-pill` o `siaf-select-options`.
 * @teclado
 * - **Tab**: pasa por cada opción del grupo (todas entran en el orden de tabulación; no hay navegación con flechas).
 * - **Enter / Espacio**: eligen la opción enfocada y emiten `valueChange`.
 * @accesibilidad
 * - **4.1.2 Nombre, función y valor (A)**: cada opción es un `<button>` nativo con `aria-pressed` según esté elegida,
 *   dentro de un `role="group"` nombrado con `ariaLabel`; con `iconOnly`, el botón se llama como su etiqueta.
 * - **1.1.1 Contenido no textual (A)**: con `iconOnly` el ícono es decorativo y la etiqueta va en `aria-label` y en el
 *   tooltip.
 * - **2.1.1 Teclado (A)**: Tab llega a cada opción y Enter o Espacio la eligen.
 * - **2.4.7 Foco visible (AA)**: contorno de 2 px con separación de 2 px (`focus-visible:outline`).
 * - **1.4.3 Contraste mínimo (AA)**: inactivas `text-neutral-medium` (en claro su fondo `bg-states-light-enabled` es
 *   transparente: 14.53:1 sobre la superficie); activa `text-neutral-activated` sobre la capa azul
 *   `bg-states-light-activated`.
 * - **1.4.1 Uso del color (A)**: la activa además va en negrita (`font-bold`); con `iconOnly` no hay texto que marcar y
 *   la distinguen el borde y la capa azul, además de `aria-pressed`.
 * - **Pendiente · 1.4.11 Contraste no textual (AA)**: el contorno de foco usa `border-states-active`: 8.79:1 en claro,
 *   pero 2.02:1 en oscuro.
 * - **2.5.8 Tamaño del objetivo (AA)**: cada opción mide al menos 40 px de alto.
 */
@Component({
  selector: 'siaf-buttons-group',
  standalone: true,
  imports: [IconComponent, NgClass, TooltipDirective],
  template: `
    <div class="flex items-center isolate" role="group" [attr.aria-label]="ariaLabel || null">
      @for (item of items; track item.value; let i = $index) {
        <button
          type="button"
          class="relative flex items-center justify-center gap-siaf-xs min-h-[40px] px-4 py-2 border text-sm transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sys-color-border-states-active)]"
          [ngClass]="[getItemClass(item, i), getRadiusClass(i)]"
          [attr.aria-pressed]="item.value === value"
          [attr.aria-label]="soloIcono(item) ? item.label : null"
          [siafTooltip]="soloIcono(item) ? item.label : ''"
          [tooltipMode]="soloIcono(item) ? 'always' : 'truncated'"
          (click)="select(item.value)"
        >
          @if (item.icon) {
            <siaf-icon [name]="item.icon" [size]="24" />
          }
          @if (!soloIcono(item)) {
            {{ item.label }}
          }
        </button>
      }
    </div>
  `,
  styles: `
    :host { display: inline-block; }

    button {
      margin-right: -1px;
      z-index: 1;
    }

    button.is-active {
      z-index: 2;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonsGroupComponent {
  @Input() items: ButtonGroupItem[] = [];
  @Input() value: string | null = null;
  /** Las opciones con `icon` muestran solo el ícono; su etiqueta nombra el botón y aparece en el tooltip. */
  @Input() iconOnly = false;
  /** Nombre del grupo para el lector de pantalla («Vista del resultado»). */
  @Input() ariaLabel = '';

  @Output() valueChange = new EventEmitter<string>();

  soloIcono(item: ButtonGroupItem): boolean {
    return this.iconOnly && !!item.icon;
  }

  select(val: string): void {
    this.value = val;
    this.valueChange.emit(val);
  }

  getItemClass(item: ButtonGroupItem, _index: number): string {
    const isActive = item.value === this.value;

    if (isActive) {
      return [
        'is-active',
        'border-[var(--sys-color-border-states-active)]',
        'bg-[var(--sys-color-bg-states-light-activated)]',
        'text-[var(--sys-color-text-neutral-activated)]',
        'font-bold',
      ].join(' ');
    }

    return [
      'border-[var(--sys-color-border-states-enabled)]',
      'bg-[var(--sys-color-bg-states-light-enabled)]',
      'text-[var(--sys-color-text-neutral-medium)]',
      'font-medium',
      'hover:bg-[var(--sys-color-bg-states-dark-hover)]',
    ].join(' ');
  }

  getRadiusClass(index: number): string {
    const total = this.items.length;
    const isFirst = index === 0;
    const isLast = index === total - 1;

    if (isFirst && isLast) return 'rounded-siaf-md';
    if (isFirst) return 'rounded-l-siaf-md';
    if (isLast) return 'rounded-r-siaf-md';
    return 'rounded-none';
  }
}
