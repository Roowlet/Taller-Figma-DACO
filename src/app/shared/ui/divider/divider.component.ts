import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type DividerVariant = 'full-width' | 'inset' | 'middle-inset';

/**
 * Línea separadora de 1 px con `role="separator"` (Figma UI KIT, nodo 8184:10561 «Dividers»).
 *
 * Variantes del Figma: `full-width` (por defecto) separa secciones de contenido distinto; `inset` deja
 * 16 px al inicio, para separar ítems de una lista que comparten sangría; `middle-inset` deja 16 px a
 * ambos lados. En `vertical` la sangría va arriba y abajo, y la línea ocupa el alto de la fila.
 *
 * Los side panels van SIN líneas separadoras por regla de diseño (título/contenido/botones).
 *
 * @usar
 * - Entre grupos de opciones de un menú: `siaf-menu` lo pinta con `divider` en la opción, como en el menú Favorito de
 *   la bandeja («Solicitudes observadas» y «Guardar búsqueda actual»).
 * - Bajo cada ítem de `siaf-list` con `dividers` (ancho completo); fuera de ella, `inset` separa ítems que comparten
 *   sangría.
 * - `full-width` para separar secciones de contenido distinto dentro de una tarjeta, y `vertical` entre grupos de
 *   controles de una misma fila.
 * @evitar
 * - En paneles laterales (`siaf-side-nav`, `siaf-side-panel`, `siaf-selection-side-nav`): van sin líneas entre título,
 *   contenido y botones, por regla de diseño. La excepción es el panel de filtros de `siaf-side-panel`, que el Figma
 *   separa del contenido con líneas.
 * - Para separar filas de una grilla: `siaf-data-table` y `siaf-documents-records-table` ya dibujan el borde de cada
 *   fila.
 * - Un `<hr>` o un `div` con `border-b` hecho a mano: usar `siaf-divider`, que toma el color del token y publica
 *   `role="separator"`.
 * - Como única señal de agrupación: la línea es tenue; acompañarla de espacio o de un título.
 * @teclado
 * - No recibe foco: no es interactivo.
 * @accesibilidad
 * - **1.3.1 Información y relaciones (A)**: la línea es `role="separator"` con `aria-orientation` (`horizontal` o
 *   `vertical`).
 * - **1.4.11 Contraste no textual (AA)**: no se exige: la línea (`divider-default`, 1.27:1 claro / 1.50:1 oscuro) es
 *   decorativa y no identifica un control ni un estado; por eso la agrupación no debe depender solo de ella.
 */
@Component({
  selector: 'siaf-divider',
  standalone: true,
  host: {
    '[class.block]': "orientation === 'horizontal'",
    '[class.flex]': "orientation === 'vertical'",
    '[class.self-stretch]': "orientation === 'vertical'",
  },
  template: `
    <div
      class="shrink-0 bg-[var(--sys-color-divider-default)]"
      [class.h-px]="orientation === 'horizontal'"
      [class.w-px]="orientation === 'vertical'"
      [class.ml-4]="orientation === 'horizontal' && variant !== 'full-width'"
      [class.mr-4]="orientation === 'horizontal' && variant === 'middle-inset'"
      [class.mt-4]="orientation === 'vertical' && variant !== 'full-width'"
      [class.mb-4]="orientation === 'vertical' && variant === 'middle-inset'"
      role="separator"
      [attr.aria-orientation]="orientation"
    ></div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DividerComponent {
  @Input() orientation: 'horizontal' | 'vertical' = 'horizontal';
  @Input() variant: DividerVariant = 'full-width';
}
