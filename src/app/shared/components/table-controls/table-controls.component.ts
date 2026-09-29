import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { IconComponent } from '../../ui/icon/icon.component';
import { PaginationComponent } from '../pagination/pagination.component';

/**
 * Barra superior estándar de las grillas: checkbox de seleccionar todo (con estado indeterminado), acciones sobre las
 * filas elegidas y, a la derecha, `siaf-pagination` en posición `Top`.
 *
 * Las acciones (editar, eliminar, exportar, más opciones y las que la página proyecta con el atributo `tableAction`)
 * solo aparecen con `selectedCount` mayor que 0, cada una encendida con `showEditAction`, `showDeleteAction`,
 * `showExportAction` o `showMenuAction`. Con `[showSelection]="false"` queda solo la paginación.
 *
 * @usar
 * - Arriba de toda grilla, siempre: bandeja, pestañas Documentos / Registros, panel lateral de selección y tablas de
 *   solicitudes, consultas, Admin y Apertura contable.
 * - En edición, con `[showSelection]="!isReadOnly"` y las acciones que correspondan (p. ej. `showEditAction` con
 *   `editDisabled` si hay más de una fila elegida); en consulta, con `[showSelection]="false"`.
 * - Para una acción extra sobre la selección: proyectarla con `tableAction` (Libros contables proyecta un
 *   `siaf-icon-dropdown-menu` «Descargar la selección»).
 * @evitar
 * - Armar la barra a mano con un checkbox y `siaf-pagination` en `Top`: esa paginación solo vive dentro de este
 *   componente.
 * - Para la paginación de abajo: `siaf-pagination` con `position="Bottom"` y `rowPage`.
 * - Para acciones que no dependen de la selección (crear, exportar todo): van en la cabecera de la sección con
 *   `siaf-button` o `siaf-icon-dropdown-menu`; aquí solo aparecen con filas elegidas.
 * @teclado
 * - **Tab**: recorre el checkbox de seleccionar todo, las acciones visibles y las flechas de la paginación.
 * - **Espacio**: marca o desmarca el checkbox (nativo) y emite `selectionChange`.
 * - **Enter / Espacio**: ejecutan la acción enfocada. Las flechas siguen `siaf-pagination` y las acciones proyectadas,
 *   su componente.
 * @accesibilidad
 * - **4.1.2 Nombre, función y valor (A)**: checkbox nativo con `aria-label` (`selectAllLabel`, «Seleccionar filas» por
 *   defecto) y estado mixto con `indeterminate`; las acciones son `<button>` con `aria-label` (`editLabel`,
 *   `deleteLabel`, `exportLabel` y `menuLabel`, este «Mas opciones» sin tilde) y `editDisabled` usa `disabled`.
 * - **Pendiente · 4.1.3 Mensajes de estado (AA)**: el contador de la paginación superior no se anuncia al cambiar de
 *   página o filtrar (lo hereda de `siaf-pagination`), y tampoco hay aviso de cuántas filas quedan elegidas.
 * - **Pendiente · 2.4.3 Orden del foco (A)**: las acciones solo existen con filas elegidas: si una deja la selección
 *   en 0 (p. ej. Eliminar), su botón enfocado desaparece y el foco no pasa a otro control.
 * - **1.4.11 Contraste no textual (AA)**: borde del checkbox en `icon-states-enabled` (8.70:1 / 12.87:1; marcado, en
 *   `icon-states-active`, 8.79:1 / 10.15:1) e íconos de acción en `text-neutral-low` (5.01:1 / 8.86:1).
 * - **2.4.7 Foco visible (AA)**: sin estilo propio: el checkbox y los botones muestran el anillo nativo del navegador;
 *   las flechas, el de `siaf-pagination`.
 * - **2.5.8 Tamaño del objetivo (AA)**: el `<label>` del checkbox y cada acción miden 40 × 40 px.
 */
@Component({
  selector: 'siaf-table-controls',
  standalone: true,
  imports: [IconComponent, PaginationComponent],
  template: `
    <div class="flex min-h-10 items-center gap-siaf-md">
      @if (showSelection) {
        <label class="inline-flex h-10 w-10 shrink-0 items-center px-siaf-sm">
          <input
            class="size-4 accent-[var(--sys-color-icon-states-enabled)]"
            type="checkbox"
            [attr.aria-label]="selectAllLabel"
            [checked]="checked"
            [indeterminate]="indeterminate"
            [disabled]="disabled"
            (change)="selectionChange.emit(checkedValue($event))"
          />
        </label>
      }

      @if (selectedCount > 0 && showEditAction) {
        <button
          class="inline-flex size-10 items-center justify-center rounded-siaf-md text-text-muted transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
          type="button"
          [attr.aria-label]="editLabel"
          [disabled]="editDisabled"
          (click)="edit.emit()"
        >
          <siaf-icon name="edit" [size]="24" />
        </button>
      }

      @if (selectedCount > 0 && showDeleteAction) {
        <button
          class="inline-flex size-10 items-center justify-center rounded-siaf-md text-text-muted transition hover:bg-surface-muted"
          type="button"
          [attr.aria-label]="deleteLabel"
          (click)="delete.emit()"
        >
          <siaf-icon name="delete" [size]="24" />
        </button>
      }

      @if (selectedCount > 0 && showExportAction) {
        <button
          class="inline-flex size-10 items-center justify-center rounded-siaf-md text-text-muted transition hover:bg-surface-muted"
          type="button"
          [attr.aria-label]="exportLabel"
          (click)="exported.emit()"
        >
          <siaf-icon name="download" [size]="24" />
        </button>
      }

      @if (selectedCount > 0 && showMenuAction) {
        <button class="inline-flex size-10 items-center justify-center rounded-siaf-md text-text-muted transition hover:bg-surface-muted" type="button" [attr.aria-label]="menuLabel" (click)="menu.emit()">
          <siaf-icon name="more_vert" [size]="24" />
        </button>
      }

      @if (selectedCount > 0) {
        <!-- Acciones extra proyectadas por la página (ej. siaf-icon-dropdown-menu) -->
        <ng-content select="[tableAction]" />
      }

      <div class="ml-auto min-w-[220px]" [class.hidden]="hideTopPaginationOnMobile" [class.md:block]="hideTopPaginationOnMobile">
        <siaf-pagination navigation="Activate" position="Top" [page]="page" [pageSize]="pageSize" [totalItems]="totalItems" [totalPages]="totalPages" (previous)="previous.emit()" (next)="next.emit()" />
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableControlsComponent {
  @Input() checked = false;
  @Input() indeterminate = false;
  @Input() selectedCount = 0;
  @Input() disabled = false;
  @Input() page = 1;
  @Input() pageSize = 10;
  @Input() totalItems = 0;
  @Input() totalPages = 1;
  @Input() showEditAction = false;
  @Input() showDeleteAction = false;
  @Input() showExportAction = false;
  @Input() showMenuAction = false;
  @Input() showSelection = true;
  @Input() editDisabled = false;
  @Input() hideTopPaginationOnMobile = false;
  @Input() selectAllLabel = 'Seleccionar filas';
  @Input() editLabel = 'Editar fila seleccionada';
  @Input() deleteLabel = 'Eliminar filas seleccionadas';
  @Input() exportLabel = 'Exportar filas seleccionadas';
  @Input() menuLabel = 'Mas opciones';

  @Output() selectionChange = new EventEmitter<boolean>();
  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
  @Output() exported = new EventEmitter<void>();
  @Output() menu = new EventEmitter<void>();
  @Output() previous = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();

  checkedValue(event: Event): boolean {
    return (event.target as HTMLInputElement).checked;
  }
}
