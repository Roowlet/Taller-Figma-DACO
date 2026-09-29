import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from "@angular/core";
import { DOCUMENT } from "@angular/common";

import { ButtonComponent, ButtonVariant } from "../button/button.component";
import { FocoDirective } from "../foco/foco.directive";
import { IconComponent } from "../icon/icon.component";
import { SidePanelAnimacion } from "../side-panel-animacion";
import { TextAreaControlComponent } from "../text-area-control/text-area-control.component";
import { TextFieldComponent } from "../text-field/text-field.component";

export type ModalVariant =
  | "custom"
  | "delete-request"
  | "delete-record"
  | "review"
  | "undo-changes"
  | "save"
  | "verify"
  | "verify-multiple"
  | "validate"
  | "approve"
  | "approve-multiple"
  | "cancel"
  | "settings"
  | "observe"
  | "reject";

interface ModalPreset {
  title: string;
  description: string;
  icon: string;
  illustration: string;
  confirmLabel: string;
  requiresReason?: boolean;
  confirmDisabled?: boolean;
}

const MODAL_PRESETS: Record<Exclude<ModalVariant, "custom">, ModalPreset> = {
  "delete-request": {
    title: "¿Eliminar solicitud?",
    description: "La solicitud será eliminada.",
    icon: "delete",
    illustration: "assets/figma/modals/delete.svg",
    confirmLabel: "Aceptar",
  },
  "delete-record": {
    title: "¿Borrar registro?",
    description: "Perderá todos los datos ingresados.",
    icon: "delete_forever",
    illustration: "assets/figma/modals/delete.svg",
    confirmLabel: "Aceptar",
  },
  review: {
    title: "¿Revisar solicitud?",
    description: "La solicitud será revisada.",
    icon: "fact_check",
    illustration: "assets/figma/modals/review.svg",
    confirmLabel: "Aceptar",
  },
  "undo-changes": {
    title: "¿Quieres deshacer los cambios?",
    description: "Esta acción no se puede revertir.",
    icon: "undo",
    illustration: "assets/figma/modals/undo.svg",
    confirmLabel: "Aceptar",
  },
  save: {
    title: "¿Grabar solicitud?",
    description: "Los registros se grabarán en esta solicitud.",
    icon: "save",
    illustration: "assets/figma/modals/save_1.svg",
    confirmLabel: "Aceptar",
  },
  verify: {
    title: "¿Verificar solicitud?",
    description: "La solicitud será verificada.",
    icon: "verified",
    illustration: "assets/figma/modals/verify.svg",
    confirmLabel: "Aceptar",
  },
  "verify-multiple": {
    title: "¿Verificar múltiples solicitudes?",
    description: "Las solicitudes serán verificadas.",
    icon: "domain_verification",
    illustration: "assets/figma/modals/verify.svg",
    confirmLabel: "Aceptar",
  },
  validate: {
    title: "¿Validar solicitud?",
    description: "La solicitud será validada.",
    icon: "task_alt",
    illustration: "assets/figma/modals/validate.svg",
    confirmLabel: "Aceptar",
  },
  approve: {
    title: "¿Aprobar solicitud?",
    description: "La solicitud será aprobada.",
    icon: "approval",
    illustration: "assets/figma/modals/approve.svg",
    confirmLabel: "Aceptar",
  },
  "approve-multiple": {
    title: "¿Aprobar múltiples solicitudes?",
    description: "Las solicitudes serán aprobadas.",
    icon: "done_all",
    illustration: "assets/figma/modals/approve.svg",
    confirmLabel: "Aceptar",
  },
  cancel: {
    title: "¿Cancelar solicitud?",
    description: "Se perderán los registros de solicitud.",
    icon: "cancel",
    illustration: "assets/figma/modals/cancel.svg",
    confirmLabel: "Aceptar",
  },
  settings: {
    title: "Modal Header",
    description: "This will restore all system settings to factory defaults.",
    icon: "settings",
    illustration: "assets/figma/modals/settings.svg",
    confirmLabel: "Aceptar",
  },
  observe: {
    title: "¿Observar solicitud?",
    description: "La solicitud será observada.",
    icon: "visibility",
    illustration: "assets/figma/modals/observe.svg",
    confirmLabel: "Aceptar",
    requiresReason: true,
    confirmDisabled: true,
  },
  reject: {
    title: "¿Rechazar solicitud?",
    description: "La solicitud será rechazada.",
    icon: "block",
    illustration: "assets/figma/modals/reject.svg",
    confirmLabel: "Aceptar",
    requiresReason: true,
    confirmDisabled: true,
  },
};

/**
 * Modal de confirmación con presets por acción (grabar, verificar, aprobar, observar, rechazar…)
 * que resuelven título, descripción, ilustración y motivo obligatorio; `custom` deja todo abierto.
 *
 * Es el diálogo canónico del kit: úsalo para cualquier confirmación en vez de maquetar un overlay.
 * Los mensajes de resultado tras la acción van por `siaf-request-approval-modals` (snackbar).
 *
 * @usar
 * - Para confirmar una acción sobre una solicitud con su preset (`save`, `verify`, `approve`, `delete-request`,
 *   `observe`, `reject`…); en las request-pages llegan ya armados por `siaf-request-approval-modals`.
 * - En las acciones masivas de la bandeja: «¿Deseas verificar / aprobar múltiples solicitudes?» de
 *   `siaf-documents-records-page` (`custom` con ilustración).
 * - Con `custom` y contenido proyectado para diálogos cortos con campos, como «Cambiar contraseña» del escritorio
 *   virtual.
 * - `observe` y `reject` para pedir el motivo (`reason` / `reasonChange`): Aceptar se habilita al escribirlo.
 * @evitar
 * - Repetir a mano en una request-page los seis modales del flujo: usar `siaf-request-approval-modals`.
 * - Para avisar el resultado después de confirmar: usar `siaf-snackbar`; para bloquear mientras se procesa,
 *   `siaf-loader-overlay`.
 * - Para buscar y elegir registros o adjuntar archivos: usar `siaf-selection-side-nav` o `siaf-upload-side-nav`.
 * - Dentro de un bloque if sin enlazar `open`: sin ese input no se pinta; y si el bloque lo destruye al cerrar, no anima
 *   la salida (el foco sí vuelve al control que lo abrió).
 * @teclado
 * - **Tab / Shift + Tab**: al abrir, el foco ya está en el primer control (la X si `showClose`, o el diálogo si no hay
 *   controles); recorren los controles y dan la vuelta del último al primero sin salir del diálogo.
 * - **Escape**: cierra como Cancelar (emite `canceled` y `closed`) y devuelve el foco al elemento que lo tenía antes
 *   de abrir.
 * - **Enter / Espacio**: activan la X, Cancelar y Aceptar (emite `confirmed`); el campo de motivo sigue
 *   `text-area-control`.
 * @accesibilidad
 * - **4.1.2 Nombre, función y valor (A)**: `role="dialog"` con `aria-modal="true"`, `aria-labelledby` al título y
 *   `aria-describedby` a la descripción; la X se llama «Cerrar» (ícono con `label`).
 * - **2.4.3 Orden del foco (A)**: con `siafFoco`, al abrir mueve el foco al primer control y al cerrar (con `open` en
 *   false o al destruirse) lo devuelve a donde estaba.
 * - **2.1.2 Sin trampas de teclado (A)**: Tab queda dentro del diálogo mientras está abierto, pero Escape siempre lo
 *   cierra.
 * - **Pendiente · 3.3.2 Etiquetas o instrucciones (A)**: en `observe` y `reject` el motivo es obligatorio (Aceptar
 *   sigue deshabilitado sin texto) pero no se marca: no pasa `required` a `text-area-control`, que pondría el
 *   asterisco y `aria-required`.
 * - **2.4.7 Foco visible (AA)**: la X muestra un anillo `border-states-focus` de 2 px con `focus-visible`; los
 *   botones del pie siguen `siaf-button`.
 * - **1.4.11 Contraste no textual (AA)**: ese anillo es el azul del kit (`border-states-focus`, 5.35:1 claro / 10.15:1
 *   oscuro sobre la superficie).
 * - **1.1.1 Contenido no textual (A)**: la ilustración va con `alt=""` y el ícono de respaldo es decorativo.
 * - **1.4.3 Contraste mínimo (AA)**: título `text-neutral-high` y descripción `text-neutral-medium` sobre
 *   `surface-highest`, que en claro es el blanco de la superficie (16.29:1 y 14.53:1).
 */
@Component({
  selector: "siaf-modal",
  standalone: true,
  imports: [ButtonComponent, FocoDirective, IconComponent, TextAreaControlComponent, TextFieldComponent],
  template: `
    @if (anim.visible()) {
      <div
        class="siaf-modal-overlay fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-siaf-md"
        [class.cerrando]="anim.cerrando()"
        role="presentation"
      >
        <section
          class="relative flex max-h-[calc(100vh-32px)] w-full max-w-[500px] flex-col gap-siaf-lg overflow-y-auto rounded-siaf-md bg-[var(--sys-color-bg-surfaces-surface-highest)] px-siaf-lg pb-siaf-lg pt-12 shadow-siaf-lg"
          role="dialog"
          aria-modal="true"
          tabindex="-1"
          [attr.aria-labelledby]="titleId"
          [attr.aria-describedby]="resolvedDescription ? descriptionId : null"
          [siafFoco]="open"
          (siafFocoEscape)="handleCancel()"
        >
          @if (showClose) {
            <button
              class="absolute right-siaf-lg top-siaf-lg grid size-6 place-items-center rounded-siaf-sm text-[var(--sys-color-text-neutral-medium)] hover:bg-surface-muted focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sys-color-border-states-focus)]"
              type="button"
              (click)="handleCancel()"
            >
              <siaf-icon
                name="close"
                [size]="20"
                label="Cerrar"
                [decorative]="false"
              />
            </button>
          }

          @if (showIllustration) {
            <div class="flex justify-center">
              @if (resolvedIllustrationSrc) {
                <img
                  class="h-32 w-[188px] object-contain"
                  [src]="resolvedIllustrationSrc"
                  alt=""
                />
              } @else {
                <div
                  class="flex size-32 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary"
                >
                  <siaf-icon [name]="resolvedIcon" [size]="64" />
                </div>
              }
            </div>
          }

          <div
            class="flex flex-col items-center gap-siaf-md px-0 text-center sm:px-siaf-lg"
          >
            @if (resolvedTitle) {
              <h2
                [id]="titleId"
                class="w-full text-base font-medium text-[var(--sys-color-text-neutral-high)]"
              >
                {{ resolvedTitle }}
              </h2>
            }

            @if (resolvedDescription) {
              <p
                [id]="descriptionId"
                class="w-full whitespace-pre-line text-sm font-normal tracking-[0.024px] text-[var(--sys-color-text-neutral-medium)]"
              >
                {{ resolvedDescription }}
              </p>
            }
          </div>

          @if (requiresReason) {
            <div class="flex flex-col gap-siaf-sm px-0 sm:px-siaf-lg">
              <!-- Input disabled con label flotante — fiel al diseño -->
              @if (reasonTypeOptions.length > 0) {
                <siaf-input [label]="reasonTypeLabel" [value]="reasonType" [disabled]="true" />
              }
              <!-- Textarea usando text-area-control del design system -->
              <text-area-control
                [placeholder]="reasonLabel || reasonPlaceholder"
                [value]="reason"
                [disabled]="reasonDisabled"
                [maxlength]="reasonMaxLength"
                (valueChange)="onReasonValueChange($event)"
              />
            </div>
          }

          <div class="text-sm text-text-muted">
            <ng-content />
          </div>

          @if (showFooter) {
            <footer
              class="flex flex-row flex-wrap justify-end gap-siaf-xs"
            >
              @if (hasProjectedActions) {
                <ng-content select="[modal-actions]" />
              } @else {
                <siaf-button variant="secondary" (click)="handleCancel()">{{
                  cancelLabel
                }}</siaf-button>
                <siaf-button
                  [variant]="confirmVariant"
                  [disabled]="resolvedConfirmDisabled"
                  (click)="confirmed.emit()"
                >
                  {{ resolvedConfirmLabel }}
                </siaf-button>
              }
            </footer>
          }
        </section>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalComponent implements OnChanges {
  @Input() open = false;
  @Input() variant: ModalVariant = "custom";
  @Input() title = "";
  @Input() description = "";
  @Input() icon = "";
  @Input() illustrationSrc = "";
  @Input() cancelLabel = "Cancelar";
  @Input() confirmLabel = "";
  @Input() confirmDisabled: boolean | null = null;
  /** Variante del botón de confirmar (las de `siaf-button`). */
  @Input() confirmVariant: ButtonVariant = "primary";
  @Input() reasonPlaceholder = "Motivo";
  @Input() reasonDisabled = false;
  @Input() reason = '';
  @Input() reasonLabel = '';
  @Input() reasonMaxLength = 500;
  /** Opciones para el dropdown de tipo/motivo. Si está vacío, no se muestra el select. */
  @Input() reasonTypeOptions: string[] = [];
  @Input() reasonTypeLabel = 'Motivo';
  @Input() reasonType = '';
  @Output() reasonTypeChange = new EventEmitter<string>();
  @Input() showClose = true;
  @Input() showFooter = true;
  @Input() showIllustration = false;
  @Input() hasProjectedActions = false;
  @Output() closed = new EventEmitter<void>();
  @Output() canceled = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<void>();
  @Output() reasonChange = new EventEmitter<string>();

  onReasonInput(event: Event): void {
    const value = (event.target as HTMLInputElement | HTMLTextAreaElement).value;
    this.reason = value;
    this.reasonChange.emit(value);
  }

  onReasonValueChange(value: string): void {
    this.reason = value;
    this.reasonChange.emit(value);
  }

  onReasonTypeChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.reasonType = value;
    this.reasonTypeChange.emit(value);
  }

  readonly titleId = `siaf-modal-title-${Math.random().toString(36).slice(2)}`;
  readonly descriptionId = `siaf-modal-description-${Math.random().toString(36).slice(2)}`;

  constructor(@Inject(DOCUMENT) private readonly document: Document) {}

  /** Render animado del modal (entra desde arriba, sale en reverso). */
  readonly anim = new SidePanelAnimacion();

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes["open"]) {
      return;
    }
    this.anim.actualizar(this.open);

    if (this.open) {
      // Reset interno al abrir el modal
      this.reason = '';
      // Pre-seleccionar la última opción (ej. "Otros") si hay opciones disponibles
      this.reasonType = this.reasonTypeOptions.length > 0
        ? this.reasonTypeOptions[this.reasonTypeOptions.length - 1]
        : '';
    }
    // El foco (entrar al abrir, Tab dentro del diálogo, Escape y volver al cerrar) lo maneja siafFoco.
  }

  get preset(): ModalPreset | null {
    return this.variant === "custom" ? null : MODAL_PRESETS[this.variant];
  }

  get resolvedTitle(): string {
    return this.title || this.preset?.title || "Detalle";
  }

  get resolvedDescription(): string {
    return this.description || this.preset?.description || "";
  }

  get resolvedIcon(): string {
    return this.icon || this.preset?.icon || "info";
  }

  get resolvedIllustrationSrc(): string {
    const illustration = this.illustrationSrc || this.preset?.illustration || "";
    return this.resolveThemeIllustration(illustration);
  }

  get resolvedConfirmLabel(): string {
    return this.confirmLabel || this.preset?.confirmLabel || "Aceptar";
  }

  get requiresReason(): boolean {
    return !!this.preset?.requiresReason;
  }

  get resolvedConfirmDisabled(): boolean {
    if (this.confirmDisabled !== null) return this.confirmDisabled;
    if (this.preset?.requiresReason) {
      return this.reason.trim().length === 0;
    }
    return !!this.preset?.confirmDisabled;
  }

  handleCancel(): void {
    this.canceled.emit();
    this.closed.emit();
  }

  private resolveThemeIllustration(src: string): string {
    if (!src || !this.isDarkTheme()) {
      return src;
    }

    return src.startsWith("assets/figma/modals/")
      ? src.replace("assets/figma/modals/", "assets/figma/modals-dark/")
      : src;
  }

  private isDarkTheme(): boolean {
    return this.document.documentElement.getAttribute("data-theme") === "dark";
  }
}
