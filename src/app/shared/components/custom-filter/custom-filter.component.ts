import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

import { ButtonComponent } from '../../ui/button/button.component';
import { IconComponent } from '../../ui/icon/icon.component';
import { TextFieldComponent, TextFieldOption } from '../../ui/text-field/text-field.component';
import { FocoDirective } from '../../ui/foco/foco.directive';

export interface FilterRow {
  campo: string;
  condicion: string;
  valor: string;
}

export interface CustomFilterApplyEvent {
  filters: FilterRow[];
}

/**
 * Panel de filtros personalizados: filas de condición con los selects Campo, Condición y Valor (`siaf-input`) que se
 * agregan o quitan; cambiar el Campo vacía la Condición y el Valor, e `initialRows` precarga las filas al editar un
 * filtro ya aplicado.
 *
 * `aplicar` emite solo las filas completas, `cancelar` las limpia y, con `deleteEnabled`, quitar la única fila emite
 * `eliminar`. Solo pinta el contenido: el padre lo abre como panel flotante y lo cierra.
 *
 * @usar
 * - Para el panel «Agregar filtro» de la bandeja y de las pestañas Documentos / Registros
 *   (`siaf-documents-records-page`): cada filtro aplicado queda como un chip que se puede reabrir.
 * - Para editar ese chip: abrirlo con `initialRows` y `[deleteEnabled]="true"`, así quitar la única condición elimina
 *   el filtro.
 * - Cuando el criterio combina un campo, una condición (Es igual a, Contiene) y un valor elegido de una lista.
 * @evitar
 * - Para filtrar por un solo campo con pocas opciones (Estado, Tipo de acción): `siaf-filter-pill`.
 * - Para buscar texto libre: `siaf-form-table-search` (en Documentos y registros y la bandeja, su variante
 *   `siaf-records-search-toolbar`).
 * - Para mostrar los criterios ya aplicados en Consultas y reportes: `siaf-consultas-filtros-chips`.
 * @teclado
 * - **Tab**: al abrirse, el foco entra en el primer campo; recorre fila por fila los selects Campo, Condición y Valor y
 *   la papelera; después «Agregar condición», Aplicar (habilitado solo con una fila completa) y Cancelar.
 * - **Enter / Espacio**: en «Agregar condición» suman una fila; en la papelera la quitan (con `deleteEnabled` y una
 *   sola fila, emiten `eliminar`).
 * - Los selects siguen `siaf-input` y Aplicar / Cancelar, `siaf-button`.
 * - **Escape**: emite `cancelar` para que el padre cierre el panel; el foco vuelve al botón que lo abrió. Con la lista
 *   de un select abierta, Escape cierra solo la lista.
 * @accesibilidad
 * - **Pendiente · 1.3.1 Información y relaciones (A)**: el título «Agregar filtros personalizados» es un `<span>`, no
 *   un encabezado, y las filas no se agrupan (`fieldset` o `role="group"`): con varias condiciones se repiten «Campo»,
 *   «Condición», «Valor» y «Eliminar condicion» sin decir de qué fila son.
 * - **4.1.2 Nombre, función y valor (A)**: los selects de `siaf-input` publican `aria-haspopup="listbox"` y
 *   `aria-expanded`; la papelera es un `<button>` con `aria-label` («Eliminar condicion», sin tilde) y Aplicar usa
 *   `disabled`.
 * - **Pendiente · 2.4.3 Orden del foco (A)**: con `siafFoco` (sin atrapar Tab) el foco entra al abrirse y vuelve al
 *   botón que lo abrió al cerrarse, pero al agregar una condición el foco no pasa a la fila nueva y, al quitar la fila
 *   final, su papelera desaparece sin mover el foco.
 * - **3.3.2 Etiquetas o instrucciones (A)**: cada select muestra su etiqueta (Campo, Condición, Valor); no hay texto
 *   que diga que Aplicar necesita una fila completa.
 * - **1.4.3 Contraste mínimo (AA)**: título `text-neutral-medium` (14.53:1 / 12.87:1), «Agregar condición»
 *   `text-neutral-high` (16.29:1 / 16.53:1) y papelera `text-neutral-low` (5.01:1 / 8.86:1) sobre la superficie.
 * - **Pendiente · 1.4.11 Contraste no textual (AA)**: los selects heredan de `siaf-input` el borde
 *   `border-states-enabled` (2.44:1 / 2.59:1) mientras no tienen foco ni valor.
 * - **2.4.7 Foco visible (AA)**: «Agregar condición» y la papelera muestran un contorno de 2 px del color de su texto
 *   (`focus-visible:outline-2`); los selects y los botones, el de su componente.
 * - **2.5.8 Tamaño del objetivo (AA)**: papelera de 32 px, «Agregar condición» de unos 28 px de alto y Aplicar /
 *   Cancelar de 32 px (`siaf-button` en `sm`).
 */
@Component({
  selector: 'siaf-custom-filter',
  standalone: true,
  imports: [FocoDirective, ButtonComponent, IconComponent, TextFieldComponent],
  template: `
    <div class="flex max-h-[calc(100vh-96px)] flex-col gap-siaf-md overflow-y-auto rounded-siaf-md bg-surface p-siaf-md shadow-siaf-elevation-1 sm:max-h-none sm:overflow-visible" siafFoco [siafFocoAtrapar]="false" (siafFocoEscape)="cancelar.emit()">
      <div class="flex flex-col gap-siaf-md">
        <span class="text-sm font-bold text-[var(--sys-color-text-neutral-medium)]">Agregar filtros personalizados</span>

        @for (row of rows; track $index; let i = $index) {
          <div class="flex items-start gap-siaf-sm">
            <div class="grid min-w-0 flex-1 grid-cols-1 gap-siaf-xs sm:grid-cols-3">
              <div class="min-w-0">
                <siaf-input
                  label="Campo"
                  type="select"
                  [options]="campoOptions"
                  [value]="row.campo"
                  (valueChange)="onCampoChange(i, $event)"
                />
              </div>
              <div class="min-w-0">
                <siaf-input
                  label="Condici&oacute;n"
                  type="select"
                  [options]="condicionOptions"
                  [value]="row.condicion"
                  (valueChange)="onCondicionChange(i, $event)"
                />
              </div>
              <div class="min-w-0">
                <siaf-input
                  label="Valor"
                  type="select"
                  [options]="valorOptions"
                  [value]="row.valor"
                  (valueChange)="onValorChange(i, $event)"
                />
              </div>
            </div>
            <button
              class="mt-1 inline-flex size-8 shrink-0 items-center justify-center rounded-siaf-md p-siaf-xxs text-text-muted transition hover:bg-surface-muted hover:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-40"
              type="button"
              aria-label="Eliminar condicion"
              (click)="removeRow(i)"
            >
              <siaf-icon name="delete_outline" [size]="20" />
            </button>
          </div>
        }

        <div>
          <button
            class="inline-flex items-center gap-siaf-xs rounded-siaf-md px-siaf-md py-siaf-xxs text-sm font-medium text-text transition hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            type="button"
            (click)="addRow()"
          >
            <siaf-icon name="add" [size]="20" />
            Agregar condici&oacute;n
          </button>
        </div>

        <div class="flex flex-row flex-wrap items-center gap-siaf-sm">
          <siaf-button
            variant="primary"
            size="sm"
            [disabled]="!canApply"
            (click)="onAplicar()"
          >
            Aplicar
          </siaf-button>
          <siaf-button
            variant="secondary"
            size="sm"
            (click)="onCancelar()"
          >
            Cancelar
          </siaf-button>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomFilterComponent implements OnChanges {
  @Input() campoOptions: TextFieldOption[] = [];
  @Input() condicionOptions: TextFieldOption[] = [];
  @Input() valorOptions: TextFieldOption[] = [];
  @Input() initialRows: FilterRow[] = [];
  @Input() deleteEnabled = false;

  @Output() aplicar = new EventEmitter<CustomFilterApplyEvent>();
  @Output() cancelar = new EventEmitter<void>();
  @Output() eliminar = new EventEmitter<void>();

  rows: FilterRow[] = [{ campo: '', condicion: '', valor: '' }];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialRows']) {
      this.rows = this.initialRows.length > 0
        ? this.initialRows.map((row) => ({ ...row }))
        : [{ campo: '', condicion: '', valor: '' }];
    }
  }

  get canApply(): boolean {
    return this.rows.some((r) => r.campo && r.condicion && r.valor);
  }

  addRow(): void {
    this.rows = [...this.rows, { campo: '', condicion: '', valor: '' }];
  }

  removeRow(index: number): void {
    if (this.deleteEnabled && this.rows.length === 1) {
      this.eliminar.emit();
      return;
    }

    const updated = this.rows.filter((_, i) => i !== index);
    this.rows = updated.length > 0 ? updated : [{ campo: '', condicion: '', valor: '' }];
  }

  onCampoChange(index: number, value: string | number | string[]): void {
    this.rows = this.rows.map((r, i) => (i === index ? { ...r, campo: String(value), condicion: '', valor: '' } : r));
  }

  onCondicionChange(index: number, value: string | number | string[]): void {
    this.rows = this.rows.map((r, i) => (i === index ? { ...r, condicion: String(value) } : r));
  }

  onValorChange(index: number, value: string | number | string[]): void {
    this.rows = this.rows.map((r, i) => (i === index ? { ...r, valor: String(value) } : r));
  }

  onAplicar(): void {
    this.aplicar.emit({ filters: this.rows.filter((r) => r.campo && r.condicion && r.valor) });
  }

  onCancelar(): void {
    this.rows = [{ campo: '', condicion: '', valor: '' }];
    this.cancelar.emit();
  }

}
