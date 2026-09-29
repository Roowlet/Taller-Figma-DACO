import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

export interface ReportTableColumn {
  key: string;
  label: string;
  /** Grupo de la primera fila de la cabecera («Acreditación»): las columnas contiguas del mismo grupo lo comparten. */
  group?: string;
  /** `right` para importes y cantidades. */
  align?: 'left' | 'right';
  /** Ancho de la columna en px. */
  width?: number;
  /** Queda fija a la derecha al desplazar la tabla (Figma «Fixed»). Solo la última columna. */
  fixed?: boolean;
  /** `link` pinta el valor como enlace y emite `linkClicked` al pulsarlo. */
  kind?: 'text' | 'link';
}

export type ReportTableRow = Record<string, string>;

/** Celda de la primera fila de la cabecera: un grupo que abarca varias columnas o una columna sin grupo. */
interface CeldaCabecera {
  label: string;
  colspan: number;
  /** 2 para una columna sin grupo: ocupa las dos filas de la cabecera. */
  rowspan: 1 | 2;
  align: 'left' | 'right' | 'center';
  width: number | null;
  fixed: boolean;
}

/**
 * Tabla de datos de un reporte (Guía de Estructura de Pantallas, «Tabla de datos detallada»): cabecera gris en dos
 * niveles cuando las columnas tienen `group` (el grupo centrado arriba y cada columna debajo), filas de al menos 48 px
 * que pasan a dos líneas si el texto no entra, importes alineados a la derecha, valores `link` en azul y la última
 * columna fija a la derecha con sombra al desplazar horizontalmente. La cabecera queda fija al desplazar vertical
 * (480 px de alto máximo, 320 px en móvil).
 *
 * No pagina, no filtra ni ordena: recibe las filas de la página visible.
 *
 * @figma 22715:12806 Tabla de datos detallada
 * @usar
 * - En «Resultado de reporte» de `siaf-query-report-page`, con `siaf-pagination` debajo.
 * - Con `group` para reportes anchos con columnas emparentadas (Acreditación: secuencia y fecha; Beneficiario: código y
 *   descripción) y `fixed` en el importe final, para leerlo mientras se desplaza.
 * - `kind: 'link'` en la columna que abre el documento de la fila.
 * @evitar
 * - Para grillas con selección de filas y acciones: usar la grilla estándar (`siaf-table-controls` y
 *   `siaf-pagination`) o `siaf-documents-records-table`.
 * - Para una tabla corta de solo lectura sin grupos: usar `siaf-data-table`.
 * - `fixed` en una columna que no es la última: solo se fija la del extremo derecho.
 * @teclado
 * - **Tab**: entra en la zona desplazable de la tabla (con flechas se desplaza) y luego en cada enlace.
 * - **Enter / Espacio**: en un enlace, emiten `linkClicked` con la fila y la columna.
 * @accesibilidad
 * - **1.3.1 Información y relaciones (A)**: tabla real con `thead`; los grupos son `th scope="colgroup"` y las columnas
 *   `th scope="col"`, así cada celda se anuncia con su grupo y su columna.
 * - **4.1.2 Nombre, función y valor (A)**: la tabla toma su nombre de `ariaLabel`; los enlaces son `button` nativos
 *   con el texto del valor.
 * - **2.1.1 Teclado (A)**: la zona desplazable es `role="region"` con nombre y `tabindex="0"`, para desplazarla con
 *   flechas sin mouse.
 * - **2.4.7 Foco visible (AA)**: la zona y los enlaces muestran el contorno de 2 px `border-states-focus`.
 * - **4.1.3 Mensajes de estado (AA)**: sin filas, el aviso de la tabla es `role="status"`.
 * - **1.4.3 Contraste mínimo (AA)**: cabecera `text-neutral-high` sobre `surface-high` (12.84:1 claro / 14.62:1
 *   oscuro), celdas `text-neutral-medium` (14.53:1 / 12.87:1) y enlaces `text-brand-primary` (8.79:1 / 10.15:1) sobre
 *   la superficie.
 */
@Component({
  selector: 'siaf-report-table',
  standalone: true,
  host: { class: 'block min-w-0' },
  template: `
    <div
      class="siaf-table-scroll rounded-siaf-sm outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sys-color-border-states-focus)]"
      role="region"
      tabindex="0"
      [attr.aria-label]="ariaLabel"
    >
      <table class="w-full min-w-full border-collapse text-left text-sm" [attr.aria-label]="ariaLabel">
        <thead>
          <tr>
            @for (celda of filaSuperior; track $index) {
              <th
                class="h-10 px-siaf-md py-siaf-sm text-xs font-bold uppercase leading-normal text-[var(--sys-color-text-neutral-high)]"
                [class.text-center]="celda.align === 'center'"
                [class.text-right]="celda.align === 'right'"
                [class]="celda.fixed ? claseFijaCabecera : ''"
                [attr.colspan]="celda.colspan > 1 ? celda.colspan : null"
                [attr.rowspan]="celda.rowspan > 1 ? celda.rowspan : null"
                [attr.scope]="celda.rowspan === 2 ? 'col' : 'colgroup'"
                [style.width.px]="celda.width"
                [style.min-width.px]="celda.width"
                data-cabecera-superior
              >
                <span class="block truncate">{{ celda.label }}</span>
              </th>
            }
          </tr>
          @if (hayGrupos) {
            <tr>
              @for (columna of columnasAgrupadas; track columna.key) {
                <th
                  class="h-10 px-siaf-md py-siaf-sm text-xs font-bold uppercase leading-normal text-[var(--sys-color-text-neutral-high)]"
                  [class.text-right]="columna.align === 'right'"
                  [class]="columna.fixed ? claseFijaCabecera : ''"
                  scope="col"
                  [style.width.px]="columna.width ?? null"
                  [style.min-width.px]="columna.width ?? null"
                  data-cabecera-columna
                >
                  <span class="block truncate">{{ columna.label }}</span>
                </th>
              }
            </tr>
          }
        </thead>
        <tbody>
          @for (fila of rows; track trackBy(fila, $index)) {
            <tr class="border-b border-[var(--sys-color-divider-default)] bg-surface">
              @for (columna of columns; track columna.key) {
                <td
                  class="h-12 px-siaf-md py-siaf-sm align-middle text-sm leading-normal tracking-[0.0249px] text-[var(--sys-color-text-neutral-medium)]"
                  [class.text-right]="columna.align === 'right'"
                  [class.whitespace-nowrap]="columna.align === 'right'"
                  [class]="columna.fixed ? claseFija + ' z-[1] bg-surface' : ''"
                  [style.width.px]="columna.width ?? null"
                  [style.min-width.px]="columna.width ?? null"
                >
                  @if (columna.kind === 'link' && fila[columna.key]) {
                    <button
                      class="rounded-siaf-sm text-left font-medium text-[var(--sys-color-text-brand-primary)] underline-offset-2 hover:underline focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sys-color-border-states-focus)]"
                      type="button"
                      (click)="linkClicked.emit({ row: fila, column: columna })"
                    >
                      {{ fila[columna.key] }}
                    </button>
                  } @else {
                    {{ fila[columna.key] }}
                  }
                </td>
              }
            </tr>
          } @empty {
            <tr>
              <td class="px-siaf-md py-siaf-xl text-center text-sm text-[var(--sys-color-text-neutral-medium)]" [attr.colspan]="columns.length || 1" role="status">
                {{ emptyMessage }}
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportTableComponent {
  @Input({ required: true }) columns: readonly ReportTableColumn[] = [];
  /** Filas de la página visible: cada clave de columna con su texto ya formateado. */
  @Input() rows: readonly ReportTableRow[] = [];
  /** Clave que identifica cada fila; sin ella se usa la posición. */
  @Input() rowKey = '';
  /** Nombre de la tabla y de su zona desplazable. */
  @Input() ariaLabel = 'Resultado del reporte';
  @Input() emptyMessage = 'No se encontraron resultados con los filtros aplicados.';

  @Output() linkClicked = new EventEmitter<{ row: ReportTableRow; column: ReportTableColumn }>();

  /**
   * Columna fija a la derecha: sticky con la sombra de elevación 6 del Figma recortada a su borde izquierdo, para que no
   * oscurezca las filas de arriba y de abajo.
   */
  readonly claseFija = 'sticky right-0 shadow-siaf-elevation-6 [clip-path:inset(0_0_0_-16px)]';

  /**
   * En la cabecera, la línea inferior va como sombra interior sobre el fondo opaco: el borde de la tabla es translúcido
   * y dejaba ver, en esa línea, el título de una columna de dos filas que pasa por debajo.
   */
  readonly claseFijaCabecera =
    'sticky right-0 z-[3] border-b-0 shadow-[inset_0_-1px_0_var(--sys-color-divider-strong),var(--sys-shadow-elevation-6)] [clip-path:inset(0_0_0_-16px)]';

  get hayGrupos(): boolean {
    return this.columns.some((c) => !!c.group);
  }

  /** Grupos contiguos en una celda; con grupos, las columnas sueltas ocupan las dos filas. */
  get filaSuperior(): CeldaCabecera[] {
    if (!this.hayGrupos) {
      return this.columns.map((c) => ({ label: c.label, colspan: 1, rowspan: 1, align: c.align ?? 'left', width: c.width ?? null, fixed: !!c.fixed }));
    }
    const celdas: CeldaCabecera[] = [];
    for (let i = 0; i < this.columns.length; i++) {
      const columna = this.columns[i];
      if (!columna.group) {
        celdas.push({ label: columna.label, colspan: 1, rowspan: 2, align: columna.align ?? 'left', width: columna.width ?? null, fixed: !!columna.fixed });
        continue;
      }
      let fin = i;
      while (fin + 1 < this.columns.length && this.columns[fin + 1].group === columna.group) fin++;
      const grupo = this.columns.slice(i, fin + 1);
      const anchos = grupo.map((c) => c.width);
      celdas.push({
        label: columna.group,
        colspan: grupo.length,
        rowspan: 1,
        align: 'center',
        width: anchos.every((a) => typeof a === 'number') ? anchos.reduce((s, a) => s + (a as number), 0) : null,
        fixed: grupo.some((c) => c.fixed),
      });
      i = fin;
    }
    return celdas;
  }

  get columnasAgrupadas(): ReportTableColumn[] {
    return this.columns.filter((c) => !!c.group);
  }

  trackBy(fila: ReportTableRow, indice: number): string | number {
    return this.rowKey && fila[this.rowKey] ? fila[this.rowKey] : indice;
  }
}
