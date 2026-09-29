import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';

import { ButtonComponent } from '../../ui/button/button.component';
import { TooltipDirective } from '../../ui/tooltip/tooltip.directive';
import { TimelineDetailPanelComponent } from './timeline-detail-panel.component';
import { TimelineItem, TimelineItemState, estadoDeHito, hitosCumplidos } from './timeline.model';

export type { TimelineItem, TimelineItemState } from './timeline.model';

const ETIQUETA_ESTADO: Record<TimelineItemState, string> = {
  done: 'cumplido',
  current: 'en curso',
  pending: 'pendiente',
};

/**
 * Seguimiento horizontal del avance de un proceso: título, «Ver detalle» y una barra con un punto por hito
 * (Figma UI KIT, nodo 19149:1300 «TIMELINE»).
 *
 * La barra se llena hasta el hito `current` (índice desde 0): los anteriores quedan cumplidos, ese va en
 * curso y los siguientes pendientes. `current = -1` es un proceso sin empezar y `current = items.length`,
 * uno terminado. Cada punto muestra su nombre y fecha con `siafTooltip` al pasar el puntero o al llegar
 * con el teclado, y los lectores de pantalla lo anuncian con su posición y estado.
 *
 * «Ver detalle» abre `siaf-timeline-detail-panel` con el avance y la línea de tiempo vertical (fecha,
 * `dateInfo` y `description` de cada hito) y además emite `detail`. Con `[openDetailPanel]="false"` solo
 * emite, para que el padre muestre su propio detalle.
 *
 * @usar
 * - Para seguir el avance de un proceso largo por hitos con fecha dentro de una tarjeta de resumen, por ejemplo las
 *   etapas del ejercicio contable (apertura, contabilización y cierre) en un tablero.
 * - Cuando cada hito tiene fecha, `dateInfo` o `description` que conviene ver en el panel «Ver detalle», o el padre
 *   muestra su propio detalle con `[openDetailPanel]="false"`.
 * - Hoy sin consumidores fuera del catálogo `/ui-kit`.
 * @evitar
 * - Para el flujo de aprobación de una solicitud (Elaborado, Verificado, Aprobado): usar `siaf-action-tracker`.
 * - Para pasos con el nombre siempre visible: usar `siaf-steps`; aquí el nombre de cada hito solo sale en el tooltip.
 * - Con muchos hitos en poco ancho: cada hito mide al menos 16 px y los puntos se amontonan; usar `siaf-steps`
 *   vertical.
 * - Para un porcentaje sin hitos: usar `siaf-loading-progress` o `siaf-progress-circular`.
 * @teclado
 * - **Tab**: pasa por «Ver detalle» y luego por cada punto de la barra; al enfocar un punto aparece su tooltip con
 *   nombre y fecha.
 * - **Enter / Espacio** en «Ver detalle»: abren `siaf-timeline-detail-panel` y emiten `detail` (sigue `siaf-button`).
 * - El panel de detalle se cierra con su X o con Escape; el foco vuelve a «Ver detalle».
 * @accesibilidad
 * - **1.3.1 Información y relaciones (A)**: los hitos son una lista ordenada (`ol` y `li`) dentro de un `section`
 *   con `aria-label` igual al título, que además es un `h3`.
 * - **Pendiente · 4.1.2 Nombre, función y valor (A)**: cada punto anuncia «Hito N de M: nombre · fecha, estado» y el
 *   actual lleva `aria-current="step"`, pero es un `span` con `tabindex="0"` sin rol: ARIA no admite `aria-label` en
 *   un elemento genérico y no todos los lectores de pantalla lo leen.
 * - **1.4.1 Uso del color (A)**: el avance se ve por el largo de la barra llena, que llega hasta el hito en curso, no
 *   solo por el tono de los puntos.
 * - **1.4.3 Contraste mínimo (AA)**: título `text-neutral-high` 16.29:1 (oscuro 16.53:1) sobre la superficie.
 * - **Pendiente · 1.4.11 Contraste no textual (AA)**: en oscuro la barra llena y el contorno de foco de los puntos
 *   (`bg-brand-primary`) dan 2.66:1 sobre la superficie; en los hitos cumplidos ese contorno además se funde con la
 *   barra del mismo color.
 * - **1.4.13 Contenido en hover o foco (AA)**: el tooltip de los puntos se cierra con Escape y se puede recorrer con el
 *   puntero.
 * - **Pendiente · 2.1.1 Teclado (A)**: el título truncado no recibe foco: su texto completo solo sale con el puntero
 *   (el lector de pantalla sí lo lee entero).
 * - **2.4.7 Foco visible (AA)**: cada punto muestra un contorno de 2 px `border-states-focus` (5.35:1 claro / 10.15:1
 *   oscuro); «Ver detalle» sigue `siaf-button`.
 * - **2.4.3 Orden del foco (A)**: el panel de «Ver detalle» (`siaf-timeline-detail-panel`, con `siafFoco`) lleva el
 *   foco a su X al abrir, cierra con Escape y lo devuelve a «Ver detalle».
 */
@Component({
  selector: 'siaf-timeline',
  standalone: true,
  imports: [ButtonComponent, TimelineDetailPanelComponent, TooltipDirective],
  template: `
    <section class="flex flex-col rounded-siaf-md bg-surface" [attr.aria-label]="title || null">
      <header class="flex min-h-10 items-center gap-siaf-md px-siaf-lg">
        <h3 class="m-0 min-w-0 flex-1 truncate text-[11px] font-normal uppercase tracking-[0.66px] text-[var(--sys-color-text-neutral-high)]" siafTooltip>
          {{ title }}
        </h3>
        @if (showDetail) {
          <siaf-button class="shrink-0" variant="ghost" (click)="verDetalle()">{{ detailLabel }}</siaf-button>
        }
      </header>

      <div class="px-siaf-lg pb-siaf-md">
        <div class="relative h-3 rounded-full bg-[var(--sys-color-bg-surfaces-surface-high)]">
          <div
            class="absolute inset-y-0 left-0 rounded-full bg-brand-primary transition-[width] duration-300 ease-out motion-reduce:transition-none"
            [style.width.%]="avance()"
          ></div>

          <ol class="relative m-0 flex h-full list-none p-0">
            @for (item of hitos(); track $index) {
              <li class="relative h-full min-w-4 flex-1">
                <!-- Zona de 20 px centrada en el punto: en el Figma su centro queda a 7 px del borde derecho del hito. -->
                <span
                  class="absolute right-[-3px] top-1/2 flex size-5 -translate-y-1/2 cursor-default items-center justify-center rounded-full focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-[var(--sys-color-border-states-focus)]"
                  tabindex="0"
                  [siafTooltip]="item.tooltip"
                  [attr.aria-label]="item.anuncio"
                  [attr.aria-current]="item.estado === 'current' ? 'step' : null"
                  [attr.data-estado]="item.estado"
                >
                  <span
                    class="block size-2 rounded-full"
                    [class.bg-[var(--sys-color-icon-brand-white)]]="item.estado !== 'pending'"
                    [class.bg-[var(--sys-color-icon-states-enabled)]]="item.estado === 'pending'"
                  ></span>
                </span>
              </li>
            }
          </ol>
        </div>
      </div>
    </section>

    @if (showDetail && openDetailPanel) {
      <siaf-timeline-detail-panel
        [open]="detalleAbierto()"
        [processName]="processName || title"
        [itemLabel]="itemLabel"
        [itemsLabel]="itemsLabel"
        [items]="lista()"
        [current]="indiceActual()"
        (closed)="detalleAbierto.set(false)"
      />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimelineComponent {
  /** Qué proceso se sigue; va en mayúsculas y se corta con tooltip si no entra. */
  @Input() title = '';
  @Input() detailLabel = 'Ver detalle';
  @Input() showDetail = true;
  /** Si «Ver detalle» abre el panel de detalle incluido. En `false` solo emite `detail`. */
  @Input() openDetailPanel = true;
  /** Nombre del proceso en la tarjeta del detalle; por defecto, el `title`. */
  @Input() processName = '';
  /** Cómo se llama un hito en el resumen del detalle: «9 procedimientos completados de 11». */
  @Input() itemLabel = 'hito';
  @Input() itemsLabel = 'hitos';

  @Input() set items(valor: TimelineItem[]) {
    this.lista.set(valor ?? []);
  }

  /** Índice del hito en curso (desde 0). -1: sin empezar; `items.length`: terminado. */
  @Input() set current(valor: number) {
    this.indiceActual.set(valor);
  }

  @Output() detail = new EventEmitter<void>();

  readonly lista = signal<TimelineItem[]>([]);
  readonly indiceActual = signal(-1);
  readonly detalleAbierto = signal(false);

  verDetalle(): void {
    if (this.openDetailPanel) this.detalleAbierto.set(true);
    this.detail.emit();
  }

  /** Porcentaje de la barra que va lleno: hasta el punto del hito en curso, incluido. */
  readonly avance = computed(() => {
    const total = this.lista().length;
    if (!total) return 0;
    return (hitosCumplidos(total, this.indiceActual() + 1) / total) * 100;
  });

  readonly hitos = computed(() => {
    const total = this.lista().length;
    const actual = this.indiceActual();
    return this.lista().map((item, i) => {
      const estado = estadoDeHito(i, actual);
      const tooltip = item.date ? `${item.label} · ${item.date}` : item.label;
      return { estado, tooltip, anuncio: `Hito ${i + 1} de ${total}: ${tooltip}, ${ETIQUETA_ESTADO[estado]}` };
    });
  });
}
