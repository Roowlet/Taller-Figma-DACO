import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/**
 * Indicador de progreso en dos variantes: spinner circular o barra horizontal con porcentaje.
 *
 * Las esperas reales de las pantallas se resuelven con textos "Cargando…" y `animate-pulse`, o con `siaf-loader` /
 * `siaf-loader-overlay`. La barra es la de `siaf-kpi-card` (Figma «Progress/lineal»); fuera de ella, no la
 * introduzcas sin acordarlo antes.
 *
 * @usar
 * - La barra (`variant="bar"` con `value` y `label`) para un avance real y medible, como la meta de una
 *   `siaf-kpi-card`.
 * - El spinner solo si se acuerda: las pantallas esperan con `siaf-loader`.
 * @evitar
 * - Para esperas sin porcentaje: usar `siaf-loader`, o `siaf-loader-overlay` si hay que bloquear la pantalla.
 * - Para un avance de 0 a 100 %: usar `siaf-progress-circular`, que ya publica `role="progressbar"`.
 * - Dentro de `siaf-button`: usar su `loading`.
 * @teclado
 * - No recibe foco: no es interactivo.
 * @accesibilidad
 * - **Pendiente · 4.1.3 Mensajes de estado (AA)**: el spinner no tiene `role`, nombre ni `aria-live`: para un
 *   lector de pantalla la espera no existe.
 * - **4.1.2 Nombre, función y valor (A)**: la barra es `role="progressbar"` con `aria-valuemin` 0, `aria-valuemax`
 *   100, `aria-valuenow` redondeado y `label` como nombre («Avance» si no hay). El porcentaje en texto lo pone quien
 *   la usa, como `siaf-kpi-card`.
 * - **Pendiente · 1.4.11 Contraste no textual (AA)**: en oscuro el azul `bg-brand-primary` del spinner queda en
 *   2.66:1 sobre la superficie.
 */
@Component({
  selector: 'siaf-loading-progress',
  standalone: true,
  template: `
    @if (variant === 'spinner') {
      <span class="inline-block animate-spin rounded-full border-2 border-brand-primary border-r-transparent" [style.width.px]="size" [style.height.px]="size"></span>
    } @else {
      <div
        class="h-2 w-full overflow-hidden rounded-full bg-surface-muted"
        role="progressbar"
        aria-valuemin="0"
        aria-valuemax="100"
        [attr.aria-valuenow]="porcentaje"
        [attr.aria-label]="label || 'Avance'"
      >
        <div class="h-full rounded-full bg-brand-primary transition-all" [style.width.%]="porcentaje"></div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingProgressComponent {
  @Input() variant: 'spinner' | 'bar' = 'spinner';
  /** Avance de 0 a 100 de la barra; se recorta a ese rango. */
  @Input() value = 50;
  @Input() size = 24;
  /** Nombre de la barra para el lector de pantalla («Avance» si no hay). */
  @Input() label = '';

  get porcentaje(): number {
    return Math.round(Math.min(100, Math.max(0, this.value)));
  }
}
