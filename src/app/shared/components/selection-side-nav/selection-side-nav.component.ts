import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

import { ButtonComponent } from '../../ui/button/button.component';
import { IconComponent } from '../../ui/icon/icon.component';
import { SidePanelAnimacion } from '../../ui/side-panel-animacion';
import { FormTableSearchComponent } from '../form-table-search/form-table-search.component';
import { PaginationComponent } from '../pagination/pagination.component';
import { TableControlsComponent } from '../table-controls/table-controls.component';
import { FocoDirective } from '../../ui/foco/foco.directive';

export interface SelectionColumn<T = Record<string, unknown>> {
  /** Llave de la propiedad en la fila (también se usa para el track). */
  key: string;
  /** Texto del header. */
  label: string;
  /** Clase Tailwind para el ancho (`w-[120px]`, `w-20`, etc.). */
  widthClass?: string;
  /** Clase Tailwind extra para las celdas (p.ej. `font-mono`). */
  cellClass?: string;
  /** Renderer opcional. Si no se da, se usa `row[key]` como string. */
  render?: (row: T) => string;
}

export type SelectionMode = 'single' | 'multiple';

/**
 * Side-nav genérico para seleccionar uno o varios elementos de un
 * catálogo. Reemplaza los 15 paneles inline repetidos en los
 * formularios de solicitud.
 *
 * Variantes:
 * - **single** — radio buttons, emite `accepted` con un único id.
 * - **multiple** — checkboxes, emite `accepted` con los ids seleccionados.
 *
 * Comportamiento:
 * - Click en la fila marca/desmarca la selección (igual que click en
 *   el control).
 * - Backdrop (click afuera) cierra sin emitir.
 * - X del header cierra sin emitir.
 * - Cancelar cierra sin emitir.
 * - Aceptar emite y cierra (el padre cierra explícitamente via
 *   `(accepted)`).
 *
 * Ejemplo single:
 *
 *   <siaf-selection-side-nav
 *     [open]="clasePanelOpen()"
 *     title="Buscar clase de ajuste"
 *     mode="single"
 *     [rows]="filteredClases()"
 *     [columns]="claseColumns"
 *     [searchValue]="claseSearch()"
 *     [selectedIds]="tempClaseId() ? [tempClaseId()] : []"
 *     (searchChange)="claseSearch.set($event)"
 *     (selectionChange)="onClaseTempChange($event)"
 *     (closed)="clasePanelOpen.set(false)"
 *     (accepted)="confirmClaseExistente()"
 *   />
 *
 * @usar
 * - Para elegir uno (`single`) o varios (`multiple`) registros de un catálogo desde un formulario de solicitud: cuentas
 *   contables, entidades, planes de cuentas, clases y detalles de ajuste, ámbitos, periodos o eventos.
 * - Con `paginated` y `showSelectAll` cuando el catálogo es largo (cuentas del plan, cuentas del tipo de asiento): el
 *   padre pagina y decide qué cuenta como «todo seleccionado».
 * - Con `disabledIds` para mostrar registros que no se pueden elegir, como las clases de ajuste ya usadas por un tipo de
 *   asiento (RN-012).
 * - Con `customTable` cuando la tabla no es plana: periodos del asiento de ajuste y de la apertura contable, eventos
 *   del catálogo de eventos contables.
 * @evitar
 * - Para elegir entre pocas opciones fijas: usar `siaf-input` tipo select, `siaf-select-options` o `siaf-radio-group`.
 * - Para adjuntar archivos: usar `siaf-upload-side-nav`; para mostrar u ocultar columnas, `siaf-column-visibility-panel`.
 * - Maquetar otro panel de búsqueda con overlay, tabla y botones: este reemplazó los 15 que había en los formularios.
 * - Para filtrar la grilla de la página: usar `siaf-custom-filter` o `siaf-filter-pill`.
 * @teclado
 * - **Tab**: al abrir, el foco entra en la X; recorre el buscador, la barra de la grilla, los controles de selección, la
 *   paginación y Cancelar / Aceptar, y da la vuelta sin salir del panel. En `single` todo el grupo de radios es una sola
 *   parada. Con `customTable`, la tabla proyectada trae su propio teclado.
 * - **Escape**: cierra el panel (emite `closed`) y el foco vuelve al control que lo abrió.
 * - **Espacio**: en `multiple` marca o desmarca la casilla enfocada; en `single` elige el radio.
 * - **Flechas**: en `single` pasan al radio anterior o siguiente y lo eligen (grupo nativo por `name`); saltan los
 *   deshabilitados.
 * - **Enter** en el buscador: aplica la búsqueda (sigue `siaf-form-table-search`).
 * - **Enter / Espacio**: activan la X y Cancelar (emiten `closed`) y Aceptar (emite `accepted` con los ids).
 * @accesibilidad
 * - **4.1.2 Nombre, función y valor (A)**: `role="dialog"` con `aria-modal="true"` y `aria-label` igual al `title`; la
 *   X se llama «Cerrar» más el título, y las casillas y los radios nativos exponen marcado y deshabilitado.
 * - **2.4.3 Orden del foco (A)**: con `siafFoco`, al abrir lleva el foco a la X y al cerrar lo devuelve al campo que lo
 *   abrió; Tab no sale a la página de atrás.
 * - **2.1.2 Sin trampas de teclado (A)**: Tab queda dentro mientras está abierto, pero Escape siempre lo cierra.
 * - **1.3.1 Información y relaciones (A)**: título `h2` y tabla real con `thead` y un `th` por columna.
 * - **Pendiente · 2.4.6 Encabezados y etiquetas (AA)**: todas las casillas y radios se llaman «Seleccionar fila» (su
 *   columna lleva un `th` vacío), y el buscador siempre se rotula «Buscar»: `searchPlaceholder` llega al `ariaLabel` de
 *   `siaf-form-table-search`, que no lo usa.
 * - **1.4.1 Uso del color (A)**: la fila elegida lleva la casilla o el radio marcado además del fondo
 *   `bg-states-light-selected`; la no elegible, el control deshabilitado además de la opacidad.
 * - **Pendiente · 4.1.3 Mensajes de estado (AA)**: «No se encontraron resultados.» aparece dentro de la tabla sin
 *   `role="status"`: el resultado de la búsqueda no se anuncia.
 * - **2.4.7 Foco visible (AA)**: la X, las casillas y los radios muestran el anillo nativo del navegador (sin
 *   `outline-none`); el buscador, la barra, la paginación y los botones del pie siguen su componente.
 */
@Component({
  selector: 'siaf-selection-side-nav',
  standalone: true,
  imports: [FocoDirective, ButtonComponent, FormTableSearchComponent, IconComponent, NgClass, PaginationComponent, TableControlsComponent],
  template: `
    @if (anim.visible()) {
      <section
        class="siaf-sidepanel-overlay fixed inset-y-0 left-0 right-0 z-50 bg-black/55 pl-0 lg:pl-[65px]"
        [class.cerrando]="anim.cerrando()"
        aria-modal="true"
        role="dialog"
        [attr.aria-label]="title"
        (click)="onCloseRequested()"
      >
        <aside
          class="flex h-screen w-full flex-col overflow-hidden bg-surface shadow-siaf-lg lg:rounded-l-siaf-md"
          [siafFoco]="open"
          (siafFocoEscape)="onCloseRequested()"
          (click)="$event.stopPropagation()"
        >
          <header class="flex h-14 shrink-0 items-center gap-siaf-xs px-siaf-md">
            <h2 class="m-0 flex-1 text-base font-bold uppercase leading-normal text-text">
              {{ title }}
            </h2>
            <button
              class="inline-flex size-10 items-center justify-center rounded-siaf-md text-text transition hover:bg-surface-muted"
              type="button"
              [attr.aria-label]="'Cerrar ' + title"
              (click)="onCloseRequested()"
            >
              <siaf-icon name="close" [size]="24" />
            </button>
          </header>

          <div class="min-h-0 flex-1 overflow-y-auto px-siaf-md py-siaf-md">
            <siaf-form-table-search
              [value]="searchValue"
              [ariaLabel]="searchPlaceholder"
              (valueChange)="searchChange.emit($event)"
            />

            @if (mode === 'multiple' && showSelectAll) {
              <div class="mt-siaf-md">
                <siaf-table-controls
                  [selectAllLabel]="selectAllLabel"
                  [checked]="selectAllChecked"
                  [indeterminate]="selectAllIndeterminate"
                  [selectedCount]="selectedIds.length"
                  [showEditAction]="false"
                  [showDeleteAction]="false"
                  [showMenuAction]="false"
                  [page]="page"
                  [pageSize]="pageSize"
                  [totalItems]="totalItems"
                  [totalPages]="totalPages"
                  (selectionChange)="selectAllChange.emit($event)"
                  (previous)="previousPage.emit()"
                  (next)="nextPage.emit()"
                />
              </div>
            } @else if (paginated && showTopPagination) {
              <div class="mt-siaf-md">
                <siaf-table-controls [showSelection]="false"
                  [page]="page"
                  [pageSize]="pageSize"
                  [totalItems]="totalItems"
                  [totalPages]="totalPages"
                  (previous)="previousPage.emit()"
                  (next)="nextPage.emit()"
                />
              </div>
            }

            @if (customTable) {
              <div class="mt-siaf-md">
                <ng-content />
              </div>
            } @else {
            <div class="mt-siaf-md siaf-sidepanel-table-scroll">
              <table class="w-full border-collapse text-left text-sm" [ngClass]="tableMinWidthClass">
                <thead>
                  <tr class="h-10 bg-[var(--sys-color-bg-surfaces-surface-high)] text-xs font-bold uppercase text-text">
                    <th class="w-12 rounded-l-siaf-sm px-siaf-sm"></th>
                    @for (col of columns; track col.key; let last = $last) {
                      <th
                        class="px-siaf-md py-siaf-sm"
                        [class.rounded-r-siaf-sm]="last"
                        [ngClass]="col.widthClass || ''"
                      >
                        {{ col.label }}
                      </th>
                    }
                  </tr>
                </thead>
                <tbody>
                  @for (row of rows; track rowId(row)) {
                    <tr
                      class="h-12 border-b border-[var(--sys-color-divider-default)] text-[var(--sys-color-text-neutral-medium)]"
                      [class.cursor-pointer]="!isDisabled(rowId(row))"
                      [class.hover:bg-surface-muted]="!isDisabled(rowId(row))"
                      [class.cursor-not-allowed]="isDisabled(rowId(row))"
                      [class.opacity-50]="isDisabled(rowId(row))"
                      [class.bg-[var(--sys-color-bg-states-light-selected)]]="isSelected(rowId(row))"
                      (click)="onRowClick(rowId(row))"
                    >
                      <td class="px-siaf-sm" (click)="$event.stopPropagation()">
                        @if (mode === 'single') {
                          <input
                            class="size-4 accent-brand-primary disabled:cursor-not-allowed"
                            type="radio"
                            name="selection-side-nav-radio"
                            [checked]="isSelected(rowId(row))"
                            [disabled]="isDisabled(rowId(row))"
                            [attr.aria-label]="'Seleccionar fila'"
                            (change)="selectSingle(rowId(row))"
                          />
                        } @else {
                          <input
                            class="size-4 accent-brand-primary disabled:cursor-not-allowed"
                            type="checkbox"
                            [checked]="isSelected(rowId(row))"
                            [disabled]="isDisabled(rowId(row))"
                            [attr.aria-label]="'Seleccionar fila'"
                            (change)="toggleMultiple(rowId(row))"
                          />
                        }
                      </td>
                      @for (col of columns; track col.key) {
                        <td class="px-siaf-md py-siaf-sm" [ngClass]="col.cellClass || ''">
                          {{ cellValue(row, col) }}
                        </td>
                      }
                    </tr>
                  } @empty {
                    <tr>
                      <td [attr.colspan]="columns.length + 1" class="px-siaf-md py-siaf-lg text-center text-text-muted">
                        {{ emptyMessage }}
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
            }

            @if (paginated) {
              <div class="mt-siaf-md">
                <siaf-pagination
                  navigation="Activate"
                  position="Bottom"
                  [rowPage]="showRowsPerPage"
                  [page]="page"
                  [pageSize]="pageSize"
                  [totalItems]="totalItems"
                  [totalPages]="totalPages"
                  [rowsPerPage]="rowsPerPage"
                  [rowsPerPageOptions]="rowsPerPageOptions"
                  (previous)="previousPage.emit()"
                  (next)="nextPage.emit()"
                  (rowsPerPageChange)="rowsPerPageChange.emit($event)"
                />
              </div>
            }
          </div>

          <footer class="flex shrink-0 items-center justify-end gap-siaf-xs px-siaf-md py-siaf-sm">
            <siaf-button variant="secondary" (click)="onCancel()">{{ cancelLabel }}</siaf-button>
            <siaf-button
              variant="primary"
              [disabled]="acceptDisabled()"
              (click)="onAccept()"
            >
              {{ acceptLabel }}
            </siaf-button>
          </footer>
        </aside>
      </section>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectionSideNavComponent<T = Record<string, unknown>> implements OnChanges {
  /** Render animado del panel (entrada/salida por la derecha, 300ms). */
  readonly anim = new SidePanelAnimacion();

  ngOnChanges(changes: SimpleChanges): void {
    if ('open' in changes) this.anim.actualizar(this.open);
  }

  /** Si está abierto. Cuando se pasa a false el componente no renderiza nada. */
  @Input() open = false;
  /** Título mostrado en el header (también usado para aria-labels). */
  @Input() title = '';
  /** 'single' (radio) o 'multiple' (checkbox). */
  @Input() mode: SelectionMode = 'single';
  /** Filas a renderizar. Ya filtradas por el padre. */
  @Input() rows: T[] = [];
  /** Columnas a mostrar. */
  @Input() columns: SelectionColumn<T>[] = [];
  /** Propiedad de cada fila que la identifica unívocamente. Default: 'id'. */
  @Input() idKey = 'id';
  /** Valor actual del buscador (controlado por el padre). */
  @Input() searchValue = '';
  /** Placeholder/aria del buscador. */
  @Input() searchPlaceholder = 'Buscar';
  /** Ids actualmente seleccionados (temporal — todavía no se aplicó). */
  @Input() selectedIds: string[] = [];
  /** Ids no seleccionables (fila atenuada, checkbox/radio deshabilitado). */
  @Input() disabledIds: string[] = [];
  /** Texto en la tabla cuando no hay filas. */
  @Input() emptyMessage = 'No se encontraron resultados.';
  /** Clase de ancho mínimo para la tabla (p.ej. `min-w-[1700px]`) para habilitar scroll horizontal. */
  @Input() tableMinWidthClass = '';
  /**
   * Escape hatch para casos que no encajan en la tabla declarativa (p.ej.
   * estructuras jerárquicas con grupos expandibles). Cuando es true, en vez
   * de la tabla auto-generada se proyecta el contenido del componente
   * (`<ng-content>`). El shell (overlay, header, búsqueda, paginación,
   * footer) se mantiene; `columns`/`rows` se ignoran. La selección la maneja
   * el padre; usa `selectedIds` para controlar el disabled de Aceptar.
   */
  @Input() customTable = false;
  /** Si Aceptar exige al menos 1 selección. Default: true. */
  @Input() requireSelection = true;
  /** Etiquetas de botones (i18n-friendly). */
  @Input() cancelLabel = 'Cancelar';
  @Input() acceptLabel = 'Aceptar';

  /**
   * Activa la paginación. Cuando es true, las `rows` que recibe ya están
   * paginadas por el padre; el componente solo renderiza los controles
   * `siaf-pagination` y emite los eventos de navegación.
   */
  @Input() paginated = false;
  /** Muestra también una barra de paginación arriba de la tabla. */
  @Input() showTopPagination = false;
  /** Muestra el selector de filas por página en la barra inferior. */
  @Input() showRowsPerPage = true;
  /** Página actual (1-based). */
  @Input() page = 1;
  /** Total de páginas. */
  @Input() totalPages = 1;
  /** Tamaño de página. */
  @Input() pageSize = 10;
  /** Total de items (sin paginar). */
  @Input() totalItems = 0;
  /** Filas por página seleccionadas. */
  @Input() rowsPerPage = 10;
  /** Opciones del selector de filas por página. */
  @Input() rowsPerPageOptions: number[] = [10, 25, 50, 100];

  /**
   * Solo en `mode='multiple'`. Renderiza `siaf-table-controls` arriba de la
   * tabla (en vez de la paginación superior) con un checkbox de
   * "seleccionar todo", estado indeterminado y contador de seleccionados.
   * La lógica de qué se considera "todo seleccionado" la decide el padre.
   */
  @Input() showSelectAll = false;
  /** Estado del checkbox "seleccionar todo" (lo controla el padre). */
  @Input() selectAllChecked = false;
  /** Estado indeterminado del checkbox "seleccionar todo". */
  @Input() selectAllIndeterminate = false;
  /** Etiqueta del checkbox "seleccionar todo". */
  @Input() selectAllLabel = 'Seleccionar filas';

  /** El padre actualiza el `searchValue`. */
  @Output() searchChange = new EventEmitter<string>();
  /** Emite cada vez que cambia la selección temporal (radio o check). */
  @Output() selectionChange = new EventEmitter<string[]>();
  /** Click en X / backdrop / Cancelar. */
  @Output() closed = new EventEmitter<void>();
  /** Click en Aceptar. Emite los ids seleccionados — el padre decide si cierra. */
  @Output() accepted = new EventEmitter<string[]>();

  /** Navegación de paginación: página anterior. */
  @Output() previousPage = new EventEmitter<void>();
  /** Navegación de paginación: página siguiente. */
  @Output() nextPage = new EventEmitter<void>();
  /** Cambio de filas por página. */
  @Output() rowsPerPageChange = new EventEmitter<number>();

  /** Toggle del checkbox "seleccionar todo" (true = marcar, false = desmarcar). */
  @Output() selectAllChange = new EventEmitter<boolean>();

  isSelected(id: string): boolean {
    return this.selectedIds.includes(id);
  }

  isDisabled(id: string): boolean {
    return this.disabledIds.includes(id);
  }

  rowId(row: T): string {
    return String((row as Record<string, unknown>)[this.idKey] ?? '');
  }

  cellValue(row: T, col: SelectionColumn<T>): string {
    if (col.render) return col.render(row);
    const v = (row as Record<string, unknown>)[col.key];
    return v == null ? '' : String(v);
  }

  acceptDisabled = (): boolean => this.requireSelection && this.selectedIds.length === 0;

  onRowClick(id: string): void {
    if (this.isDisabled(id)) return;
    if (this.mode === 'single') {
      this.selectSingle(id);
    } else {
      this.toggleMultiple(id);
    }
  }

  selectSingle(id: string): void {
    if (this.isDisabled(id)) return;
    this.selectionChange.emit([id]);
  }

  toggleMultiple(id: string): void {
    if (this.isDisabled(id)) return;
    const next = this.selectedIds.includes(id)
      ? this.selectedIds.filter(x => x !== id)
      : [...this.selectedIds, id];
    this.selectionChange.emit(next);
  }

  onCancel(): void {
    this.closed.emit();
  }

  onCloseRequested(): void {
    this.closed.emit();
  }

  onAccept(): void {
    this.accepted.emit(this.selectedIds);
  }
}
