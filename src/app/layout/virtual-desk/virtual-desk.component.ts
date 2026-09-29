import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';

import { ShellNavigationService } from '../shell/shell-navigation.service';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { DeskCardComponent, DeskCardTone } from '../../shared/ui/desk-card/desk-card.component';
import { ModalComponent } from '../../shared/ui/modal/modal.component';
import { TextFieldComponent } from '../../shared/ui/text-field/text-field.component';
import { SolicitudesFacadeService } from '../../core/state/solicitudes-facade.service';
import { SolicitudesStateService } from '../../core/state/solicitudes-state.service';
import { PermissionService } from '../../core/auth/permission.service';
import { AuthService } from '../../core/auth/auth.service';
import { NotificationsStateService } from '../../core/realtime/notifications-state.service';
import { AuthApiService } from '../../core/api/auth-api.service';
import { ESTADO, ESTADOS_RESPUESTA_APROBADOR } from '../../core/models/documento.model';

type DeskCard = {
  title: string;
  value: number;
  icon: string;
  tone: DeskCardTone;
};

/**
 * Escritorio virtual: la home autenticada, con las tarjetas de resumen (Bandeja, Procesos, Recibidos,
 * Enviados, Borradores, Notificaciones) y el aviso/modal de cambio de contraseña obligatorio.
 * Las tarjetas son `siaf-desk-card` en sus tres variantes; solo Procesos es interactiva.
 *
 * Los contadores se calculan sobre `SolicitudesStateService` según el rol, salvo Notificaciones, que lee
 * `NotificationsStateService.unreadCount()` — la misma fuente por socket que la campana del navbar, tras
 * quitar una consulta REST duplicada. Ojo: su definición de "Enviados" incluye los ya procesados y no
 * coincide con la de `solicitudes-state` (solo VERIFICADO); es una inconsistencia conocida y anotada.
 */
@Component({
  selector: 'siaf-virtual-desk',
  standalone: true,
  imports: [IconComponent, ButtonComponent, DeskCardComponent, ModalComponent, TextFieldComponent],
  template: `
      <section class="min-w-0">
        <header class="flex h-[56px] items-center bg-surface px-siaf-md">
          <h1 class="m-0 text-sm font-bold uppercase leading-normal text-[var(--sys-color-text-brand-secondary)]">Panel</h1>
        </header>

        <section class="min-h-[calc(100vh-112px)] bg-[var(--sys-color-bg-surfaces-surface-lowest)] p-siaf-md">

          @if (authService.debeCambiarPassword()) {
            <div class="mb-siaf-md flex items-center justify-between gap-siaf-md rounded-siaf-md border border-[var(--sys-color-border-feedback-warning)] bg-[var(--sys-color-bg-feedback-light-warning)] px-siaf-lg py-siaf-md">
              <div class="flex items-center gap-siaf-md">
                <siaf-icon class="text-[var(--sys-color-text-feedback-warning)]" name="warning" [size]="24" />
                <div>
                  <p class="m-0 text-sm font-bold text-[var(--sys-color-text-feedback-warning)]">Por seguridad, debes cambiar tu contraseña</p>
                  <p class="m-0 text-xs text-[var(--sys-color-text-neutral-medium)]">Te recomendamos hacerlo ahora antes de continuar</p>
                </div>
              </div>
              <siaf-button variant="primary" size="md" (click)="changePasswordModalOpen.set(true)">Cambiar contraseña</siaf-button>
            </div>
          }

          @if (changePasswordModalOpen()) {
            <siaf-modal
              [open]="changePasswordModalOpen()"
              title="Cambiar contraseña"
              confirmLabel="Guardar"
              cancelLabel="Cancelar"
              [confirmDisabled]="changingPassword() || newPassword().length < 8 || newPassword() !== confirmPassword()"
              (confirmed)="onChangePassword()"
              (canceled)="closePasswordModal()"
              (closed)="closePasswordModal()"
            >
              <div class="flex flex-col gap-siaf-md">
                @if (passwordError()) {
                  <p class="rounded-siaf-sm bg-[var(--sys-color-bg-feedback-light-danger)] px-siaf-md py-siaf-xs text-sm text-[var(--sys-color-text-feedback-danger)]">{{ passwordError() }}</p>
                }
                @if (!authService.debeCambiarPassword()) {
                  <siaf-input
                    label="Contraseña actual"
                    type="password"
                    [required]="true"
                    [value]="currentPassword()"
                    (valueChange)="currentPassword.set(asString($event))"
                  />
                }
                <siaf-input
                  label="Nueva contraseña"
                  type="password"
                  [required]="true"
                  hint="Mínimo 8 caracteres"
                  [value]="newPassword()"
                  (valueChange)="newPassword.set(asString($event))"
                />
                <siaf-input
                  label="Confirmar nueva contraseña"
                  type="password"
                  [required]="true"
                  [value]="confirmPassword()"
                  (valueChange)="confirmPassword.set(asString($event))"
                />
              </div>
            </siaf-modal>
          }

          <div class="grid gap-siaf-md xl:grid-cols-2">
            <siaf-desk-card variant="featured" title="Bandeja de Documentos" icon="inbox" tone="accent" [value]="totalBandeja()" />
            <siaf-desk-card
              variant="featured"
              title="Procesos"
              icon="picture_in_picture"
              tone="primary"
              [interactive]="true"
              (activated)="openProcessMenu()"
            />
          </div>

          <div class="mt-siaf-md grid gap-siaf-md xl:grid-cols-2">
            <div class="grid gap-siaf-md sm:grid-cols-2">
              @for (card of smallCards(); track card.title) {
                <siaf-desk-card variant="counter" [title]="card.title" [icon]="card.icon" [tone]="card.tone" [value]="card.value" />
              }
            </div>

            <div class="grid gap-siaf-md">
              @for (card of wideCards; track card.title) {
                <siaf-desk-card variant="shortcut" [title]="card.title" [icon]="card.icon" [tone]="card.tone" />
              }
            </div>
          </div>
        </section>
      </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VirtualDeskComponent implements OnInit {
  private readonly shellNavigation = inject(ShellNavigationService);
  private readonly solicitudesFacade = inject(SolicitudesFacadeService);
  private readonly solicitudesState = inject(SolicitudesStateService);
  private readonly permissionService = inject(PermissionService);
  private readonly authApi = inject(AuthApiService);
  readonly authService = inject(AuthService);
  private readonly notificationsState = inject(NotificationsStateService);

  // Cambio de contraseña
  readonly changePasswordModalOpen = signal(false);
  readonly currentPassword = signal('');
  readonly newPassword = signal('');
  readonly confirmPassword = signal('');
  readonly changingPassword = signal(false);
  readonly passwordError = signal<string | null>(null);

  readonly totalBandeja = computed(() => this.solicitudesState.solicitudes().length);

  readonly borradoresCount = computed(() =>
    this.solicitudesState.solicitudes().filter(s => s.estado === ESTADO.ELABORADO).length
  );

  readonly enviadosCount = computed(() => {
    const role = this.permissionService.currentRole();
    const solicitudes = this.solicitudesState.solicitudes();
    if (role === 'approver') {
      // Aprobador: los que ya procesó
      return solicitudes.filter(s => ESTADOS_RESPUESTA_APROBADOR.includes(s.estado)).length;
    }
    // Creador: los que ya envió (verificados o procesados)
    return solicitudes.filter(s => [ESTADO.VERIFICADO, ...ESTADOS_RESPUESTA_APROBADOR].includes(s.estado)).length;
  });

  readonly recibidosCount = computed(() => {
    const role = this.permissionService.currentRole();
    const solicitudes = this.solicitudesState.solicitudes();
    if (role === 'approver') {
      // Aprobador: lo que llega para su acción
      return solicitudes.filter(s => s.estado === ESTADO.VERIFICADO).length;
    }
    // Creador: respuestas del aprobador (observadas, aprobadas, rechazadas)
    return solicitudes.filter(s => ESTADOS_RESPUESTA_APROBADOR.includes(s.estado)).length;
  });

  readonly smallCards = computed<DeskCard[]>(() => [
    { title: 'Recibidos', value: this.recibidosCount(), icon: 'description', tone: 'success' },
    { title: 'Enviados', value: this.enviadosCount(), icon: 'send', tone: 'accent' },
    { title: 'Borradores', value: this.borradoresCount(), icon: 'edit_note', tone: 'warning' },
    { title: 'Notificaciones', value: this.notificationsState.unreadCount(), icon: 'notifications', tone: 'neutral' },
  ]);

  readonly wideCards: Omit<DeskCard, 'value'>[] = [
    { title: 'Consulta y Reportes', icon: 'content_paste_search', tone: 'success' },
    { title: 'Crear documento', icon: 'add', tone: 'accent' },
  ];

  ngOnInit(): void {
    const role = this.permissionService.currentRole();
    if (role === 'approver') {
      this.solicitudesFacade.cargarBandejaAprobador();
    } else {
      this.solicitudesFacade.cargarBandejaCreador();
    }
  }

  openProcessMenu(): void {
    this.shellNavigation.openProcessMenu();
  }

  asString(v: string | number | string[]): string {
    return Array.isArray(v) ? v.join('') : String(v);
  }

  closePasswordModal(): void {
    this.changePasswordModalOpen.set(false);
    this.currentPassword.set('');
    this.newPassword.set('');
    this.confirmPassword.set('');
    this.passwordError.set(null);
  }

  onChangePassword(): void {
    if (this.newPassword() !== this.confirmPassword()) {
      this.passwordError.set('Las contraseñas no coinciden');
      return;
    }
    if (this.newPassword().length < 8) {
      this.passwordError.set('La contraseña debe tener mínimo 8 caracteres');
      return;
    }

    this.changingPassword.set(true);
    this.passwordError.set(null);

    const dto = {
      passwordActual: this.currentPassword(),
      passwordNuevo: this.newPassword(),
    };

    this.authApi.cambiarPassword(dto).subscribe({
      next: () => {
        this.changingPassword.set(false);
        this.closePasswordModal();
        // Refrescar la sesión para que debeCambiarPassword pase a false
        // El backend revocó la sesión, así que el siguiente request hará logout automático
        // y el usuario tendrá que hacer login con la nueva contraseña
      },
      error: (err) => {
        this.passwordError.set(err?.error?.message ?? 'Error al cambiar la contraseña.');
        this.changingPassword.set(false);
      },
    });
  }
}
