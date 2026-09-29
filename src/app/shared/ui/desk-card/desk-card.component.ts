import { NgClass, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { IconComponent } from '../icon/icon.component';

export type DeskCardVariant = 'featured' | 'counter' | 'shortcut';
export type DeskCardTone = 'accent' | 'primary' | 'success' | 'warning' | 'neutral';

/** Entero no negativo: un contador no tiene decimales ni signo. */
const entero = (valor: number | null): number => Math.max(0, Math.trunc(Number(valor) || 0));

/** El número del Panel lleva dos dígitos como mínimo: «00», «04», «128». */
export function formatearContador(valor: number | null): string {
  return String(entero(valor)).padStart(2, '0');
}

/**
 * Tarjeta del Panel de inicio (escritorio virtual): ícono, título y un número opcional, en las tres formas de esa
 * pantalla. `featured` es la grande, con el ícono en un recuadro y el número bajo el título (Bandeja de Documentos, o
 * Procesos sin número); `counter`, un contador con el título y el número a la izquierda y el ícono de color a la
 * derecha, sin recuadro (Recibidos, Enviados, Borradores, Notificaciones); `shortcut`, un acceso con el ícono en
 * recuadro y el título, que no muestra número (Consulta y Reportes, Crear documento). El número va con dos dígitos
 * como mínimo («04»).
 *
 * Con `interactive` toda la tarjeta es un `button` que emite `activated`; sin él es un `article` que no recibe foco.
 *
 * @usar
 * - En el Panel de inicio (`siaf-virtual-desk`): Bandeja de Documentos y Procesos arriba (`featured`), los contadores
 *   de la bandeja (`counter`) y los accesos (`shortcut`) debajo.
 * - Con `interactive` cuando pulsarla abre algo, como «Procesos», que abre el menú de procesos del shell.
 * - `tone` para el color del ícono, que acompaña al título: Enviados y Crear documento en `accent`, Recibidos en
 *   `success`, Borradores en `warning`.
 * @evitar
 * - Para un monto con su avance respecto de una meta, en un tablero: usar `siaf-kpi-card`.
 * - Para agrupar contenido de una pantalla: usar `siaf-card`.
 * - `interactive` en una tarjeta que no hace nada al pulsarla: parece un acceso roto.
 * - Con enlaces o botones adentro: la tarjeta interactiva ya es un `button` y no admite otros controles.
 * - Para decir algo solo con el color del ícono: el título tiene que decirlo.
 * @teclado
 * - **Tab**: enfoca la tarjeta si es `interactive`; si no, no recibe foco.
 * - **Enter / Espacio**: en la interactiva, emiten `activated`.
 * @accesibilidad
 * - **4.1.2 Nombre, función y valor (A)**: la interactiva es un `button` nativo nombrado con su texto; la otra es un
 *   `article` nombrado con el título.
 * - **1.1.1 Contenido no textual (A)**: el ícono es decorativo (`aria-hidden`): el título dice qué es.
 * - **1.3.1 Información y relaciones (A)**: el número visible, con ceros a la izquierda, se oculta al lector de
 *   pantalla, que lee el valor sin relleno («4» y no «cero cuatro»).
 * - **1.4.1 Uso del color (A)**: el tono del ícono no dice nada por sí solo.
 * - **1.4.3 Contraste mínimo (AA)**: título y número `text-brand-secondary` sobre la superficie (8.70:1 claro /
 *   12.87:1 oscuro), y 8.06:1 / 8.66:1 sobre el fondo de hover de la interactiva.
 * - **1.4.11 Contraste no textual (AA)**: los íconos quedan sobre 3:1 aunque son decorativos (`accent` 4.14:1 /
 *   4.29:1 es el más bajo).
 * - **2.4.7 Foco visible (AA)**: contorno de 2 px `border-states-focus` separado 2 px (5.35:1 claro / 10.15:1 oscuro).
 * - **2.5.8 Tamaño del objetivo (AA)**: toda la tarjeta es el objetivo, de al menos 120 px de alto.
 */
@Component({
  selector: 'siaf-desk-card',
  standalone: true,
  imports: [IconComponent, NgClass, NgTemplateOutlet],
  host: { class: 'block' },
  template: `
    @if (interactive) {
      <button
        class="cursor-pointer transition hover:bg-[var(--sys-color-bg-states-light-hover)] focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sys-color-border-states-focus)] active:bg-[var(--sys-color-bg-states-light-selected)]"
        type="button"
        [ngClass]="claseTarjeta"
        [attr.data-variante]="variant"
        (click)="activated.emit()"
      >
        <ng-container [ngTemplateOutlet]="contenido" />
      </button>
    } @else {
      <article [ngClass]="claseTarjeta" [attr.aria-label]="title || null" [attr.data-variante]="variant">
        <ng-container [ngTemplateOutlet]="contenido" />
      </article>
    }

    <!-- Solo spans y strong: dentro de un button no caben párrafos, y el tamaño del texto va en cada span. -->
    <ng-template #contenido>
      @if (variant === 'counter') {
        <span class="block min-w-0">
          <span class="block text-[22px] font-medium leading-normal tracking-[-0.19px]" data-titulo>{{ title }}</span>
          <ng-container [ngTemplateOutlet]="numero" [ngTemplateOutletContext]="{ clase: 'text-[44px]' }" />
        </span>
        <span class="inline-flex size-[74px] shrink-0 items-center justify-center" [ngClass]="colorIcono" data-icono>
          <siaf-icon [name]="icon" [size]="58" />
        </span>
      } @else {
        <span
          class="inline-flex shrink-0 items-center justify-center rounded-[12px] border border-[var(--sys-color-divider-default)]"
          [ngClass]="claseRecuadro"
          data-icono
        >
          <siaf-icon [name]="icon" [size]="variant === 'featured' ? 64 : 58" />
        </span>
        <span class="block min-w-0">
          <span class="block text-[30px] font-medium leading-normal tracking-[-0.63px]" data-titulo>{{ title }}</span>
          @if (variant === 'featured') {
            <ng-container [ngTemplateOutlet]="numero" [ngTemplateOutletContext]="{ clase: 'text-[54px]' }" />
          }
        </span>
      }
    </ng-template>

    <ng-template #numero let-clase="clase">
      @if (value !== null) {
        <strong class="block font-bold leading-none tracking-[-0.62px]" [ngClass]="clase" aria-hidden="true" data-numero>{{ numeroVisible }}</strong>
        <span class="sr-only">{{ numeroLeido }}</span>
      }
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeskCardComponent {
  /** Color del ícono por tono. Va dentro de la clase para que la ficha del catálogo liste estos tokens. */
  private static readonly COLOR_ICONO: Record<DeskCardTone, string> = {
    accent: 'text-[var(--sys-color-text-brand-accent)]',
    primary: 'text-[var(--sys-color-text-brand-primary)]',
    success: 'text-[var(--sys-color-text-feedback-success)]',
    warning: 'text-[var(--sys-color-text-feedback-warning)]',
    neutral: 'text-[var(--sys-color-text-feedback-default)]',
  };

  /** `featured` (grande, número opcional), `counter` (contador) o `shortcut` (acceso, sin número). */
  @Input() variant: DeskCardVariant = 'shortcut';
  /** Qué es la tarjeta («Bandeja de Documentos»); también nombra el `article`. */
  @Input({ required: true }) title = '';
  /** Ícono de Material Icons. */
  @Input({ required: true }) icon = '';
  /** Color del ícono. */
  @Input() tone: DeskCardTone = 'neutral';
  /** Número de `featured` y `counter`; con `null` no se muestra. `shortcut` nunca lo muestra. */
  @Input() value: number | null = null;
  /** Toda la tarjeta pasa a ser un `button` que emite `activated`. */
  @Input() interactive = false;
  @Output() activated = new EventEmitter<void>();

  get claseTarjeta(): string {
    const base = 'flex h-full w-full items-center rounded-siaf-md bg-surface text-left text-[var(--sys-color-text-brand-secondary)]';
    switch (this.variant) {
      case 'featured':
        return `${base} min-h-[204px] gap-siaf-lg px-siaf-xl py-12`;
      case 'counter':
        return `${base} min-h-[120px] justify-between gap-siaf-md p-siaf-xl`;
      default:
        return `${base} min-h-[120px] gap-siaf-lg p-siaf-xl`;
    }
  }

  get colorIcono(): string {
    return DeskCardComponent.COLOR_ICONO[this.tone] ?? DeskCardComponent.COLOR_ICONO.neutral;
  }

  /** Recuadro del ícono de `featured` y `shortcut`: más grande en la destacada desde `sm`. */
  get claseRecuadro(): string {
    return `${this.variant === 'featured' ? 'size-[74px] sm:size-[98px]' : 'size-[74px]'} ${this.colorIcono}`;
  }

  get numeroVisible(): string {
    return formatearContador(this.value);
  }

  get numeroLeido(): string {
    return String(entero(this.value));
  }
}
