import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/**
 * Skeleton loader para tablas. Renderiza filas y columnas con animación de pulso
 * para indicar al usuario que el contenido está cargando.
 *
 * @usar
 * - Mientras cargan las filas de una grilla: `siaf-documents-records-page` la pinta en lugar de la tabla, con las
 *   columnas visibles y las filas por página.
 * - Al abrir una solicitud de carga masiva de cuentas contables, mientras llega el detalle, con un `ariaLabel` que
 *   dice qué se carga.
 * @evitar
 * - Para esperas que no son una tabla (procesar un archivo, grabar): `siaf-loader`, `siaf-loader-overlay` o
 *   `siaf-loading-progress`.
 * - Cuando la consulta ya respondió sin filas: `siaf-empty-state` o `empty-section`.
 * - Con columnas o ancho distintos de la tabla real: pasar los mismos `columns` y `minWidthClass` para que la
 *   pantalla no salte al terminar.
 * @teclado
 * - No recibe foco: no es interactivo.
 * @accesibilidad
 * - **4.1.3 Mensajes de estado (AA)**: el contenedor es `role="status"` con `aria-live="polite"` y repite `ariaLabel`
 *   en un texto `sr-only` («Cargando contenido de la tabla» por defecto); el padre debe pasar uno que diga qué se
 *   carga. El fin de la carga no se anuncia: le toca a la grilla.
 * - **Pendiente · 1.3.1 Información y relaciones (A)**: la tabla de barras no lleva `aria-hidden`: dentro del mensaje
 *   de carga el lector puede encontrar una tabla con cabeceras `<th>` vacías.
 */
@Component({
  selector: 'siaf-table-skeleton',
  standalone: true,
  imports: [NgClass],
  template: `
    <div class="siaf-table-scroll min-w-0" role="status" aria-live="polite" [attr.aria-label]="ariaLabel">
      <span class="sr-only">{{ ariaLabel }}</span>
      <table class="w-full border-collapse text-left text-sm" [class.min-w-full]="!minWidthClass" [ngClass]="minWidthClass">
        <thead>
          <tr class="h-10 bg-[var(--sys-color-bg-surfaces-surface-low)]">
            @for (col of columnsArray; track $index) {
              <th class="px-siaf-md py-siaf-sm">
                <div class="h-3 w-24 animate-pulse rounded bg-[var(--sys-color-bg-surfaces-surface-low)]"></div>
              </th>
            }
          </tr>
        </thead>
        <tbody>
          @for (row of rowsArray; track $index) {
            <tr class="h-12 border-b border-[var(--sys-color-divider-default)] bg-surface">
              @for (col of columnsArray; track $index) {
                <td class="px-siaf-md py-siaf-sm">
                  <div
                    class="h-3 animate-pulse rounded bg-[var(--sys-color-bg-surfaces-surface-low)]"
                    [style.width.%]="cellWidth($index)"
                  ></div>
                </td>
              }
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    @keyframes siaf-skeleton-pulse {
      0%, 100% { opacity: 0.5; }
      50% { opacity: 0.85; }
    }
    .animate-pulse {
      animation: siaf-skeleton-pulse 1.5s ease-in-out infinite;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableSkeletonComponent {
  @Input() columns = 9;
  @Input() rows = 6;
  @Input() minWidthClass = '';
  @Input() ariaLabel = 'Cargando contenido de la tabla';

  get columnsArray(): number[] {
    return Array.from({ length: this.columns });
  }

  get rowsArray(): number[] {
    return Array.from({ length: this.rows });
  }

  cellWidth(index: number): number {
    // Varía el ancho de las barras para un look más natural
    const widths = [70, 50, 80, 65, 55, 75, 60, 85, 45];
    return widths[index % widths.length];
  }
}
