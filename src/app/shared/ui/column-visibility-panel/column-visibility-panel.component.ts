import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import type { DocumentsRecordsColumn } from '../../types/documents-records.types';
import { ButtonComponent } from '../button/button.component';
import { IconComponent } from '../icon/icon.component';
import { FocoDirective } from '../foco/foco.directive';

/**
 * Panel lateral modal para mostrar u ocultar columnas de una grilla, agrupadas en
 * Predeterminado / Más columnas / Interno (estas últimas fijas, no desmarcables).
 *
 * Úsalo junto a `siaf-documents-records-table` y sus `DocumentsRecordsColumn`; el
 * componente es controlado (recibe el estado y emite toggles, no decide la visibilidad).
 *
 * @usar
 * - En la bandeja «Documentos y registros» (`siaf-documents-records-page`), desde «Más opciones → Ocultar o mostrar
 *   columnas», para elegir qué columnas se ven en Documentos o en Registros.
 * - En otra grilla con `DocumentsRecordsColumn` cuando el padre guarda un borrador de columnas ocultas y solo lo aplica
 *   con Aplicar (`dirty` habilita el botón).
 * @evitar
 * - Para filtrar filas: usar `siaf-custom-filter`, `siaf-filter-pill` o el buscador de la grilla.
 * - Para elegir registros de un catálogo: usar `siaf-selection-side-nav`.
 * - Para un menú corto de opciones sobre la grilla: usar `siaf-icon-dropdown-menu`.
 * @teclado
 * - **Tab**: al abrir, el foco entra en la X; recorre «Seleccionar todo», las casillas de cada columna y Cancelar /
 *   Aplicar, y da la vuelta sin salir del panel; las de Interno están deshabilitadas y no reciben foco.
 * - **Escape**: cierra el panel (emite `closed`) y el foco vuelve al control que lo abrió.
 * - **Espacio**: marca o desmarca la casilla enfocada (emite `toggleAll` o `toggleColumn`).
 * - **Enter / Espacio**: activan la X y Cancelar (emiten `closed`) y Aplicar (emite `applied`; habilitado solo con
 *   cambios).
 * @accesibilidad
 * - **4.1.2 Nombre, función y valor (A)**: `role="dialog"` con `aria-modal="true"` y `aria-labelledby` al título; la X
 *   se llama «Cerrar» y cada casilla toma su nombre del texto de la columna (`<label>`).
 * - **2.4.3 Orden del foco (A)**: con `siafFoco`, al abrir lleva el foco a la X aunque en la bandeja el panel se pinte
 *   al final de la página, y al cerrar lo devuelve al botón que lo abrió.
 * - **2.1.2 Sin trampas de teclado (A)**: Tab queda dentro mientras está abierto, pero Escape siempre lo cierra.
 * - **1.3.1 Información y relaciones (A)**: título `h2` y los grupos Predeterminado / Más columnas / Interno con `h3`.
 * - **2.4.7 Foco visible (AA)**: sin estilo propio pero sin `outline-none`: la X, Cancelar y las casillas muestran el
 *   anillo nativo del navegador; Aplicar sigue `siaf-button`.
 * - **2.5.8 Tamaño del objetivo (AA)**: cada fila mide 48 px y toda la fila marca la casilla; la X y Cancelar, 40 px.
 * - **1.4.11 Contraste no textual (AA)**: las casillas llevan borde `icon-states-enabled` de 2 px (8.70:1 sobre la
 *   superficie en claro).
 * - **1.4.3 Contraste mínimo (AA)**: título `text-text` sobre `bg-surface` (16.29:1 / 16.53:1); las etiquetas
 *   `text-neutral-medium` van sobre `surface-highest`, que en claro es el blanco de la superficie (14.53:1).
 */
@Component({
  selector: 'siaf-column-visibility-panel',
  standalone: true,
  imports: [FocoDirective, ButtonComponent, IconComponent],
  template: `
    @if (open) {
      <section class="fixed inset-y-0 left-0 right-0 z-50 bg-black/55 pl-0 lg:pl-[65px]" aria-modal="true" role="dialog" aria-labelledby="columns-panel-title" (click)="closed.emit()">
        <aside class="absolute bottom-0 right-0 top-0 flex w-full max-w-[420px] flex-col overflow-hidden bg-surface shadow-siaf-lg" [siafFoco]="open" (siafFocoEscape)="closed.emit()" (click)="$event.stopPropagation()">
          <!-- Sin líneas entre título, contenido y botones, como el resto de los side panels. -->
          <header class="flex h-14 shrink-0 items-center gap-siaf-xs px-siaf-xl">
            <h2 id="columns-panel-title" class="m-0 flex-1 text-base font-bold uppercase tracking-[0.02px] text-text">Ocultar o mostrar columnas</h2>
            <button class="inline-flex size-10 items-center justify-center rounded-siaf-md text-text transition hover:bg-surface-muted active:bg-[var(--sys-color-bg-states-dark-pressed)]" type="button" aria-label="Cerrar" (click)="closed.emit()">
              <siaf-icon name="close" [size]="24" />
            </button>
          </header>

          <div class="min-h-0 flex-1 overflow-y-auto bg-[var(--sys-color-bg-surfaces-surface-highest)] px-siaf-xl py-siaf-md">
            <div class="flex flex-col gap-siaf-lg">
              <label class="flex min-h-12 cursor-pointer items-center gap-siaf-md px-siaf-md py-siaf-sm text-sm uppercase text-[var(--sys-color-text-neutral-medium)]">
                <input class="size-4 accent-[var(--sys-color-icon-states-enabled)]" type="checkbox" [checked]="allSelected" (change)="toggleAll.emit($event)" />
                Seleccionar todo
              </label>
              <section class="grid gap-siaf-xs">
                <h3 class="m-0 px-[18px] text-xs font-normal uppercase text-[var(--sys-color-text-neutral-medium)]">Predeterminado</h3>
                @for (column of defaultColumns; track column.key) {
                  <label class="flex min-h-12 cursor-pointer items-center gap-siaf-md px-siaf-md py-siaf-sm text-sm text-[var(--sys-color-text-neutral-medium)] transition hover:bg-surface-muted">
                    <input class="size-4 accent-[var(--sys-color-icon-states-enabled)]" type="checkbox" [checked]="isColumnVisible(column.key)" (change)="toggleColumn.emit({ key: column.key, event: $event })" />
                    {{ column.label }}
                  </label>
                }
              </section>
              <section class="grid gap-siaf-xs">
                <h3 class="m-0 px-[18px] text-xs font-normal uppercase text-[var(--sys-color-text-neutral-medium)]">Más columnas</h3>
                @for (column of moreColumns; track column.key) {
                  <label class="flex min-h-12 cursor-pointer items-center gap-siaf-md px-siaf-md py-siaf-sm text-sm text-[var(--sys-color-text-neutral-medium)] transition hover:bg-surface-muted">
                    <input class="size-4 accent-[var(--sys-color-icon-states-enabled)]" type="checkbox" [checked]="isColumnVisible(column.key)" (change)="toggleColumn.emit({ key: column.key, event: $event })" />
                    {{ column.label }}
                  </label>
                }
              </section>
              @if (internalColumns.length) {
                <section class="grid gap-siaf-xs">
                  <h3 class="m-0 px-[18px] text-xs font-normal uppercase text-[var(--sys-color-text-neutral-medium)]">Interno</h3>
                  @for (column of internalColumns; track column.key) {
                    <label class="flex min-h-12 items-center gap-siaf-md px-siaf-md py-siaf-sm text-sm text-text-muted">
                      <input class="size-4" type="checkbox" disabled />
                      {{ column.label }}
                    </label>
                  }
                </section>
              }
            </div>
          </div>

          <footer class="flex shrink-0 items-center justify-end gap-siaf-xs px-siaf-md py-siaf-sm">
            <button class="inline-flex min-h-10 items-center justify-center rounded-siaf-md border border-[var(--sys-color-border-states-enabled)] px-siaf-md py-siaf-xs text-sm font-medium text-text transition hover:bg-surface-muted" type="button" (click)="closed.emit()">Cancelar</button>
            <siaf-button variant="primary" size="md" [disabled]="!dirty" (click)="applied.emit()">Aplicar</siaf-button>
          </footer>
        </aside>
      </section>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ColumnVisibilityPanelComponent {
  @Input() open = false;
  @Input() allSelected = false;
  @Input() dirty = false;
  @Input() defaultColumns: DocumentsRecordsColumn[] = [];
  @Input() moreColumns: DocumentsRecordsColumn[] = [];
  @Input() internalColumns: DocumentsRecordsColumn[] = [];
  @Input() isColumnVisible: (columnKey: string) => boolean = () => false;

  @Output() closed = new EventEmitter<void>();
  @Output() applied = new EventEmitter<void>();
  @Output() toggleAll = new EventEmitter<Event>();
  @Output() toggleColumn = new EventEmitter<{ key: string; event: Event }>();
}

