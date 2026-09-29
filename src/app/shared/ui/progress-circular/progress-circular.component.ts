import { ChangeDetectionStrategy, Component, Input, computed, signal } from '@angular/core';

/**
 * Avance circular: anillo que se llena en sentido horario desde arriba, con el porcentaje al centro y una
 * etiqueta opcional encima (Figma UI KIT, nodo 20157:95 «Progress/circular»).
 *
 * Es para un avance determinado (0 a 100 %), como procedimientos completados o ítems conciliados. Para una
 * espera sin porcentaje va `siaf-loader` o el spinner de `siaf-loading-progress`. El anillo mide 150 px y
 * `size` lo escala junto con los textos; la etiqueta se muestra tal como se escribe y se corta en dos líneas.
 *
 * @usar
 * - Para un avance determinado de 0 a 100 %, como procedimientos completados o ítems conciliados, con un `label`
 *   que diga qué se mide.
 * - En un resumen o tablero de proceso donde el porcentaje es el dato principal. Aún no lo usa ninguna pantalla.
 * @evitar
 * - Para esperas sin porcentaje: usar `siaf-loader`, o `siaf-loader-overlay` si hay que bloquear la pantalla.
 * - Para los pasos de un flujo: usar `siaf-steps` o `siaf-action-tracker`.
 * - Para ver cómo se reparte un total entre varias partes: usar `siaf-donut-chart`.
 * - Con `size` muy por debajo de 150 px: los textos escalan con el anillo (la etiqueta mide `size` × 0.08) y
 *   dejan de leerse.
 * @teclado
 * - No recibe foco: no es interactivo.
 * @accesibilidad
 * - **4.1.2 Nombre, función y valor (A)**: es `role="progressbar"` con `aria-valuemin` 0, `aria-valuemax` 100 y
 *   `aria-valuenow` redondeado; el nombre es `label`, o «Avance» si no hay.
 * - **1.1.1 Contenido no textual (A)**: el anillo SVG va con `aria-hidden` y el porcentaje también está en texto,
 *   así que el anillo no es la única pista del avance.
 * - **1.4.3 Contraste mínimo (AA)**: etiqueta y porcentaje en `text-neutral-medium`, 14.53:1 sobre la superficie
 *   (12.87:1 en oscuro).
 * - **4.1.3 Mensajes de estado (AA)**: una barra de progreso no es región viva: si `value` cambia en vivo, el
 *   lector no lo anuncia solo y el padre debe avisar los hitos.
 */
@Component({
  selector: 'siaf-progress-circular',
  standalone: true,
  template: `
    <div
      class="relative inline-block shrink-0"
      role="progressbar"
      aria-valuemin="0"
      aria-valuemax="100"
      [attr.aria-valuenow]="porcentaje()"
      [attr.aria-label]="label || 'Avance'"
      [style.width.px]="size"
      [style.height.px]="size"
    >
      <svg class="absolute inset-0 size-full -rotate-90" viewBox="0 0 150 150" aria-hidden="true">
        <circle cx="75" cy="75" r="67.5" fill="none" stroke-width="15" class="stroke-[var(--sys-color-bg-surfaces-surface-high)]" />
        <circle
          cx="75"
          cy="75"
          r="67.5"
          fill="none"
          stroke-width="15"
          pathLength="100"
          stroke-dasharray="100"
          class="stroke-brand-primary transition-[stroke-dashoffset] duration-300 ease-out motion-reduce:transition-none"
          [attr.stroke-dashoffset]="100 - valor()"
        />
      </svg>

      <div
        class="absolute inset-x-[23.33%] bottom-[31.33%] top-[30.67%] flex flex-col items-center justify-center text-center leading-[normal] text-[var(--sys-color-text-neutral-medium)]"
        [style.font-size.px]="size * 0.08"
      >
        @if (label) {
          <p class="m-0 line-clamp-2 w-full font-medium [overflow-wrap:anywhere]">{{ label }}</p>
        }
        <p class="m-0 w-full font-bold tracking-[-0.19px]" [style.font-size.px]="size * 22 / 150">{{ porcentaje() }}%</p>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProgressCircularComponent {
  /** Texto sobre el porcentaje (ej. «Completado»). */
  @Input() label = '';
  /** Lado del anillo en px; el grosor y los textos escalan con él. */
  @Input() size = 150;

  /** Avance de 0 a 100; se recorta a ese rango. */
  @Input() set value(valor: number) {
    this.crudo.set(Number.isFinite(valor) ? valor : 0);
  }

  private readonly crudo = signal(0);

  readonly valor = computed(() => Math.min(Math.max(this.crudo(), 0), 100));
  readonly porcentaje = computed(() => Math.round(this.valor()));
}
