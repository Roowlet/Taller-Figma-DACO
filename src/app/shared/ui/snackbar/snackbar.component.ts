import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

import { IconComponent } from '../icon/icon.component';
import { SidePanelAnimacion } from '../side-panel-animacion';

export type SnackbarVariant =
  | 'custom'
  | 'changes-done'
  | 'record-done'
  | 'record-deleted'
  | 'changes-saved'
  | 'changes-undone'
  | 'request-uploaded'
  | 'file-uploaded'
  | 'creation-elaborated'
  | 'creation-verified'
  | 'modification-verified'
  | 'creation-approved'
  | 'modification-approved'
  | 'creation-observed'
  | 'modification-observed'
  | 'creation-rejected'
  | 'modification-rejected'
  | 'creation-deleted'
  | 'modification-deleted'
  | 'bulk-approved'
  | 'bulk-verified';

/** Tipos del Figma (UI KIT, nodo 7018:15692): `neutral` va sin ícono. */
export type SnackbarTone = 'neutral' | 'info' | 'success' | 'warning' | 'error';

const ICONO_POR_TONO: Record<Exclude<SnackbarTone, 'neutral'>, { nombre: string; clase: string }> = {
  info: { nombre: 'info', clase: 'text-[var(--sys-color-icon-snackbar-info)]' },
  success: { nombre: 'check_circle', clase: 'text-[var(--sys-color-icon-snackbar-success)]' },
  warning: { nombre: 'warning', clase: 'text-[var(--sys-color-icon-snackbar-warning)]' },
  error: { nombre: 'error', clase: 'text-[var(--sys-color-icon-snackbar-danger)]' },
};

type SnackbarPreset = {
  text?: string;
  beforeStrong?: string;
  strong?: string;
  afterStrong?: string;
  requestType?: string;
  requestAction?: string;
  bulkStatus?: string;
};

const SNACKBAR_PRESETS: Record<Exclude<SnackbarVariant, 'custom'>, SnackbarPreset> = {
  'changes-done': {
    text: 'Los cambios se han realizado con éxito.'
  },
  'record-done': {
    text: 'El registro se ha realizado con éxito.'
  },
  'record-deleted': {
    text: 'El registro se ha eliminado con éxito.'
  },
  'changes-saved': {
    text: 'Los cambios se han guardado con éxito.'
  },
  'changes-undone': {
    text: 'Los cambios se deshicieron con éxito.'
  },
  'request-uploaded': {
    beforeStrong: 'La solicitud ',
    strong: 'DocEntregado001.xls',
    afterStrong: ' se ha subido con éxito.'
  },
  'file-uploaded': {
    beforeStrong: 'El archivo ',
    strong: 'DocEntregado001.xls',
    afterStrong: ' se ha subido con éxito.'
  },
  'creation-elaborated': {
    requestType: 'creación',
    requestAction: 'elaborado'
  },
  'creation-verified': {
    requestType: 'creación',
    requestAction: 'verificado'
  },
  'modification-verified': {
    requestType: 'modificación',
    requestAction: 'verificado'
  },
  'creation-approved': {
    requestType: 'creación',
    requestAction: 'aprobado'
  },
  'modification-approved': {
    requestType: 'modificación',
    requestAction: 'aprobado'
  },
  'creation-observed': {
    requestType: 'creación',
    requestAction: 'observado'
  },
  'modification-observed': {
    requestType: 'modificación',
    requestAction: 'observado'
  },
  'creation-rejected': {
    requestType: 'creación',
    requestAction: 'rechazado'
  },
  'modification-rejected': {
    requestType: 'modificación',
    requestAction: 'rechazado'
  },
  'creation-deleted': {
    requestType: 'creación',
    requestAction: 'eliminado'
  },
  'modification-deleted': {
    requestType: 'modificación',
    requestAction: 'eliminado'
  },
  'bulk-approved': {
    bulkStatus: 'aprobado'
  },
  'bulk-verified': {
    bulkStatus: 'verificado'
  }
};

/**
 * Aviso flotante animado con textos predefinidos por `variant` (registro grabado, archivo subido, solicitud
 * elaborada/verificada/aprobada…) o mensaje libre.
 *
 * `tone` sigue los tipos del Figma: `neutral` (sin ícono), `info`, `success` (por defecto), `warning` y
 * `error`. Los íconos usan los colores del Figma también en modo oscuro, porque el fondo es oscuro en ambos
 * temas. `actionLabel` agrega un botón de texto antes de la X, que emite `action`. Mide como máximo 430 px:
 * un mensaje largo pasa a dos líneas. `warning` y `error` se anuncian de inmediato (`role="alert"`).
 *
 * Úsalo para confirmar una acción puntual del usuario. Los avisos de aprobación/rechazo de una
 * solicitud NO se arman a mano aquí: los emite `siaf-request-approval-modals` con `[requestType]`.
 *
 * @usar
 * - Para confirmar una acción puntual que ya terminó: registro grabado, cambios guardados, archivo subido.
 * - Para el resultado de la aprobación masiva en la bandeja (`siaf-documents-records-page`) y de la carga masiva
 *   del Plan de Cuentas o del catálogo de eventos.
 * - Con `tone="error"` cuando la acción falló y hay que avisar enseguida, como al cambiar el estado de un usuario
 *   en Admin.
 * - Con `actionLabel` para ofrecer una salida rápida, como «Deshacer».
 * @evitar
 * - Para los avisos de grabar, verificar, aprobar, observar o rechazar una solicitud: los emite
 *   `siaf-request-approval-modals` con `[requestType]`.
 * - Para mensajes que deben quedar fijos en la pantalla o explicar una restricción: usar `siaf-alert`.
 * - Para pedir confirmación antes de actuar: usar `siaf-modal`.
 * @teclado
 * - **Tab**: llega al botón de acción (con `actionLabel`) y a la × (con `dismissible`) según su lugar en el DOM;
 *   el aviso no toma el foco al aparecer.
 * - **Enter / Espacio**: el botón de acción emite `action` y la × emite `closed` (botones nativos).
 * @accesibilidad
 * - **4.1.3 Mensajes de estado (AA)**: `warning` y `error` son `role="alert"` y los demás `role="status"`; ojo: la
 *   región nace junto con el texto (bloque if) y un `status` que aparece ya lleno no siempre se anuncia.
 * - **1.1.1 Contenido no textual (A)**: el ícono del tono es decorativo (`aria-hidden`) y `neutral` no lleva: el
 *   texto tiene que decir si la acción salió bien o falló.
 * - **1.4.3 Contraste mínimo (AA)**: texto blanco sobre el fondo casi negro del aviso en ambos temas
 *   (`bg-on-surfaces-high` en claro, `bg-snackbar` en oscuro).
 * - **4.1.2 Nombre, función y valor (A)**: la × es un `<button>` con `aria-label="Cerrar mensaje"` y el botón de
 *   acción se nombra con su texto visible.
 * - **2.4.7 Foco visible (AA)**: los dos botones muestran un contorno blanco de 2 px.
 * - **2.5.8 Tamaño del objetivo (AA)**: la × mide 32 × 32 px y el botón de acción, 32 px de alto.
 * - **2.2.1 Tiempo ajustable (A)**: no tiene temporizador: queda visible hasta que el usuario lo cierra o el padre
 *   cambia `open`.
 * - **2.4.3 Orden del foco (A)**: al cerrarlo con la × el botón desaparece y el foco queda en el documento.
 */
@Component({
  selector: 'siaf-snackbar',
  standalone: true,
  imports: [IconComponent],
  template: `
    @if (anim.visible()) {
      <div
        class="siaf-snackbar-anim flex min-h-16 w-full max-w-[430px] items-center gap-siaf-xs rounded-siaf-md bg-[var(--sys-color-bg-snackbar,var(--sys-color-bg-on-surfaces-high))] p-siaf-md text-sm font-normal leading-[normal] tracking-[0.025px] text-[var(--sys-color-text-brand-white)] shadow-siaf-elevation-2"
        [class.cerrando]="anim.cerrando()"
        [attr.role]="tone === 'warning' || tone === 'error' ? 'alert' : 'status'"
        [attr.data-tone]="tone"
      >
        <div class="flex min-w-0 flex-1 items-center gap-siaf-xs">
          @if (icono; as icono) {
            <siaf-icon class="shrink-0" [class]="icono.clase" [name]="icono.nombre" [size]="24" />
          }

          <div class="min-w-0 flex-1">
            @if (message) {
              <p class="m-0">{{ message }}</p>
            } @else if (resolvedPreset.text) {
              <p class="m-0">{{ resolvedPreset.text }}</p>
            } @else if (resolvedPreset.requestAction) {
              <p class="m-0">
                <span>La solicitud de tipo </span>
                <span>{{ requestType || resolvedPreset.requestType }}</span>
                <span> número </span>
                <strong class="font-bold">{{ requestNumber }}</strong>
                <span> se ha </span>
                <strong class="font-bold">{{ requestAction || resolvedPreset.requestAction }}</strong>
                <span> con éxito.</span>
              </p>
            } @else if (resolvedPreset.bulkStatus) {
              <p class="m-0">
                <span>El estado de las solicitudes se ha actualizado a </span>
                <strong class="font-bold">{{ bulkStatus || resolvedPreset.bulkStatus }}</strong>
                <span> con éxito.</span>
              </p>
            } @else if (resolvedPreset.strong) {
              <p class="m-0">
                <span>{{ resolvedPreset.beforeStrong }}</span>
                <strong class="font-bold">{{ fileName || resolvedPreset.strong }}</strong>
                <span>{{ resolvedPreset.afterStrong }}</span>
              </p>
            } @else {
              <ng-content />
            }
          </div>
        </div>

        @if (actionLabel) {
          <button
            class="inline-flex min-h-8 shrink-0 items-center justify-center rounded-siaf-md px-siaf-md py-siaf-xxs text-sm font-medium leading-[normal] text-[var(--sys-color-text-brand-white)] transition hover:bg-[var(--sys-color-bg-states-dark-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sys-color-text-brand-white)]"
            type="button"
            (click)="action.emit()"
          >
            {{ actionLabel }}
          </button>
        }
        @if (dismissible) {
          <button
            class="-mr-1 inline-flex size-8 shrink-0 items-center justify-center rounded-siaf-sm text-[var(--sys-color-text-brand-white)] transition hover:bg-[var(--sys-color-bg-states-dark-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sys-color-text-brand-white)]"
            type="button"
            aria-label="Cerrar mensaje"
            (click)="closed.emit()"
          >
            <siaf-icon name="close" [size]="24" />
          </button>
        }
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SnackbarComponent implements OnChanges, OnInit {
  /** Render animado (entra desde abajo, sale en reverso al cerrar con la X). */
  readonly anim = new SidePanelAnimacion();

  /** Cubre los usos sin binding de `open` (default true, p. ej. showcase). */
  ngOnInit(): void {
    this.anim.actualizar(this.open);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('open' in changes) this.anim.actualizar(this.open);
  }

  @Input() open = true;
  /** Tipo del aviso: define el ícono y su color. `neutral` no lleva ícono. */
  @Input() tone: SnackbarTone = 'success';
  @Input() variant: SnackbarVariant = 'custom';
  @Input() message = '';
  @Input() fileName = '';
  @Input() requestType = '';
  @Input() requestNumber = '0001';
  @Input() requestAction = '';
  @Input() bulkStatus = '';
  @Input() dismissible = true;
  /** Texto del botón de acción (ej. «Deshacer»). Sin texto no se muestra. */
  @Input() actionLabel = '';

  @Output() closed = new EventEmitter<void>();
  @Output() action = new EventEmitter<void>();

  get icono(): { nombre: string; clase: string } | null {
    return this.tone === 'neutral' ? null : ICONO_POR_TONO[this.tone];
  }

  get resolvedPreset(): SnackbarPreset {
    if (this.variant === 'custom') {
      return {};
    }

    return SNACKBAR_PRESETS[this.variant];
  }
}
