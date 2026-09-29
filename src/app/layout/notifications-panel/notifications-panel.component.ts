import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Router } from '@angular/router';

import { IconComponent } from '../../shared/ui/icon/icon.component';
import { NotificationsStateService } from '../../core/realtime/notifications-state.service';
import { NotificacionResponse } from '../../core/api/notificaciones-api.service';
import { FocoDirective } from '../../shared/ui/foco/foco.directive';

/**
 * Desplegable de notificaciones que abre la campana del navbar (lista, skeleton, vacío y "marcar leídas").
 *
 * Lee y muta el estado compartido de `NotificationsStateService` — la misma fuente del contador de la
 * campana — y no hace HTTP por su cuenta. Al tocar una notificación resuelve la ruta del documento por
 * código de tipo (SCC, SCMPC, SRAA, STAA, SCA, CAM) y navega, conservando compatibilidad con el campo
 * viejo `solicitud` además del actual `documento`.
 *
 * @usar
 * - Solo como desplegable de la campana de `siaf-navbar`, que lo pinta al abrirse y lo quita al recibir `closed`.
 * - Para revisar de un vistazo las notificaciones recientes y saltar al documento (SCC, SCMPC, SRAA, STAA, SCA o CAM)
 *   sin pasar por la bandeja.
 * @evitar
 * - Para el historial completo, con filtro y paginación: usar `siaf-tray-notifications-view` (Bandeja › Notificaciones).
 * - Para avisar el resultado de una acción del usuario: usar `siaf-snackbar` o `siaf-alert`.
 * - Suelto en una pantalla: `open` no lo oculta (lo decide quien lo pinta) y su posición supone la campana del navbar.
 * @teclado
 * - **Tab**: al abrir, el foco entra en «Marcar todas como leídas», si hay no leídas, o en la primera notificación;
 *   luego recorre cada notificación y puede salir del panel (no atrapa el foco: no es modal).
 * - **Escape**: cierra el panel (emite `closed`) y el foco vuelve a la campana.
 * - **Enter / Espacio**: en una notificación, emite `closed` y, si tiene documento, lo abre; en «Marcar todas como
 *   leídas», las marca.
 * @accesibilidad
 * - **1.3.1 Información y relaciones (A)**: encabezado `h3` y notificaciones en lista `ul`/`li`; cada una es un
 *   `<button>` cuyo nombre reúne título, fecha, mensaje y número del documento.
 * - **Pendiente · 1.4.3 Contraste mínimo (AA)**: título `text-text` 16.29:1 / 16.53:1, mensaje `text-neutral-medium`
 *   14.53:1 / 12.87:1, fecha `text-neutral-low` 5.01:1 / 8.86:1 y código blanco sobre `bg-brand-accent` 4.89:1 / 5.65:1;
 *   pero «Marcar todas como leídas» usa la clase `text-brand-primary` (azul de fondo de marca) y en oscuro queda en
 *   2.66:1.
 * - **1.4.11 Contraste no textual (AA)**: el contorno de foco es el azul del kit (`border-states-focus`, 5.35:1 claro
 *   / 10.15:1 oscuro sobre la superficie).
 * - **Pendiente · 2.4.3 Orden del foco (A)**: con `siafFoco` (sin atrapar Tab) el foco entra al abrir y Escape cierra
 *   devolviéndolo a la campana, pero al marcar todas como leídas el botón desaparece y el foco se pierde.
 * - **2.4.7 Foco visible (AA)**: «Marcar todas como leídas» y cada notificación muestran un contorno azul de 2 px con
 *   `focus-visible`.
 * - **4.1.2 Nombre, función y valor (A)**: el panel es `role="dialog"` con `aria-label="Notificaciones"`, y la campana
 *   de `siaf-navbar` publica `aria-expanded` y `aria-haspopup="dialog"`.
 * - **Pendiente · 4.1.3 Mensajes de estado (AA)**: la carga se marca con `role="status"` y `aria-live="polite"`, pero no
 *   se anuncia el resultado: ni el vacío «No tienes notificaciones nuevas.» ni el marcado de todas como leídas.
 */
@Component({
  selector: 'siaf-notifications-panel',
  standalone: true,
  imports: [FocoDirective, IconComponent],
  template: `
    <div
      class="fixed inset-x-2 top-[60px] z-50 overflow-hidden rounded-siaf-md bg-surface shadow-siaf-elevation-2 sm:absolute sm:inset-x-auto sm:right-0 sm:top-[calc(100%+8px)] sm:w-[360px] sm:max-w-[calc(100vw-32px)]"
      role="dialog"
      aria-label="Notificaciones"
      [siafFoco]="open"
      [siafFocoAtrapar]="false"
      (siafFocoEscape)="closed.emit()"
      (click)="$event.stopPropagation()"
    >
      <header class="flex items-center justify-between gap-siaf-md border-b border-[var(--sys-color-divider-default)] px-siaf-md py-siaf-sm">
        <h3 class="m-0 text-sm font-bold uppercase leading-5 text-text">Notificaciones</h3>
        @if (state.hasUnread()) {
          <button
            class="text-xs font-medium text-brand-primary hover:underline focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sys-color-border-states-focus)]"
            type="button"
            (click)="onMarkAllRead()"
          >
            Marcar todas como leídas
          </button>
        }
      </header>

      <div class="max-h-[70vh] overflow-y-auto sm:max-h-[420px]">
        @if (state.loading() && state.notifications().length === 0) {
          <ul class="m-0 flex list-none flex-col gap-0 p-0" role="status" aria-live="polite" aria-label="Cargando notificaciones">
            <span class="sr-only">Cargando notificaciones</span>
            @for (i of skeletonRows; track $index) {
              <li class="flex items-start gap-siaf-md border-b border-[var(--sys-color-divider-default)] px-siaf-md py-siaf-sm">
                <span class="mt-1 inline-block size-2 shrink-0 rounded-full bg-[var(--sys-color-bg-surfaces-surface-low)] siaf-skeleton-pulse" aria-hidden="true"></span>
                <span class="flex min-w-0 flex-1 flex-col gap-2">
                  <span class="h-3 w-2/3 rounded bg-[var(--sys-color-bg-surfaces-surface-low)] siaf-skeleton-pulse"></span>
                  <span class="h-2.5 w-full rounded bg-[var(--sys-color-bg-surfaces-surface-low)] siaf-skeleton-pulse"></span>
                  <span class="h-2 w-1/3 rounded bg-[var(--sys-color-bg-surfaces-surface-low)] siaf-skeleton-pulse"></span>
                </span>
              </li>
            }
          </ul>
        } @else if (state.notifications().length === 0) {
          <div class="flex flex-col items-center gap-siaf-sm py-siaf-xl text-center">
            <siaf-icon class="text-[var(--sys-color-text-neutral-low)]" name="notifications_off" [size]="32" />
            <p class="m-0 px-siaf-md text-sm text-[var(--sys-color-text-neutral-medium)]">
              No tienes notificaciones nuevas.
            </p>
          </div>
        } @else {
          <ul class="m-0 flex list-none flex-col gap-0 p-0">
            @for (notif of state.notifications(); track notif.id) {
              <li>
                <button
                  class="flex w-full items-start gap-siaf-md border-b border-[var(--sys-color-divider-default)] px-siaf-md py-siaf-sm text-left transition hover:bg-surface-muted focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--sys-color-border-states-focus)]"
                  type="button"
                  (click)="onClickNotification(notif)"
                >
                  <span class="mt-1 inline-block size-2 shrink-0 rounded-full bg-brand-primary" aria-hidden="true"></span>
                  <span class="flex min-w-0 flex-1 flex-col gap-1">
                    <span class="flex flex-wrap items-baseline justify-between gap-siaf-xs">
                      <strong class="text-sm font-bold leading-tight text-text">{{ notif.titulo }}</strong>
                      <span class="text-[11px] uppercase tracking-wide text-[var(--sys-color-text-neutral-low)]">
                        {{ formatDate(notif.createdAt) }}
                      </span>
                    </span>
                    <span class="text-xs leading-normal text-[var(--sys-color-text-neutral-medium)]">{{ notif.mensaje }}</span>
                    @if (notif.documento?.numero || notif.documento?.catDocumento?.codigo || notif.solicitud?.numeroSolicitud || notif.solicitud?.tipoDocumento?.codigo) {
                      <span class="flex flex-wrap items-center gap-siaf-xs">
                        @if (notif.documento?.catDocumento?.codigo || notif.solicitud?.tipoDocumento?.codigo) {
                          <span class="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white" style="background-color: var(--sys-color-bg-brand-accent)">
                            {{ notif.documento?.catDocumento?.codigo ?? notif.solicitud!.tipoDocumento!.codigo }}
                          </span>
                        }
                        @if (notif.documento?.numero || notif.solicitud?.numeroSolicitud) {
                          <strong class="text-[11px] font-bold uppercase tracking-wide text-text">
                            {{ notif.documento?.numero ?? notif.solicitud!.numeroSolicitud }}
                          </strong>
                        }
                      </span>
                    }
                  </span>
                </button>
              </li>
            }
          </ul>
        }
      </div>
    </div>
  `,
  styles: [`
    @keyframes siaf-skeleton-pulse-kf {
      0%, 100% { opacity: 0.5; }
      50% { opacity: 0.85; }
    }
    .siaf-skeleton-pulse {
      animation: siaf-skeleton-pulse-kf 1.5s ease-in-out infinite;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsPanelComponent {
  protected readonly state = inject(NotificationsStateService);
  private readonly router = inject(Router);

  @Input() open = false;
  @Output() closed = new EventEmitter<void>();

  readonly skeletonRows = Array.from({ length: 4 });

  async onMarkAllRead(): Promise<void> {
    await this.state.marcarLeidas();
  }

  onClickNotification(notif: NotificacionResponse): void {
    this.closed.emit();
    // En el modelo v2 el campo es `documento`; conservamos compat con
    // `solicitud` por si alguna respuesta vieja sigue en caché.
    const docId = notif.documento?.id ?? notif.solicitud?.id;
    if (!docId) return;

    const codigo =
      notif.documento?.catDocumento?.codigo
      ?? notif.solicitud?.tipoDocumento?.codigo
      ?? '';
    const nombre =
      notif.documento?.catDocumento?.nombre
      ?? notif.solicitud?.tipoDocumento?.nombre
      ?? '';

    const route = this.resolveRoute(codigo.toUpperCase(), nombre.toLowerCase());
    void this.router.navigate([route, docId]);
  }

  /**
   * Mapea el tipo de documento → ruta del frontend.
   * Prefiere el código (estable) sobre el nombre.
   */
  private resolveRoute(codigo: string, _nombre: string): string {
    // Taller: documentos SRCB (cuentas bancarias) y SMAPM (modificación de la APM).
    const rutas: Record<string, string> = {
      SRCB: '/procesos/registro-cuentas-bancarias/solicitud',
      SMAPM: '/procesos/modificacion-apm/solicitud',
    };
    return rutas[codigo] ?? '/procesos/registro-cuentas-bancarias/solicitud';
  }

  formatDate(iso: string): string {
    const d = new Date(iso);
    const diffMin = Math.floor((Date.now() - d.getTime()) / 60000);
    if (diffMin < 1) return 'Ahora';
    if (diffMin < 60) return `Hace ${diffMin} min`;
    if (diffMin < 1440) return `Hace ${Math.floor(diffMin / 60)} h`;
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}
