import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, Output, signal } from '@angular/core';

import { IconComponent } from '../icon/icon.component';
import { MenuComponent, MenuDensity } from '../menu/menu.component';
import { FocoDirective } from '../foco/foco.directive';

export interface IconDropdownMenuItem {
  /** Texto visible. */
  label: string;
  /** Valor que se emite al seleccionar (default = label). */
  value?: string;
  /**
   * Muestra la flecha de submenú (`arrow_right`) a la derecha — indica que el
   * item tiene un submenú (el padre debe manejar el click para abrir
   * el submenú aparte).
   */
  hasChildren?: boolean;
  /**
   * Si es true, renderiza un divisor inmediatamente DESPUÉS de este
   * item. Útil para agrupar opciones relacionadas dentro del menú.
   */
  divider?: boolean;
  /** Deshabilita el item. */
  disabled?: boolean;
  /** Ícono Material Symbols antes del texto (ej. `delete` para «Eliminar»). */
  icon?: string;
}

export type IconDropdownMenuAlign = 'left' | 'right';

/** ghost = botón neutro (default) · accent = mismo color que siaf-button accent. */
export type IconDropdownMenuVariant = 'ghost' | 'accent';

/**
 * Botón cuadrado (40×40) con icono que abre un menú flotante. Cubre
 * los 3 patrones idénticos que estaban inline en
 * `siaf-documents-records-page`:
 *   - "Campos" (layers)
 *   - "Favorito" (star_border)
 *   - "Más opciones" (more_vert)
 *
 * También sirve para cualquier botón-acción que necesite ofrecer una
 * lista corta de comandos (kebab menus de tablas, etc.).
 *
 * El panel es `siaf-menu`, compact salvo `density="standard"` (diseño del Figma UI KIT):
 * este componente solo pone el botón, lo ancla (`align`), cierra al pulsar
 * fuera o con Escape y respeta `closeOnSelect`. Un cambio de diseño del
 * menú se hace en `siaf-menu`. Abierto con el teclado, el foco entra en la
 * primera opción y ↑ ↓ recorren el resto.
 *
 * @usar
 * - Botones de ícono de la barra de búsqueda de la bandeja (`siaf-documents-records-page`): Campos (`layers`), Favorito
 *   (`star_border`) y Más opciones (`more_vert`).
 * - Exportar con `variant="accent"` e ícono `file_download` en el encabezado de resultados de las consultas (Plan de
 *   Cuentas, Asiento de ajuste, Catálogo de ajuste, Contabilización y Libros contables).
 * - Acciones sobre las filas marcadas, proyectado en `siaf-table-controls` con el atributo `tableAction` (Gestor de
 *   Usuarios de Admin, descarga de Libros contables), y el menú ⋮ de `siaf-expansion-panel`.
 * - Con `label` cuando el Figma pide un botón con texto que abre el menú: «Exportar» (Excel, CSV y PDF) del resultado de
 *   `siaf-query-report-page`, con `density="standard"` como su menú «Opciones de tabla» (nodo 22402:16485).
 * @evitar
 * - Para una sola acción: usar `siaf-button` con `iconOnly` y `ariaLabel`, sin menú.
 * - Con opciones en dos niveles: usar `siaf-cascading-menu`.
 * - Para filtrar por un valor que debe quedar a la vista: usar `siaf-filter-pill`.
 * - Un botón de ícono con una lista flotante hecha a mano: este componente ya da `aria-expanded`, Escape y el cierre al
 *   pulsar fuera, y dibuja el panel con `siaf-menu`.
 * @teclado
 * - **Tab**: enfoca el botón.
 * - **Enter / Espacio**: abren o cierran el menú; al abrir, el foco entra en la primera opción habilitada.
 * - **Flecha arriba / abajo** e **Inicio / Fin**: recorren las opciones (de `siaf-menu`).
 * - **Enter / Espacio** sobre una opción: la eligen y cierran el menú, salvo con `closeOnSelect=false`.
 * - **Escape**: cierra el menú y el foco vuelve al botón.
 * - **Tab** desde el menú: lo cierra y el foco sigue al control siguiente.
 * @accesibilidad
 * - **4.1.2 Nombre, función y valor (A)**: el disparador es un `<button>` con `aria-label` (por defecto «Más opciones»:
 *   el padre debe dar uno propio, como «Exportar resultados»), `aria-haspopup="menu"` y `aria-expanded`; el panel es
 *   `siaf-menu` con el mismo nombre. Con `label`, el texto visible nombra el botón y el menú, sin `aria-label`.
 * - **2.5.3 Etiqueta en el nombre (A)**: con `label`, el nombre es el mismo texto que se ve.
 * - **1.1.1 Contenido no textual (A)**: el ícono del botón es decorativo (`siaf-icon`); el nombre lo da `aria-label`.
 * - **2.4.3 Orden del foco (A)**: con `siafFoco`, al abrir el foco entra en la primera opción y al cerrar (Escape o
 *   elegir) vuelve al botón; salir con Tab cierra el menú. La capa que cierra al pulsar fuera no es parada de Tab.
 * - **2.4.7 Foco visible (AA)**: el botón tiene contorno de 2 px `bg-brand-accent` en `accent` (4.89:1 claro / 3.14:1
 *   oscuro), el anillo del kit `border-states-focus` con `label` y el anillo del navegador en `ghost`; las opciones, el
 *   contorno interior azul de `siaf-menu` (`border-states-focus`).
 * - **1.4.11 Contraste no textual (AA)**: en `accent`, relleno 4.89:1 / 3.14:1 sobre la superficie e ícono blanco
 *   (`text-brand-white` sobre `bg-brand-accent`) 4.89:1 / 5.65:1; en `ghost` el ícono hereda el color del texto del
 *   padre.
 * - **2.5.8 Tamaño del objetivo (AA)**: botón de 40 px de alto y opciones de 32 px (`compact`) o 48 px (`standard`).
 */
@Component({
  selector: 'siaf-icon-dropdown-menu',
  standalone: true,
  imports: [FocoDirective, IconComponent, MenuComponent],
  template: `
    <div class="relative inline-block">
      <button
        class="inline-flex items-center justify-center rounded-siaf-md transition disabled:cursor-not-allowed disabled:opacity-40"
        type="button"
        [class]="triggerClass"
        [class.size-10]="!label"
        [class.bg-surface-muted]="(variant === 'ghost' || !!label) && open()"
        [attr.aria-label]="label ? null : ariaLabel"
        [attr.aria-haspopup]="'menu'"
        [attr.aria-expanded]="open()"
        [disabled]="disabled"
        (click)="toggle($event)"
      >
        <siaf-icon [name]="icon" [size]="24" />
        @if (label) {
          <!-- El tamaño va en el span: la regla global button { font: inherit } pisa las utilidades del botón. -->
          <span class="text-sm font-medium leading-normal">{{ label }}</span>
        }
      </button>

      @if (open()) {
        <button
          class="fixed inset-0 z-20 cursor-default bg-transparent"
          type="button"
          data-capa-cierre tabindex="-1" aria-hidden="true" (mousedown)="$event.preventDefault()"
          (click)="close()"
        ></button>
        <!-- El panel es siaf-menu compact: su diseño (Figma UI KIT «menus») se cambia en un solo lugar. -->
        <div
          class="absolute top-12 z-30"
          [class.right-0]="align === 'right'"
          [class.left-0]="align === 'left'"
          siafFoco
          [siafFocoAtrapar]="false"
          (siafFocoSalida)="close()"
          (click)="$event.stopPropagation()"
        >
          <siaf-menu
            [density]="density"
            [items]="items"
            [leading]="tieneIconos ? 'icon' : 'none'"
            [width]="menuWidth"
            [ariaLabel]="label || ariaLabel"
            (selected)="alElegir($event)"
            (closed)="close()"
          />
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconDropdownMenuComponent {

  /** Nombre del icono Material Symbols. */
  @Input() icon = '';
  /** aria-label del botón (también se usa en aria-labels secundarios). */
  @Input() ariaLabel = 'Más opciones';
  /** Items del menú. */
  @Input() items: IconDropdownMenuItem[] = [];
  /** Alineación del menú respecto al botón. Default: 'right'. */
  @Input() align: IconDropdownMenuAlign = 'right';
  /** Ancho del menú flotante en px. Default 248. */
  @Input() menuWidth = 248;
  /** Deshabilita el botón disparador. */
  @Input() disabled = false;
  /** Estilo del botón disparador: 'ghost' (default) o 'accent' (color de marca). */
  @Input() variant: IconDropdownMenuVariant = 'ghost';
  /** Densidad del menú: `compact` (32 px por opción, la de las barras de búsqueda) o `standard` (48 px). */
  @Input() density: MenuDensity = 'compact';

  /**
   * Texto del disparador: con él, el botón es de contorno (Figma «Buttons» outline, 40 px) con el ícono y el texto, y el
   * texto lo nombra; sin él, es el botón de solo ícono.
   */
  @Input() label = '';

  /** Clases del disparador según variante (accent = mismas que siaf-button accent). */
  get triggerClass(): string {
    if (this.label) {
      return 'min-h-10 gap-siaf-xs border border-[var(--sys-color-border-states-enabled)] px-siaf-md py-siaf-xs text-[var(--sys-color-text-neutral-medium)] enabled:hover:bg-surface-muted enabled:active:bg-[var(--sys-color-bg-states-dark-pressed)] focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sys-color-border-states-focus)]';
    }
    return this.variant === 'accent'
      ? 'bg-[var(--sys-color-bg-brand-accent)] text-[var(--sys-color-text-brand-white)] enabled:hover:brightness-90 enabled:active:brightness-75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sys-color-bg-brand-accent)]'
      : 'hover:bg-surface-muted active:bg-[var(--sys-color-bg-states-dark-pressed)]';
  }
  /**
   * Si true, NO cierra el menú al seleccionar un item (útil para items
   * `hasChildren` donde el padre va a abrir un submenú separado).
   */
  @Input() closeOnSelect = true;

  /** Emite el `value` del item seleccionado (o `label` si no tiene value). */
  @Output() selected = new EventEmitter<string>();

  readonly open = signal(false);

  /** Abre o cierra. Al abrir, siafFoco lleva el foco a la primera opción; al cerrar, lo devuelve al botón. */
  toggle(event?: MouseEvent): void {
    if (this.disabled) return;
    event?.stopPropagation();
    this.open.update(v => !v);
  }

  /** Hay que reservar la columna del ícono si alguna opción lo trae. */
  get tieneIconos(): boolean {
    return this.items.some((item) => !!item.icon);
  }

  /** `siaf-menu` emite el valor; se busca la opción para respetar `disabled` y `closeOnSelect`. */
  alElegir(valor: string): void {
    const item = this.items.find((i) => (i.value ?? i.label) === valor);
    if (item) this.select(item);
  }

  close(): void {
    this.open.set(false);
  }

  select(item: IconDropdownMenuItem): void {
    if (item.disabled) return;
    this.selected.emit(item.value ?? item.label);
    if (this.closeOnSelect) this.close();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open()) this.close();
  }
}
