import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { ButtonComponent } from '../../ui/button/button.component';
import { TagComponent } from '../../ui/tag/tag.component';

export interface FiltroChip {
  label: string;
  values: string[];
}

/**
 * Chips de filtros aplicados de las pantallas "Consultas y reportes"
 * (transversal — antes vivía clonado en plan-cuentas/asiento-ajuste/catálogo).
 *
 * Los chips van en UNA sola línea con scroll horizontal invisible (sin barra;
 * se desplaza con rueda/arrastre). El botón "Quitar filtros" queda fijo a la
 * derecha, fuera del scroll, con 12px de separación: los chips que no caben
 * se cortan en ese borde.
 *
 * @usar
 * - Arriba de los resultados de Consultas y reportes (plan de cuentas, asiento de ajuste, catálogo de tipos de
 *   asiento y libros contables) para mostrar con qué criterios se buscó.
 * - Con varios criterios o varios valores por criterio: cada chip lee «Etiqueta: valor, valor» en una sola línea.
 * - Para volver al inicio de la consulta con un solo botón: «Quitar filtros» emite `cleared`.
 * @evitar
 * - Para elegir o cambiar un filtro: los chips no son interactivos; usar `siaf-filter-pill` (opciones cerradas) o
 *   `siaf-custom-filter` (condiciones).
 * - Para quitar un solo criterio: no hay × por chip; usar `siaf-filter-pill`, que limpia su propio valor.
 * - Rehacer la sección con `siaf-tag` sueltos en cada módulo: ya estuvo clonada en tres.
 * - Para el bloque «Parámetros aplicados» de la Guía de Estructura de Pantallas (tarjetas con ícono, nombre y valor):
 *   es otro componente, `siaf-parametros-aplicados`. Las consultas de hoy siguen con estos chips.
 * @teclado
 * - **Tab**: llega al botón «Quitar filtros»; los chips no reciben foco.
 * - **Enter / Espacio**: quitan todos los filtros (emite `cleared`). El botón sigue `siaf-button`.
 * @accesibilidad
 * - **1.3.1 Información y relaciones (A)**: `<section>` con título `<h3>` «Filtros aplicados de búsqueda»; cada chip
 *   se lee como texto «Etiqueta: valores».
 * - **1.4.3 Contraste mínimo (AA)**: el título va en `text-neutral-medium` (14.53:1 / 12.87:1) y los chips son
 *   `siaf-tag` `input` elegidos, con `text-neutral-activated` sobre la capa `bg-states-light-selected` (7.69:1 /
 *   17.15:1).
 * - **Pendiente · 2.5.3 Etiqueta en el nombre (A)**: el botón muestra «Quitar filtros», pero su `ariaLabel` es
 *   «Quitar todos los filtros», que no contiene el texto visible tal cual (afecta al control por voz).
 * - **Pendiente · 2.1.1 Teclado (A)**: el carril de chips se desplaza sin barra y sin `tabindex`; los chips que no
 *   caben quedan cortados y, con teclado, dependen de que el navegador enfoque el contenedor (el lector los lee todos).
 * - **Pendiente · 2.4.3 Orden del foco (A)**: en las cuatro Consultas, `cleared` devuelve la pantalla al estado vacío
 *   y el bloque desaparece con el foco adentro; el padre debe llevarlo (p. ej. al botón «Búsqueda» de la cabecera).
 * - **2.4.7 Foco visible (AA)**: el botón es `siaf-button`: borde `border-states-focus` (5.35:1 / 10.15:1) y capa.
 * - **2.5.8 Tamaño del objetivo (AA)**: el botón mide 40 px de alto.
 */
@Component({
  selector: 'siaf-consultas-filtros-chips',
  standalone: true,
  imports: [ButtonComponent, TagComponent],
  styles: `
    .chips-scroll {
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
    .chips-scroll::-webkit-scrollbar {
      display: none;
    }
  `,
  template: `
    <section class="flex flex-col gap-siaf-md rounded-siaf-md bg-surface px-siaf-lg py-siaf-md">
      <h3 class="m-0 text-xs font-bold uppercase tracking-wide text-[var(--sys-color-text-neutral-medium)]">
        Filtros aplicados de búsqueda
      </h3>
      <div class="flex min-w-0 items-center">
        <div class="chips-scroll flex min-w-0 flex-1 items-center gap-siaf-sm overflow-x-auto">
          @for (chip of chips; track chip.label) {
            <!-- Los valores van como texto tras la etiqueta: entre dos span, Angular quita el espacio. -->
            <siaf-tag class="shrink-0" variant="input" [selected]="true">
              <span class="font-medium">{{ chip.label }}:</span> {{ chip.values.join(', ') }}
            </siaf-tag>
          }
        </div>

        <div class="shrink-0 pl-3">
          <siaf-button
            variant="secondary"
            size="md"
            icon="delete_outline"
            ariaLabel="Quitar todos los filtros"
            (click)="cleared.emit()"
          >
            Quitar filtros
          </siaf-button>
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConsultasFiltrosChipsComponent {
  @Input() chips: FiltroChip[] = [];
  @Output() cleared = new EventEmitter<void>();
}
