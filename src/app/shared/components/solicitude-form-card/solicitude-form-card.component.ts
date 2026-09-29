import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { IconComponent } from '../../ui/icon/icon.component';

/**
 * Tarjeta de sección de las pantallas de solicitud y de los formularios de Admin: cabecera con el título en
 * mayúsculas (`h2`), un ícono (i) opcional con `titleInfo` y las acciones proyectadas con el atributo `card-actions`,
 * y debajo el cuerpo proyectado.
 *
 * Con `loading` la cabecera muestra una barra gris animada en lugar del título. Sin `title` ni `loading` no se pinta
 * la cabecera, así que tampoco aparecen las `card-actions`.
 *
 * @usar
 * - Para cada sección de una solicitud: «Tipo de modificación», «Lista de cuentas contables», «Registro de asiento de
 *   ajuste», «Registros de eventos», «Justificación del sustento».
 * - Para los bloques de los formularios de Admin: datos de la entidad, de la UE, del usuario o del correlativo.
 * - Cuando la sección lleva acciones en la cabecera (buscar, Cancelar / Aceptar) con `card-actions`, o `loading`
 *   mientras llega el detalle (carga masiva de cuentas contables).
 * @evitar
 * - Para el N° y el estado del documento o para los datos generales de la solicitud: usar
 *   `siaf-document-summary-card` o `siaf-solicitude-info-card`.
 * - Para un contenedor genérico fuera de las solicitudes: usar `siaf-card`.
 * - Sin `title` cuando hacen falta acciones: no se pinta la cabecera y las `card-actions` no aparecen.
 * - Para secciones que el usuario pliega: usar `siaf-expansion-panel` dentro de la tarjeta.
 * @teclado
 * - No recibe foco: es un contenedor. Las `card-actions` y el contenido siguen el teclado de su componente; el ícono
 *   (i) de `titleInfo` no es enfocable.
 * @accesibilidad
 * - **1.3.1 Información y relaciones (A)**: el título es un `h2` dentro de un `section`, así cada sección de la
 *   solicitud aparece en la lista de encabezados.
 * - **1.4.3 Contraste mínimo (AA)**: título `text-neutral-high` sobre la superficie, 16.29:1 (oscuro 16.53:1).
 * - **Pendiente · 1.1.1 Contenido no textual (A)**: el ícono (i) de `titleInfo` recibe `label` pero sigue
 *   `decorative` (`aria-hidden`), así que su texto no llega al lector de pantalla; hoy ningún consumidor lo usa.
 * - **Pendiente · 2.1.1 Teclado (A)**: ese texto solo se ve en el atributo `title` al pasar el puntero; el ícono no
 *   recibe foco.
 * - **Pendiente · 4.1.3 Mensajes de estado (AA)**: con `loading` la cabecera pinta una barra animada sin texto ni
 *   `aria-busy`, así que la carga no se anuncia.
 */
@Component({
  selector: 'siaf-solicitude-form-card',
  standalone: true,
  imports: [IconComponent],
  template: `
    <section class="rounded-siaf-md bg-surface">
      @if (loading) {
        <header class="flex min-h-14 items-center justify-between gap-siaf-md px-siaf-lg pt-siaf-md">
          <div class="h-4 w-48 rounded bg-[var(--sys-color-bg-surfaces-surface-low)] siaf-skeleton-pulse"></div>
        </header>
      } @else if (title) {
        <header class="flex min-h-14 items-center justify-between gap-siaf-md px-siaf-lg pt-siaf-md">
          <div class="flex min-w-0 items-center gap-siaf-sm">
            <h2 class="m-0 text-base font-bold uppercase tracking-[0.02px] text-text">{{ title }}</h2>
            @if (titleInfo) {
              <siaf-icon
                class="shrink-0 cursor-help text-[var(--sys-color-icon-states-enabled)]"
                name="info"
                [size]="20"
                [label]="titleInfo"
                [attr.title]="titleInfo"
              />
            }
          </div>
          <ng-content select="[card-actions]" />
        </header>
      }

      <div class="flex flex-col gap-siaf-lg px-siaf-lg py-siaf-md">
        <ng-content />
      </div>
    </section>
  `,
  styles: [`
    @keyframes siaf-skeleton-pulse-kf {
      0%, 100% { opacity: 0.5; }
      50% { opacity: 0.85; }
    }
    .siaf-skeleton-pulse {
      animation: siaf-skeleton-pulse-kf 1.5s ease-in-out infinite;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SolicitudeFormCardComponent {
  @Input() title = '';
  /** Tooltip del ícono (i) junto al título; si está vacío no se muestra el ícono. */
  @Input() titleInfo = '';
  @Input() loading = false;
}
