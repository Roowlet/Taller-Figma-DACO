import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { IconComponent } from '../../ui/icon/icon.component';

export type PaginationNavigation = 'Inactive' | 'Activate';
export type PaginationPosition = 'Top' | 'Bottom';

/**
 * Paginación de las grillas: contador «1-10 de 800» y flechas Página anterior / Página siguiente, que se deshabilitan
 * solas en la primera y la última página.
 *
 * Con `position="Bottom"` y `rowPage` suma a la izquierda el select nativo de filas por página; en `Top` es la versión
 * compacta que pinta `siaf-table-controls`. Solo emite eventos (`previous`, `next`, `rowsPerPageChange`): el padre
 * cambia `page` y las filas.
 *
 * @usar
 * - Debajo de toda grilla, con `position="Bottom"` y `[rowPage]="true"`: bandeja, pestañas Documentos / Registros,
 *   panel lateral de selección, listados de Admin y tablas de solicitudes y consultas.
 * - Con `rowsPerPageOptions` propias si la tabla usa otros tamaños (detalle anual de apertura contable, pedidos de
 *   contabilización).
 * @evitar
 * - `position="Top"` suelta sobre la tabla: la barra superior es siempre `siaf-table-controls`, que ya la incluye.
 * - Forzar `navigation="Inactive"` cuando todo cabe en una página: `Activate` (por defecto) ya deshabilita las flechas
 *   en los bordes.
 * - Para avanzar por las etapas de un flujo: `siaf-steps` o `siaf-button`.
 * @teclado
 * - **Tab**: recorre el select de filas por página (con `rowPage`) y las flechas; una flecha deshabilitada queda fuera.
 * - **Enter / Espacio**: en una flecha, cambian de página (emiten `previous` o `next`).
 * - **Flechas arriba / abajo**: en el select nativo eligen otra cantidad de filas (emite `rowsPerPageChange`).
 * @accesibilidad
 * - **1.3.1 Información y relaciones (A)**: es un `<nav aria-label="Paginación">`; en la grilla estándar hay dos con el
 *   mismo nombre (el de `siaf-table-controls` arriba y este abajo).
 * - **4.1.2 Nombre, función y valor (A)**: las flechas son `<button>` con `aria-label` («Página anterior», «Página
 *   siguiente») y `disabled` en los bordes; el select lleva `aria-label` «Filas por página».
 * - **Pendiente · 4.1.3 Mensajes de estado (AA)**: el contador es un `<span>` sin `role="status"` ni `aria-live`:
 *   cambiar de página o de filas por página, o filtrar, no se anuncia.
 * - **Pendiente · 2.4.3 Orden del foco (A)**: al llegar a la primera o la última página, la flecha enfocada pasa a
 *   `disabled` y el componente no mueve el foco a otro control.
 * - **1.4.3 Contraste mínimo (AA)**: contador en `text-neutral-low` (5.01:1 / 8.86:1) y valor del select en
 *   `text-neutral-high` (16.29:1 / 16.53:1) sobre la superficie.
 * - **Pendiente · 1.4.11 Contraste no textual (AA)**: el borde del select es `border-states-enabled` (2.44:1 /
 *   2.59:1). El anillo de foco ya es el azul del kit (`border-states-focus`, 5.35:1 / 10.15:1).
 * - **2.4.7 Foco visible (AA)**: el select y las flechas muestran un anillo de 2 px `border-states-focus` separado
 *   2 px. El del select antes no se pintaba: con `outline-none`, Tailwind v4 dejaba el estilo del contorno en `none`.
 * - **2.5.8 Tamaño del objetivo (AA)**: flechas de 40 px y select de 32 px de alto.
 */
@Component({
  selector: 'siaf-pagination',
  standalone: true,
  imports: [IconComponent],
  template: `
    <nav
      class="flex w-full min-w-0 items-center gap-siaf-md text-xs text-text-muted"
      [class.justify-between]="position === 'Bottom' && rowPage"
      [class.justify-end]="!(position === 'Bottom' && rowPage)"
      aria-label="Paginación"
    >
      @if (position === 'Bottom' && rowPage) {
        <div class="flex min-w-0 flex-1 items-center gap-siaf-xs">
          <!-- En móvil solo "Filas:" para no comerse el ancho de la barra. -->
          <span class="whitespace-nowrap">Filas<span class="hidden sm:inline"> por página</span>:</span>
          <label class="relative block h-8 w-[82px]">
            <select
              class="h-8 w-full appearance-none rounded-siaf-md border border-[var(--sys-color-border-states-enabled)] bg-surface py-siaf-xxs pl-siaf-md pr-9 text-sm text-text outline-none transition hover:bg-surface-muted focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sys-color-border-states-focus)]"
              [value]="rowsPerPage"
              aria-label="Filas por página"
              (change)="onRowsPerPageChange($event)"
              (click)="rowsPerPageOpened.emit()"
              (keydown.enter)="rowsPerPageOpened.emit()"
              (keydown.space)="rowsPerPageOpened.emit()"
            >
              @for (option of rowsPerPageOptions; track option) {
                <!-- selected en cada opción: el [value] del select se aplica antes de que existan las opciones y quedaba en la primera. -->
                <option [value]="option" [selected]="option === rowsPerPage">{{ option }}</option>
              }
            </select>
            <siaf-icon class="pointer-events-none absolute right-siaf-xs top-1/2 -translate-y-1/2 text-text" name="expand_more" [size]="24" />
          </label>
        </div>
      }

      <div class="flex h-10 shrink-0 items-center justify-end gap-siaf-md">
        <span class="whitespace-nowrap">{{ counterText }}</span>
        <div class="flex h-full items-center gap-siaf-xs">
          <button
            class="inline-flex size-10 items-center justify-center rounded-siaf-md transition hover:bg-surface-muted focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sys-color-border-states-focus)] disabled:cursor-not-allowed disabled:text-text-muted/60"
            type="button"
            [disabled]="previousDisabled"
            aria-label="Página anterior"
            (click)="previous.emit()"
          >
            <siaf-icon name="chevron_left" [size]="24" />
          </button>
          <button
            class="inline-flex size-10 items-center justify-center rounded-siaf-md transition hover:bg-surface-muted focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sys-color-border-states-focus)] disabled:cursor-not-allowed disabled:text-text-muted/60"
            type="button"
            [disabled]="nextDisabled"
            aria-label="Página siguiente"
            (click)="next.emit()"
          >
            <siaf-icon name="chevron_right" [size]="24" />
          </button>
        </div>
      </div>
    </nav>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaginationComponent {
  @Input() page = 1;
  @Input() totalPages = 1;
  @Input() pageSize = 10;
  @Input() totalItems = 800;
  @Input() counterPage = '';
  /** 'Activate' (default): flechas navegables — se deshabilitan solas en los
   *  bordes (page 1 / última). 'Inactive' fuerza ambas deshabilitadas. */
  @Input() navigation: PaginationNavigation = 'Activate';
  @Input() position: PaginationPosition = 'Top';
  @Input() rowPage = false;
  @Input() rowsPerPage = 10;
  @Input() rowsPerPageOptions: number[] = [10, 25, 50, 100];

  @Output() previous = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();
  @Output() rowsPerPageOpened = new EventEmitter<void>();
  @Output() rowsPerPageChange = new EventEmitter<number>();

  get counterText(): string {
    if (this.counterPage) {
      return this.counterPage;
    }

    const start = this.totalItems === 0 ? 0 : (this.page - 1) * this.pageSize + 1;
    const end = Math.min(this.page * this.pageSize, this.totalItems);

    return `${start}-${end} de ${this.totalItems}`;
  }

  get previousDisabled(): boolean {
    return this.page <= 1 || this.navigation === 'Inactive';
  }

  get nextDisabled(): boolean {
    return this.page >= this.totalPages || this.navigation === 'Inactive';
  }

  onRowsPerPageChange(event: Event): void {
    const value = Number((event.target as HTMLSelectElement).value);
    this.rowsPerPageChange.emit(value);
  }
}
