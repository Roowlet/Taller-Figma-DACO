import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, QueryList, ViewChildren, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { ButtonComponent } from '../../shared/ui/button/button.component';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { TextFieldComponent } from '../../shared/ui/text-field/text-field.component';
import { AuthApiService } from '../../core/api/auth-api.service';
import { AuthService } from '../../core/auth/auth.service';

const OTP_LENGTH = 6;

@Component({
  selector: 'siaf-otp-verification',
  standalone: true,
  imports: [ButtonComponent, IconComponent, NgClass, TextFieldComponent],
  template: `
    <main class="flex min-h-screen items-center justify-center bg-[var(--sys-color-bg-surfaces-surface-lowest)] px-siaf-md py-siaf-lg sm:p-siaf-xxl">
      <div class="w-full max-w-[1077px] rounded-siaf-lg bg-surface px-siaf-md py-siaf-xl shadow-siaf-sm sm:p-siaf-xxl">
        <div class="flex min-h-[420px] flex-col items-center justify-between gap-8 sm:min-h-[440px] sm:gap-10">

          <div class="flex w-full flex-col items-center gap-5">

            <div class="flex w-full max-w-[360px] flex-col items-center gap-5">
              <h1 class="m-0 text-center text-[24px] font-bold leading-[32px] tracking-[-0.31px] text-[var(--sys-color-text-brand-primary)] sm:text-[27px] sm:leading-[36px]">
                Recuperar contraseña
              </h1>

              @if (step() === 1) {
                <p class="m-0 w-full text-center text-sm font-medium leading-5 text-[var(--sys-color-text-neutral-medium)]">
                  Ingresa tu correo electrónico. Te enviaremos un código de 4 dígitos.
                </p>
              } @else {
                <p class="m-0 w-full text-center text-sm font-medium leading-5 text-[var(--sys-color-text-neutral-medium)]">
                  Ingresa el código enviado a <strong>{{ email() }}</strong>.
                </p>
              }
            </div>

            @if (error()) {
              <p class="w-full max-w-[360px] rounded-siaf-sm bg-[var(--sys-color-bg-feedback-light-danger)] px-siaf-md py-siaf-xs text-sm text-[var(--sys-color-text-feedback-danger)]">
                {{ error() }}
              </p>
            }

            @if (step() === 1) {
              <div class="flex w-full max-w-[360px] flex-col gap-5">
                <siaf-input
                  class="block w-full"
                  label="Correo electrónico"
                  type="email"
                  leadingIcon="mail"
                  autocomplete="email"
                  [value]="email()"
                  (valueChange)="email.set(textFieldValue($event))"
                />
                <siaf-button
                  class="block w-full"
                  variant="primary"
                  size="md"
                  [disabled]="!email().includes('@') || isLoading()"
                  (click)="solicitarOtp()"
                >
                  {{ isLoading() ? 'Enviando...' : 'Enviar código' }}
                </siaf-button>
              </div>
            }

            @if (step() === 2) {
              <div class="flex w-full max-w-[360px] flex-col gap-5">

                <div class="flex w-full items-center justify-center gap-siaf-sm sm:gap-5">
                  @for (digit of otp; track $index; let i = $index) {
                    <input
                      #otpInput
                      class="h-10 w-10 rounded-siaf-md border bg-surface text-center text-sm text-text outline-none transition focus:border-2 sm:w-[42px]"
                      [ngClass]="otpInputStateClass(digit)"
                      type="text"
                      inputmode="numeric"
                      pattern="[0-9]*"
                      autocomplete="one-time-code"
                      maxlength="1"
                      [value]="digit"
                      (beforeinput)="onBeforeInput($event)"
                      (input)="onDigitInput($event, i)"
                      (keydown)="onKeyDown($event, i)"
                      (paste)="onPaste($event)"
                    />
                  }
                </div>

                <siaf-button
                  class="block w-full"
                  variant="primary"
                  size="md"
                  [disabled]="!isComplete() || isLoading()"
                  (click)="verificarOtp()"
                >
                  {{ isLoading() ? 'Verificando...' : 'Iniciar sesión' }}
                </siaf-button>

                <div class="text-center">
                  <button
                    class="text-sm text-[var(--sys-color-text-brand-primary)] hover:underline"
                    type="button"
                    (click)="step.set(1); error.set(null)"
                  >
                    ¿No recibiste el código? Volver a intentar
                  </button>
                </div>
              </div>
            }

            @if (step() === 2) {
              <div class="w-full max-w-[360px]">
                <p class="m-0 text-sm font-bold leading-5 text-[var(--sys-color-text-neutral-medium)]">¿Necesitas ayuda?</p>
                <p class="m-0 text-xs leading-5 text-[var(--sys-color-text-neutral-medium)]">
                  Si no puedes recibir el código,
                  <button class="text-[var(--sys-color-text-brand-primary)] hover:underline" type="button" (click)="reenviarWhatsapp()">
                    Prueba de otra manera
                  </button>
                </p>
              </div>
            }
          </div>

          <div class="flex w-full justify-center sm:justify-end">
            <button
              class="inline-flex min-h-10 items-center gap-siaf-xs rounded-siaf-md px-siaf-md py-siaf-xs text-sm font-medium text-[var(--sys-color-text-neutral-medium)] transition hover:bg-surface-muted"
              type="button"
              (click)="goToLogin()"
            >
              <siaf-icon name="home" [size]="24" />
              Ir a inicio
            </button>
          </div>

        </div>
      </div>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OtpVerificationComponent {
  @ViewChildren('otpInput') inputs!: QueryList<ElementRef<HTMLInputElement>>;

  private readonly authApi = inject(AuthApiService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly step = signal<1 | 2>(1);
  readonly email = signal('');
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  otp = Array<string>(OTP_LENGTH).fill('');

  isComplete(): boolean {
    return this.otp.every((d) => d.length === 1);
  }

  solicitarOtp(): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.authApi.solicitarOtp(this.email()).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.step.set(2);
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Error al enviar el código. Verifica tu correo.');
        this.isLoading.set(false);
      },
    });
  }

  verificarOtp(): void {
    if (!this.isComplete()) return;
    this.isLoading.set(true);
    this.error.set(null);
    const codigo = this.otp.join('');
    this.authApi.verificarOtp({ email: this.email(), codigo }).subscribe({
      next: (res) => {
        // Login automático: mismo punto único de armado de sesión que usan
        // login y cambio de perfil (tokens, usuario, permisos y arranque del
        // socket de notificaciones en tiempo real).
        this.authService.establecerSesion(res);
        this.isLoading.set(false);
        void this.router.navigate(['/panel']);
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Código incorrecto o expirado. Intenta de nuevo.');
        this.isLoading.set(false);
      },
    });
  }

  reenviarWhatsapp(): void {
    this.authApi.reenviarOtpWhatsapp(this.email()).subscribe({
      error: (err) => this.error.set(err?.error?.message ?? 'Error al reenviar por WhatsApp.'),
    });
  }

  goToLogin(): void {
    void this.router.navigate(['/login']);
  }

  otpInputStateClass(digit: string): string {
    return digit
      ? 'border-2 border-[var(--sys-color-border-feedback-success)] focus:border-[var(--sys-color-border-feedback-success)]'
      : 'border-[var(--sys-color-border-states-enabled)] focus:border-[var(--sys-color-border-states-focus)]';
  }

  textFieldValue(value: string | number | string[]): string {
    return Array.isArray(value) ? value.join(', ') : String(value);
  }

  onDigitInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '').slice(-1);
    this.otp[index] = value;
    input.value = value;
    if (value && index < OTP_LENGTH - 1) {
      this.inputs.get(index + 1)?.nativeElement.focus();
    }
  }

  onBeforeInput(event: Event): void {
    const inputEvent = event as InputEvent;
    if (inputEvent.inputType.includes('Paste')) return;
    if (inputEvent.data && /\D/.test(inputEvent.data)) event.preventDefault();
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key.length === 1 && /\D/.test(event.key)) { event.preventDefault(); return; }
    if (event.key === 'Backspace' && !this.otp[index] && index > 0) {
      this.inputs.get(index - 1)?.nativeElement.focus();
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const text = event.clipboardData?.getData('text') ?? '';
    const digits = text.replace(/\D/g, '').slice(0, OTP_LENGTH).split('');
    digits.forEach((d, i) => {
      if (i < OTP_LENGTH) {
        this.otp[i] = d;
        const el = this.inputs.get(i)?.nativeElement;
        if (el) el.value = d;
      }
    });
    this.inputs.get(Math.min(digits.length, OTP_LENGTH - 1))?.nativeElement.focus();
  }
}
