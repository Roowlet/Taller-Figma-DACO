import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TooltipDirective } from '../../ui/tooltip/tooltip.directive';

export type SolicitudeInfoField = {
  label: string;
  value: string;
};

/**
 * Tarjeta de datos generales de una solicitud, de solo lectura: una fila por campo con la etiqueta en mayúsculas
 * (columna de 140 px desde `md`) y el valor en negrita.
 *
 * Con `captureOpenDate`, un campo «Fecha» que llega vacío se completa una sola vez con la fecha y hora en que se
 * abrió la tarjeta y queda fijo.
 *
 * @usar
 * - En la cabecera de las pantallas de solicitud con Fecha, Ente rector y Entidad, junto a
 *   `siaf-document-summary-card`: plan de cuentas, catálogo de ajustes, catálogo de eventos, eventos contables y
 *   asiento de ajuste.
 * - Con `[captureOpenDate]="true"` en una solicitud nueva, para que «Fecha» marque cuándo se inició y no cambie.
 * - En detalles de solo lectura que ya traen la fecha: apertura contable (solicitud y asiento anual) y
 *   Contabilización.
 * @evitar
 * - Para el N° y el estado del documento: usar `siaf-document-summary-card`.
 * - Para el ítem elegido desde un panel lateral: usar `siaf-summary-card`.
 * - Para campos editables: usar `siaf-input` dentro de `siaf-solicitude-form-card`.
 * - Dos campos con la misma etiqueta: la etiqueta es la clave del `track` y no debe repetirse.
 * @teclado
 * - No recibe foco: no es interactivo.
 * @accesibilidad
 * - **1.3.1 Información y relaciones (A)**: cada etiqueta precede a su valor en el orden de lectura (`span` y
 *   `strong`).
 * - **1.4.3 Contraste mínimo (AA)**: etiquetas `text-neutral-low` 5.01:1 (oscuro 8.86:1) y valores
 *   `text-neutral-high` 16.29:1 (16.53:1) sobre la superficie.
 * - **1.4.13 Contenido en hover o foco (AA)**: desde `sm` una etiqueta larga se trunca y se completa con `siafTooltip`,
 *   que se cierra con Escape y se puede recorrer con el puntero.
 * - **Pendiente · 2.1.1 Teclado (A)**: la etiqueta no recibe foco, así que con teclado el globo no aparece (el lector
 *   de pantalla sí lee la etiqueta entera).
 */
@Component({
  selector: 'siaf-solicitude-info-card',
  standalone: true,
  imports: [TooltipDirective],
  template: `
    <section class="rounded-siaf-md bg-surface px-siaf-lg py-siaf-md">
      <div class="grid gap-siaf-xs">
        @for (field of fields; track field.label) {
          <div class="grid min-h-6 items-center gap-siaf-xs md:grid-cols-[140px_1fr]">
            <span class="text-[11px] font-medium uppercase leading-none tracking-[0.66px] text-text-muted sm:truncate" siafTooltip>{{ field.label }}</span>
            <strong class="min-w-0 text-sm font-bold leading-6 text-text">{{ fieldValue(field) }}</strong>
          </div>
        }
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SolicitudeInfoCardComponent {
  @Input() fields: SolicitudeInfoField[] = [];

  /**
   * Cuando es true, un campo "Fecha" que llegue vacío se completa UNA sola
   * vez con la fecha/hora en que se abrió el documento y queda CONGELADO:
   * marca cuándo se inició la solicitud y no debe cambiar (antes usaba un
   * reloj en vivo que se actualizaba cada segundo — incorrecto).
   *
   * Si el padre provee un valor explícito (p. ej. la fecha de creación
   * persistida de un documento existente), se muestra ese valor.
   */
  @Input() captureOpenDate = false;

  /** Fecha/hora capturada al construir la tarjeta (apertura del documento). */
  private readonly openedAt = this.formatDateTime(new Date());

  fieldValue(field: SolicitudeInfoField): string {
    if (this.captureOpenDate && !field.value && field.label.toLowerCase() === 'fecha') {
      return this.openedAt;
    }
    return field.value;
  }

  private formatDateTime(date: Date): string {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy}    ${hh}:${min}:${ss}`;
  }
}
