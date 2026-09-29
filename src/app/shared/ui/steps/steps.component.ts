import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';

import { StepperCardComponent, StepperCardField } from '../stepper-card/stepper-card.component';

export interface StepItem {
  label: string;
  description?: string;
  /** Con `variant="cards"`: los campos de la tarjeta del paso (etiqueta y valor), por ejemplo N° de modificación, tipo de acción y fecha. */
  fields?: StepperCardField[];
}

export type StepsOrientation = 'horizontal' | 'vertical';
export type StepsSize = 'default' | 'small';
/** `default`: círculos con el nombre del paso. `cards`: vertical, con una tarjeta (`siaf-stepper-card`) por paso. */
export type StepsVariant = 'default' | 'cards';
type EstadoPaso = 'done' | 'current' | 'pending';

const ETIQUETA_ESTADO: Record<EstadoPaso, string> = {
  done: 'completado',
  current: 'paso actual',
  pending: 'pendiente',
};

/**
 * Pasos numerados de un flujo con el paso activo resaltado (Figma UI KIT: «Step colum», nodo 1264:580,
 * y «Steps Rows», nodo 2582:7222).
 *
 * - `horizontal` (por defecto): un círculo de 32 px con el número por paso, unidos por una línea, y el
 *   nombre y la descripción debajo. Si no entra en el ancho, se desplaza en horizontal.
 * - `vertical`: un paso por fila con el nombre a la derecha. `size="default"` usa círculos de 40 px con
 *   número; `size="small"`, de 24 px sin número.
 * - `variant="cards"`: siempre vertical. Cada paso es un `siaf-stepper-card` con sus `fields` y, a la derecha, un
 *   punto de 24 px; los puntos van unidos por una línea. La tarjeta activa lleva sombra y barra azul y su punto va
 *   en azul; las demás, borde y punto gris. Al elegir otra tarjeta emite `activeStepChange`.
 *
 * `activeStep` cuenta desde 1. Con círculos, el activo y los anteriores van en el color de marca y los siguientes, en
 * gris; con tarjetas, solo la activa va en azul. La variante `cards` es la columna de versiones de
 * `siaf-account-history-panel` y `siaf-asiento-history-panel`; el stepper e historial de las solicitudes es
 * `siaf-action-tracker`.
 *
 * @usar
 * - Para mostrar en qué etapa va un flujo lineal corto (3 a 6 pasos), como un asistente por etapas de una carga
 *   masiva: plantilla, archivo, validación y envío.
 * - `vertical` en paneles laterales o columnas angostas; `size="small"` cuando el número no aporta.
 * - `variant="cards"` para las versiones de un registro (creación y modificaciones, con su número, tipo de acción y
 *   fecha): la tarjeta elegida queda marcada y el padre muestra su detalle al lado, como en los paneles de historial.
 * @evitar
 * - Para el avance y los responsables de una solicitud (Elaborado, Verificado, Aprobado): usar `siaf-action-tracker`.
 * - Para hitos con fecha y detalle: usar `siaf-timeline`.
 * - Como navegación entre vistas: para cambiar de vista usar `siaf-tabs`.
 * - Muchos pasos en `horizontal`: la fila se desplaza; pasar a `vertical`.
 * - `variant="cards"` con valores largos: la tarjeta mide 200 px y los corta (el texto completo sale en el tooltip).
 * @teclado
 * - Con círculos no recibe foco: no es interactivo.
 * - Con `variant="cards"`, **Tab** recorre las tarjetas (cada una es un `button`) y **Enter / Espacio** elige la
 *   enfocada: emite `activeStepChange`.
 * @accesibilidad
 * - **1.3.1 Información y relaciones (A)**: los pasos son una lista ordenada (`ol` y `li`); círculos, puntos y líneas
 *   van con `aria-hidden`.
 * - **4.1.2 Nombre, función y valor (A)**: con círculos, el paso actual lleva `aria-current="step"` y cada nombre suma
 *   en texto oculto «paso N de M» y su estado (completado, paso actual o pendiente). Con tarjetas, cada una es un
 *   `button` con `aria-pressed` (la activa en `true`) nombrado por sus etiquetas y valores.
 * - **Pendiente · 1.4.1 Uso del color (A)**: con círculos, a la vista, completado o pendiente solo se distingue por el
 *   relleno del círculo (azul o gris) y el actual se ve igual que los completados; el estado en texto solo llega al
 *   lector de pantalla. Con tarjetas no depende del color: la activa suma la barra y la sombra.
 * - **Pendiente · 1.4.3 Contraste mínimo (AA)**: nombres `text-neutral-high` 16.29:1 (oscuro 16.53:1) y número blanco
 *   sobre `bg-brand-primary` 8.79:1 (6.67:1) cumplen, pero el número de los pendientes (`text-neutral-low` sobre
 *   `surface-high`) no llega a 4.5:1 en claro.
 * - **Pendiente · 1.4.11 Contraste no textual (AA)**: en oscuro el círculo o punto azul da 2.66:1 sobre la superficie
 *   (`bg-brand-primary`). El punto gris de las tarjetas usa `text-neutral-low` (5.01:1 claro / 8.86:1 oscuro).
 */
@Component({
  selector: 'siaf-steps',
  standalone: true,
  imports: [StepperCardComponent],
  template: `
    @if (variant === 'cards') {
      <ol class="m-0 flex list-none flex-col gap-siaf-xl p-0" data-steps-tarjetas>
        @for (paso of pasos(); track $index; let primero = $first; let ultimo = $last) {
          <li class="flex items-center gap-[22px]" [attr.data-elegido]="paso.estado === 'current'">
            <siaf-stepper-card
              class="block w-[200px] shrink-0"
              [fields]="paso.fields ?? []"
              [selected]="paso.estado === 'current'"
              (selectedChange)="elegir($index + 1)"
            />
            <!-- El punto va centrado en la tarjeta; la línea cruza el espacio entre tarjetas (32 px) hasta el punto anterior. -->
            <div class="relative w-6 shrink-0 self-stretch" aria-hidden="true">
              @if (!primero) {
                <span class="absolute bottom-1/2 left-1/2 top-[calc(var(--spacing-siaf-xl)*-1)] w-0.5 -translate-x-1/2 bg-[var(--sys-color-divider-default)]" data-steps-linea></span>
              }
              @if (!ultimo) {
                <span class="absolute bottom-0 left-1/2 top-1/2 w-0.5 -translate-x-1/2 bg-[var(--sys-color-divider-default)]" data-steps-linea></span>
              }
              <span
                class="absolute left-1/2 top-1/2 size-6 -translate-x-1/2 -translate-y-1/2 rounded-full"
                [class]="paso.estado === 'current' ? 'bg-brand-primary' : 'bg-[var(--sys-color-text-neutral-low)]'"
                data-steps-punto
              ></span>
            </div>
          </li>
        }
      </ol>
    } @else if (orientation === 'vertical') {
      <ol class="m-0 flex list-none flex-col gap-0.5 p-0">
        @for (paso of pasos(); track $index; let ultimo = $last) {
          <li
            class="flex gap-siaf-md"
            [class.items-center]="!ultimo"
            [class.items-start]="ultimo"
            [attr.aria-current]="paso.estado === 'current' ? 'step' : null"
            [attr.data-estado]="paso.estado"
          >
            <div class="flex shrink-0 flex-col items-center gap-0.5 self-stretch" aria-hidden="true">
              <span
                class="flex shrink-0 items-center justify-center rounded-full text-base font-medium leading-none"
                [class.size-10]="size === 'default'"
                [class.size-6]="size === 'small'"
                [class.bg-brand-primary]="paso.estado !== 'pending'"
                [class.text-[var(--sys-color-text-brand-white)]]="paso.estado !== 'pending'"
                [class.bg-[var(--sys-color-bg-surfaces-surface-high)]]="paso.estado === 'pending'"
                [class.text-[var(--sys-color-text-neutral-low)]]="paso.estado === 'pending'"
              >
                @if (size === 'default') {
                  {{ $index + 1 }}
                }
              </span>
              @if (!ultimo) {
                <span class="w-0.5 flex-1 rounded-full bg-[var(--sys-color-divider-default)]"></span>
              }
            </div>
            <div class="flex min-w-0 flex-col gap-0.5 pb-5 leading-[normal]">
              <!-- relative: el sr-only (position: absolute) se ubica dentro del paso y no agranda la página. -->
              <span
                class="relative text-sm font-medium leading-[normal]"
                [class.text-[var(--sys-color-text-neutral-high)]]="paso.estado !== 'pending'"
                [class.text-[var(--sys-color-text-neutral-medium)]]="paso.estado === 'pending'"
              >
                {{ paso.label }}<span class="sr-only">, {{ paso.anuncio }}</span>
              </span>
              @if (paso.description) {
                <span class="text-xs leading-[normal] text-[var(--sys-color-text-neutral-low)]">{{ paso.description }}</span>
              }
            </div>
          </li>
        }
      </ol>
    } @else {
      <div class="overflow-x-auto">
        <ol class="m-0 flex min-w-max list-none items-start p-0 sm:min-w-0">
          @for (paso of pasos(); track $index; let ultimo = $last) {
            <li
              class="flex min-w-[124px] flex-1 flex-col gap-siaf-xs"
              [attr.aria-current]="paso.estado === 'current' ? 'step' : null"
              [attr.data-estado]="paso.estado"
            >
              <div class="flex w-full items-center" aria-hidden="true">
                <span
                  class="flex size-8 shrink-0 items-center justify-center rounded-full text-base font-medium leading-none"
                  [class.bg-brand-primary]="paso.estado !== 'pending'"
                  [class.text-[var(--sys-color-text-brand-white)]]="paso.estado !== 'pending'"
                  [class.bg-[var(--sys-color-bg-surfaces-surface-high)]]="paso.estado === 'pending'"
                  [class.text-[var(--sys-color-text-neutral-low)]]="paso.estado === 'pending'"
                >{{ $index + 1 }}</span>
                @if (!ultimo) {
                  <span class="h-0.5 min-w-0 flex-1 bg-[var(--sys-color-divider-default)]"></span>
                }
              </div>
              <div class="flex w-[124px] flex-col gap-0.5 leading-[normal]">
                <!-- relative: sin un ancestro posicionado, el sr-only (position: absolute) escapa del desplazamiento
                     horizontal de la fila y agranda la página cuando los pasos no entran en el ancho. -->
                <span class="relative text-sm font-bold leading-[normal] text-[var(--sys-color-text-neutral-high)]">
                  {{ paso.label }}<span class="sr-only">, {{ paso.anuncio }}</span>
                </span>
                @if (paso.description) {
                  <span class="text-xs leading-[normal] text-[var(--sys-color-text-neutral-medium)]">{{ paso.description }}</span>
                }
              </div>
            </li>
          }
        </ol>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepsComponent {
  @Input() orientation: StepsOrientation = 'horizontal';
  /** Solo en vertical con círculos: `default` (40 px con número) o `small` (24 px sin número). */
  @Input() size: StepsSize = 'default';
  /** `cards`: vertical, con un `siaf-stepper-card` por paso (sus `fields`) y el punto a la derecha. */
  @Input() variant: StepsVariant = 'default';

  @Input() set steps(valor: StepItem[]) {
    this.lista.set(valor ?? []);
  }

  /** Paso activo, contando desde 1. */
  @Input() set activeStep(valor: number) {
    this.activo.set(valor);
  }

  /** Con `variant="cards"`: el número (desde 1) de la tarjeta elegida. Admite `[(activeStep)]`. */
  @Output() activeStepChange = new EventEmitter<number>();

  private readonly lista = signal<StepItem[]>([]);
  private readonly activo = signal(1);

  readonly pasos = computed(() => {
    const total = this.lista().length;
    return this.lista().map((paso, i) => {
      const numero = i + 1;
      const estado: EstadoPaso = numero < this.activo() ? 'done' : numero === this.activo() ? 'current' : 'pending';
      return { ...paso, estado, anuncio: `paso ${numero} de ${total}, ${ETIQUETA_ESTADO[estado]}` };
    });
  });

  /** Elegir la tarjeta activa no cambia nada; otra pasa a ser la activa y se avisa al padre. */
  elegir(numero: number): void {
    if (numero === this.activo()) return;
    this.activo.set(numero);
    this.activeStepChange.emit(numero);
  }
}
