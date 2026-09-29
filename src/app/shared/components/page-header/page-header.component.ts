import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TooltipDirective } from '../../ui/tooltip/tooltip.directive';

/**
 * Header simple de pagina (titulo en mayusculas + slot de acciones).
 *
 * Variante "ligera" de `siaf-solicitude-header`, sin estados de
 * documento ni eventos de workflow. Pensado para pantallas que solo
 * necesitan un titulo y opcionalmente un boton/grupo de acciones a
 * la derecha (p. ej. "Consultas y reportes …" con CTA Busqueda).
 *
 * Slot:
 *   <ng-content select="[actions]" />  -> bloque a la derecha
 *
 * Ejemplo:
 *
 *   <siaf-page-header title="Consultas y reportes …">
 *     <siaf-button actions variant="accent" icon="manage_search">
 *       Busqueda
 *     </siaf-button>
 *   </siaf-page-header>
 *
 * @usar
 * - Como encabezado de las pantallas «Consultas y reportes» dentro de `siaf-page-shell` (plan de cuentas, asiento de
 *   ajuste, catálogo de tipos de asiento, contabilización y libros contables), con el botón «Búsqueda» en `[actions]`.
 * - En listados o vistas de solo lectura que solo necesitan título, subtítulo opcional y una o dos acciones a la derecha.
 * @evitar
 * - En pantallas de solicitud con estados y botones del flujo: usar `siaf-solicitude-header` (o
 *   `siaf-solicitude-page-layout`, que ya lo trae).
 * - Como título de una sección o tarjeta: pinta un `h1`; usar el título de la tarjeta (`siaf-solicitude-form-card`).
 * - Más de uno por página: cada uno agrega otro `h1`.
 * @teclado
 * - No recibe foco: no es interactivo. Las acciones proyectadas en `[actions]` siguen su componente (`siaf-button`).
 * @accesibilidad
 * - **1.3.1 Información y relaciones (A)**: el título es el `h1` de la página y el subtítulo, un párrafo; el `header` no
 *   funciona como banner porque vive dentro del `main` del shell.
 * - **2.4.3 Orden del foco (A)**: las acciones van después del título en el DOM, igual que en pantalla.
 * - **Pendiente · 2.1.1 Teclado (A)**: desde `sm` el título y el subtítulo se cortan y el texto completo sale con
 *   `siafTooltip`, que se abre con el mouse o con el foco; como no son enfocables, con teclado no se puede ver (el
 *   lector de pantalla sí lee el texto entero).
 * - **1.4.3 Contraste mínimo (AA)**: título `text-neutral-high` (16.29:1 / 16.53:1) y subtítulo `text-neutral-medium`
 *   (14.53:1 / 12.87:1) sobre `bg-surface`.
 */
@Component({
  selector: 'siaf-page-header',
  standalone: true,
  imports: [TooltipDirective],
  template: `
    <header class="flex items-center justify-between gap-siaf-lg bg-surface px-siaf-lg py-siaf-md">
      <div class="flex min-w-0 flex-1 flex-col gap-siaf-xxs">
        <h1 class="m-0 min-h-6 text-base font-bold uppercase tracking-[0.02px] text-[var(--sys-color-text-neutral-high)] sm:truncate" siafTooltip>
          {{ title }}
        </h1>
        @if (subtitle) {
          <p class="m-0 text-sm font-normal leading-snug tracking-[0.0249px] text-[var(--sys-color-text-neutral-medium)] sm:truncate" siafTooltip>
            {{ subtitle }}
          </p>
        }
      </div>
      <div class="flex shrink-0 items-center gap-siaf-sm">
        <ng-content select="[actions]" />
      </div>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
}
