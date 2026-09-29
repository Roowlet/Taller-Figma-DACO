import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

import { IconComponent } from '../../ui/icon/icon.component';
import { TextFieldComponent } from '../../ui/text-field/text-field.component';

/**
 * Buscador de tabla: un `siaf-input` con lupa a todo el ancho y, a la derecha, dos botones de ícono: Filtrar y Más
 * opciones, que emiten `filter` y `more`.
 *
 * Con `variant="reports"` es el buscador de Consultas y reportes (Figma «Guía de Estructura de Pantallas», nodo
 * 22402:16457 «Search for table»): el segundo botón pasa a ser Columnas (`view_column`), que emite `columns`.
 *
 * Escribir solo registra el texto: la búsqueda sale por `valueChange` al pulsar Enter o la lupa, y lo tecleado se
 * descarta si el padre reescribe `value`.
 *
 * Tiene además otra variante, como componente aparte, para Documentos y registros y la Bandeja de Documentos:
 * `siaf-records-search-toolbar`, el mismo campo con las acciones de la derecha proyectadas (los menús Campos, Favorito
 * y Más opciones) en vez de estos dos botones fijos.
 *
 * @usar
 * - Sobre las tablas de las solicitudes (cuentas contables, tipos de asiento, clases de ajuste, asiento de ajuste,
 *   eventos contables) y en el panel lateral de selección (`siaf-selection-side-nav`).
 * - Con `variant="reports"` en Consultas y reportes: Plan de cuentas, Asiento de ajuste, Tipos de asiento, Pedidos de
 *   contabilización y Libros contables.
 * - En el detalle de Contabilización y en los listados de Admin (usuarios, entidades, unidades y correlativos).
 * - En Apertura contable: cuentas contables del detalle anual, aperturas mensuales de la configuración e historial de
 *   la configuración.
 * - Cuando la búsqueda debe confirmarse con Enter o la lupa y no a cada tecla (búsqueda en servidor o muchas filas).
 * @evitar
 * - En las pestañas Documentos / Registros y en la Bandeja de Documentos, con menús a la derecha:
 *   `siaf-records-search-toolbar`, que los proyecta.
 * - Esperar que los botones hagan algo por sí solos: emiten `filter`, `more` y `columns`, y si la pantalla no los escucha
 *   se pintan y no hacen nada (hoy ninguna consulta escucha Filtrar ni Columnas).
 * - Para filtrar por opciones cerradas o por condiciones: `siaf-filter-pill` o `siaf-custom-filter` junto al buscador.
 * @teclado
 * - **Tab**: recorre el campo, la lupa, Filtrar y Más opciones (o Columnas); con `disabled` quedan todos fuera.
 * - **Enter**: en el campo, confirma la búsqueda y emite `valueChange` con lo escrito; escribir no busca.
 * - **Enter / Espacio**: en la lupa confirman igual; en Filtrar, Más opciones y Columnas emiten `filter`, `more` y
 *   `columns`.
 * @accesibilidad
 * - **Pendiente · 4.1.2 Nombre, función y valor (A)**: el input `ariaLabel` no se usa en la plantilla; el nombre del
 *   campo sale de `placeholder` («Buscar» por defecto), así que «Buscar cuentas contables» o «Buscar en pedidos» no
 *   llegan al lector. Los botones sí llevan `filterLabel` («Filtrar»), `moreLabel` («Mas opciones», sin tilde) y
 *   `columnsLabel` («Ocultar o mostrar columnas»).
 * - **Pendiente · 4.1.3 Mensajes de estado (AA)**: ni el buscador ni la grilla anuncian el resultado; la pantalla debe
 *   anunciar el total (p. ej. con `role="status"`).
 * - **Pendiente · 1.4.11 Contraste no textual (AA)**: el borde del campo sin foco es `border-states-enabled` (2.44:1 /
 *   2.59:1). El anillo de foco de la lupa y de los botones ya es el azul del kit (`border-states-focus`, 5.35:1 /
 *   10.15:1) y los íconos cumplen (`text-neutral-high`; la lupa, `text-neutral-medium`).
 * - **2.4.7 Foco visible (AA)**: el campo pasa a un borde de 2 px `border-states-focus` (5.35:1 / 10.15:1); la lupa y
 *   los botones muestran un anillo de 2 px separado 2 px.
 * - **2.5.8 Tamaño del objetivo (AA)**: Filtrar, Más opciones y Columnas miden 40 px; la lupa, 24 px.
 */
@Component({
  selector: 'siaf-form-table-search',
  standalone: true,
  imports: [IconComponent, TextFieldComponent],
  template: `
    <div class="flex w-full items-start gap-siaf-md">
      <!-- Campo del design system: etiqueta flotante y borde de éxito, igual
           que el resto de inputs. Enter o la lupa (trailingAction) confirman. -->
      <siaf-input
        class="min-w-0 flex-1"
        [label]="placeholder"
        [value]="value"
        [disabled]="disabled"
        trailingIcon="search"
        trailingButtonLabel="Buscar"
        (valueChange)="onTyped($event)"
        (keydown.enter)="onSubmit($event)"
        (trailingAction)="onLupa()"
      />

      <div class="flex shrink-0 items-start gap-siaf-xs">
        <button
          class="inline-flex size-10 items-center justify-center rounded-siaf-md text-text transition hover:bg-surface-muted active:bg-[var(--sys-color-bg-states-dark-pressed)] disabled:cursor-not-allowed disabled:text-[var(--sys-color-text-neutral-disabled)] disabled:hover:bg-transparent focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sys-color-border-states-focus)]"
          type="button"
          [attr.aria-label]="filterLabel"
          [disabled]="disabled"
          (click)="filter.emit()"
        >
          <siaf-icon name="filter_list" [size]="24" />
        </button>
        <!-- Segundo botón según la variante: Más opciones o, en Consultas y reportes, Columnas. -->
        <button
          class="inline-flex size-10 items-center justify-center rounded-siaf-md text-text transition hover:bg-surface-muted active:bg-[var(--sys-color-bg-states-dark-pressed)] disabled:cursor-not-allowed disabled:text-[var(--sys-color-text-neutral-disabled)] disabled:hover:bg-transparent focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sys-color-border-states-focus)]"
          type="button"
          [attr.aria-label]="variant === 'reports' ? columnsLabel : moreLabel"
          [attr.data-accion]="variant === 'reports' ? 'columns' : 'more'"
          [disabled]="disabled"
          (click)="variant === 'reports' ? columns.emit() : more.emit()"
        >
          <siaf-icon [name]="variant === 'reports' ? 'view_column' : 'more_vert'" [size]="24" />
        </button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormTableSearchComponent implements OnChanges {
  ngOnChanges(changes: SimpleChanges): void {
    // Si el padre reescribe `value` (p. ej. quitar la búsqueda desde el chip),
    // lo tecleado pendiente deja de valer: un Enter posterior no debe
    // resucitar el texto viejo.
    if (changes['value']) {
      this.lastTyped = null;
    }
  }

  @Input() value = '';
  @Input() placeholder = 'Buscar';
  @Input() ariaLabel = 'Buscar';
  /** `default`: Filtrar y Más opciones. `reports`: el de Consultas y reportes, con Filtrar y Columnas. */
  @Input() variant: 'default' | 'reports' = 'default';
  @Input() filterLabel = 'Filtrar';
  @Input() moreLabel = 'Mas opciones';
  /** Nombre accesible del botón Columnas de la variante `reports`. */
  @Input() columnsLabel = 'Ocultar o mostrar columnas';
  @Input() disabled = false;

  @Output() valueChange = new EventEmitter<string>();
  @Output() filter = new EventEmitter<void>();
  @Output() more = new EventEmitter<void>();
  /** Botón Columnas de la variante `reports`. */
  @Output() columns = new EventEmitter<void>();

  /** Último texto tecleado; se emite recién al confirmar (Enter o lupa). */
  private lastTyped: string | null = null;

  /** El siaf-input interno emite al tipear; aquí solo se registra el texto. */
  onTyped(value: string | number | string[]): void {
    this.lastTyped = String(value ?? '');
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    // La búsqueda se dispara con Enter o la lupa, no por tecleo: los 18
    // consumidores (paneles de selección, tablas de solicitudes, listados
    // admin) pasan a ese comportamiento sin cambiar una línea.
    this.valueChange.emit(this.lastTyped ?? this.value);
  }

  onLupa(): void {
    this.valueChange.emit(this.lastTyped ?? this.value);
  }
}
