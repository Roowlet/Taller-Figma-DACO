import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { IconComponent } from '../../shared/ui/icon/icon.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { NotificacionesApiService, NotificacionResponse } from '../../core/api/notificaciones-api.service';
import { NotificationsStateService } from '../../core/realtime/notifications-state.service';
import { TableControlsComponent } from '../../shared/components/table-controls/table-controls.component';

type FiltroLeidas = 'todas' | 'leidas' | 'no_leidas';

/**
 * Sección Notificaciones de la bandeja: historial paginado con filtro Todas / No leídas / Leídas
 * y acción "Marcar todas como leídas".
 *
 * El historial completo lo trae `NotificacionesApiService` (con skeletons mientras carga), mientras que
 * el marcado masivo pasa por `NotificationsStateService` para que la campana del navbar quede en cero.
 * Al hacer clic navega al documento resolviendo la ruta del proceso por el código del catálogo (SCMPC,
 * SRAA, STAA, SCA, CAM…), con fallback a Plan de Cuentas.
 *
 * @usar
 * - Como sección Notificaciones de la Bandeja en `siaf-app-shell`: se pinta cuando `siaf-tray-menu` emite
 *   «Notificaciones».
 * - Para revisar el historial completo, filtrar leídas o no leídas y abrir el documento de cada notificación (plan de
 *   cuentas, asientos de ajuste, tipos y clases de ajuste, apertura contable).
 * @evitar
 * - Para un vistazo rápido desde cualquier pantalla: usar la campana de `siaf-navbar`, que abre
 *   `siaf-notifications-panel`.
 * - Para las demás secciones de la bandeja (Recibidos, Enviados, Borradores, Papelera): usar `siaf-tray-documents-view`.
 * - Para el historial de un documento o registro: usar `siaf-document-history-panel` o `siaf-action-tracker`.
 * @teclado
 * - **Tab**: recorre el Inicio de la ruta (sin acción), «Marcar todas como leídas» si hay no leídas, las tres pestañas
 *   de filtro (cada una es una parada), la paginación de arriba, las notificaciones y la de abajo.
 * - **Enter / Espacio**: en una pestaña aplica el filtro y vuelve a la página 1; en una notificación abre su documento,
 *   si lo tiene; en «Marcar todas como leídas», las marca.
 * - La paginación sigue `siaf-table-controls` y `siaf-pagination`.
 * @accesibilidad
 * - **Pendiente · 1.3.1 Información y relaciones (A)**: `h1`, `h2` y notificaciones en lista `ul`/`li`, pero la ruta de
 *   navegación es un `nav` hecho a mano, sin `ol`/`li` ni `aria-current` (`siaf-breadcrumb` ya lo resuelve), y leída o
 *   no leída solo se ve por el punto azul, que es `aria-hidden`.
 * - **Pendiente · 1.4.3 Contraste mínimo (AA)**: título `text-text` 16.29:1 / 16.53:1, mensaje `text-neutral-medium`
 *   14.53:1 / 12.87:1, fecha y pestañas inactivas `text-neutral-low` 5.01:1 / 8.86:1 y pestaña activa blanca sobre
 *   `bg-brand-primary` 8.79:1 / 6.67:1; pero «Marcar todas como leídas» usa la clase `text-brand-primary` (azul de
 *   fondo de marca) y en oscuro queda en 2.66:1.
 * - **Pendiente · 1.4.11 Contraste no textual (AA)**: en oscuro, el punto de no leída, el relleno de la pestaña activa y
 *   el contorno de foco, todos en `brand-primary`, quedan en 2.66:1 sobre la superficie.
 * - **Pendiente · 2.4.3 Orden del foco (A)**: al usar «Marcar todas como leídas» el botón desaparece y el foco se pierde.
 * - **2.4.7 Foco visible (AA)**: las notificaciones y «Marcar todas como leídas» muestran un contorno azul de 2 px con
 *   `focus-visible`; las pestañas y el Inicio de la ruta no tienen estilo propio y quedan con el anillo del navegador.
 * - **Pendiente · 4.1.2 Nombre, función y valor (A)**: el filtro es `role="tablist"` con `role="tab"` y `aria-selected`,
 *   pero sin `role="tabpanel"` ni flechas, y cada pestaña es una parada de Tab; `siaf-tabs` ya lo resuelve.
 * - **Pendiente · 4.1.3 Mensajes de estado (AA)**: la carga solo marca `aria-busy`, y no se anuncian el resultado de
 *   filtrar, el vacío «No hay notificaciones para mostrar.» ni el marcado de todas como leídas.
 */
@Component({
  selector: 'siaf-tray-notifications-view',
  standalone: true,
  imports: [
    TableControlsComponent,IconComponent, PaginationComponent],
  template: `
    <section class="min-h-[calc(100vh-56px)] bg-[var(--sys-color-bg-surfaces-surface-lowest)]">
      <section class="bg-surface">
        <nav class="flex h-10 items-center gap-siaf-xxs px-siaf-md py-siaf-xxs text-xs" aria-label="Breadcrumb">
          <button class="inline-flex size-8 items-center justify-center rounded-siaf-md transition hover:bg-surface-muted" type="button" aria-label="Inicio">
            <siaf-icon name="home" [size]="20" />
          </button>
          <siaf-icon class="text-text-muted" name="keyboard_arrow_right" [size]="12" />
          <span class="font-medium text-[var(--sys-color-text-neutral-medium)]">Bandeja de Documentos</span>
          <siaf-icon class="text-text-muted" name="keyboard_arrow_right" [size]="12" />
          <span class="font-normal text-[var(--sys-color-text-neutral-low)]">Notificaciones</span>
        </nav>

        <header class="flex min-h-[73px] items-start justify-between gap-siaf-md border-b border-[var(--sys-color-divider-default)] px-siaf-lg py-siaf-md">
          <h1 class="m-0 min-h-6 text-base font-bold uppercase leading-normal tracking-[0.02px] text-text">Notificaciones</h1>
          @if (totalUnread() > 0) {
            <button
              class="text-sm font-medium text-brand-primary hover:underline focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sys-color-border-states-focus)]"
              type="button"
              (click)="onMarkAllRead()"
            >
              Marcar todas como leídas ({{ totalUnread() }})
            </button>
          }
        </header>
      </section>

      <section class="p-siaf-md">
        <article class="min-h-[600px] overflow-hidden rounded-siaf-md bg-surface">
          <header class="flex min-h-14 flex-wrap items-center justify-between gap-siaf-md px-siaf-lg pt-siaf-md">
            <h2 class="m-0 text-base font-bold uppercase leading-normal tracking-[0.02px] text-text">Historial</h2>

            <div class="flex items-center gap-siaf-xs" role="tablist" aria-label="Filtro por estado de lectura">
              @for (opt of filtroOpciones; track opt.value) {
                <button
                  class="inline-flex h-8 items-center rounded-siaf-sm px-siaf-sm text-xs font-medium uppercase tracking-wide transition"
                  type="button"
                  role="tab"
                  [class.bg-brand-primary]="filtro() === opt.value"
                  [class.text-white]="filtro() === opt.value"
                  [class.text-text-muted]="filtro() !== opt.value"
                  [class.hover:bg-surface-muted]="filtro() !== opt.value"
                  [attr.aria-selected]="filtro() === opt.value"
                  (click)="setFiltro(opt.value)"
                >
                  {{ opt.label }}
                </button>
              }
            </div>
          </header>

          <div class="flex flex-col gap-siaf-md px-siaf-lg pb-siaf-lg pt-siaf-md">
            @if (loading() && all().length === 0) {
              <ul class="m-0 flex list-none flex-col gap-0 p-0" aria-busy="true">
                @for (i of skeletonRows; track $index) {
                  <li class="flex items-start gap-siaf-md border-b border-[var(--sys-color-divider-default)] px-siaf-sm py-siaf-md">
                    <span class="mt-1 inline-block size-2 shrink-0 rounded-full bg-[var(--sys-color-bg-surfaces-surface-low)] siaf-skeleton-pulse"></span>
                    <span class="flex min-w-0 flex-1 flex-col gap-2">
                      <span class="h-3 w-1/2 rounded bg-[var(--sys-color-bg-surfaces-surface-low)] siaf-skeleton-pulse"></span>
                      <span class="h-3 w-full rounded bg-[var(--sys-color-bg-surfaces-surface-low)] siaf-skeleton-pulse"></span>
                      <span class="h-2 w-1/4 rounded bg-[var(--sys-color-bg-surfaces-surface-low)] siaf-skeleton-pulse"></span>
                    </span>
                  </li>
                }
              </ul>
            } @else if (pagedItems().length === 0) {
              <div class="flex flex-col items-center gap-siaf-sm py-siaf-xl text-center">
                <siaf-icon class="text-[var(--sys-color-text-neutral-low)]" name="notifications_off" [size]="40" />
                <p class="m-0 text-sm text-[var(--sys-color-text-neutral-medium)]">
                  No hay notificaciones para mostrar.
                </p>
              </div>
            } @else {
              <siaf-table-controls [showSelection]="false"
                [page]="page()"
                [pageSize]="pageSize()"
                [totalItems]="filtered().length"
                [totalPages]="totalPages()"
                (previous)="prevPage()"
                (next)="nextPage()"
              />

              <ul class="m-0 flex list-none flex-col gap-0 p-0">
                @for (notif of pagedItems(); track notif.id) {
                  <li>
                    <button
                      class="flex w-full items-start gap-siaf-md border-b border-[var(--sys-color-divider-default)] px-siaf-sm py-siaf-md text-left transition hover:bg-surface-muted focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--sys-color-border-states-focus)]"
                      type="button"
                      (click)="onClick(notif)"
                    >
                      <span
                        class="mt-1.5 inline-block size-2 shrink-0 rounded-full"
                        [class.bg-brand-primary]="!notif.leida"
                        [class.bg-transparent]="notif.leida"
                        aria-hidden="true"
                      ></span>
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

              <siaf-pagination
                navigation="Activate"
                position="Bottom"
                [rowPage]="true"
                [page]="page()"
                [pageSize]="pageSize()"
                [totalItems]="filtered().length"
                [totalPages]="totalPages()"
                [rowsPerPage]="pageSize()"
                [rowsPerPageOptions]="rowsPerPageOptions"
                (previous)="prevPage()"
                (next)="nextPage()"
                (rowsPerPageChange)="onPageSizeChange($event)"
              />
            }
          </div>
        </article>
      </section>
    </section>
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
export class TrayNotificationsViewComponent implements OnInit {
  private readonly api = inject(NotificacionesApiService);
  private readonly state = inject(NotificationsStateService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly all = signal<NotificacionResponse[]>([]);
  readonly filtro = signal<FiltroLeidas>('todas');
  readonly page = signal(1);
  readonly pageSize = signal(10);
  readonly rowsPerPageOptions = [10, 25, 50, 100];
  readonly skeletonRows = Array.from({ length: 6 });

  readonly filtroOpciones: { label: string; value: FiltroLeidas }[] = [
    { label: 'Todas', value: 'todas' },
    { label: 'No leídas', value: 'no_leidas' },
    { label: 'Leídas', value: 'leidas' },
  ];

  readonly totalUnread = computed(() => this.all().filter((n) => !n.leida).length);

  readonly filtered = computed(() => {
    const items = this.all();
    switch (this.filtro()) {
      case 'leidas': return items.filter((n) => n.leida);
      case 'no_leidas': return items.filter((n) => !n.leida);
      default: return items;
    }
  });

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.pageSize())));

  readonly pagedItems = computed(() => {
    const start = (this.page() - 1) * this.pageSize();
    return this.filtered().slice(start, start + this.pageSize());
  });

  ngOnInit(): void {
    void this.cargar();
  }

  async cargar(): Promise<void> {
    this.loading.set(true);
    try {
      const list = await this.api.obtenerHistorial().toPromise();
      this.all.set(list ?? []);
    } finally {
      this.loading.set(false);
    }
  }

  setFiltro(value: FiltroLeidas): void {
    this.filtro.set(value);
    this.page.set(1);
  }

  prevPage(): void {
    this.page.update((p) => Math.max(1, p - 1));
  }

  nextPage(): void {
    this.page.update((p) => Math.min(this.totalPages(), p + 1));
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.page.set(1);
  }

  async onMarkAllRead(): Promise<void> {
    await this.state.marcarLeidas();
    // Refrescar local: marcar todas como leídas en la lista mostrada
    this.all.update((list) => list.map((n) => ({ ...n, leida: true, leidaEn: new Date().toISOString() })));
  }

  onClick(notif: NotificacionResponse): void {
    // En el modelo v2 el documento vive en `documento`; fallback a `solicitud` legacy.
    const docId = notif.documento?.id ?? notif.solicitud?.id;
    if (!docId) return;
    void this.router.navigate([this.resolveRoute(notif), docId]);
  }

  formatDate(iso: string): string {
    const d = new Date(iso);
    const diffMin = Math.floor((Date.now() - d.getTime()) / 60000);
    if (diffMin < 1) return 'Ahora';
    if (diffMin < 60) return `Hace ${diffMin} min`;
    if (diffMin < 1440) return `Hace ${Math.floor(diffMin / 60)} h`;
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  private resolveRoute(notif: NotificacionResponse): string {
    // Taller: el único documento es la Solicitud de Registro de Cuenta Bancaria (SRCB).
    const codigo = (notif.documento?.catDocumento?.codigo ?? notif.solicitud?.tipoDocumento?.codigo ?? '').toUpperCase();
    const rutas: Record<string, string> = {
      SRCB: '/procesos/registro-cuentas-bancarias/solicitud',
      SMAPM: '/procesos/modificacion-apm/solicitud',
    };
    return rutas[codigo] ?? '/procesos/registro-cuentas-bancarias/solicitud';
  }
}
