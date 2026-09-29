import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AlertComponent } from '../../shared/ui/alert/alert.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { ListComponent, ListItem } from '../../shared/ui/list/list.component';
import { MessageBoxComponent } from '../../shared/ui/message-box/message-box.component';
import { TabItem, TabsComponent } from '../../shared/ui/tabs/tabs.component';
import { TextFieldComponent } from '../../shared/ui/text-field/text-field.component';
import { AuthService } from '../../core/auth/auth.service';
import { reiniciarDatosDemo } from '../../mock/mock-db';
import { CONTRASENA_DEMO, USUARIOS_DEMO } from '../../mock/usuarios-demo';

type LoginTab = 'entidades' | 'proveedores';

@Component({
  selector: 'siaf-login',
  standalone: true,
  imports: [AlertComponent, ButtonComponent, ListComponent, MessageBoxComponent, RouterLink, TabsComponent, TextFieldComponent],
  template: `
    <main class="flex min-h-screen bg-[var(--sys-color-bg-surfaces-surface)] text-text lg:h-screen lg:overflow-hidden">
      <section class="hidden h-screen flex-[0_0_50%] overflow-hidden lg:block" aria-hidden="true">
        <img class="h-full w-full object-cover" src="assets/figma/login/login-hero.webp" alt="" />
      </section>

      <section class="flex min-h-screen flex-1 items-center justify-center overflow-y-auto px-siaf-lg py-siaf-xxl lg:h-screen lg:min-h-0 lg:flex-[0_0_50%]">
        <div class="flex w-full max-w-[360px] flex-col items-center gap-12">

          <!-- Logos -->
          <header class="flex w-full flex-col items-center gap-siaf-lg">
            <img class="h-[53px] w-[250px] object-contain" src="assets/figma/login/mef-logo.webp" alt="Ministerio de Economia y Finanzas" />
            <img class="h-[54px] w-[174px] object-contain" src="assets/figma/login/siaf-logo-vector.svg" alt="SIAF-RP" />
          </header>

          <section class="flex w-full flex-col items-center gap-siaf-lg">

            <!-- Título + Tabs -->
            <div class="flex w-full flex-col items-center gap-siaf-xs">
              <h1 class="m-0 text-[30px] font-bold leading-none tracking-[-0.63px] text-[var(--sys-color-text-brand-primary)]">Bienvenido</h1>
              <p class="m-0 text-sm font-medium leading-normal text-[var(--sys-color-text-neutral-medium)]">
                Ingresa tus datos para Iniciar sesión
              </p>

              <!-- Tabs -->
              <siaf-tabs
                class="mt-siaf-xs w-full"
                ariaLabel="Tipo de usuario"
                [tabs]="pestanas"
                [activeId]="activeTab()"
                [border]="false"
                [fullWidth]="true"
                (activeIdChange)="activeTab.set($any($event))"
              />
            </div>

            <!-- Formulario: Entidades del Estado -->
            @if (activeTab() === 'entidades') {
            <form class="flex w-full flex-col items-center gap-5" aria-label="Inicio de sesión">

              <!-- Input DNI -->
              <siaf-input
                class="block w-full"
                label="DNI"
                type="text"
                inputmode="numeric"
                leadingIcon="badge"
                autocomplete="username"
                [value]="usuario()"
                (valueChange)="usuario.set(textFieldValue($event))"
              />

              <!-- Input Contraseña -->
              <siaf-input
                class="block w-full"
                label="Contraseña"
                [type]="showPassword() ? 'text' : 'password'"
                leadingIcon="lock"
                [trailingIcon]="showPassword() ? 'visibility_off' : 'visibility'"
                [trailingButtonLabel]="showPassword() ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                autocomplete="current-password"
                [value]="contrasena()"
                (valueChange)="contrasena.set(textFieldValue($event))"
                (trailingAction)="togglePassword()"
              />

              <!-- Error de autenticación -->
              @if (authService.authError()) {
                <p class="w-full rounded-siaf-sm bg-[var(--sys-color-bg-feedback-light-danger)] px-siaf-md py-siaf-xs text-sm text-[var(--sys-color-text-feedback-danger)]">
                  {{ authService.authError() }}
                </p>
              }

              <!-- Botón Iniciar sesión -->
              <siaf-button
                class="block w-full"
                variant="primary"
                type="button"
                [disabled]="authService.isLoading()"
                (click)="onSubmit()"
              >
                {{ authService.isLoading() ? 'Ingresando...' : 'Iniciar sesión' }}
              </siaf-button>

              <!-- Links inferiores -->
              <div class="flex w-full items-center justify-between">
                <a
                  class="inline-flex min-h-10 items-center justify-center rounded-siaf-md px-siaf-md py-siaf-xs text-sm font-medium text-[var(--sys-color-text-brand-primary)] transition hover:bg-surface-muted active:bg-[var(--sys-color-bg-states-light-pressed)] focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sys-color-border-states-focus)]"
                  routerLink="/ui-kit"
                >
                  Ver componentes
                </a>
                <button
                  class="inline-flex min-h-10 items-center justify-center rounded-siaf-md px-siaf-md py-siaf-xs text-sm font-medium text-[var(--sys-color-text-brand-primary)] transition hover:bg-surface-muted active:bg-[var(--sys-color-bg-states-light-pressed)] focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sys-color-border-states-focus)]"
                  type="button"
                  (click)="goToRecuperarContrasena()"
                >
                  Olvidé mi contraseña
                </button>
              </div>
            </form>

            <!-- Taller: usuarios de demostración -->
            <section class="flex w-full flex-col gap-siaf-xs" aria-labelledby="usuarios-demo-titulo">
              <div class="flex items-center justify-between gap-siaf-xs">
                <h2 id="usuarios-demo-titulo" class="m-0 text-base font-bold text-[var(--sys-color-text-neutral-high)]">Usuarios de demostración</h2>
                <siaf-button variant="text" size="sm" icon="restart_alt" (click)="reiniciarDatos()">Reiniciar datos</siaf-button>
              </div>
              <siaf-list
                ariaLabel="Usuarios de demostración"
                [items]="usuariosDemo"
                [selectable]="true"
                [wrapDescription]="true"
                [dividers]="true"
                [selectedId]="usuarioElegido()"
                (selectedIdChange)="elegirUsuario($event)"
              />
              <message-box [text]="'Elija un usuario para llenar el DNI. La contraseña de todos es ' + contrasenaDemo + '.'" />
              @if (datosReiniciados()) {
                <siaf-alert
                  tone="success"
                  description="Se restauraron las solicitudes, las cuentas y las notificaciones iniciales."
                  [showClose]="true"
                  (closed)="datosReiniciados.set(false)"
                />
              }
            </section>
            } <!-- fin @if entidades -->

            <!-- Formulario: Proveedores y Externos -->
            @if (activeTab() === 'proveedores') {
            <div class="flex w-full flex-col gap-5">

              <!-- ID Peru -->
              <button
                class="flex w-full items-center justify-center gap-siaf-xs rounded-siaf-md border border-[var(--sys-color-border-states-enabled)] bg-surface px-siaf-md py-siaf-xs text-sm font-medium text-[var(--sys-color-text-neutral-medium)] transition hover:bg-surface-muted focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sys-color-border-states-focus)]"
                type="button"
              >
                <!-- ID Peru: fondo rojo, dos vectores posicionados (24×24px base) -->
                <span class="relative inline-block size-6 shrink-0 overflow-hidden rounded-siaf-sm bg-[var(--sys-color-bg-feedback-dark-danger)]">
                  <img class="absolute left-[7.74px] top-[4.65px] h-[14.7px] w-[12.36px]" src="assets/figma/login/id-peru-v1.svg" alt="" />
                  <img class="absolute left-[4.05px] top-[9.35px] h-[7.45px] w-[6.87px]" src="assets/figma/login/id-peru-v2.svg" alt="" />
                </span>
                ID Peru
              </button>

              <!-- Sunat -->
              <button
                class="flex w-full items-center justify-center gap-siaf-xs rounded-siaf-md border border-[var(--sys-color-border-states-enabled)] bg-surface px-siaf-md py-siaf-xs text-sm font-medium text-[var(--sys-color-text-neutral-medium)] transition hover:bg-surface-muted focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sys-color-border-states-focus)]"
                type="button"
              >
                <!-- Sunat: fondo blanco, dos vectores posicionados -->
                <span class="relative inline-block size-6 shrink-0 overflow-hidden rounded-siaf-sm border border-[var(--sys-color-divider-default)] bg-surface">
                  <img class="absolute left-[8.1px] top-[3.6px] h-[11.25px] w-[11.55px]" src="assets/figma/login/sunat-v1.svg" alt="" />
                  <img class="absolute left-[4.35px] top-[9.3px] h-[11.1px] w-[11.55px]" src="assets/figma/login/sunat-v2.svg" alt="" />
                </span>
                Sunat
              </button>

              <!-- JNE -->
              <div class="relative w-full">
                <button
                  class="flex w-full items-center justify-center gap-siaf-xs rounded-siaf-md border border-[var(--sys-color-border-states-enabled)] bg-surface px-siaf-md py-siaf-xs text-sm font-medium text-[var(--sys-color-text-neutral-medium)] transition hover:bg-surface-muted focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sys-color-border-states-focus)]"
                  type="button"
                  (mouseenter)="jnePopover.set(true)"
                  (mouseleave)="jnePopover.set(false)"
                >
                  <!-- JNE: fondo blanco, dos vectores posicionados -->
                  <span class="relative inline-block size-6 shrink-0 overflow-hidden rounded-siaf-sm border border-[var(--sys-color-divider-default)] bg-surface">
                    <img class="absolute left-[3.9px] top-[3.9px] h-[10.95px] w-[16.35px]" src="assets/figma/login/jne-v1.svg" alt="" />
                    <img class="absolute left-[3.9px] top-[8.4px] h-[11.7px] w-[16.35px]" src="assets/figma/login/jne-v2.svg" alt="" />
                  </span>
                  JNE
                </button>

                @if (jnePopover()) {
                  <div class="absolute bottom-[calc(100%+8px)] left-0 right-0 z-50 rounded-[4px] bg-surface px-siaf-md py-siaf-sm shadow-siaf-elevation-1">
                    <p class="m-0 text-sm leading-normal text-[var(--sys-color-text-neutral-medium)]">
                      Exclusivo para autoridades electas.<br />
                      Se registra automáticamente al ingresar por primera vez.
                    </p>
                  </div>
                }
              </div>

              <!-- Ir a inicio -->
              <div class="flex w-full items-center">
                <a
                  class="inline-flex min-h-10 items-center justify-center rounded-siaf-md px-siaf-md py-siaf-xs text-sm font-medium text-[var(--sys-color-text-brand-primary)] transition hover:bg-surface-muted active:bg-[var(--sys-color-bg-states-light-pressed)] focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sys-color-border-states-focus)]"
                  routerLink="/ui-kit"
                >
                  Ver componentes
                </a>
              </div>
            </div>
            } <!-- fin @if proveedores -->
          </section>
        </div>
      </section>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  private readonly router = inject(Router);
  readonly authService = inject(AuthService);

  readonly usuario = signal('');
  readonly contrasena = signal('');
  readonly activeTab = signal<LoginTab>('entidades');
  readonly pestanas: TabItem[] = [
    { id: 'entidades', label: 'Entidades del Estado' },
    { id: 'proveedores', label: 'Proveedores y Externos' },
  ];
  readonly showPassword = signal(false);
  readonly jnePopover = signal(false);

  // ── Taller: usuarios de demostración (src/app/mock/usuarios-demo.ts) ──
  readonly contrasenaDemo = CONTRASENA_DEMO;
  readonly usuariosDemo: ListItem[] = USUARIOS_DEMO.map((u) => ({
    id: u.dni,
    title: `${u.nombres} ${u.apellidoPaterno} ${u.apellidoMaterno}`,
    description: `DNI ${u.dni} · ${u.descripcion}`,
    leading: { type: 'avatar', initials: `${u.nombres[0]}${u.apellidoPaterno[0]}` },
  }));
  readonly usuarioElegido = signal<string | null>(null);
  readonly datosReiniciados = signal(false);

  onSubmit(): void {
    if (!this.usuario() || !this.contrasena()) return;
    this.authService.login(this.usuario().trim(), this.contrasena()).subscribe({
      next: () => void this.router.navigate(['/panel']),
    });
  }

  elegirUsuario(dni: string): void {
    this.usuarioElegido.set(dni);
    this.usuario.set(dni);
    this.contrasena.set(CONTRASENA_DEMO);
  }

  /** Vuelve a los datos iniciales de la demo (lo que grabaron los usuarios se pierde). */
  reiniciarDatos(): void {
    reiniciarDatosDemo();
    this.datosReiniciados.set(true);
  }

  goToRecuperarContrasena(): void {
    void this.router.navigate(['/login/recuperar-contrasena']);
  }

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  textFieldValue(value: string | number | string[]): string {
    return Array.isArray(value) ? value.join(', ') : String(value);
  }
}
