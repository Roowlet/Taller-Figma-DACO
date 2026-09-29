import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export interface DataTableColumn {
  key: string;
  label: string;
}

export type DataTableRow = Record<string, string | number>;

/**
 * Tabla de solo lectura: una cabecera con las `columns` y una fila por registro con el texto de cada celda
 * (`row[column.key]`); `idKey` identifica las filas.
 *
 * Usa las clases globales `siaf-table-*` (cabecera fija y scroll con alto máximo de 480 px, 320 px en móvil). No
 * selecciona, no ordena ni pagina; `siaf-table` la envuelve con la misma API.
 *
 * @usar
 * - Para un listado corto de solo lectura con texto plano en cada celda (número, documento, estado como texto), sin
 *   acciones por fila.
 * - Hoy solo la pinta `siaf-table`, que ninguna pantalla usa: es la base para un listado nuevo antes de escribir otra
 *   `<table>` a mano.
 * @evitar
 * - Para celdas con enlace al documento, tag de estado, checkbox o historial: `siaf-documents-records-table`.
 * - Para seleccionar o paginar: no lo hace sola; va dentro de la grilla estándar (`siaf-table-controls` arriba y
 *   `siaf-pagination` con `position="Bottom"` y `rowPage` abajo).
 * - Para ítems sin columnas (título, descripción, ícono): `siaf-list`.
 * @teclado
 * - No recibe foco: no es interactiva. Si las filas pasan el alto máximo, el contenedor con scroll no lleva
 *   `tabindex`: desplazarlo con el teclado depende del navegador.
 * @accesibilidad
 * - **1.3.1 Información y relaciones (A)**: `<table>` con `<thead>`, `<tbody>` y un `<th>` por columna (sin `scope`,
 *   que con una sola fila de cabecera no hace falta). No admite `<caption>` ni `ariaLabel`: el padre debe titularla
 *   con un encabezado cercano. No ordena columnas, así que no aplica `aria-sort`.
 * - **1.4.3 Contraste mínimo (AA)**: celdas en `text-neutral-high` sobre la superficie (16.29:1 / 16.53:1); la
 *   cabecera, en `text-neutral-high` sobre `bg-surfaces-surface-high` (más que `text-neutral-medium` en ese fondo,
 *   11.46:1 / 11.39:1).
 */
@Component({
  selector: 'siaf-data-table',
  standalone: true,
  template: `
    <div class="siaf-table-shell">
      <table class="siaf-table">
        <thead>
          <tr class="siaf-table-head-row">
            @for (column of columns; track column.key) {
              <th class="siaf-table-th">{{ column.label }}</th>
            }
          </tr>
        </thead>
        <tbody>
          @for (row of rows; track row[idKey]) {
            <tr class="siaf-table-row">
              @for (column of columns; track column.key) {
                <td class="siaf-table-td">{{ row[column.key] }}</td>
              }
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataTableComponent {
  @Input({ required: true }) columns: DataTableColumn[] = [];
  @Input({ required: true }) rows: DataTableRow[] = [];
  @Input() idKey = 'id';
}
