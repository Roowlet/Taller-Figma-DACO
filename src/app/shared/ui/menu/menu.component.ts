import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, HostListener, Input, Output, forwardRef, inject, signal } from '@angular/core';

import { DividerComponent } from '../divider/divider.component';
import { IconComponent } from '../icon/icon.component';
import { TooltipDirective } from '../tooltip/tooltip.directive';

export interface MenuItem {
  label: string;
  /** Valor que se emite al elegir; por defecto, `label`. */
  value?: string;
  /** Ícono al inicio (con `leading="icon"`). */
  icon?: string;
  /** Ícono al final. Con `hasChildren` es la flecha de submenú. */
  trailingIcon?: string;
  /** Opciones del submenú: se abre al costado al pasar el puntero, al pulsar o con → / Enter. */
  children?: MenuItem[];
  /** Muestra la flecha `arrow_right` sin `children`: el submenú lo abre y maneja el padre. */
  hasChildren?: boolean;
  /** Línea divisoria después de esta opción. */
  divider?: boolean;
  disabled?: boolean;
}

export type MenuLeading = 'none' | 'icon' | 'radio' | 'checkbox';
export type MenuDensity = 'standard' | 'compact';

/**
 * Menú de opciones del design system (Figma UI KIT, nodo 7440:34249 «menus»): panel de 280 px con
 * sombra de elevación 8 y una opción por fila.
 *
 * - `leading`: `none`, `icon` (el `icon` de cada opción), `radio` (elección única, `[(selectedValue)]`)
 *   o `checkbox` (varias, `[(selectedValues)]`), con el radio y el checkbox nativos del kit.
 * - Al final, `trailingIcon` por opción, o la flecha de submenú: con `children` el submenú se abre al costado
 *   (puntero, clic, → o Enter; ← o Escape lo cierra) y su elección sale por el mismo `selected`. Se abre a la
 *   derecha, o a la izquierda / debajo si no entra en la ventana. El nivel 2
 *   lleva íconos si el menú los lleva; `submenuLeading="none"` lo deja solo con texto.
 * - `density`: `standard` (48 px por opción, íconos de 24) o `compact` (32 px, íconos de 20).
 * - Un texto que no entra se corta y muestra el completo con `siafTooltip`.
 * - `maxHeight` agrega scroll. Se navega con ↑ ↓ Inicio Fin y Escape emite `closed`.
 *
 * Emite `selected` con el valor elegido. Es solo el panel: para abrirlo desde un botón con ícono va
 * `siaf-icon-dropdown-menu`, y para dos niveles, `siaf-cascading-menu`.
 *
 * @usar
 * - Como panel de opciones de los disparadores del kit: `siaf-icon-dropdown-menu` (Campos, Favorito y Exportar),
 *   `siaf-filter-pill` (filtros Estado y Tipo de acción de la bandeja) y `siaf-cascading-menu` (el «+» de la solicitud
 *   del catálogo de eventos).
 * - `leading="radio"` o `checkbox` cuando la opción queda marcada (una sola o varias), en vez de dibujar el check a
 *   mano.
 * - `children` para un segundo nivel corto; `density="compact"` en barras y filtros, `standard` en menús sueltos.
 * @evitar
 * - Para abrirlo desde un botón: no armar a mano el disparador, la apertura y el cierre; usar `siaf-icon-dropdown-menu`
 *   o `siaf-cascading-menu`.
 * - Para elegir un valor dentro de un formulario: usar `siaf-select-options` o `siaf-radio-group`.
 * - Para contenido con título, texto o acciones al pie: usar `siaf-popover`.
 * - Para navegar entre pantallas: usar `siaf-process-menu-tree` o enlaces.
 * @teclado
 * - **Tab**: el menú es una sola parada: entra en la última opción enfocada (al principio, la primera habilitada) y la
 *   siguiente pulsación sale del menú; las opciones se recorren con las flechas.
 * - **Flecha arriba / abajo**: pasan a la opción habilitada anterior o siguiente (dan la vuelta).
 * - **Inicio / Fin**: van a la primera o a la última opción habilitada.
 * - **Enter / Espacio**: eligen la opción y emiten `selected` (con `radio` la marcan y con `checkbox` la alternan); en
 *   una opción con `children`, abren el submenú y enfocan su primera opción.
 * - **Flecha derecha**: abre el submenú de la opción y enfoca su primera opción.
 * - **Flecha izquierda** (dentro del submenú): lo cierra y devuelve el foco a la opción que lo abrió.
 * - **Escape**: en un submenú hace lo mismo que la flecha izquierda; en el menú principal emite `closed` y quien lo
 *   abre decide cerrarlo.
 * @accesibilidad
 * - **4.1.2 Nombre, función y valor (A)**: el panel es `role="menu"` con `aria-label` (el padre debe dar `ariaLabel`;
 *   el submenú toma el texto de su opción) y cada opción, `menuitem`, `menuitemradio` o `menuitemcheckbox` con
 *   `aria-checked` y `aria-disabled`; las que abren submenú llevan `aria-haspopup` y `aria-expanded`.
 * - **1.1.1 Contenido no textual (A)**: los íconos son decorativos y el radio y el checkbox nativos llevan
 *   `aria-hidden` y `tabindex="-1"`: el estado lo publica `aria-checked`.
 * - **2.1.1 Teclado (A)**: todo se opera con teclado y Tab sale del menú sin trampa; al enfocar una opción cortada,
 *   `siafTooltip` muestra su texto completo.
 * - **2.4.3 Orden del foco (A)**: abrir un submenú con teclado enfoca su primera opción y cerrarlo con flecha izquierda
 *   o Escape devuelve el foco a la opción que lo abrió. Llevar el foco al menú al abrirlo le toca al disparador
 *   (`siaf-icon-dropdown-menu` lo hace).
 * - **2.4.7 Foco visible (AA)**: la opción enfocada con teclado lleva un contorno interior azul de 2 px
 *   (`border-states-focus`, 5.35:1 claro / 10.15:1 oscuro) además de la capa gris `bg-states-light-focus`, que sola no
 *   se distinguía en oscuro.
 * - **1.4.3 Contraste mínimo (AA)**: texto `text-neutral-medium` sobre `bg-surfaces-surface-highest`, que en claro es
 *   blanco como la superficie (14.53:1). Las opciones deshabilitadas (`opacity-40`) están exentas.
 * - **1.4.13 Contenido en hover o foco (AA)**: el submenú que abre el puntero se pega a su opción dentro del mismo
 *   contenedor, así que se puede pasar el puntero sobre él sin que se cierre; se cierra con flecha izquierda o Escape.
 * - **2.5.8 Tamaño del objetivo (AA)**: 48 px por opción en `standard` y 32 px en `compact`.
 */
@Component({
  selector: 'siaf-menu',
  standalone: true,
  imports: [DividerComponent, IconComponent, TooltipDirective, forwardRef(() => MenuComponent)],
  host: { class: 'relative inline-block align-top' },
  template: `
    <div
      class="flex flex-col overflow-y-auto rounded-siaf-md bg-[var(--sys-color-bg-surfaces-surface-highest)] py-siaf-xs shadow-siaf-elevation-8"
      role="menu"
      [attr.aria-label]="ariaLabel || null"
      [style.width.px]="width"
      [style.max-height.px]="maxHeight"
      (keydown)="alTeclado($event)"
    >
      @for (item of items; track valorDe(item); let i = $index) {
        <!-- Cada opción es un elemento con rol de menú (no <button>) para poder llevar el checkbox y el
             radio nativos del kit: un <input> no puede ir dentro de un botón.
             El contorno de foco lleva outline-solid: outline-none deja el estilo del contorno en none. -->
        <div
          class="flex w-full items-center gap-siaf-md px-siaf-md text-left text-[var(--sys-color-text-neutral-medium)] outline-none transition-colors focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--sys-color-border-states-focus)]"
          [class.min-h-12]="density === 'standard'"
          [class.py-siaf-sm]="density === 'standard'"
          [class.min-h-8]="density === 'compact'"
          [class.py-siaf-xxs]="density === 'compact'"
          [class.cursor-pointer]="!item.disabled"
          [class.hover:bg-[var(--sys-color-bg-states-light-hover)]]="!item.disabled"
          [class.focus-visible:bg-[var(--sys-color-bg-states-light-focus)]]="!item.disabled"
          [class.cursor-not-allowed]="item.disabled"
          [class.opacity-40]="item.disabled"
          [attr.role]="rol"
          [attr.tabindex]="i === indiceTabulable ? 0 : -1"
          [attr.aria-disabled]="item.disabled ? true : null"
          [attr.aria-checked]="leading === 'radio' || leading === 'checkbox' ? estaMarcado(item) : null"
          [attr.aria-haspopup]="item.children?.length || item.hasChildren ? 'menu' : null"
          [attr.aria-expanded]="item.children?.length ? submenu()?.item === item : null"
          [class.bg-[var(--sys-color-bg-states-light-hover)]]="submenu()?.item === item"
          (mouseenter)="alPasar(item, $event)"
          (focus)="enfocada.set(i)"
          (click)="elegir(item, $event)"
          (keydown.enter)="$event.preventDefault(); elegir(item, $event, true)"
          (keydown.space)="$event.preventDefault(); elegir(item, $event, true)"
          (keydown.arrowright)="alFlechaDerecha(item, $event)"
        >
          @switch (leading) {
            @case ('icon') {
              @if (item.icon) {
                <siaf-icon class="shrink-0 text-[var(--sys-color-icon-states-enabled)]" [name]="item.icon" [size]="tamIcono" />
              }
            }
            @case ('radio') {
              <input class="pointer-events-none size-4 shrink-0 accent-brand-primary" type="radio" tabindex="-1" aria-hidden="true" [checked]="estaMarcado(item)" [disabled]="!!item.disabled" />
            }
            @case ('checkbox') {
              <input class="pointer-events-none shrink-0" type="checkbox" tabindex="-1" aria-hidden="true" [checked]="estaMarcado(item)" [disabled]="!!item.disabled" />
            }
          }
          <span class="min-w-0 flex-1 truncate text-sm leading-[normal]" siafTooltip>{{ item.label }}</span>
          @if (item.children?.length || item.hasChildren || item.trailingIcon) {
            <siaf-icon class="shrink-0 text-[var(--sys-color-icon-states-enabled)]" [name]="item.trailingIcon || 'arrow_right'" [size]="tamIcono" />
          }
        </div>
        @if (item.divider) {
          <siaf-divider class="my-siaf-xs" />
        }
      }
    </div>

    <!-- El submenú va fuera del panel con scroll para que no lo recorte, alineado con su opción. -->
    @if (submenu(); as sub) {
      <!-- Envoltorio posicionado: el host de siaf-menu ya es relative y pisaría un absolute puesto encima. -->
      <div class="absolute z-10" data-submenu [attr.data-lado]="sub.lado" [style.left.px]="sub.left" [style.top.px]="sub.top">
      <siaf-menu
        [items]="sub.item.children ?? []"
        [leading]="leadingDelSubmenu"
        [density]="density"
        [width]="width"
        [esSubmenu]="true"
        [ariaLabel]="sub.item.label"
        (selected)="elegirDelSubmenu($event)"
        (closed)="cerrarSubmenu(true)"
      />
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  @Input() items: MenuItem[] = [];
  @Input() leading: MenuLeading = 'none';
  @Input() density: MenuDensity = 'standard';
  /** Ancho del panel en px (280 en el Figma). */
  @Input() width = 280;
  /** Alto máximo en px; por encima aparece el scroll. */
  @Input() maxHeight: number | null = null;
  @Input() ariaLabel = '';
  /** Opción marcada con `leading="radio"`. */
  @Input() selectedValue: string | null = null;
  /** Opciones marcadas con `leading="checkbox"`. */
  @Input() selectedValues: string[] = [];
  /** Elemento inicial de las opciones del submenú. Por defecto, íconos si este menú los usa; si no, nada. */
  @Input() submenuLeading: 'none' | 'icon' | null = null;
  /** Uso interno: el panel es un submenú (← también lo cierra). */
  @Input() esSubmenu = false;

  @Output() selected = new EventEmitter<string>();
  @Output() selectedValueChange = new EventEmitter<string>();
  @Output() selectedValuesChange = new EventEmitter<string[]>();
  @Output() closed = new EventEmitter<void>();

  /** Submenú abierto: la opción que lo abrió y su posición vertical dentro del host. */
  readonly submenu = signal<{ item: MenuItem; top: number; left: number; lado: 'derecha' | 'izquierda' | 'abajo' } | null>(null);

  /** Índice de la última opción enfocada: es la única parada de Tab del menú. */
  readonly enfocada = signal(0);

  /** Opción con `tabindex="0"`: la última enfocada o, si no se puede (deshabilitada o ya no está), la primera habilitada. */
  get indiceTabulable(): number {
    const indice = this.enfocada();
    if (this.items[indice] && !this.items[indice].disabled) return indice;
    return this.items.findIndex((item) => !item.disabled);
  }

  get leadingDelSubmenu(): MenuLeading {
    return this.submenuLeading ?? (this.leading === 'icon' ? 'icon' : 'none');
  }

  get tamIcono(): number {
    return this.density === 'compact' ? 20 : 24;
  }

  get rol(): string {
    return this.leading === 'radio' ? 'menuitemradio' : this.leading === 'checkbox' ? 'menuitemcheckbox' : 'menuitem';
  }

  valorDe(item: MenuItem): string {
    return item.value ?? item.label;
  }

  estaMarcado(item: MenuItem): boolean {
    const valor = this.valorDe(item);
    return this.leading === 'radio' ? this.selectedValue === valor : this.selectedValues.includes(valor);
  }

  elegir(item: MenuItem, event?: Event, conTeclado = false): void {
    if (item.disabled) return;
    if (item.children?.length) {
      if (event) this.abrirSubmenu(item, event, conTeclado);
      return;
    }
    const valor = this.valorDe(item);
    if (this.leading === 'radio') {
      this.selectedValue = valor;
      this.selectedValueChange.emit(valor);
    } else if (this.leading === 'checkbox') {
      this.selectedValues = this.estaMarcado(item)
        ? this.selectedValues.filter((v) => v !== valor)
        : [...this.selectedValues, valor];
      this.selectedValuesChange.emit(this.selectedValues);
    }
    this.selected.emit(valor);
  }

  alFlechaDerecha(item: MenuItem, event: Event): void {
    if (!item.children?.length || item.disabled) return;
    event.preventDefault();
    this.abrirSubmenu(item, event, true);
  }

  alPasar(item: MenuItem, event: Event): void {
    if (item.disabled) return;
    if (item.children?.length) this.abrirSubmenu(item, event, false);
    else if (this.submenu()) this.cerrarSubmenu(false);
  }

  abrirSubmenu(item: MenuItem, event: Event, enfocar: boolean): void {
    const opcion = event.currentTarget as HTMLElement;
    const panel = opcion.parentElement as HTMLElement;
    // El submenú arranca a la altura de la opción; se restan los 8 px de relleno para alinear su primera opción.
    // Va a la derecha si entra en la ventana; si no, a la izquierda; y si tampoco (móvil), debajo de la opción.
    const caja = this.host.nativeElement.getBoundingClientRect();
    const anchoVentana = document.documentElement.clientWidth || window.innerWidth;
    const alto = opcion.offsetTop - panel.scrollTop;
    if (caja.right + this.width <= anchoVentana) {
      this.submenu.set({ item, top: alto - 8, left: this.width, lado: 'derecha' });
    } else if (caja.left - this.width >= 0) {
      this.submenu.set({ item, top: alto - 8, left: -this.width, lado: 'izquierda' });
    } else {
      this.submenu.set({ item, top: alto + opcion.offsetHeight, left: 0, lado: 'abajo' });
    }
    if (enfocar) {
      setTimeout(() => this.host.nativeElement.querySelector<HTMLElement>(':scope > [data-submenu] [role^="menuitem"]:not([aria-disabled="true"])')?.focus());
    }
  }

  cerrarSubmenu(devolverFoco: boolean): void {
    const item = this.submenu()?.item;
    this.submenu.set(null);
    if (devolverFoco && item) {
      const indice = this.items.indexOf(item);
      this.host.nativeElement.querySelectorAll<HTMLElement>(':scope > [role="menu"] > [role^="menuitem"]')[indice]?.focus();
    }
  }

  elegirDelSubmenu(valor: string): void {
    this.submenu.set(null);
    this.selected.emit(valor);
  }

  @HostListener('mouseleave')
  alSalir(): void {
    if (this.submenu()) this.cerrarSubmenu(false);
  }

  /** ↑ ↓ Inicio Fin mueven el foco entre las opciones habilitadas; Escape (o ← en un submenú) pide cerrar. */
  alTeclado(event: KeyboardEvent): void {
    if (event.key === 'Escape' || (this.esSubmenu && event.key === 'ArrowLeft')) {
      event.preventDefault();
      this.closed.emit();
      return;
    }
    const botones = Array.from(this.host.nativeElement.querySelectorAll<HTMLElement>(':scope > [role="menu"] > [role^="menuitem"]:not([aria-disabled="true"])'));
    if (!botones.length) return;
    const actual = botones.indexOf(document.activeElement as HTMLElement);
    const destino =
      event.key === 'ArrowDown' ? (actual + 1) % botones.length
      : event.key === 'ArrowUp' ? (actual - 1 + botones.length) % botones.length
      : event.key === 'Home' ? 0
      : event.key === 'End' ? botones.length - 1
      : -1;
    if (destino < 0) return;
    event.preventDefault();
    botones[destino].focus();
  }
}
