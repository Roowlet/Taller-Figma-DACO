import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { DataTableColumn, DataTableComponent, DataTableRow } from '../../components/data-table/data-table.component';

/**
 * Envoltorio mínimo sobre `siaf-data-table`: tabla de columnas y filas, sin selección ni paginación.
 *
 * Úsalo para listados simples. Cuando la tabla necesita barra superior o paginado, va la grilla
 * estándar: `siaf-table-controls` arriba (siempre, con `[showSelection]=false` si no hay selección)
 * y `siaf-pagination Bottom` abajo.
 *
 * @usar
 * - Para un listado corto de solo lectura con columnas de texto (número, documento, estado como texto) dentro de una
 *   tarjeta o un panel.
 * - Hoy ninguna pantalla la usa: es la opción del kit antes de escribir otra `<table>` a mano.
 * @evitar
 * - Para enlace al documento, tags de estado, checkbox o historial por fila: `siaf-documents-records-table`.
 * - Para paginar o seleccionar: no lo hace; va la grilla estándar alrededor (`siaf-table-controls` arriba y
 *   `siaf-pagination` con `position="Bottom"` y `rowPage` abajo).
 * - Para ítems sin columnas (título, descripción, ícono): `siaf-list`.
 * @teclado
 * - No recibe foco: no es interactiva. El scroll es el de `siaf-data-table`, sin `tabindex`.
 * @accesibilidad
 * - **1.3.1 Información y relaciones (A)**: pinta `siaf-data-table`: `<table>` con `<thead>` y un `<th>` por columna.
 *   No admite `<caption>` ni `ariaLabel` (el padre debe titularla con un encabezado cercano) y no ordena columnas,
 *   así que no aplica `aria-sort`.
 * - **1.4.3 Contraste mínimo (AA)**: celdas en `text-neutral-high` sobre la superficie (16.29:1 / 16.53:1).
 */
@Component({
  selector: 'siaf-table',
  standalone: true,
  imports: [DataTableComponent],
  template: `<siaf-data-table [columns]="columns" [rows]="rows" [idKey]="idKey" />`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableComponent {
  @Input({ required: true }) columns: DataTableColumn[] = [];
  @Input({ required: true }) rows: DataTableRow[] = [];
  @Input() idKey = 'id';
}
