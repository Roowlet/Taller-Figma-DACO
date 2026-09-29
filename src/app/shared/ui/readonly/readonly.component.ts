import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/**
 * Bloque de solo lectura: etiqueta en mayúsculas sobre el valor, dentro de un recuadro gris.
 *
 * Hoy no tiene consumidores: los datos de solo lectura se pintan con `siaf-text-field [disabled]`
 * o con `siaf-summary-card`. Ojo, `siaf-readonly-field` es un componente distinto: no lo confundas
 * con este.
 *
 * @usar
 * - Solo si un diseño pide el bloque gris con la etiqueta en mayúsculas sobre el valor; hoy ninguna pantalla lo usa.
 * - Para un dato de contexto suelto dentro de un panel o modal (Entidad, Año fiscal) que debe verse como bloque.
 * @evitar
 * - Para el modo lectura de una solicitud o los criterios de una consulta: usar `readonly-field`, que es el que usan
 *   las pantallas.
 * - Para el ítem elegido desde un panel lateral: usar `siaf-summary-card`; para un aviso breve, `message-box`.
 * - Para un dato que el usuario puede cambiar: usar `siaf-input`.
 * @teclado
 * - No recibe foco: no es interactivo.
 * @accesibilidad
 * - **1.3.1 Información y relaciones (A)**: es texto estático: la etiqueta va antes del valor en el DOM, así que se
 *   leen juntos y en orden; no usa `dt`/`dd` ni `aria-labelledby`.
 * - **Pendiente · 1.4.3 Contraste mínimo (AA)**: la etiqueta de 12 px va en `text-neutral-low` sobre
 *   `bg-surfaces-surface-high` (`bg-surface-muted`), par que la tabla no mide: con los valores del tema claro no llega
 *   a 4.5:1 (sobre `surface-low`, un fondo más claro, ya baja a 4.64:1).
 */
@Component({
  selector: 'siaf-readonly',
  standalone: true,
  template: `
    <div class="grid gap-1 rounded-siaf-md border border-border bg-surface-muted px-3 py-2">
      <span class="text-xs font-semibold uppercase text-text-muted">{{ label }}</span>
      <span class="text-sm font-medium text-text">{{ value }}</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReadonlyComponent {
  @Input() label = '';
  @Input() value = '';
}
