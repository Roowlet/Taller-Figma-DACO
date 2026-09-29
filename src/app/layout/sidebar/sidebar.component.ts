import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { IconComponent } from '../../shared/ui/icon/icon.component';

export interface SidebarItem {
  label: string;
  href?: string;
  active?: boolean;
  icon?: string;
  id?: SidebarNavigation;
}

export type SidebarNavigation = 'Default' | 'Panel' | 'Bandeja' | 'Proceso' | 'Ajustes';
export type SidebarVariant = 'rail' | 'expanded';

type RailItem = {
  id: Exclude<SidebarNavigation, 'Default'>;
  label: string;
  icon: string;
};

const RAIL_ITEMS: RailItem[] = [
  { id: 'Panel', label: 'Panel', icon: 'space_dashboard' },
  { id: 'Bandeja', label: 'Bandeja', icon: 'inbox' },
  { id: 'Proceso', label: 'Procesos', icon: 'picture_in_picture' }
];

/**
 * Barra lateral de navegación del shell autenticado, en dos variantes: `rail` (iconos) y `expanded` (lista).
 *
 * El rail arma sus destinos desde la constante local `RAIL_ITEMS` (Panel, Bandeja, Procesos) y suma
 * Crear, Ayuda y Ajustes; no navega por sí mismo: solo emite `created`, `help` y `navigationChanged`,
 * y pinta como activo lo que el padre le pase en `navigation`. La variante `expanded` usa `items`.
 *
 * @usar
 * - Variante `rail` como navegación fija de escritorio (desde `lg`): `siaf-app-shell` la pinta a la izquierda con
 *   Crear, Panel, Bandeja, Procesos, Ayuda y Ajustes.
 * - Con `ctaAdd` atado al permiso `document.create` (Crear se deshabilita si el rol no puede crear) y `buttonHelp`
 *   para mostrar Ayuda.
 * - Para indicar en qué área está el usuario: el armazón le pasa en `navigation` Panel, Procesos o Ajustes según la URL.
 * @evitar
 * - En móvil: usar `siaf-mobile-navigation-menu`, que comparte `SidebarNavigation` y los mismos handlers.
 * - Para navegar dentro de un módulo (Documentos / Registros, Detalle / Historial): usar `siaf-tabs` o
 *   `siaf-records-tabs`.
 * - La variante `expanded` en pantallas nuevas: no tiene uso en la app y sus enlaces usan `href` en vez del router;
 *   para un menú de destinos, `siaf-process-menu-tree` con otro arreglo de nodos.
 * @teclado
 * - **Tab**: recorre Crear, Panel, Bandeja, Procesos, Ayuda (con `buttonHelp`) y Ajustes; Crear deshabilitado
 *   (`ctaAdd` en false) se salta.
 * - **Enter / Espacio**: emiten `created`, `navigationChanged` o `help`; el componente no navega ni abre paneles.
 * - **Enter** (variante `expanded`): sigue el enlace `<a href>` del ítem.
 * @accesibilidad
 * - **Pendiente · 1.3.1 Información y relaciones (A)**: es un `<aside>` con un `<nav>` que solo agrupa Panel, Bandeja y
 *   Procesos (Crear, Ayuda y Ajustes quedan fuera); ni el `aside` ni el `nav` tienen `aria-label` y los destinos no
 *   van en lista `ul`/`li`.
 * - **Pendiente · 1.4.1 Uso del color (A)**: en el rail, el destino activo solo cambia de color (capa `brand-primary`
 *   detrás del ícono y el ícono en azul); el texto no cambia. En `expanded` el activo además va en `font-medium`.
 * - **1.4.3 Contraste mínimo (AA)**: rail con `text-neutral-medium` sobre la superficie (14.53:1 / 12.87:1); en
 *   `expanded`, título y activo en blanco sobre `bg-brand-secondary` (8.70:1 / 5.95:1).
 * - **Pendiente · 1.4.11 Contraste no textual (AA)**: el contorno de foco del rail es el azul del kit
 *   (`border-states-focus`, 5.35:1 / 10.15:1), pero en oscuro el ícono activo, en `bg-brand-primary`, no llega a 3:1.
 * - **2.4.7 Foco visible (AA)**: los botones del rail muestran un contorno azul de 2 px con `focus-visible`; los enlaces
 *   de `expanded` quedan con el anillo del navegador.
 * - **2.5.8 Tamaño del objetivo (AA)**: cada botón del rail ocupa el ancho de la barra (56 px) y más de 60 px de alto.
 * - **Pendiente · 4.1.2 Nombre, función y valor (A)**: cada destino es un `<button>` con su texto como nombre y Crear usa
 *   `disabled`, pero el activo no publica `aria-current` (tampoco `item.active` en `expanded`). En el armazón, Bandeja,
 *   Procesos y Ajustes abren un panel sin `aria-expanded`: el componente no recibe si está abierto.
 */
@Component({
  selector: 'siaf-sidebar',
  standalone: true,
  imports: [IconComponent, NgClass],
  template: `
    @if (variant === 'rail') {
      <aside class="flex h-full min-h-0 w-16 flex-col items-center gap-0 overflow-y-auto border-r border-[var(--sys-color-divider-default)] bg-[var(--sys-color-bg-surfaces-surface)] px-siaf-xxs py-siaf-xs">
        <div class="z-[1] flex min-h-0 w-full flex-1 flex-col items-center gap-siaf-xxs">
          <button
            class="group flex w-full flex-col items-center gap-siaf-xxs px-0 py-siaf-xs text-center font-['Inter'] text-[10px] font-medium leading-normal text-[var(--sys-color-text-neutral-medium)] transition duration-150 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sys-color-border-states-focus)] active:scale-[0.98] disabled:cursor-not-allowed"
            type="button"
            [disabled]="!ctaAdd"
            [ngClass]="ctaAdd ? 'text-[var(--sys-color-text-neutral-medium)]' : 'text-[var(--sys-color-text-neutral-disabled)]'"
            (click)="created.emit()"
          >
            <span
              class="relative inline-flex size-10 items-center justify-center rounded-siaf-md transition duration-150"
              [ngClass]="ctaAdd ? 'bg-[var(--sys-color-bg-brand-accent)] text-[var(--sys-color-text-brand-white)] group-hover:brightness-90 group-active:brightness-75' : 'bg-[var(--sys-color-bg-surfaces-disabled)] text-[var(--sys-color-text-neutral-disabled)]'"
            >
              @if (!ctaAdd) {
                <span class="absolute inset-0 rounded-siaf-md bg-[var(--sys-color-bg-states-dark-disabled)]"></span>
              }
              <siaf-icon class="relative" name="add" [size]="24" />
            </span>
            <span class="font-['Inter'] text-[10px] font-medium leading-normal text-[var(--sys-color-text-neutral-medium)]">Crear</span>
          </button>

          <nav class="flex min-h-0 w-full flex-1 flex-col items-center gap-siaf-xxs">
            @for (item of railItems; track item.id) {
              <button
                class="group flex w-full flex-col items-center gap-siaf-xxs px-0 py-siaf-xs text-center font-['Inter'] text-[10px] font-medium leading-normal text-[var(--sys-color-text-neutral-medium)] transition duration-150 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sys-color-border-states-focus)] active:scale-[0.98]"
                type="button"
                (click)="navigationChanged.emit(item.id)"
              >
                <span class="relative inline-flex size-8 items-center justify-center rounded-siaf-md" [ngClass]="iconShellClass(item.id)">
                  @if (isActive(item.id)) {
                    <span class="absolute inset-0 rounded-siaf-md bg-brand-primary/10"></span>
                  }
                  <siaf-icon class="relative" [name]="item.icon" [size]="24" />
                </span>
                <span class="font-['Inter'] text-[10px] font-medium leading-normal text-[var(--sys-color-text-neutral-medium)]">{{ item.label }}</span>
              </button>
            }
          </nav>

          @if (buttonHelp) {
            <button
              class="group flex w-full flex-col items-center gap-siaf-xxs px-0 py-siaf-xs text-center font-['Inter'] text-[10px] font-medium leading-normal text-[var(--sys-color-text-neutral-medium)] transition duration-150 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sys-color-border-states-focus)] active:scale-[0.98]"
              type="button"
              (click)="help.emit()"
            >
              <span class="inline-flex size-8 items-center justify-center rounded-siaf-md transition duration-150 group-hover:bg-[var(--sys-color-bg-states-light-hover)] group-active:bg-[var(--sys-color-bg-states-light-pressed)]">
                <siaf-icon name="help_outline" [size]="24" />
              </span>
              <span class="font-['Inter'] text-[10px] font-medium leading-normal text-[var(--sys-color-text-neutral-medium)]">Ayuda</span>
            </button>
          }

          <button
            class="group flex w-full flex-col items-center gap-siaf-xxs px-0 py-siaf-xs text-center font-['Inter'] text-[10px] font-medium leading-normal text-[var(--sys-color-text-neutral-medium)] transition duration-150 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sys-color-border-states-focus)] active:scale-[0.98]"
            type="button"
            (click)="navigationChanged.emit('Ajustes')"
          >
            <span class="relative inline-flex size-8 items-center justify-center rounded-siaf-md" [ngClass]="iconShellClass('Ajustes')">
              @if (isActive('Ajustes')) {
                <span class="absolute inset-0 rounded-siaf-md bg-brand-primary/10"></span>
              }
              <siaf-icon class="relative" name="settings" [size]="24" />
            </span>
            <span class="font-['Inter'] text-[10px] font-medium leading-normal text-[var(--sys-color-text-neutral-medium)]">Ajustes</span>
          </button>
        </div>
      </aside>
    } @else {
      <aside class="h-full w-64 border-r border-border bg-brand-secondary text-[var(--sys-color-text-brand-white)]">
        <div class="flex h-16 items-center border-b border-[var(--sys-color-border-on-brand-subtle)] px-6">
          <span class="text-lg font-bold tracking-normal">{{ title }}</span>
        </div>
        <nav class="grid gap-1 p-3 text-sm">
          @for (item of items; track item.label) {
            <a
              class="flex items-center gap-2 rounded-siaf-md px-3 py-2 transition hover:bg-[var(--sys-color-bg-states-on-brand-hover)] hover:text-[var(--sys-color-text-brand-white)]"
              [class.bg-[var(--sys-color-bg-states-on-brand-selected)]]="item.active"
              [class.font-medium]="item.active"
              [class.text-[var(--sys-color-text-brand-white)]\/75]="!item.active"
              [href]="item.href || '#'"
            >
              @if (item.icon) {
                <siaf-icon [name]="item.icon" [size]="18" />
              }
              {{ item.label }}
            </a>
          }
        </nav>
      </aside>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent {
  @Input() variant: SidebarVariant = 'rail';
  @Input() title = 'SIAF RP';
  @Input() items: SidebarItem[] = [];
  @Input() navigation: SidebarNavigation = 'Default';
  @Input() ctaAdd = true;
  @Input() buttonHelp = false;

  @Output() created = new EventEmitter<void>();
  @Output() navigationChanged = new EventEmitter<SidebarNavigation>();
  @Output() help = new EventEmitter<void>();

  readonly railItems = RAIL_ITEMS;

  isActive(item: SidebarNavigation): boolean {
    return this.navigation === item;
  }

  iconShellClass(item: SidebarNavigation): string {
    return this.isActive(item)
      ? 'bg-brand-primary/10 text-brand-primary group-hover:bg-brand-primary/15 group-active:bg-brand-primary/25'
      : 'bg-transparent text-[var(--sys-color-text-neutral-medium)] group-hover:bg-[var(--sys-color-bg-states-light-hover)] group-active:bg-[var(--sys-color-bg-states-light-pressed)]';
  }
}
