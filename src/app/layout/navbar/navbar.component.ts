import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, HostListener, Inject, Input, Output, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { PermissionService } from '../../core/auth/permission.service';
import { CurrentUserService } from '../../core/auth/current-user.service';
import { AuthService } from '../../core/auth/auth.service';
import { NotificationsStateService } from '../../core/realtime/notifications-state.service';
import { NotificationsPanelComponent } from '../notifications-panel/notifications-panel.component';
import { TooltipDirective } from '../../shared/ui/tooltip/tooltip.directive';
import { TemaApp, aplicarTema, leerTemaGuardado } from '../../shared/utils/tema.util';
import { FocoDirective } from '../../shared/ui/foco/foco.directive';

type ViewTransitionDocument = Document & {
  startViewTransition?: (updateCallback: () => void) => { ready: Promise<void> };
};

/**
 * Barra superior del shell autenticado: logo, campana de notificaciones y menú de usuario.
 *
 * El contador de la campana sale de `NotificationsStateService.unreadCount()` (actualizado por socket) y
 * al abrir el panel dispara un `refresh()`. El menú de usuario incluye cambio de perfil vía `AuthService`,
 * cierre de sesión y el toggle de tema, que persiste en localStorage y anima el cambio con View Transitions
 * cuando el navegador las soporta. Un click fuera del componente cierra ambos desplegables.
 *
 * @usar
 * - Una sola vez, arriba de todo el armazón autenticado: `siaf-app-shell` la fija con `sticky top-0` y le pasa
 *   `userName` y `officeName` de la sesión.
 * - Para dar acceso desde cualquier pantalla a las notificaciones (contador en vivo por socket), al cambio de perfil,
 *   al tema claro u oscuro y al cierre de sesión.
 * - En un armazón reducido, con `showMenu`, `showNotifications` o `showProfile` en false; lo proyectado se pinta antes
 *   de la campana.
 * @evitar
 * - Como cabecera de una pantalla o de una solicitud: usar `siaf-page-header` o `siaf-solicitude-header`; la barra ya
 *   la pinta el armazón y no se repite dentro de una página.
 * - En pantallas sin sesión, como el login: lee `AuthService` y el estado de notificaciones por socket.
 * - Para un menú de opciones en otra parte: usar `siaf-icon-dropdown-menu` o `siaf-menu`; el menú de usuario está
 *   hecho a mano y no se reutiliza.
 * @teclado
 * - **Tab**: recorre el botón de menú, el logo, la campana y el perfil. Al abrir el menú de usuario o el panel de
 *   notificaciones, el foco entra en su primera opción; salir con Tab los cierra.
 * - **Escape**: cierra el desplegable abierto y el foco vuelve a su botón (perfil o campana).
 * - **Enter / Espacio**: el botón de menú emite `menuClicked`; la campana y el perfil abren o cierran su desplegable
 *   (abrir uno cierra el otro).
 * - **Enter** en el logo: va a `homeHref`.
 * - **Enter / Espacio** en una opción del menú de usuario: la ejecuta; «Perfil» muestra u oculta la lista de perfiles.
 * @accesibilidad
 * - **Pendiente · 1.3.1 Información y relaciones (A)**: la barra es un `<header>`, pero solo cuenta como región
 *   `banner` fuera de `<main>`, y `siaf-app-shell` hoy la pinta dentro.
 * - **Pendiente · 1.4.3 Contraste mínimo (AA)**: la barra (`text-brand-white` sobre `bg-brand-primary`, 8.79:1 / 6.67:1)
 *   y el menú (`text-neutral-medium` sobre la superficie, 14.53:1 / 12.87:1) cumplen; en oscuro, el perfil activo usa
 *   la clase `text-brand-primary` (el azul de fondo de marca) y no llega a 4.5:1.
 * - **Pendiente · 1.4.11 Contraste no textual (AA)**: el contorno blanco de los botones de la barra cumple (8.79:1 /
 *   6.67:1) y el de las opciones es el azul del kit (`border-states-focus`, 5.35:1 / 10.15:1), pero en oscuro el ícono
 *   del perfil activo no llega a 3:1.
 * - **2.4.3 Orden del foco (A)**: con `siafFoco`, el menú de usuario y el panel de notificaciones reciben el foco al
 *   abrir, cierran con Escape o al salir con Tab, y al elegir tema o perfil el foco vuelve al botón de perfil.
 * - **2.4.7 Foco visible (AA)**: contorno de 2 px con `focus-visible` en los botones de la barra y en las opciones del
 *   menú; el logo y la lista de perfiles quedan con el anillo del navegador.
 * - **Pendiente · 2.5.3 Etiqueta en el nombre (A)**: el botón de perfil muestra las iniciales y, desde `md`, el nombre y
 *   la oficina, pero su `aria-label` fijo «Perfil de usuario» los reemplaza: el lector no dice quién inició sesión.
 * - **Pendiente · 4.1.2 Nombre, función y valor (A)**: la campana y el perfil publican `aria-expanded`, pero «Abrir
 *   menu» no. El menú de usuario es un `role="menu"` hecho a mano: sin flechas, «Perfil» sin `aria-expanded` y
 *   perfiles `menuitem` sin `aria-checked` (el activo solo se ve); `siaf-menu` ya trae flechas, Escape y `aria-checked`.
 * - **Pendiente · 4.1.3 Mensajes de estado (AA)**: el número de no leídas va en el nombre de la campana
 *   («Notificaciones, 3 sin leer») y el badge es `aria-hidden`, pero una notificación nueva no se anuncia: no hay
 *   `role="status"` ni `aria-live`.
 */
@Component({
  selector: 'siaf-navbar',
  standalone: true,
  imports: [FocoDirective, BadgeComponent, IconComponent, RouterLink, NotificationsPanelComponent, TooltipDirective],
  template: `
    <header class="flex h-14 w-full items-center justify-between bg-brand-primary px-siaf-md py-siaf-xxs text-[var(--sys-color-text-brand-white)]">
      <div class="flex min-w-0 shrink-0 items-center gap-siaf-lg">
        @if (showMenu) {
          <button
            class="inline-flex size-8 items-center justify-center rounded-siaf-md transition hover:bg-[var(--sys-color-bg-states-on-brand-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sys-color-text-brand-white)]"
            type="button"
            aria-label="Abrir menu"
            (click)="menuClicked.emit()"
          >
            <siaf-icon name="menu" [size]="20" />
          </button>
        }

        <a class="flex h-10 items-center text-[var(--sys-color-text-brand-white)]" [routerLink]="homeHref" aria-label="SIAF-RP">
          <img class="h-10 w-[128px] object-contain" src="assets/figma/logos/siaf-rp-default-white.svg" alt="SIAF-RP" />
        </a>
      </div>

      <div class="flex min-w-0 items-center justify-end gap-siaf-md">
        <ng-content />

        @if (showNotifications) {
          <div class="relative">
            <button
              class="relative inline-flex size-8 shrink-0 items-center justify-center rounded-siaf-md transition hover:bg-[var(--sys-color-bg-states-on-brand-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sys-color-text-brand-white)]"
              type="button"
              [attr.aria-label]="notifications.hasUnread() ? 'Notificaciones, ' + notifications.unreadCount() + ' sin leer' : 'Notificaciones'"
              [attr.aria-expanded]="notificationsOpen()"
              aria-haspopup="dialog"
              (click)="toggleNotifications(); $event.stopPropagation()"
            >
              <siaf-icon name="notifications" [size]="24" />
              @if (notifications.hasUnread()) {
                <!-- El número ya va en el nombre accesible del botón: el badge es solo visual. -->
                <siaf-badge class="absolute -right-0.5 -top-0.5 flex" size="small" aria-hidden="true" [label]="notifications.unreadCount()" [max]="99" />
              }
            </button>

            @if (notificationsOpen()) {
              <siaf-notifications-panel
                [open]="true"
                (closed)="notificationsOpen.set(false)"
              />
            }
          </div>
        }

        @if (showProfile) {
          <div class="relative">
            <button
              class="flex min-w-0 items-center gap-siaf-sm rounded-siaf-md py-siaf-xxs pl-siaf-sm pr-siaf-xs text-left transition hover:bg-[var(--sys-color-bg-states-on-brand-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sys-color-text-brand-white)]"
              type="button"
              aria-label="Perfil de usuario"
              [attr.aria-expanded]="userMenuOpen()"
              aria-haspopup="menu"
              (click)="toggleUserMenu(); $event.stopPropagation()"
            >
              <span class="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-[var(--sys-color-border-states-white)] bg-[var(--ref-color-solid-primary-50)] text-base font-medium text-brand-primary">
                {{ initials }}
              </span>
              <span class="hidden min-w-0 flex-col gap-1 text-[var(--sys-color-text-brand-white)] md:flex">
                <strong class="truncate text-sm font-bold leading-none" siafTooltip>{{ userName }}</strong>
                <span class="max-w-[200px] truncate text-xs uppercase leading-none" siafTooltip>{{ officeName }}</span>
              </span>
              <siaf-icon class="hidden shrink-0 md:block" name="keyboard_arrow_down" [size]="24" />
            </button>

            @if (userMenuOpen()) {
              <div
                class="absolute right-0 top-[calc(100%+8px)] z-50 w-[260px] overflow-hidden rounded-siaf-md bg-surface py-siaf-xs text-[var(--sys-color-text-neutral-medium)] shadow-siaf-elevation-2"
                role="menu"
                aria-label="Opciones de usuario"
                siafFoco
                [siafFocoAtrapar]="false"
                (siafFocoEscape)="userMenuOpen.set(false)"
                (siafFocoSalida)="userMenuOpen.set(false)"
                (click)="$event.stopPropagation()"
              >
                <!-- Perfil — abre/cierra selector de rol -->
                <button
                  class="flex min-h-12 w-full items-center gap-siaf-md px-siaf-md py-siaf-sm text-left text-sm transition hover:bg-surface-muted focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--sys-color-border-states-focus)]"
                  type="button"
                  role="menuitem"
                  (click)="perfilMenuOpen.set(!perfilMenuOpen())"
                >
                  <siaf-icon class="shrink-0" name="perm_identity" [size]="24" />
                  <span class="min-w-0 flex-1 truncate" siafTooltip>Perfil</span>
                  <siaf-icon class="shrink-0 transition-transform" [class.rotate-180]="perfilMenuOpen()" name="keyboard_arrow_down" [size]="18" />
                </button>

                <!-- Selector de rol (se expande al hacer click en Perfil) -->
                @if (perfilMenuOpen()) {
                  <div class="border-y border-[var(--sys-color-divider-default)] bg-[var(--sys-color-bg-surfaces-surface-lowest)] py-siaf-xs">
                    <p class="px-siaf-md py-siaf-xs text-[10px] font-semibold uppercase text-[var(--sys-color-text-neutral-low)]">
                      Seleccionar perfil
                    </p>
                    @for (perfil of authService.perfilesDisponibles(); track perfil.id) {
                      <button
                        class="flex min-h-10 w-full items-center gap-siaf-md px-siaf-md py-siaf-xs text-left text-sm transition hover:bg-surface-muted"
                        type="button"
                        role="menuitem"
                        (click)="cambiarPerfil(perfil.id)"
                      >
                        @if (perfilActivoId() === perfil.id) {
                          <siaf-icon class="shrink-0 text-brand-primary" name="radio_button_checked" [size]="18" />
                          <span class="min-w-0 flex-1 truncate font-bold text-brand-primary" siafTooltip>{{ perfil.rol }} — {{ perfil.entidad }}</span>
                        } @else {
                          <siaf-icon class="shrink-0" name="radio_button_unchecked" [size]="18" />
                          <span class="min-w-0 flex-1 truncate" siafTooltip>{{ perfil.rol }} — {{ perfil.entidad }}</span>
                        }
                      </button>
                    }
                  </div>
                }

                <button class="flex min-h-12 w-full items-center gap-siaf-md px-siaf-md py-siaf-sm text-left text-sm transition hover:bg-surface-muted focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--sys-color-border-states-focus)]" type="button" role="menuitem" (click)="toggleTheme()">
                  <siaf-icon class="shrink-0" name="color_lens" [size]="24" />
                  <span class="min-w-0 flex-1 truncate" siafTooltip>{{ themeLabel }}</span>
                  <siaf-icon class="shrink-0" name="arrow_right" [size]="24" />
                </button>

                <button class="flex min-h-12 w-full items-center gap-siaf-md px-siaf-md py-siaf-sm text-left text-sm transition hover:bg-surface-muted focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--sys-color-border-states-focus)]" type="button" role="menuitem">
                  <siaf-icon class="shrink-0" name="settings" [size]="24" />
                  <span class="min-w-0 flex-1 truncate" siafTooltip>Configuración</span>
                </button>

                <div class="h-px bg-[var(--sys-color-divider-default)]"></div>

                <button class="flex min-h-12 w-full items-center gap-siaf-md px-siaf-md py-siaf-sm text-left text-sm transition hover:bg-surface-muted focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--sys-color-border-states-focus)]" type="button" role="menuitem" (click)="logout()">
                  <siaf-icon class="shrink-0" name="exit_to_app" [size]="24" />
                  <span class="min-w-0 flex-1 truncate" siafTooltip>Cerrar sesión</span>
                </button>
              </div>
            }
          </div>
        }
      </div>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent {
  private readonly permissionService = inject(PermissionService);
  private readonly currentUserService = inject(CurrentUserService);

  readonly perfilMenuOpen = signal(false);
  readonly perfilActivoId = signal<string | null>(null);

  cambiarPerfil(perfilId: string): void {
    this.authService.cambiarPerfil(perfilId).subscribe({
      next: () => {
        this.perfilActivoId.set(perfilId);
        this.perfilMenuOpen.set(false);
        this.userMenuOpen.set(false);
      },
    });
  }

  @Input() homeHref = '/panel';
  @Input() initials = 'JP';
  @Input() userName = 'Juan Doe Perez Perez';
  @Input() officeName = 'Office name';
  @Input() showMenu = true;
  @Input() showNotifications = true;
  @Input() showProfile = true;

  @Output() menuClicked = new EventEmitter<void>();

  readonly userMenuOpen = signal(false);
  readonly notificationsOpen = signal(false);
  readonly currentTheme = signal<'light' | 'dark'>('light');

  readonly authService = inject(AuthService);
  readonly notifications = inject(NotificationsStateService);

  constructor(
    private readonly router: Router,
    private readonly elementRef: ElementRef<HTMLElement>,
    @Inject(DOCUMENT) private readonly document: Document
  ) {
    const storedTheme = this.readStoredTheme();
    this.currentTheme.set(storedTheme);
    this.applyTheme(storedTheme);
  }

  @HostListener('document:click', ['$event'])
  closeUserMenuFromOutside(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.userMenuOpen.set(false);
      this.notificationsOpen.set(false);
    }
  }

  toggleUserMenu(): void {
    this.userMenuOpen.update((open) => !open);
    if (this.userMenuOpen()) {
      this.notificationsOpen.set(false);
    }
  }

  toggleNotifications(): void {
    this.notificationsOpen.update((open) => !open);
    if (this.notificationsOpen()) {
      this.userMenuOpen.set(false);
      void this.notifications.refresh();
    }
  }

  toggleTheme(): void {
    const nextTheme = this.currentTheme() === 'light' ? 'dark' : 'light';
    this.userMenuOpen.set(false);
    this.applyThemeWithTransition(nextTheme);
  }

  logout(): void {
    this.userMenuOpen.set(false);
    this.authService.logout().subscribe({
      next: () => void this.router.navigate(['/login']),
      error: () => void this.router.navigate(['/login']),
    });
  }

  get themeLabel(): string {
    return this.currentTheme() === 'light' ? 'Aspecto: Claro' : 'Aspecto: Oscuro';
  }

  private readStoredTheme(): TemaApp {
    return leerTemaGuardado();
  }

  private applyTheme(theme: TemaApp): void {
    aplicarTema(this.document, theme);
  }

  private applyThemeWithTransition(theme: 'light' | 'dark'): void {
    const transitionDocument = this.document as ViewTransitionDocument;

    if (!transitionDocument.startViewTransition || typeof this.document.documentElement.animate !== 'function') {
      this.currentTheme.set(theme);
      this.applyTheme(theme);
      return;
    }

    const transition = transitionDocument.startViewTransition(() => {
      this.currentTheme.set(theme);
      this.applyTheme(theme);
    });

    void transition.ready.then(() => {
      this.document.documentElement.animate(
        {
          clipPath: ['inset(0 0 100% 0)', 'inset(0)']
        },
        {
          duration: 600,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          pseudoElement: '::view-transition-new(root)'
        }
      );
    });
  }
}
