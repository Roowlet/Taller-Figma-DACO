import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { SidebarNavigation } from '../sidebar/sidebar.component';
import { IconComponent } from '../../shared/ui/icon/icon.component';

type MobileNavigationItem = {
  id: SidebarNavigation | 'Ayuda';
  label: string;
  icon: string;
};

/**
 * Versión móvil del sidebar: la navegación principal del shell cuando no hay espacio para la barra fija.
 *
 * Reusa el mismo tipo `SidebarNavigation` que `siaf-sidebar`, así que el shell trata ambos con los mismos
 * handlers. Los ítems están fijos en el componente; "Ayuda" no es una sección navegable — emite `help`
 * aparte y nunca se marca como activo.
 *
 * @usar
 * - Como navegación principal por debajo de `lg` (1024 px): `siaf-app-shell` lo abre a pantalla completa desde el
 *   botón de menú de `siaf-navbar`, en lugar del rail.
 * - Para ofrecer en una sola lista Crear documento, Panel, Bandeja, Procesos, Ayuda y Ajustes, con `ctaAdd` atado al
 *   permiso `document.create`.
 * @evitar
 * - En escritorio: la barra fija es `siaf-sidebar` (variante `rail`), que emite los mismos eventos.
 * - Para listar procesos o secciones de la bandeja: al elegir el destino, el armazón abre `siaf-process-menu-tree` o
 *   `siaf-tray-menu`.
 * - Para una lista de opciones dentro de una pantalla: usar `siaf-list`, o `siaf-menu` si son acciones.
 * @teclado
 * - **Tab**: recorre «Crear documento» (se salta si `ctaAdd` es false) y los cinco destinos, en orden.
 * - **Enter / Espacio**: eligen el destino (`navigationChanged`); «Ayuda» emite `help` y «Crear documento», `created`.
 * @accesibilidad
 * - **Pendiente · 1.3.1 Información y relaciones (A)**: es un `<aside>` con `h2` y un `<nav>`, pero ninguno tiene
 *   `aria-label` y los destinos son botones sueltos, sin lista `ul`/`li`: el lector no dice cuántos hay.
 * - **1.4.1 Uso del color (A)**: el destino activo, además del fondo y el color, va en negrita.
 * - **1.4.3 Contraste mínimo (AA)**: «Crear documento» en `text-brand-white` sobre `bg-brand-accent` (4.89:1 / 5.65:1);
 *   en claro, destinos en `text-neutral-medium` sobre blanco (14.53:1). En oscuro el fondo es `bg-surfaces-field` y
 *   falta medirlo.
 * - **1.4.11 Contraste no textual (AA)**: el contorno de foco es el azul del kit (`border-states-focus`, 5.35:1 claro
 *   / 10.15:1 oscuro sobre la superficie).
 * - **Pendiente · 2.4.3 Orden del foco (A)**: no toma el foco al abrirse (el Tab pasa antes por el logo, la campana y el
 *   perfil del navbar), no cierra con Escape y la página de fondo sigue en el orden de tabulación. Le toca al armazón,
 *   que hoy no lo hace.
 * - **2.4.7 Foco visible (AA)**: los destinos muestran un contorno azul de 2 px con `focus-visible`; «Crear documento»
 *   no tiene estilo propio y queda con el anillo del navegador.
 * - **2.5.8 Tamaño del objetivo (AA)**: destinos de 48 px de alto y «Crear documento» de 40 px, a todo el ancho.
 * - **Pendiente · 4.1.2 Nombre, función y valor (A)**: cada destino es un `<button>` con su texto como nombre y «Crear
 *   documento» usa `disabled`, pero el activo solo se marca con estilo: falta `aria-current`.
 */
@Component({
  selector: 'siaf-mobile-navigation-menu',
  standalone: true,
  imports: [IconComponent],
  template: `
    <aside class="min-h-[calc(100vh-56px)] w-full border-r border-[var(--sys-color-divider-default)] bg-[var(--sys-color-bg-surfaces-field,var(--sys-color-bg-surfaces-surface-highest))]">
      <header class="sticky top-0 z-[2] bg-[var(--sys-color-bg-surfaces-field,var(--sys-color-bg-surfaces-surface))] p-siaf-md">
        <h2 class="m-0 min-h-6 text-base font-bold uppercase leading-normal tracking-[0.02px] text-text">Bandeja de documentos</h2>
      </header>

      <div class="flex flex-col gap-siaf-lg bg-[var(--sys-color-bg-surfaces-field,var(--sys-color-bg-surfaces-surface))] px-siaf-md py-siaf-xs">
        <button
          class="inline-flex min-h-10 w-full items-center justify-center gap-siaf-xs rounded-siaf-md px-siaf-md py-siaf-xs text-sm font-medium transition enabled:bg-[var(--sys-color-bg-brand-accent)] enabled:text-[var(--sys-color-text-brand-white)] enabled:hover:brightness-90 enabled:active:brightness-75 disabled:cursor-not-allowed disabled:bg-[var(--sys-color-bg-surfaces-disabled)] disabled:text-[var(--sys-color-text-neutral-disabled)]"
          type="button"
          [disabled]="!ctaAdd"
          (click)="created.emit()"
        >
          <siaf-icon name="add" [size]="24" />
          Crear documento
        </button>

        <nav class="flex w-full flex-col">
          @for (item of items; track item.id) {
            <button
              class="flex min-h-12 w-full items-center gap-siaf-md overflow-hidden rounded-siaf-sm px-siaf-md py-siaf-sm text-left transition hover:bg-[var(--sys-color-bg-states-light-hover)] focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sys-color-border-states-focus)]"
              type="button"
              [class.bg-[var(--sys-color-bg-states-light-selected)]]="isActive(item.id)"
              (click)="select(item)"
            >
              <siaf-icon
                class="shrink-0"
                [name]="item.icon"
                [size]="24"
                [class.text-[var(--sys-color-text-neutral-activated)]]="isActive(item.id)"
                [class.text-[var(--sys-color-text-neutral-medium)]]="!isActive(item.id)"
              />
              <span
                class="min-w-0 flex-1 text-sm leading-normal"
                [class.font-bold]="isActive(item.id)"
                [class.font-normal]="!isActive(item.id)"
                [class.tracking-[-0.02px]]="isActive(item.id)"
                [class.tracking-[0.025px]]="!isActive(item.id)"
                [class.text-[var(--sys-color-text-neutral-activated)]]="isActive(item.id)"
                [class.text-[var(--sys-color-text-neutral-medium)]]="!isActive(item.id)"
              >
                {{ item.label }}
              </span>
            </button>
          }
        </nav>
      </div>
    </aside>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MobileNavigationMenuComponent {
  @Input() navigation: SidebarNavigation = 'Panel';
  @Input() ctaAdd = false;

  @Output() created = new EventEmitter<void>();
  @Output() navigationChanged = new EventEmitter<SidebarNavigation>();
  @Output() help = new EventEmitter<void>();

  readonly items: MobileNavigationItem[] = [
    { id: 'Panel', label: 'Panel', icon: 'space_dashboard' },
    { id: 'Bandeja', label: 'Bandeja', icon: 'send' },
    { id: 'Proceso', label: 'Procesos', icon: 'edit_note' },
    { id: 'Ayuda', label: 'Ayuda', icon: 'help_outline' },
    { id: 'Ajustes', label: 'Ajustes', icon: 'settings' }
  ];

  isActive(id: MobileNavigationItem['id']): boolean {
    return id !== 'Ayuda' && this.navigation === id;
  }

  select(item: MobileNavigationItem): void {
    if (item.id === 'Ayuda') {
      this.help.emit();
      return;
    }

    this.navigationChanged.emit(item.id);
  }
}
