import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, computed, inject } from '@angular/core';

import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { NotificationsStateService } from '../../core/realtime/notifications-state.service';
import { SolicitudesStateService } from '../../core/state/solicitudes-state.service';
import { PermissionService } from '../../core/auth/permission.service';

type TrayItem = {
  label: string;
  icon: string;
  count: string;
  active?: boolean;
};

/**
 * Menú de la Bandeja de Documentos: lista Recibidos, Enviados, Borradores, Notificaciones y Papelera
 * con su contador, y emite en `selected` la sección elegida.
 *
 * Los contadores son un `computed` que depende del rol: `SolicitudesStateService` para las bandejas
 * (el aprobador no tiene Borradores ni Papelera) y `NotificationsStateService.unreadCount()` —la misma
 * fuente por socket que la campana del navbar— para Notificaciones. Se muestran a dos dígitos, tope '99+'.
 *
 * @usar
 * - Como panel de la Bandeja en `siaf-app-shell`: se abre desde Bandeja del rail o del menú móvil, y la sección elegida
 *   decide si se pinta `siaf-tray-documents-view` o `siaf-tray-notifications-view`.
 * - Para ver de un vistazo cuántos documentos hay por sección según el rol y cuántas notificaciones sin leer, con la
 *   misma cuenta que la campana de `siaf-navbar`.
 * @evitar
 * - Para la navegación principal: usar `siaf-sidebar` o `siaf-mobile-navigation-menu`.
 * - Para alternar secciones dentro de una pantalla (Documentos / Registros): usar `siaf-tabs` o `siaf-records-tabs`.
 * - Para una lista de opciones con contador fuera del armazón: usar `siaf-list` con un badge al final.
 * @teclado
 * - **Tab**: recorre las cinco secciones en orden.
 * - **Enter / Espacio**: emiten `selected` con la sección (Recibidos, Enviados, Borradores, Notificaciones o Papelera).
 * @accesibilidad
 * - **Pendiente · 1.3.1 Información y relaciones (A)**: es un `<aside>` con `h2` y un `<nav>`, pero el `nav` no tiene
 *   `aria-label` (en escritorio convive con el del rail) y las secciones son botones sueltos, sin lista `ul`/`li`.
 * - **1.4.1 Uso del color (A)**: la sección elegida, además del fondo y el color, va en negrita.
 * - **1.4.3 Contraste mínimo (AA)**: contadores de `siaf-badge` en blanco sobre `bg-brand-accent` (4.89:1 / 5.65:1) y,
 *   en claro, secciones en `text-neutral-medium` sobre blanco (14.53:1); en oscuro el fondo es
 *   `bg-surfaces-surface-highest` y falta medirlo.
 * - **1.4.11 Contraste no textual (AA)**: el contorno de foco es el azul del kit (`border-states-focus`, 5.35:1 claro
 *   / 10.15:1 oscuro sobre la superficie).
 * - **Pendiente · 2.4.3 Orden del foco (A)**: no toma el foco al abrirse ni cierra con Escape; el armazón lo pinta
 *   después del rail, así que desde Bandeja el Tab pasa antes por Procesos, Ayuda y Ajustes.
 * - **2.4.7 Foco visible (AA)**: cada sección muestra un contorno azul de 2 px con `focus-visible`.
 * - **Pendiente · 4.1.2 Nombre, función y valor (A)**: cada sección es un `<button>` cuyo nombre incluye el contador
 *   («Recibidos 03»), pero la elegida no publica `aria-current`.
 * - **4.1.3 Mensajes de estado (AA)**: los contadores se leen dentro del botón al enfocarlo; no son región viva, así que
 *   avisar de una notificación nueva le toca a la campana de `siaf-navbar`.
 */
@Component({
  selector: 'siaf-tray-menu',
  standalone: true,
  imports: [BadgeComponent, IconComponent],
  template: `
    <aside class="flex h-[calc(100vh-56px)] w-full flex-col items-center border-r border-[var(--sys-color-divider-default)] bg-[var(--sys-color-bg-surfaces-surface-highest,white)] py-siaf-xs shadow-siaf-elevation-1 lg:w-[300px]">
      <header class="flex w-full items-center px-siaf-lg py-siaf-md">
        <h2 class="m-0 text-sm font-bold leading-normal text-[var(--sys-color-tipography-neutral-high)]">BANDEJA</h2>
      </header>

      <nav class="flex w-full flex-col">
        @for (item of resolvedItems(); track item.label) {
          <button
            class="flex min-h-12 w-full items-center gap-siaf-md overflow-hidden rounded-siaf-sm px-siaf-md py-siaf-sm text-left transition hover:bg-[var(--sys-color-bg-states-light-hover)] focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sys-color-border-states-focus)]"
            type="button"
            [class.bg-[var(--sys-color-bg-states-light-selected)]]="isSelected(item)"
            (click)="selected.emit(item.label)"
          >
            <siaf-icon
              class="shrink-0"
              [name]="item.icon"
              [size]="24"
              [class.text-[var(--sys-color-text-neutral-activated)]]="isSelected(item)"
              [class.text-[var(--sys-color-text-neutral-medium)]]="!isSelected(item)"
            />
            <span
              class="min-w-0 flex-1 text-sm leading-normal tracking-[0.025px]"
              [class.font-bold]="isSelected(item)"
              [class.font-normal]="!isSelected(item)"
              [class.text-[var(--sys-color-text-neutral-activated)]]="isSelected(item)"
              [class.text-[var(--sys-color-text-neutral-medium)]]="!isSelected(item)"
            >
              {{ item.label }}
            </span>
            <siaf-badge class="shrink-0" [label]="item.count" [minWidth]="32" />
          </button>
        }
      </nav>
    </aside>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrayMenuComponent {
  private readonly notifications = inject(NotificationsStateService);
  private readonly solicitudesState = inject(SolicitudesStateService);
  private readonly permissionService = inject(PermissionService);

  @Input() selectedItem = 'Borradores';
  @Output() selected = new EventEmitter<string>();

  private fmt(n: number): string {
    return n > 99 ? '99+' : String(n).padStart(2, '0');
  }

  readonly resolvedItems = computed(() => {
    const role = this.permissionService.currentRole();
    const unread = this.notifications.unreadCount();
    const isAprobador = role === 'approver';

    const recibidos = isAprobador
      ? this.solicitudesState.aprobadorRecibidosCount()
      : this.solicitudesState.creadorRecibidosCount();

    const enviados = isAprobador
      ? this.solicitudesState.aprobadorEnviadosCount()
      : this.solicitudesState.creadorEnviadosCount();

    const borradores = isAprobador ? 0 : this.solicitudesState.creadorBorradoresCount();
    const papelera   = isAprobador ? 0 : this.solicitudesState.creadorPapeleraCount();

    const base: TrayItem[] = [
      { label: 'Recibidos',      icon: 'description',   count: this.fmt(recibidos) },
      { label: 'Enviados',       icon: 'send',          count: this.fmt(enviados) },
      { label: 'Borradores',     icon: 'edit_note',     count: this.fmt(borradores) },
      { label: 'Notificaciones', icon: 'notifications', count: this.fmt(unread) },
      { label: 'Papelera',       icon: 'delete',        count: this.fmt(papelera) },
    ];

    return base;
  });

  isSelected(item: TrayItem): boolean {
    return item.label === this.selectedItem;
  }
}
