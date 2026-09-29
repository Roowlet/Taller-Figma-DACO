import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, signal } from '@angular/core';

import { BadgeComponent } from '../badge/badge.component';
import { DividerComponent } from '../divider/divider.component';
import { IconComponent } from '../icon/icon.component';
import { SwitchComponent } from '../switch/switch.component';
import { TooltipDirective } from '../tooltip/tooltip.directive';

/** Elemento al inicio del ítem (Figma «Leading type»). */
export type ListLeading =
  | { type: 'icon'; icon: string }
  | { type: 'avatar'; initials: string }
  | { type: 'switch'; checked: boolean; ariaLabel?: string }
  | { type: 'thumbnail'; src: string; alt?: string };

/** Elemento al final del ítem (Figma «Trailing type»). */
export type ListTrailing =
  | { type: 'icon'; icon: string }
  | { type: 'badge'; label: string | number; max?: number; ariaLabel?: string }
  | { type: 'switch'; checked: boolean; ariaLabel?: string };

export interface ListItem {
  /** Identificador para la selección y los eventos; por defecto, el título. */
  id?: string;
  title: string;
  description?: string;
  /** Texto en mayúsculas sobre el título (Figma, 3 líneas con thumbnail). */
  overline?: string;
  /** Atajo de `leading: { type: 'icon', icon }`. */
  icon?: string;
  leading?: ListLeading;
  trailing?: ListTrailing;
}

export type ListSize = 'standard' | 'compact';

export type ListOrientation = 'vertical' | 'horizontal';

export interface ListSwitchChange {
  id: string;
  position: 'leading' | 'trailing';
  checked: boolean;
}

/**
 * Lista de ítems (Figma UI KIT, nodo 7421:7061 «Lists»): cada ítem con título, texto de apoyo y
 * overline opcionales, un elemento inicial (ícono, avatar con iniciales, switch o thumbnail) y uno final
 * (ícono, badge contador o switch).
 *
 * - `size`: `standard` (48 px mínimo, íconos de 24) o `compact` (32 px, íconos de 20).
 * - El tipo de 1, 2 o 3+ líneas sale del contenido: sin descripción es de 1 línea; con descripción, esta
 *   se corta en una línea con tooltip, salvo `[wrapDescription]="true"`, que la deja crecer (3 líneas +).
 * - `dividers` agrega `siaf-divider` bajo cada ítem, menos el último (solo en vertical).
 * - `orientation="horizontal"` pone los ítems en fila, con 4 px de separación, 230 px de ancho, el contenido centrado y
 *   el título y la descripción en una línea cada uno (con tooltip si se cortan); el desplazamiento lo maneja el
 *   contenedor. `outlined` les pone borde: son las tarjetas de «Parámetros aplicados»
 *   (`siaf-parametros-aplicados`).
 * - `selectable` la vuelve una lista de opciones: hover, foco con teclado y seleccionado (fondo azul,
 *   título en negrita e ícono inicial en azul), con `[(selectedId)]`. Sin `selectable` es estática.
 * - Los switches son `siaf-switch` y emiten `switchChange` sin cambiar la selección.
 *
 * @usar
 * - Para listas verticales de ítems con título, texto de apoyo e ícono, avatar o miniatura (p. ej. los documentos de
 *   un expediente, o novedades y capacitaciones).
 * - Con switches (`leading` o `trailing` de tipo `switch`) para una lista de preferencias, como «Avisar al aprobador».
 * - Con `selectable` y `[(selectedId)]` para elegir un ítem de una lista corta. Hoy ninguna pantalla la usa.
 * - En horizontal y con `outlined` para una fila de tarjetas con ícono, título y valor, como los parámetros de una
 *   consulta: `siaf-parametros-aplicados` ya la arma con su título y su botón para desplazar.
 * @evitar
 * - Para datos en columnas: `siaf-table` o `siaf-data-table`.
 * - Para opciones que se abren desde un botón: `siaf-menu` o `siaf-icon-dropdown-menu`.
 * - Combinar `selectable` con switches: el switch queda dentro de un `role="option"`, que no admite controles adentro.
 * - Para una jerarquía de nodos: `siaf-tree-view` o `siaf-process-menu-tree`.
 * @teclado
 * - **Tab**: con `selectable`, la lista es una sola parada: entra por la última opción enfocada (al principio, la
 *   elegida o la primera) y la siguiente pulsación sale; sin `selectable`, solo pasa por los switches.
 * - **Flecha abajo / arriba**: con `selectable`, pasan a la opción siguiente o anterior y dan la vuelta (en horizontal,
 *   también **derecha / izquierda**).
 * - **Inicio / Fin**: van a la primera o a la última opción.
 * - **Enter / Espacio**: eligen la opción enfocada y emiten `selectedIdChange`; sobre un switch interno lo dejan
 *   actuar.
 * - Los switches siguen `siaf-switch`.
 * @accesibilidad
 * - **1.3.1 Información y relaciones (A)**: `<ul>` y `<li>` reales; overline, título y descripción van como texto en
 *   orden de lectura.
 * - **Pendiente · 4.1.2 Nombre, función y valor (A)**: con `selectable` es `role="listbox"` con opciones
 *   `role="option"` y `aria-selected` (el padre debe dar `ariaLabel`); pero un switch dentro de una opción queda
 *   anidado, y ARIA trata los hijos de una opción como presentacionales.
 * - **1.1.1 Contenido no textual (A)**: íconos y avatar son decorativos (`aria-hidden`); la miniatura lleva `alt`
 *   vacío salvo que el padre dé uno (debe darlo si la imagen informa) y el badge contador necesita `ariaLabel` para
 *   decir qué cuenta.
 * - **2.1.1 Teclado (A)**: en una lista seleccionable, al enfocar la opción aparece el globo con la descripción
 *   cortada.
 * - **Pendiente · 2.1.1 Teclado (A)**: sin `selectable` las filas no reciben foco y la descripción cortada solo se
 *   completa con el mouse (la alternativa es `wrapDescription`).
 * - **1.4.13 Contenido en hover o foco (AA)**: ese tooltip (`siafTooltip`) se cierra con Escape y se puede recorrer con
 *   el puntero.
 * - **Pendiente · 1.4.3 Contraste mínimo (AA)**: título `text-neutral-medium` (14.53:1 / 12.87:1) y descripción
 *   `text-neutral-low` (5.01:1 / 8.86:1) sobre la superficie; en el ítem seleccionado la descripción queda sobre la
 *   capa `bg-states-light-selected`, que en claro la deja por debajo de 4.5:1.
 * - **1.4.1 Uso del color (A)**: el seleccionado no depende solo del fondo azul: el título pasa a negrita.
 * - **2.4.7 Foco visible (AA)**: la opción enfocada con teclado lleva un contorno interior azul de 2 px
 *   (`border-states-focus`, 5.35:1 claro / 10.15:1 oscuro), el mismo de `siaf-menu`, además de la capa
 *   `bg-states-light-focus`, que sola casi no se veía (1.27:1 en claro y sin redefinir en oscuro).
 * - **2.5.8 Tamaño del objetivo (AA)**: ítems de 48 px (`standard`) o 32 px (`compact`) de alto como mínimo.
 */
@Component({
  selector: 'siaf-list',
  standalone: true,
  imports: [BadgeComponent, DividerComponent, IconComponent, SwitchComponent, TooltipDirective],
  template: `
    <ul
      class="m-0 flex list-none p-0"
      [class.flex-col]="orientation === 'vertical'"
      [class.flex-row]="orientation === 'horizontal'"
      [class.gap-siaf-xxs]="orientation === 'horizontal'"
      [attr.role]="selectable ? 'listbox' : null"
      [attr.aria-label]="ariaLabel || null"
      [attr.aria-orientation]="selectable && orientation === 'horizontal' ? 'horizontal' : null"
      (keydown)="alNavegar($event)"
    >
      @for (item of items; track idDe(item); let ultimo = $last; let i = $index) {
        <li
          class="flex flex-col overflow-hidden rounded-siaf-sm outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--sys-color-border-states-focus)]"
          [class.w-[230px]]="orientation === 'horizontal'"
          [class.shrink-0]="orientation === 'horizontal'"
          [class.border]="outlined"
          [class.border-[var(--sys-color-border-states-enabled)]]="outlined"
          [class.cursor-pointer]="selectable"
          [class.transition-colors]="selectable"
          [class.hover:bg-[var(--sys-color-bg-states-light-hover)]]="selectable && !esSeleccionado(item)"
          [class.focus-visible:bg-[var(--sys-color-bg-states-light-focus)]]="selectable"
          [class.bg-[var(--sys-color-bg-states-light-selected)]]="esSeleccionado(item)"
          [attr.role]="selectable ? 'option' : null"
          [attr.aria-selected]="selectable ? esSeleccionado(item) : null"
          [attr.tabindex]="selectable ? (i === indiceTabulable ? 0 : -1) : null"
          (focus)="enfocada.set(i)"
          [attr.data-id]="idDe(item)"
          (click)="elegir(item)"
          (keydown.enter)="alTeclado($event, item)"
          (keydown.space)="alTeclado($event, item)"
        >
          <div
            class="flex w-full gap-siaf-md px-siaf-md"
            [class.min-h-12]="size === 'standard'"
            [class.py-siaf-sm]="size === 'standard'"
            [class.min-h-8]="size === 'compact'"
            [class.py-siaf-xxs]="size === 'compact'"
            [class.items-center]="orientation === 'horizontal' || !item.description || !!thumbnailDe(item)"
            [class.items-start]="orientation === 'vertical' && !!item.description && !thumbnailDe(item)"
          >
            @if (leadingDe(item); as leading) {
              <div class="flex shrink-0 items-center" (click)="leading.type === 'switch' && $event.stopPropagation()">
                @switch (leading.type) {
                  @case ('icon') {
                    <siaf-icon
                      [name]="leading.icon"
                      [size]="tamIcono"
                      [class.text-[var(--sys-color-icon-states-enabled)]]="!esSeleccionado(item)"
                      [class.text-[var(--sys-color-icon-states-active)]]="esSeleccionado(item)"
                    />
                  }
                  @case ('avatar') {
                    <span
                      class="flex size-10 items-center justify-center rounded-full border border-[var(--sys-color-border-states-white)] bg-[var(--sys-color-bg-surfaces-highlight)] text-base font-medium leading-none tracking-[0.025px] text-[var(--sys-color-text-brand-primary)]"
                      aria-hidden="true"
                    >{{ leading.initials }}</span>
                  }
                  @case ('switch') {
                    <siaf-switch
                      [checked]="leading.checked"
                      [ariaLabel]="leading.ariaLabel || item.title"
                      (checkedChange)="switchChange.emit({ id: idDe(item), position: 'leading', checked: $event })"
                    />
                  }
                  @case ('thumbnail') {
                    <img class="size-14 rounded-siaf-md bg-[var(--sys-color-bg-surfaces-highlight)] object-cover" [src]="leading.src" [alt]="leading.alt ?? ''" />
                  }
                }
              </div>
            }

            <div class="flex min-w-0 flex-1 flex-col gap-siaf-xxs">
              @if (item.overline) {
                <span class="text-[11px] leading-[normal] tracking-[0.66px] uppercase text-[var(--sys-color-text-neutral-medium)]">{{ item.overline }}</span>
              }
              <!-- En horizontal el título también va en una línea: las tarjetas de la fila quedan de la misma altura. -->
              <span
                class="text-sm leading-[normal]"
                [class.truncate]="orientation === 'horizontal'"
                [siafTooltip]="''"
                [tooltipMode]="'auto'"
                [class.font-bold]="esSeleccionado(item)"
                [class.tracking-[-0.02px]]="esSeleccionado(item)"
                [class.tracking-[0.025px]]="!esSeleccionado(item)"
                [class.text-[var(--sys-color-text-neutral-activated)]]="esSeleccionado(item)"
                [class.text-[var(--sys-color-text-neutral-medium)]]="!esSeleccionado(item)"
              >{{ item.title }}</span>
              @if (item.description) {
                <span
                  class="text-xs leading-[normal] text-[var(--sys-color-text-neutral-low)]"
                  [class.truncate]="!wrapDescription"
                  [siafTooltip]="''"
                  [tooltipMode]="wrapDescription ? 'truncated' : 'auto'"
                >{{ item.description }}</span>
              }
            </div>

            @if (item.trailing; as trailing) {
              <div class="flex shrink-0 items-center" (click)="trailing.type === 'switch' && $event.stopPropagation()">
                @switch (trailing.type) {
                  @case ('icon') {
                    <siaf-icon class="text-[var(--sys-color-icon-states-enabled)]" [name]="trailing.icon" [size]="tamIcono" />
                  }
                  @case ('badge') {
                    <siaf-badge [label]="trailing.label" [max]="trailing.max" [minWidth]="32" [ariaLabel]="trailing.ariaLabel ?? ''" />
                  }
                  @case ('switch') {
                    <siaf-switch
                      [checked]="trailing.checked"
                      [ariaLabel]="trailing.ariaLabel || item.title"
                      (checkedChange)="switchChange.emit({ id: idDe(item), position: 'trailing', checked: $event })"
                    />
                  }
                }
              </div>
            }
          </div>
          @if (dividers && !ultimo && orientation === 'vertical') {
            <siaf-divider />
          }
        </li>
      }
    </ul>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent {
  @Input() items: ListItem[] = [];
  @Input() size: ListSize = 'standard';
  /** `vertical` (por defecto) o `horizontal`: ítems en fila de 230 px, sin desplazamiento propio. */
  @Input() orientation: ListOrientation = 'vertical';
  /** Ítems con borde `border-states-enabled` (tarjetas). */
  @Input() outlined = false;
  @Input() dividers = false;
  /** Deja crecer la descripción en varias líneas (Figma «3 line+»). Por defecto se corta en una. */
  @Input() wrapDescription = false;
  /** Convierte la lista en opciones seleccionables con hover, foco y seleccionado. */
  @Input() selectable = false;
  @Input() selectedId: string | null = null;
  @Input() ariaLabel = '';

  @Output() selectedIdChange = new EventEmitter<string>();
  @Output() switchChange = new EventEmitter<ListSwitchChange>();

  /** Índice de la última opción enfocada: con `selectable`, es la única parada de Tab de la lista (como `siaf-menu`). */
  readonly enfocada = signal(-1);

  /** Opción con `tabindex="0"`: la última enfocada o, al principio, la elegida o la primera. */
  get indiceTabulable(): number {
    const indice = this.enfocada();
    if (indice >= 0 && indice < this.items.length) return indice;
    const elegida = this.items.findIndex((item) => this.esSeleccionado(item));
    return elegida >= 0 ? elegida : 0;
  }

  get tamIcono(): number {
    return this.size === 'compact' ? 20 : 24;
  }

  idDe(item: ListItem): string {
    return item.id ?? item.title;
  }

  leadingDe(item: ListItem): ListLeading | null {
    return item.leading ?? (item.icon ? { type: 'icon', icon: item.icon } : null);
  }

  thumbnailDe(item: ListItem): boolean {
    return this.leadingDe(item)?.type === 'thumbnail';
  }

  esSeleccionado(item: ListItem): boolean {
    return this.selectable && this.selectedId === this.idDe(item);
  }

  /** Flechas, Inicio y Fin recorren las opciones de una lista seleccionable; con el foco en un switch interno no mueven nada. */
  alNavegar(event: KeyboardEvent): void {
    if (!this.selectable) return;
    const opciones = Array.from((event.currentTarget as HTMLElement).querySelectorAll<HTMLElement>(':scope > li[role="option"]'));
    const actual = opciones.indexOf(event.target as HTMLElement);
    if (actual < 0) return;
    const siguiente = (actual + 1) % opciones.length;
    const anterior = (actual - 1 + opciones.length) % opciones.length;
    const destinos: Record<string, number> = {
      ArrowDown: siguiente,
      ArrowUp: anterior,
      ...(this.orientation === 'horizontal' ? { ArrowRight: siguiente, ArrowLeft: anterior } : {}),
      Home: 0,
      End: opciones.length - 1,
    };
    const destino = destinos[event.key];
    if (destino === undefined) return;
    event.preventDefault();
    opciones[destino].focus();
  }

  /** Enter o Espacio sobre el ítem lo eligen; sobre un switch de adentro, lo dejan actuar. */
  alTeclado(event: Event, item: ListItem): void {
    if (event.target !== event.currentTarget) return;
    event.preventDefault();
    this.elegir(item);
  }

  elegir(item: ListItem): void {
    if (!this.selectable) return;
    this.selectedId = this.idDe(item);
    this.selectedIdChange.emit(this.selectedId);
  }
}
