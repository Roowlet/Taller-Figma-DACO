import { ChangeDetectionStrategy, Component, HostListener, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { FocoDirective } from '../../ui/foco/foco.directive';
import { IconComponent } from '../../ui/icon/icon.component';
import { TooltipDirective } from '../../ui/tooltip/tooltip.directive';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

let siguienteId = 0;

/**
 * Ruta de navegación (migas de pan) de la página: enlace de inicio con ícono de casa y los niveles hasta la pantalla
 * actual, en un `<nav>` con lista ordenada. Con rutas largas colapsa los niveles intermedios detrás del botón «…»: en
 * escritorio, con más de tres niveles, quedan visibles los dos últimos; en móvil, solo el último. Si el primer ítem se
 * llama «Inicio», la casa usa su ruta en vez de `homeHref`.
 *
 * @usar
 * - Arriba de toda pantalla del shell, sobre el título. Ya lo traen `siaf-documents-records-page` (bandejas),
 *   `siaf-solicitude-page-layout` (solicitudes) y `siaf-page-shell`; las listas de Admin (Gestor de Usuarios,
 *   Entidades, Perfiles funcionales) y la configuración de Apertura contable lo usan directo.
 * - Con los niveles armados por `buildProcessBreadcrumbs` (`shared/utils/breadcrumbs.util.ts`), que los toma del árbol
 *   de procesos y avisa en desarrollo si el proceso no existe.
 * - En las páginas públicas del landing (noticia, servicio, sistema), con `homeHref="/landing"`.
 * @evitar
 * - En páginas que ya usan `siaf-documents-records-page`, `siaf-solicitude-page-layout` o `siaf-page-shell`: no agregar
 *   otro.
 * - Escribir los niveles a mano repitiendo el árbol del menú: usar `buildProcessBreadcrumbs`.
 * - Para alternar vistas de la misma pantalla: usar `siaf-tabs` o `siaf-records-tabs`; para las etapas de un flujo,
 *   `siaf-steps` o `siaf-action-tracker`.
 * @teclado
 * - **Tab**: recorre el enlace de inicio, el botón «…» (si hay niveles ocultos) y los niveles con enlace; el nivel
 *   actual es texto y no recibe foco.
 * - **Enter**: sigue el enlace enfocado.
 * - **Enter / Espacio** en «…»: abre o cierra la lista de niveles intermedios; al abrirla, el foco pasa al primer
 *   nivel con enlace.
 * - **Escape**: con la lista abierta, la cierra y el foco vuelve a «…». Salir de la lista con Tab o pulsar fuera
 *   también la cierra.
 * @accesibilidad
 * - **1.3.1 Información y relaciones (A)**: `<nav aria-label="Ruta de navegación">` con lista ordenada (`<ol>` y
 *   `<li>`); las flechas separadoras son íconos decorativos y el enlace de inicio lleva `aria-label="Inicio"`.
 * - **Pendiente · 4.1.2 Nombre, función y valor (A)**: «…» es un `<button>` con `aria-label="Niveles intermedios"`,
 *   `aria-expanded` y `aria-controls` hacia una lista (`<ul>`) de enlaces, el patrón de revelación de una navegación;
 *   falta que el nivel actual marque `aria-current="page"`.
 * - **2.4.3 Orden del foco (A)**: con `siafFoco`, al abrir la lista el foco entra en el primer nivel con enlace y al
 *   cerrarla con Escape vuelve a «…»; salir de la lista con Tab la cierra.
 * - **Pendiente · 2.1.1 Teclado (A)**: enlaces y «…» se alcanzan con Tab, pero el nivel actual y los niveles sin enlace
 *   no reciben foco: si su texto se corta, el completo (`siafTooltip`) solo aparece con el mouse.
 * - **2.4.7 Foco visible (AA)**: inicio y «…» tienen contorno de 2 px con separación (`border-states-focus`); los
 *   enlaces de texto usan el anillo del navegador.
 * - **1.4.11 Contraste no textual (AA)**: el contorno de foco de inicio y «…» es el azul del kit
 *   (`border-states-focus`, 5.35:1 claro / 10.15:1 oscuro sobre la superficie).
 * - **1.4.3 Contraste mínimo (AA)**: niveles con enlace `text-text` (16.29:1 claro / 16.53:1 oscuro) y nivel actual
 *   `text-text-muted` (5.01:1 / 8.86:1) sobre `bg-surface`.
 * - **2.5.8 Tamaño del objetivo (AA)**: inicio y «…» miden 32×32 px; los enlaces de texto son bajos (texto de 12 px),
 *   pero la flecha y los espacios los separan unos 20 px (excepción por espaciado).
 */
@Component({
  selector: 'siaf-breadcrumb',
  standalone: true,
  imports: [FocoDirective, IconComponent, RouterLink, TooltipDirective],
  template: `
    <nav class="flex h-10 w-full min-w-0 items-center bg-surface px-siaf-md py-siaf-xxs" aria-label="Ruta de navegación">
      <ol class="flex w-full min-w-0 items-center gap-siaf-xxs overflow-visible text-xs leading-none">
        <li class="flex shrink-0 items-center gap-siaf-xxs">
          <a
            class="inline-flex size-8 items-center justify-center rounded-siaf-md text-text transition hover:bg-surface-muted focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sys-color-border-states-focus)]"
            [routerLink]="resolvedHomeHref"
            aria-label="Inicio"
          >
            <siaf-icon name="home" [size]="20" />
          </a>
          @if (displayItems.length > 0) {
            <siaf-icon class="text-text-muted" name="keyboard_arrow_right" [size]="12" />
          }
        </li>

        @if (hasMobileCollapsedItems) {
          <li class="relative flex shrink-0 items-center gap-siaf-xxs md:hidden">
            <button
              class="inline-flex size-8 items-center justify-center rounded-siaf-md text-text-muted transition hover:bg-surface-muted hover:text-text focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sys-color-border-states-focus)]"
              type="button"
              aria-label="Niveles intermedios"
              [attr.aria-expanded]="collapsedMenuOpen"
              [attr.aria-controls]="collapsedMenuOpen ? idListaMovil : null"
              (click)="toggleCollapsedMenu($event)"
            >
              <siaf-icon name="more_horiz" [size]="20" />
            </button>
            <siaf-icon class="text-text-muted" name="keyboard_arrow_right" [size]="12" />

            @if (collapsedMenuOpen) {
              <ul
                class="absolute left-0 top-9 z-30 w-[min(256px,calc(100vw-32px))] rounded-siaf-md border border-border bg-surface py-siaf-xs shadow-lg"
                [id]="idListaMovil"
                siafFoco
                [siafFocoAtrapar]="false"
                (siafFocoEscape)="closeCollapsedMenu()"
                (siafFocoSalida)="closeCollapsedMenu()"
                (click)="$event.stopPropagation()"
              >
                @for (item of mobileCollapsedItems; track item.label) {
                  <li>
                    @if (item.href) {
                      <a class="block truncate px-siaf-md py-siaf-sm text-xs font-medium text-text hover:bg-surface-muted" siafTooltip [routerLink]="item.href">
                        {{ item.label }}
                      </a>
                    } @else {
                      <span class="block truncate px-siaf-md py-siaf-sm text-xs font-medium text-text-muted" siafTooltip>
                        {{ item.label }}
                      </span>
                    }
                  </li>
                }
              </ul>
            }
          </li>
        }

        @if (hasDesktopCollapsedItems) {
          <li class="relative hidden shrink-0 items-center gap-siaf-xxs md:flex">
            <button
              class="inline-flex size-8 items-center justify-center rounded-siaf-md text-text-muted transition hover:bg-surface-muted hover:text-text focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sys-color-border-states-focus)]"
              type="button"
              aria-label="Niveles intermedios"
              [attr.aria-expanded]="collapsedMenuOpen"
              [attr.aria-controls]="collapsedMenuOpen ? idListaEscritorio : null"
              (click)="toggleCollapsedMenu($event)"
            >
              <siaf-icon name="more_horiz" [size]="20" />
            </button>
            <siaf-icon class="text-text-muted" name="keyboard_arrow_right" [size]="12" />

            @if (collapsedMenuOpen) {
              <ul
                class="absolute left-0 top-9 z-30 min-w-64 max-w-80 rounded-siaf-md border border-border bg-surface py-siaf-xs shadow-lg"
                [id]="idListaEscritorio"
                siafFoco
                [siafFocoAtrapar]="false"
                (siafFocoEscape)="closeCollapsedMenu()"
                (siafFocoSalida)="closeCollapsedMenu()"
                (click)="$event.stopPropagation()"
              >
                @for (item of desktopCollapsedItems; track item.label) {
                  <li>
                    @if (item.href) {
                      <a class="block truncate px-siaf-md py-siaf-sm text-xs font-medium text-text hover:bg-surface-muted" siafTooltip [routerLink]="item.href">
                        {{ item.label }}
                      </a>
                    } @else {
                      <span class="block truncate px-siaf-md py-siaf-sm text-xs font-medium text-text-muted" siafTooltip>
                        {{ item.label }}
                      </span>
                    }
                  </li>
                }
              </ul>
            }
          </li>
        }

        @for (item of mobileVisibleItems; track item.label; let last = $last) {
          <li class="flex min-w-0 flex-1 items-center gap-siaf-xxs md:hidden">
            @if (item.href && !last) {
              <a class="min-w-0 flex-1 truncate font-medium text-text hover:underline" siafTooltip [routerLink]="item.href">
                {{ item.label }}
              </a>
            } @else {
              <span
                class="min-w-0 flex-1 truncate" siafTooltip
                [class.font-medium]="!last"
                [class.font-normal]="last"
                [class.text-text]="!last"
                [class.text-text-muted]="last"
              >
                {{ item.label }}
              </span>
            }
            @if (!last) {
              <siaf-icon class="text-text-muted" name="keyboard_arrow_right" [size]="12" />
            }
          </li>
        }

        @for (item of desktopVisibleItems; track item.label; let last = $last) {
          <li class="hidden min-w-0 shrink-0 items-center gap-siaf-xxs md:flex">
            @if (item.href && !last) {
              <a class="max-w-[180px] truncate font-medium text-text hover:underline" siafTooltip [routerLink]="item.href">
                {{ item.label }}
              </a>
            } @else {
              <span
                class="max-w-[220px] truncate" siafTooltip
                [class.font-medium]="!last"
                [class.font-normal]="last"
                [class.text-text]="!last"
                [class.text-text-muted]="last"
              >
                {{ item.label }}
              </span>
            }
            @if (!last) {
              <siaf-icon class="text-text-muted" name="keyboard_arrow_right" [size]="12" />
            }
          </li>
        }
      </ol>
    </nav>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BreadcrumbComponent {
  @Input() items: BreadcrumbItem[] = [];
  @Input() homeHref = '#';

  collapsedMenuOpen = false;

  private readonly id = siguienteId++;
  /** Móvil y escritorio tienen cada uno su «…» y su lista; el CSS muestra solo la que corresponde. */
  readonly idListaMovil = `siaf-breadcrumb-niveles-movil-${this.id}`;
  readonly idListaEscritorio = `siaf-breadcrumb-niveles-${this.id}`;

  @HostListener('document:click')
  closeCollapsedMenu(): void {
    this.collapsedMenuOpen = false;
  }

  get resolvedHomeHref(): string {
    return this.homeItem?.href || this.homeHref;
  }

  get displayItems(): BreadcrumbItem[] {
    // El icono de home ya representa "Inicio"; si llega como item, se usa solo su ruta.
    if (this.homeItem) {
      return this.items.slice(1);
    }

    return this.items;
  }

  get mobileVisibleItems(): BreadcrumbItem[] {
    return this.displayItems.slice(-1);
  }

  get desktopVisibleItems(): BreadcrumbItem[] {
    const displayItems = this.displayItems;

    // Regla UX del Figma: para rutas largas se muestra Home > ... > penultimo > actual.
    if (displayItems.length > 3) {
      return displayItems.slice(-2);
    }

    return displayItems;
  }

  get hasMobileCollapsedItems(): boolean {
    return this.displayItems.length > 1;
  }

  get hasDesktopCollapsedItems(): boolean {
    return this.displayItems.length > 3;
  }

  get mobileCollapsedItems(): BreadcrumbItem[] {
    if (!this.hasMobileCollapsedItems) {
      return [];
    }

    // En movil solo queda visible el ultimo nivel; todo lo anterior vive detras de "...".
    return this.displayItems.slice(0, -1);
  }

  get desktopCollapsedItems(): BreadcrumbItem[] {
    if (!this.hasDesktopCollapsedItems) {
      return [];
    }

    // En desktop estos niveles se ocultan detras del boton "...".
    return this.displayItems.slice(0, -2);
  }

  toggleCollapsedMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.collapsedMenuOpen = !this.collapsedMenuOpen;
  }

  private get homeItem(): BreadcrumbItem | undefined {
    const firstItem = this.items[0];

    if (firstItem?.label.trim().toLowerCase() === 'inicio') {
      return firstItem;
    }

    return undefined;
  }
}
