import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output, inject } from '@angular/core';

import { BadgeComponent } from '../badge/badge.component';

let contadorDeFilas = 0;

export interface TabItem {
  id: string;
  label: string;
  /** Contador opcional a la derecha de la etiqueta (se dibuja con `siaf-badge`). */
  count?: number | null;
}

/**
 * Pestañas del design system (Figma UI KIT, nodo 2588:135 «Tabs content»).
 *
 * Una fila de pestañas sobre una línea gris de 2 px. Texto de 14 px en gris; la activa va en negrita azul.
 * - `border` (por defecto `true`): la activa se dibuja como carpeta, con borde arriba y a los lados y el
 *   fondo de la superficie, y corta la línea. Con `border=false` la activa lleva un subrayado azul de 2 px.
 * - Al pasar el mouse, enfocar con teclado o presionar, una capa de estado del Figma cubre la pestaña.
 * - `count` muestra un contador con `siaf-badge`; `fullWidth` reparte el ancho entre las pestañas.
 * - Con muchas pestañas (Figma «6+») la fila se desplaza en horizontal sin barra visible.
 *
 * El padre mantiene el `activeId` y decide qué contenido pinta: este componente solo dibuja la fila.
 * `siaf-records-tabs`, la franja «Detalle | Historial» de `siaf-detail-history-tabs` y el login lo usan por dentro.
 *
 * @usar
 * - Para alternar entre vistas de una misma pantalla sin cambiar de ruta (Documentos / Registros, Detalle / Historial).
 * - Entre 2 y 5 pestañas con nombres cortos; con más, la fila se desplaza en horizontal.
 * - `border=false` bajo cabeceras y dentro de tarjetas; `border=true` cuando la pestaña activa se une a un panel blanco.
 * @evitar
 * - Para acciones o para navegar a otra ruta: usar `siaf-button` o un enlace.
 * - Para seguir un flujo por etapas: usar `siaf-steps` o `siaf-action-tracker`.
 * - Pestañas anidadas dentro de otra pestaña.
 * @figma 2588:135 Tabs content
 * @teclado
 * - **Tab**: entra a la fila en la pestaña activa (o en la primera, si ninguna lo está) y el siguiente Tab sale de la
 *   fila.
 * - **Flecha izquierda / derecha**: pasan a la pestaña anterior o siguiente (dan la vuelta) y la activan.
 * - **Inicio / Fin**: van a la primera o a la última pestaña y la activan.
 * - **Enter / Espacio**: activan la pestaña enfocada (cada pestaña es un `<button>`).
 * @accesibilidad
 * - **4.1.2 Nombre, función y valor (A)**: la fila es `role="tablist"` y cada pestaña un `<button>` con `role="tab"` y
 *   `aria-selected`. El padre debe dar `ariaLabel` a la fila (por defecto va vacío) y, en el contenido,
 *   `role="tabpanel"` con `aria-labelledby` apuntando al id de la pestaña (`idBase` + `-` + id de la pestaña); hoy solo
 *   lo hace la ficha del `/ui-kit`.
 * - **2.1.1 Teclado (A)**: flechas izquierda y derecha, Inicio y Fin; solo la activa (o la primera, si ninguna lo está)
 *   entra en el orden de tabulación (roving tabindex).
 * - **2.4.7 Foco visible (AA)**: `:focus-visible` pinta un contorno interior azul de 2 px (`border-states-focus`,
 *   5.35:1 claro / 10.15:1 oscuro) sobre la capa `bg-states-light-focus`. Es un `outline`, no una sombra: en la
 *   pestaña activa, que es la que recibe el foco, la sombra del subrayado o de la carpeta ya no lo tapa.
 * - **1.4.3 Contraste mínimo (AA)**: activa `text-neutral-activated` (8.79:1 claro / 17.76:1 oscuro) e inactivas
 *   `text-neutral-low` (5.01:1 / 8.86:1) sobre la superficie; con `border=false` el fondo es el del padre.
 * - **1.4.1 Uso del color (A)**: la activa además va en negrita, así que el estado no depende del subrayado
 *   (`border-states-active`, 2.02:1 en oscuro) ni del borde de carpeta.
 * - **2.5.8 Tamaño del objetivo (AA)**: cada pestaña mide al menos 40 px de alto.
 */
@Component({
  selector: 'siaf-tabs',
  standalone: true,
  imports: [BadgeComponent],
  template: `
    <div class="siaf-tabs flex overflow-x-auto" role="tablist" [attr.aria-label]="ariaLabel || null" [attr.data-borde]="border ? '' : null">
      @for (tab of tabs; track tab.id; let indice = $index) {
        <button
          class="siaf-tab relative flex min-h-10 items-center justify-center gap-siaf-xs whitespace-nowrap px-siaf-md py-siaf-xs"
          type="button"
          role="tab"
          [id]="tabId(tab.id)"
          [class.shrink-0]="!fullWidth"
          [class.flex-1]="fullWidth"
          [class.min-w-0]="fullWidth"
          [attr.data-activa]="tab.id === activeId ? '' : null"
          [attr.aria-selected]="tab.id === activeId"
          [attr.tabindex]="tab.id === activeId || (!hayActiva && indice === 0) ? 0 : -1"
          (click)="selectTab(tab.id)"
          (keydown)="alPresionarTecla($event, indice)"
        >
          <!-- El tamaño va en el texto: la regla global button { font: inherit } pisa las utilidades del botón. -->
          <span
            class="text-sm leading-[normal]"
            [class.font-bold]="tab.id === activeId"
            [class.tracking-[-0.02px]]="tab.id === activeId"
            [class.font-medium]="tab.id !== activeId"
            [class.tracking-[0.0249px]]="tab.id !== activeId"
          >{{ tab.label }}</span>
          @if (tab.count !== undefined && tab.count !== null) {
            <siaf-badge color="primary" [label]="tab.count" />
          }
        </button>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    /* La línea gris va como sombra interior: queda debajo de las pestañas, así la activa la tapa. */
    .siaf-tabs {
      box-shadow: inset 0 -2px 0 var(--sys-color-divider-strong);
      scrollbar-width: none;
    }

    .siaf-tabs::-webkit-scrollbar {
      display: none;
    }

    .siaf-tabs[data-borde] {
      background-color: var(--sys-color-bg-surfaces-surface);
    }

    .siaf-tab {
      color: var(--sys-color-text-neutral-low);
      outline: none;
      transition: color 150ms, box-shadow 150ms;
    }

    .siaf-tab > * {
      position: relative;
    }

    /* Capa de estado del Figma («layer state»). */
    .siaf-tab::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background-color: transparent;
      pointer-events: none;
      transition: background-color 150ms;
    }

    .siaf-tab:not([data-activa]):hover::before {
      background-color: var(--sys-color-bg-states-light-hover);
    }

    .siaf-tab:focus-visible::before {
      background-color: var(--sys-color-bg-states-light-focus);
    }

    .siaf-tab:not([data-activa]):active::before {
      background-color: var(--sys-color-bg-states-light-pressed);
    }

    /* Contorno y no sombra: la sombra del subrayado o de la carpeta de la pestaña activa lo tapaba. */
    .siaf-tab:focus-visible {
      outline: 2px solid var(--sys-color-border-states-focus);
      outline-offset: -2px;
    }

    .siaf-tab[data-activa] {
      color: var(--sys-color-text-neutral-activated);
    }

    /* Border=False: subrayado azul de 2 px sobre la línea gris. */
    .siaf-tabs:not([data-borde]) .siaf-tab[data-activa] {
      box-shadow: inset 0 -2px 0 var(--sys-color-border-states-active);
    }

    /* Border=True: carpeta con borde arriba y a los lados; su fondo tapa la línea gris. */
    .siaf-tabs[data-borde] .siaf-tab[data-activa] {
      border-radius: var(--sys-radius-sm) var(--sys-radius-sm) 0 0;
      background-color: var(--sys-color-bg-surfaces-surface);
      box-shadow:
        inset 2px 0 0 var(--sys-color-divider-strong),
        inset -2px 0 0 var(--sys-color-divider-strong),
        inset 0 2px 0 var(--sys-color-divider-strong);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabsComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  /** Prefijo propio de cada fila: con varias en la página, los ids de las pestañas no se repiten. */
  private readonly idAutomatico = `siaf-tabs-${++contadorDeFilas}`;

  @Input() tabs: TabItem[] = [];
  @Input() activeId = '';
  /** Figma «Border»: `true` dibuja la activa como carpeta; `false`, con subrayado azul. */
  @Input() border = true;
  /** Reparte el ancho disponible entre las pestañas. */
  @Input() fullWidth = false;
  /** Nombre accesible de la fila de pestañas. */
  @Input() ariaLabel = '';
  /** Prefijo de los ids de las pestañas (`idBase-idDeLaPestaña`), para que el panel los cite en `aria-labelledby`. */
  @Input() idBase = '';

  /** Emite el `id` de la pestaña elegida (no se emite al pulsar la que ya está activa). */
  @Output() activeIdChange = new EventEmitter<string>();
  @Output() selected = new EventEmitter<TabItem>();

  get hayActiva(): boolean {
    return this.tabs.some((tab) => tab.id === this.activeId);
  }

  selectTab(id: string): void {
    if (id === this.activeId) {
      return;
    }
    this.activeId = id;
    this.activeIdChange.emit(id);

    const tab = this.tabs.find((item) => item.id === id);
    if (tab) {
      this.selected.emit(tab);
    }
  }

  tabId(id: string): string {
    return `${this.idBase || this.idAutomatico}-${id}`;
  }

  alPresionarTecla(event: KeyboardEvent, indice: number): void {
    const total = this.tabs.length;
    const destino: Record<string, number> = {
      ArrowRight: (indice + 1) % total,
      ArrowLeft: (indice - 1 + total) % total,
      Home: 0,
      End: total - 1,
    };
    if (!(event.key in destino)) {
      return;
    }
    event.preventDefault();
    this.focusAt(destino[event.key]);
  }

  focusAt(index: number): void {
    const tab = this.tabs[index];
    if (!tab) {
      return;
    }

    this.selectTab(tab.id);
    this.host.nativeElement.querySelectorAll<HTMLElement>('[role="tab"]')[index]?.focus();
  }
}
