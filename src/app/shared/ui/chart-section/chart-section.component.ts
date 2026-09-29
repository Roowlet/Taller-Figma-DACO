import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

let siguienteId = 0;

/**
 * Sección de gráfico (Figma UI KIT, nodo 22743:668 «Section-graph»): tarjeta con título, descripción opcional y el
 * gráfico proyectado debajo. Es la pieza que se usa en pantalla; los gráficos del kit (`siaf-bar-chart`,
 * `siaf-line-chart`, `siaf-diverging-chart` y `siaf-donut-chart`) van adentro.
 *
 * @figma 22743:668 Section-graph
 * @usar
 * - Para presentar un gráfico con su título y una línea que explique qué mide, por ejemplo «Evolución comparada» y
 *   «Crecimiento acumulado de recaudación».
 * - Con un gráfico del kit proyectado: `<siaf-chart-section title="…"><siaf-bar-chart … /></siaf-chart-section>`.
 * @evitar
 * - Para un número destacado sin gráfico: usar `siaf-kpi-card`.
 * - Para tarjetas de datos o formularios: usar `siaf-card` o `siaf-solicitude-form-card`.
 * @teclado
 * - No recibe foco: el gráfico proyectado sigue su propio teclado.
 * @accesibilidad
 * - **1.3.1 Información y relaciones (A)**: es un `section` con el título como `h3` y `aria-labelledby`, así la
 *   sección y su gráfico quedan nombrados.
 * - **1.4.3 Contraste mínimo (AA)**: título `text-neutral-medium` (14.53:1 claro / 12.87:1 oscuro) y descripción
 *   `text-neutral-low` (5.01:1 / 8.86:1) sobre la superficie.
 */
@Component({
  selector: 'siaf-chart-section',
  standalone: true,
  host: { class: 'block' },
  template: `
    <!-- h-full: en una grilla, las secciones de una misma fila quedan de la misma altura aunque un título ocupe dos líneas. -->
    <section
      class="flex h-full flex-col gap-siaf-md rounded-siaf-md border border-[var(--sys-color-border-states-enabled)] bg-surface p-siaf-lg"
      [attr.aria-labelledby]="title ? idTitulo : null"
    >
      @if (title || description) {
        <div class="flex flex-col gap-siaf-xs">
          @if (title) {
            <h3 class="m-0 text-base font-medium leading-[normal] text-[var(--sys-color-text-neutral-medium)]" [id]="idTitulo">{{ title }}</h3>
          }
          @if (description) {
            <p class="m-0 text-sm leading-[normal] tracking-[0.025px] text-[var(--sys-color-text-neutral-low)]">{{ description }}</p>
          }
        </div>
      }
      <ng-content />
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartSectionComponent {
  @Input() title = '';
  /** Línea bajo el título que explica qué mide el gráfico; vacía, no se muestra. */
  @Input() description = '';

  readonly idTitulo = `siaf-chart-section-titulo-${siguienteId++}`;
}
