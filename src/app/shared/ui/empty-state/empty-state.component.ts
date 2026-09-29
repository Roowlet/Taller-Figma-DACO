import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, computed, inject, signal } from '@angular/core';

import { ButtonComponent } from '../button/button.component';
import { EMPTY_STATE_ILLUSTRATIONS, EmptyStateIllustration } from './empty-state-illustrations';

/**
 * Estado vacío ilustrado para pantallas de consulta, reportes y
 * listados. Centra una ilustración + título + descripción y, opcional,
 * un CTA primario.
 *
 * No confundir con `empty-section` (shared/ui/empty-section), que es
 * un placeholder de SECCIÓN dentro de un formulario.
 *
 * Ejemplo:
 *
 *   <siaf-empty-state
 *     illustration="no-results"
 *     title="Aún no se encontraron resultados"
 *     description="Ingrese los criterios de búsqueda para visualizar la información disponible."
 *   />
 *
 * @usar
 * - En las pantallas de Consultas y reportes antes de la primera búsqueda: «Aún no se encontraron resultados»
 *   (Plan de Cuentas, Asiento de ajuste, Catálogo de tipos de asiento, Contabilización, Libros contables).
 * - Cuando un listado no tiene registros (`illustration="no-data"`) o falta elegir un registro para ver su
 *   detalle (`no-selection`).
 * - `illustration="no-records"` (la hoja con casillas «Sin registros», exportada del Figma) en la plantilla
 *   `siaf-query-report-page`, la nueva versión de Consultas y reportes.
 * - Con `actionLabel` cuando hay una acción directa para salir del vacío.
 * @evitar
 * - Para una sección de formulario sin valor elegido: usar `empty-section`.
 * - Para una nota breve dentro de una tarjeta: usar `message-box`.
 * - Mientras los datos cargan: usar `siaf-table-skeleton` o `siaf-loader`.
 * - Para un error al cargar: usar `siaf-alert` con `tone="error"`.
 * @teclado
 * - **Tab**: con `actionLabel`, enfoca el botón de acción (deshabilitado no recibe el foco); sin él, no hay nada
 *   que enfocar.
 * - **Enter / Espacio**: el botón emite `actionClicked` (sigue `siaf-button`).
 * @accesibilidad
 * - **1.1.1 Contenido no textual (A)**: la ilustración SVG va con `aria-hidden`; el mensaje está en el título y la
 *   descripción.
 * - **1.3.1 Información y relaciones (A)**: el título es un `<h2>` de nivel fijo, que encaja bajo el `<h1>` de
 *   `siaf-page-header` en las consultas; la descripción es un párrafo.
 * - **4.1.3 Mensajes de estado (AA)**: el bloque es `aria-live="polite"` y anuncia los cambios de título o
 *   descripción; si el padre lo inserta ya lleno con un bloque if, no todos los lectores lo anuncian.
 * - **1.4.3 Contraste mínimo (AA)**: título `text-neutral-high` 16.29:1 (16.53:1 en oscuro) y descripción
 *   `text-neutral-medium` 14.53:1 (12.87:1) sobre la superficie.
 * - **4.1.2 Nombre, función y valor (A)**: el botón de acción es un `siaf-button` con `ariaLabel` igual a su texto
 *   visible (`actionLabel`).
 */
@Component({
  selector: 'siaf-empty-state',
  standalone: true,
  imports: [ButtonComponent],
  template: `
    <section
      class="flex w-full flex-1 items-center justify-center rounded-siaf-md bg-surface px-siaf-md py-siaf-xl"
      aria-live="polite"
    >
      <div class="flex w-full max-w-[660px] flex-col items-center gap-siaf-xl text-center">
        <svg
          class="h-[154px] w-[153px] text-[var(--sys-color-text-neutral-low)]"
          viewBox="0 0 152 154"
          fill="none"
          aria-hidden="true"
          [innerHTML]="illustrationSvg()"
        ></svg>
        <div class="flex flex-col gap-siaf-md">
          <h2 class="m-0 text-[22px] font-bold leading-tight tracking-[-0.19px] text-[var(--sys-color-text-neutral-high)]">
            {{ title }}
          </h2>
          @if (description) {
            <p class="m-0 max-w-[308px] self-center text-sm leading-snug tracking-[0.0249px] text-[var(--sys-color-text-neutral-medium)]">
              {{ description }}
            </p>
          }
          @if (actionLabel) {
            <div class="mt-siaf-xs">
              <siaf-button
                variant="accent"
                size="md"
                [icon]="actionIcon"
                [disabled]="actionDisabled"
                [ariaLabel]="actionLabel"
                (click)="actionClicked.emit()"
              >
                {{ actionLabel }}
              </siaf-button>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: `
    /* El host debe estirarse en columnas flex (page-shell) para que el estado
       vacío ocupe todo el alto disponible, no solo su contenido. */
    :host {
      display: flex;
      flex: 1 1 auto;
      min-height: 0;
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  private readonly sanitizer = inject(DomSanitizer);

  @Input() title = '';
  @Input() description = '';
  @Input() actionLabel = '';
  @Input() actionIcon = '';
  @Input() actionDisabled = false;
  @Input() set illustration(value: EmptyStateIllustration) {
    this._illustration.set(value);
  }
  get illustration(): EmptyStateIllustration {
    return this._illustration();
  }

  @Output() actionClicked = new EventEmitter<void>();

  private readonly _illustration = signal<EmptyStateIllustration>('no-results');

  readonly illustrationSvg = computed<SafeHtml>(() =>
    this.sanitizer.bypassSecurityTrustHtml(
      EMPTY_STATE_ILLUSTRATIONS[this._illustration()] ?? EMPTY_STATE_ILLUSTRATIONS['no-results'],
    ),
  );
}
