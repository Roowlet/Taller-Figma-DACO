import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, computed, signal } from '@angular/core';

import { IconComponent } from '../../ui/icon/icon.component';
import { SidePanelAnimacion } from '../../ui/side-panel-animacion';
import { TimelineItem, estadoDeHito, hitosCumplidos } from './timeline.model';
import { FocoDirective } from '../../ui/foco/foco.directive';

let siguienteId = 0;

/**
 * Panel lateral «Detalle del seguimiento» de `siaf-timeline` (Figma Control de Inventarios, nodo 20182:155604):
 * una tarjeta con el avance (barra, «9/11» y «9 procedimientos completados de 11») y la línea de tiempo
 * vertical con un hito por fila (Figma UI KIT, TL_GOAL_VERTICAL: cumplido, en curso y pendiente).
 *
 * Un hito cumplido muestra su fecha y `dateInfo` a la izquierda; el en curso y los pendientes muestran «-»
 * con «En proceso» o «No iniciado». Lo abre `siaf-timeline` con «Ver detalle», pero también se puede usar
 * suelto: el padre controla `open` y cierra con `closed`.
 *
 * @usar
 * - Lo abre `siaf-timeline` con «Ver detalle» para mostrar la fecha, el estado y la descripción de cada hito de un
 *   proceso por etapas.
 * - Suelto, cuando la pantalla muestra el avance a su manera (`siaf-timeline` con `[openDetailPanel]="false"`) y solo
 *   necesita este detalle.
 * - Con `itemLabel` / `itemsLabel` para nombrar los hitos del proceso en el resumen («9 procedimientos completados
 *   de 11»).
 * @evitar
 * - Para el historial de acciones de una solicitud (quién verificó, aprobó u observó): usar
 *   `siaf-document-history-panel` o `siaf-action-tracker`.
 * - Para los pasos de un formulario o asistente: usar `siaf-steps`.
 * - Para la barra de avance dentro de la página: usar `siaf-timeline`, que ya abre este panel.
 * @teclado
 * - **Tab**: al abrir, el foco entra en la X, el único control, y no sale del panel.
 * - **Enter / Espacio**: la X cierra el panel (emite `closed`).
 * - **Escape**: cierra el panel (emite `closed`) y el foco vuelve a «Ver detalle».
 * @accesibilidad
 * - **4.1.2 Nombre, función y valor (A)**: `role="dialog"` con `aria-modal="true"` y `aria-labelledby` al título (id
 *   propio por instancia); la barra es `role="progressbar"` con `aria-valuenow`, `aria-valuemax` y el resumen como
 *   nombre, y el hito en curso lleva `aria-current="step"`.
 * - **2.4.3 Orden del foco (A)**: con `siafFoco`, al abrir lleva el foco a la X y al cerrar lo devuelve a «Ver detalle».
 * - **2.1.2 Sin trampas de teclado (A)**: Tab queda dentro mientras está abierto, pero Escape siempre lo cierra.
 * - **1.3.1 Información y relaciones (A)**: título `h2` y los hitos en una lista ordenada (`ol` / `li`) con
 *   `aria-label`; el punto y la línea de cada hito son `aria-hidden`.
 * - **1.4.1 Uso del color (A)**: el estado de cada hito va en texto, no solo en el color del punto: los cumplidos
 *   muestran su fecha, el en curso «En proceso» y los pendientes «No iniciado».
 * - **1.4.3 Contraste mínimo (AA)**: `text-neutral-high` (16.29:1 / 16.53:1), `text-neutral-medium` (14.53:1 /
 *   12.87:1) y las descripciones `text-neutral-low` (5.01:1 / 8.86:1) sobre `bg-surface`.
 * - **2.4.7 Foco visible (AA)**: la X no tiene estilo de foco propio ni `outline-none`: queda el anillo nativo del
 *   navegador.
 * - **2.5.8 Tamaño del objetivo (AA)**: la X mide 40 px.
 */
@Component({
  selector: 'siaf-timeline-detail-panel',
  standalone: true,
  imports: [FocoDirective, IconComponent],
  template: `
    @if (anim.visible()) {
      <section
        class="siaf-sidepanel-overlay fixed inset-y-0 left-0 right-0 z-50 bg-black/55 pl-0 lg:pl-[65px]"
        [class.cerrando]="anim.cerrando()"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="idTitulo"
        (click)="closed.emit()"
      >
        <aside
          class="absolute bottom-0 right-0 top-0 flex w-full max-w-[420px] flex-col overflow-hidden rounded-siaf-md bg-surface shadow-siaf-lg"
          [siafFoco]="open"
          (siafFocoEscape)="closed.emit()"
          (click)="$event.stopPropagation()"
        >
          <header class="flex h-14 shrink-0 items-center gap-siaf-xs px-siaf-md">
            <h2 class="m-0 flex-1 text-base font-bold uppercase leading-normal tracking-[0.02px] text-[var(--sys-color-text-neutral-high)]" [id]="idTitulo">{{ title }}</h2>
            <button
              class="inline-flex size-10 items-center justify-center rounded-siaf-md text-text transition hover:bg-surface-muted active:bg-[var(--sys-color-bg-states-light-pressed)]"
              type="button"
              aria-label="Cerrar"
              (click)="closed.emit()"
            >
              <siaf-icon name="close" [size]="24" />
            </button>
          </header>

          <div class="min-h-0 flex-1 overflow-y-auto px-siaf-md pb-siaf-lg pt-siaf-xs">
            <div class="flex flex-col gap-siaf-lg">
              <!-- Avance -->
              <section class="flex flex-col gap-siaf-xxs rounded-siaf-md border border-[var(--sys-color-border-states-enabled)] px-siaf-sm py-siaf-xs leading-[normal]">
                <p class="m-0 text-[11px] font-medium uppercase tracking-[0.66px] text-[var(--sys-color-text-neutral-medium)]">{{ processName }}</p>
                <div class="flex items-center gap-siaf-md">
                  <div
                    class="relative h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-[var(--sys-color-bg-surfaces-surface-high)]"
                    role="progressbar"
                    aria-valuemin="0"
                    [attr.aria-valuemax]="total()"
                    [attr.aria-valuenow]="cumplidos()"
                    [attr.aria-label]="resumen()"
                  >
                    <div
                      class="absolute inset-y-0 left-0 rounded-full bg-[var(--sys-color-border-states-active)] transition-[width] duration-300 ease-out motion-reduce:transition-none"
                      [style.width.%]="porcentaje()"
                    ></div>
                  </div>
                  <span class="shrink-0 text-sm leading-[normal] font-bold tracking-[-0.02px] text-[var(--sys-color-text-neutral-medium)]">{{ cumplidos() }}/{{ total() }}</span>
                </div>
                <p class="m-0 text-[10px] text-[var(--sys-color-text-neutral-medium)]">{{ resumen() }}</p>
              </section>

              <!-- Línea de tiempo vertical -->
              <ol class="m-0 flex list-none flex-col gap-siaf-xxs p-[10px]" [attr.aria-label]="'Hitos de ' + processName">
                @for (hito of hitos(); track $index) {
                  <li class="flex gap-siaf-md" [attr.data-estado]="hito.estado" [attr.aria-current]="hito.estado === 'current' ? 'step' : null">
                    <div class="flex w-20 shrink-0 gap-siaf-md">
                      <div class="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span class="whitespace-nowrap text-xs leading-none text-[var(--sys-color-text-neutral-high)]">{{ hito.fecha }}</span>
                        <span class="whitespace-nowrap text-[10px] leading-[normal] text-[var(--sys-color-text-neutral-medium)]">{{ hito.estadoTexto }}</span>
                      </div>
                      <div class="flex flex-col items-center gap-0.5" aria-hidden="true">
                        <span
                          class="size-2 shrink-0 rounded-full"
                          [class.bg-[var(--sys-color-icon-states-active)]]="hito.estado === 'done'"
                          [class.border-2]="hito.estado !== 'done'"
                          [class.border-[var(--sys-color-bg-brand-primary)]]="hito.estado === 'current'"
                          [class.border-[var(--sys-color-divider-default)]]="hito.estado === 'pending'"
                        ></span>
                        <span class="w-0.5 flex-1 rounded-full bg-[var(--sys-color-divider-default)]"></span>
                      </div>
                    </div>
                    <div class="flex min-w-0 flex-1 flex-col gap-0.5 pb-siaf-md">
                      <p class="m-0 text-xs font-bold leading-none text-[var(--sys-color-text-neutral-high)]">{{ $index + 1 }}. {{ hito.label }}</p>
                      <p class="m-0 text-[10px] leading-[normal] text-[var(--sys-color-text-neutral-low)]">{{ hito.descripcion }}</p>
                    </div>
                  </li>
                }
              </ol>
            </div>
          </div>
        </aside>
      </section>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimelineDetailPanelComponent implements OnChanges {
  @Input() open = false;
  @Input() title = 'Detalle del seguimiento';
  /** Nombre del proceso en la tarjeta de avance (va en mayúsculas). */
  @Input() processName = '';
  /** Cómo se llama un hito en el resumen, en singular y plural: «9 procedimientos completados de 11». */
  @Input() itemLabel = 'hito';
  @Input() itemsLabel = 'hitos';

  @Input() set items(valor: TimelineItem[]) {
    this.lista.set(valor ?? []);
  }

  /** Índice del hito en curso (desde 0), igual que en `siaf-timeline`. */
  @Input() set current(valor: number) {
    this.indiceActual.set(valor);
  }

  @Output() closed = new EventEmitter<void>();

  readonly anim = new SidePanelAnimacion();
  readonly idTitulo = `siaf-timeline-detalle-${siguienteId++}`;

  private readonly lista = signal<TimelineItem[]>([]);
  private readonly indiceActual = signal(-1);
  private readonly etiquetas = signal({ singular: 'hito', plural: 'hitos' });

  readonly total = computed(() => this.lista().length);
  readonly cumplidos = computed(() => hitosCumplidos(this.total(), this.indiceActual()));
  readonly porcentaje = computed(() => (this.total() ? (this.cumplidos() / this.total()) * 100 : 0));

  readonly resumen = computed(() => {
    const { singular, plural } = this.etiquetas();
    const cumplidos = this.cumplidos();
    return cumplidos === 1
      ? `1 ${singular} completado de ${this.total()}`
      : `${cumplidos} ${plural} completados de ${this.total()}`;
  });

  readonly hitos = computed(() =>
    this.lista().map((item, i) => {
      const estado = estadoDeHito(i, this.indiceActual());
      return {
        label: item.label,
        estado,
        fecha: estado === 'done' ? (item.date ?? '-') : '-',
        estadoTexto: estado === 'done' ? (item.dateInfo ?? '') : estado === 'current' ? 'En proceso' : 'No iniciado',
        descripcion: item.description ?? (estado === 'pending' ? 'Aún no iniciado' : estado === 'current' ? 'En proceso' : ''),
      };
    }),
  );

  ngOnChanges(changes: SimpleChanges): void {
    if ('open' in changes) this.anim.actualizar(this.open);
    if ('itemLabel' in changes || 'itemsLabel' in changes) {
      this.etiquetas.set({ singular: this.itemLabel, plural: this.itemsLabel });
    }
  }
}
