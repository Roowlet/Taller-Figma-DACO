import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { ButtonComponent } from '../../ui/button/button.component';
import { IconComponent } from '../../ui/icon/icon.component';
import { TooltipDirective } from '../../ui/tooltip/tooltip.directive';

export type SolicitudeHeaderType = 'readonly' | 'actions';
export type SolicitudeHeaderRole = 'creator' | 'reviewer' | 'approver';
export type SolicitudeHeaderState =
  | 'new'
  | 'edit'
  | 'readonly'
  | 'elaborated'
  | 'registered'
  | 'verified'
  | 'validated'
  | 'reviewed'
  | 'generated'
  | 'in_process'
  | 'authorized'
  | 'signed'
  | 'approved'
  | 'accepted'
  | 'published'
  | 'processed'
  | 'observed'
  | 'pending'
  | 'failed'
  | 'deleted'
  | 'rejected'
  | 'annulled';
export type SolicitudeHeaderTagTone = 'accent' | 'info';
export type SolicitudeHeaderButtonTone = 'primary' | 'secondary' | 'accent';

type SolicitudeHeaderConfig = {
  type: SolicitudeHeaderType;
  showTag: boolean;
  tagLabel: string;
  tagTone: SolicitudeHeaderTagTone;
  saveVariant: SolicitudeHeaderButtonTone;
  editVariant?: SolicitudeHeaderButtonTone;
  showDelete: boolean;
  /** Eliminar visible pero deshabilitado (RN-019/031: un documento observado
   *  no puede eliminarse — la subsanación es obligatoria). */
  deleteDisabled?: boolean;
  showEdit: boolean;
  showVerify: boolean;
  showApprove?: boolean;
  showObserve?: boolean;
  showReject?: boolean;
};

const CREATOR_HEADER_CONFIG: Partial<Record<SolicitudeHeaderState, SolicitudeHeaderConfig>> = {
  new: {
    type: 'actions',
    showTag: true,
    tagLabel: 'Nuevo',
    tagTone: 'accent',
    saveVariant: 'secondary',
    showDelete: false,
    showEdit: false,
    showVerify: true
  },
  edit: {
    // En modo edición solo se muestran Cancelar y Grabar.
    // Verificar aparece únicamente en el estado ELABORADO de solo lectura,
    // una vez que el usuario haya grabado los cambios.
    type: 'actions',
    showTag: true,
    tagLabel: 'Edición',
    tagTone: 'info',
    saveVariant: 'accent',
    showDelete: false,
    showEdit: false,
    showVerify: false
  },
  elaborated: {
    type: 'readonly',
    showTag: false,
    tagLabel: '',
    tagTone: 'accent',
    saveVariant: 'secondary',
    showDelete: true,
    showEdit: true,
    showVerify: true
  },
  verified: {
    type: 'readonly',
    showTag: false,
    tagLabel: '',
    tagTone: 'accent',
    saveVariant: 'secondary',
    showDelete: false,
    showEdit: false,
    showVerify: false
  },
  deleted: {
    type: 'readonly',
    showTag: false,
    tagLabel: '',
    tagTone: 'accent',
    saveVariant: 'secondary',
    showDelete: false,
    showEdit: false,
    showVerify: false
  },
  // Cuando el aprobador OBSERVA, el creador solo puede EDITAR para subsanar
  // (RN-019/031: la subsanación es obligatoria — Eliminar queda visible pero
  // deshabilitado para preservar la trazabilidad de auditoría).
  observed: {
    type: 'readonly',
    showTag: false,
    tagLabel: '',
    tagTone: 'accent',
    saveVariant: 'secondary',
    editVariant: 'primary',
    showDelete: true,
    deleteDisabled: true,
    showEdit: true,
    showVerify: false
  },
  rejected: {
    // RECHAZADO es estado FINAL para el creador — flujo terminado, solo lectura
    type: 'readonly',
    showTag: false,
    tagLabel: '',
    tagTone: 'accent',
    saveVariant: 'secondary',
    showDelete: false,
    showEdit: false,
    showVerify: false
  },
  approved: {
    type: 'readonly',
    showTag: false,
    tagLabel: '',
    tagTone: 'accent',
    saveVariant: 'secondary',
    showDelete: false,
    showEdit: false,
    showVerify: false
  },
  readonly: {
    type: 'readonly',
    showTag: false,
    tagLabel: '',
    tagTone: 'accent',
    saveVariant: 'secondary',
    showDelete: true,
    showEdit: true,
    showVerify: true
  }
};

const APPROVER_HEADER_CONFIG: Partial<Record<SolicitudeHeaderState, SolicitudeHeaderConfig>> = {
  elaborated: {
    type: 'readonly',
    showTag: false,
    tagLabel: '',
    tagTone: 'accent',
    saveVariant: 'secondary',
    showDelete: false,
    showEdit: false,
    showVerify: false
  },
  verified: {
    type: 'readonly',
    showTag: false,
    tagLabel: '',
    tagTone: 'accent',
    saveVariant: 'secondary',
    showDelete: false,
    showEdit: false,
    showVerify: false,
    showApprove: true,
    showObserve: true,
    showReject: true
  },
  observed: {
    type: 'readonly',
    showTag: false,
    tagLabel: '',
    tagTone: 'accent',
    saveVariant: 'secondary',
    showDelete: false,
    showEdit: false,
    showVerify: false
  },
  rejected: {
    type: 'readonly',
    showTag: false,
    tagLabel: '',
    tagTone: 'accent',
    saveVariant: 'secondary',
    showDelete: false,
    showEdit: false,
    showVerify: false
  },
  approved: {
    type: 'readonly',
    showTag: false,
    tagLabel: '',
    tagTone: 'accent',
    saveVariant: 'secondary',
    showDelete: false,
    showEdit: false,
    showVerify: false
  }
};

const HEADER_CONFIG_BY_ROLE: Partial<Record<SolicitudeHeaderRole, Partial<Record<SolicitudeHeaderState, SolicitudeHeaderConfig>>>> = {
  creator: CREATOR_HEADER_CONFIG,
  approver: APPROVER_HEADER_CONFIG
};

/** Botón de la barra móvil; el último de la lista es la acción principal. */
type SolicitudeHeaderMobileAction = {
  label: string;
  icon: string;
  variant: SolicitudeHeaderButtonTone;
  disabled: boolean;
  event: EventEmitter<void>;
};

// Barra móvil del Figma («Docked toolbar» de la Guía de Estructura de Pantallas): botones de 48 px, los secundarios
// con su ancho y solo texto, y la principal con ícono ocupando el resto; desde `sm`, todos con su ancho a la derecha.
// `siaf-button` mide 40 px y no oculta su ícono por ancho, así que la clase lo ajusta por dentro: bajo 360 px la
// principal pierde el ícono para que entren tres acciones. El ancho también va por dentro: con `w-full` en el host,
// `:host(.w-full)` de `siaf-button` le gana a `sm:w-auto` y desde `sm` la principal empujaba a las otras fuera.
const MOBILE_ACTION_CLASS = 'shrink-0 [&_button]:min-h-12';
const MOBILE_PRIMARY_ACTION_CLASS =
  'min-w-0 flex-1 sm:flex-none [&_button]:min-h-12 [&_button]:w-full sm:[&_button]:w-auto max-[360px]:[&_siaf-icon]:hidden';

/**
 * Encabezado de una pantalla de solicitud: Regresar, título (`heading`) con etiqueta («Nuevo», «Edición»), texto
 * secundario y la botonera del flujo (Cancelar, Grabar, Verificar, Editar, Eliminar, Aprobar, Observar, Rechazar).
 * Qué botones se ven sale de una matriz por `role` (creador o aprobador) y `state` del documento; sin esa combinación
 * mandan los inputs sueltos, y `customActions` cambia la botonera por lo proyectado en `[actions]`.
 * En escritorio los botones van a la derecha. En móvil van en una barra fija inferior donde la última acción es la
 * principal (con ícono y el resto del ancho) y las demás van solo con texto. `loading` pinta un esqueleto.
 *
 * @usar
 * - Dentro de `siaf-solicitude-page-layout`, que lo pinta con `role` y `state`: así lo usan las request-pages de
 *   Contabilidad y los formularios de Admin.
 * - Con `customActions` y botones en `[actions]` cuando el proceso tiene acciones fuera de la matriz, como «Reprocesar»
 *   en el detalle de contabilización.
 * - Con `saveDisabled` para dejar Grabar deshabilitado mientras no hay cambios (patrón «Grabar solo con cambios»).
 * @evitar
 * - Suelto con su propio breadcrumb y contenedor: usar `siaf-solicitude-page-layout`, que lo fija bajo el navbar y
 *   reenvía los eventos (hoy solo la ruta `formulario` de asiento de ajuste lo arma a mano).
 * - Para pantallas sin ciclo de documento (consultas, listados): usar `siaf-page-header`.
 * - Para acciones de una tarjeta o sección: ponerlas en la tarjeta y apagar la botonera con `showButtonGroup` en false,
 *   como el Gestor de Usuarios.
 * - Para mostrar el estado del documento en el flujo: usar `siaf-flow-status-tag`; esta etiqueta solo marca «Nuevo» o
 *   «Edición».
 * @teclado
 * - **Tab**: recorre Regresar (si `showReturn`) y los botones visibles en su orden; en móvil, la barra fija inferior va
 *   en el DOM justo después del encabezado. Los deshabilitados no reciben foco.
 * - **Enter / Espacio**: activan cada botón y emiten su evento (`returned`, `canceled`, `saved`, `verified`, `edited`,
 *   `deleted`, `approved`, `observed` o `rejected`). Los botones siguen `siaf-button`.
 * @accesibilidad
 * - **1.3.1 Información y relaciones (A)**: `heading` es el `h1` de la página; la etiqueta y el texto secundario van
 *   como texto junto a él.
 * - **4.1.2 Nombre, función y valor (A)**: Regresar lleva `aria-label="Regresar"`; en la barra móvil cada botón se
 *   nombra con su texto visible (el ícono de la principal es decorativo), y los deshabilitados (Grabar sin cambios,
 *   Eliminar en observado) exponen `disabled`.
 * - **2.5.8 Tamaño del objetivo (AA)**: los botones de la barra móvil miden 48 px de alto; en escritorio, 40.
 * - **2.4.3 Orden del foco (A)**: en escritorio los botones siguen al título; en móvil la barra fija inferior va en el
 *   DOM después del encabezado, así que Tab llega a las acciones antes que al formulario.
 * - **Pendiente · 2.4.11 Foco no oculto (AA)**: en móvil la barra de acciones es `fixed` abajo y no hay
 *   `scroll-padding`: al avanzar con Tab, un campo puede quedar tapado por ella.
 * - **1.4.11 Contraste no textual (AA)**: el anillo de foco de Regresar (2 px) es el azul del kit
 *   (`border-states-focus`, 5.35:1 claro / 10.15:1 oscuro sobre `bg-surface`). Los demás botones siguen `siaf-button`.
 * - **1.4.3 Contraste mínimo (AA)**: `h1` `text-text` (16.29:1 / 16.53:1), texto secundario `text-text-muted` (5.01:1 /
 *   8.86:1) y la etiqueta en blanco sobre `bg-brand-accent` (4.89:1 / 5.65:1) o `bg-brand-primary` (8.79:1 / 6.67:1).
 * - **Pendiente · 4.1.3 Mensajes de estado (AA)**: con `loading` el título y los botones se cambian por un esqueleto
 *   sin `aria-busy` ni `role="status"`: la carga no se anuncia.
 * - **Pendiente · 2.1.1 Teclado (A)**: desde `sm` el `h1` se corta y el texto completo sale con `siafTooltip`, que se
 *   abre con el mouse o con el foco; como el `h1` no es enfocable, con teclado no se puede ver.
 */
@Component({
  selector: 'siaf-solicitude-header',
  standalone: true,
  imports: [ButtonComponent, IconComponent, NgClass, TooltipDirective],
  template: `
    <header
      class="flex w-full flex-col gap-siaf-lg bg-surface px-siaf-lg py-siaf-md lg:flex-row lg:items-start lg:justify-between"
      [ngClass]="containerClass"
    >
      <div class="flex min-w-0 flex-1 items-start gap-siaf-xs">
        @if (showReturn) {
          <button
            class="inline-flex size-10 shrink-0 items-center justify-center rounded-siaf-md text-text-muted transition hover:bg-surface-muted hover:text-text focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sys-color-border-states-focus)]"
            type="button"
            aria-label="Regresar"
            (click)="returned.emit()"
          >
            <siaf-icon name="arrow_back" [size]="24" />
          </button>
        }

        <div class="flex min-w-0 flex-1 flex-col gap-1">
          @if (loading) {
            <div class="flex flex-col gap-1.5">
              <div class="h-4 w-72 max-w-full rounded bg-[var(--sys-color-bg-surfaces-surface-low)] siaf-skeleton-pulse"></div>
              <div class="h-3 w-24 rounded bg-[var(--sys-color-bg-surfaces-surface-low)] siaf-skeleton-pulse"></div>
            </div>
          } @else {
            <div class="flex min-w-0 flex-wrap items-center gap-siaf-xs">
              <h1 class="m-0 min-w-0 text-base font-bold uppercase leading-5 text-text sm:truncate" siafTooltip>
                {{ heading }}
              </h1>

              @if (resolvedShowTag) {
                <span
                  class="inline-flex h-6 shrink-0 items-center rounded-siaf-sm px-siaf-xs text-xs font-medium leading-none text-[var(--sys-color-text-brand-white)]"
                  [ngClass]="tagClass"
                >
                  {{ resolvedTagLabel }}
                </span>
              }
            </div>

            @if (showSecondaryText && secondaryText) {
              <p class="m-0 text-[11px] font-medium uppercase leading-4 tracking-[0.66px] text-text-muted">
                {{ secondaryText }}
              </p>
            }
          }
        </div>
      </div>

      @if (loading) {
        <div class="hidden w-full flex-wrap items-center justify-end gap-siaf-sm lg:flex lg:w-auto lg:shrink-0">
          <div class="h-10 w-24 rounded-siaf-md bg-[var(--sys-color-bg-surfaces-surface-low)] siaf-skeleton-pulse"></div>
          <div class="h-10 w-24 rounded-siaf-md bg-[var(--sys-color-bg-surfaces-surface-low)] siaf-skeleton-pulse"></div>
          <div class="h-10 w-24 rounded-siaf-md bg-[var(--sys-color-bg-surfaces-surface-low)] siaf-skeleton-pulse"></div>
        </div>
      } @else if (customActions) {
        <!-- Acciones proyectadas por el padre (procesos con botones no estándar,
             p.ej. "Reprocesar" en pedidos de contabilización). Mismo comportamiento
             responsive que los botones estándar: inline en desktop, barra fija
             inferior en móvil (una sola proyección resuelta por CSS). -->
        <div
          class="fixed inset-x-0 bottom-0 z-40 flex flex-wrap items-center justify-end gap-siaf-sm border-t border-[var(--sys-color-divider-strong)] bg-surface p-siaf-md lg:static lg:z-auto lg:w-auto lg:shrink-0 lg:border-0 lg:bg-transparent lg:p-0"
        >
          <ng-content select="[actions]" />
        </div>
      } @else if (resolvedType === 'actions' && showButtonGroup) {
        <div class="hidden w-full flex-wrap items-center justify-end gap-siaf-sm lg:flex lg:w-auto lg:shrink-0">
          <siaf-button variant="secondary" size="md" icon="close" (click)="canceled.emit()">Cancelar</siaf-button>
          <siaf-button [variant]="resolvedSaveVariant" size="md" icon="save" [disabled]="saveDisabled" (click)="saved.emit()">Grabar</siaf-button>
          @if (resolvedShowVerify) {
            <siaf-button size="md" icon="task_alt" [disabled]="verifyDisabled" (click)="verified.emit()">{{ verifyLabel }}</siaf-button>
          }
        </div>
      }

      @if (!loading && !customActions && resolvedType === 'readonly' && showButtonGroup) {
        <div class="hidden w-full flex-wrap items-center justify-end gap-siaf-sm lg:flex lg:w-auto lg:shrink-0">
          @if (resolvedShowReject) {
            <siaf-button variant="secondary" size="md" icon="content_paste_off" (click)="rejected.emit()">{{ rejectLabel }}</siaf-button>
          }
          @if (resolvedShowObserve) {
            <siaf-button variant="secondary" size="md" icon="assignment_late" (click)="observed.emit()">{{ observeLabel }}</siaf-button>
          }
          @if (resolvedShowDelete) {
            <siaf-button variant="secondary" size="md" icon="delete" [disabled]="resolvedDeleteDisabled" (click)="deleted.emit()">{{ deleteLabel }}</siaf-button>
          }
          @if (resolvedShowEdit) {
            <siaf-button [variant]="resolvedEditVariant" size="md" icon="edit" (click)="edited.emit()">{{ editLabel }}</siaf-button>
          }
          @if (resolvedShowApprove) {
            <siaf-button size="md" icon="inventory" (click)="approved.emit()">{{ approveLabel }}</siaf-button>
          }
          @if (resolvedShowVerify) {
            <siaf-button size="md" icon="task_alt" [disabled]="verifyDisabled" (click)="verified.emit()">{{ verifyLabel }}</siaf-button>
          }
        </div>
      }
    </header>

    @if (showMobileActionBar && !loading) {
      <!-- Barra de acciones móvil: «Docked toolbar» de la Guía de Estructura de Pantallas (12016:69169). -->
      <div class="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--sys-color-divider-strong)] bg-surface p-siaf-md lg:hidden">
        <div class="flex w-full items-center gap-siaf-xs sm:justify-end">
          @for (accion of mobileActions; track accion.event; let principal = $last) {
            <siaf-button
              [class]="principal ? mobilePrimaryActionClass : mobileActionClass"
              [variant]="accion.variant"
              size="md"
              [icon]="principal ? accion.icon : ''"
              [disabled]="accion.disabled"
              (click)="accion.event.emit()"
            >{{ accion.label }}</siaf-button>
          }
        </div>
      </div>
    }
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
export class SolicitudeHeaderComponent {
  @Input() loading = false;
  // Matriz reusable: cada rol y estado define las acciones y etiquetas visibles del header.
  @Input() role: SolicitudeHeaderRole | '' = '';
  @Input() state: SolicitudeHeaderState | '' = '';
  @Input() type: SolicitudeHeaderType = 'readonly';
  @Input() heading = 'Heading name';
  @Input() secondaryText = 'Creacion';
  @Input() showSecondaryText = true;
  @Input() showButtonGroup = true;
  /**
   * Reemplaza el grupo de botones estándar por contenido proyectado con
   * el atributo `actions`: `<siaf-button actions ...>`. Para procesos
   * con acciones fuera de la matriz rol/estado.
   */
  @Input() customActions = false;
  @Input() showReturn = false;
  @Input() showTag = true;
  @Input() tagLabel = 'Nuevo';
  @Input() tagTone: SolicitudeHeaderTagTone = 'accent';
  @Input() saveVariant: SolicitudeHeaderButtonTone = 'secondary';
  @Input() saveDisabled = false;
  @Input() verifyDisabled = false;
  @Input() showDelete = false;
  @Input() showEdit = false;
  @Input() showVerify = true;
  @Input() deleteLabel = 'Eliminar';
  @Input() editLabel = 'Editar';
  @Input() verifyLabel = 'Verificar';
  @Input() approveLabel = 'Aprobar';
  @Input() observeLabel = 'Observar';
  @Input() rejectLabel = 'Rechazar';

  @Output() returned = new EventEmitter<void>();
  @Output() canceled = new EventEmitter<void>();
  @Output() deleted = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();
  @Output() verified = new EventEmitter<void>();
  @Output() edited = new EventEmitter<void>();
  @Output() approved = new EventEmitter<void>();
  @Output() observed = new EventEmitter<void>();
  @Output() rejected = new EventEmitter<void>();

  get containerClass(): string {
    return this.resolvedType === 'actions' ? 'min-h-[72px]' : 'min-h-[68px]';
  }

  get tagClass(): string {
    return this.resolvedTagTone === 'info' ? 'bg-brand-primary' : 'bg-[var(--sys-color-bg-brand-accent)]';
  }

  get resolvedType(): SolicitudeHeaderType {
    return this.roleStateConfig?.type ?? this.type;
  }

  get resolvedShowTag(): boolean {
    // Con acciones custom no aplica la matriz rol/estado: manda el input.
    if (this.customActions) return this.showTag;
    return this.roleStateConfig?.showTag ?? this.showTag;
  }

  get resolvedTagLabel(): string {
    return this.roleStateConfig?.tagLabel ?? this.tagLabel;
  }

  get resolvedTagTone(): SolicitudeHeaderTagTone {
    return this.roleStateConfig?.tagTone ?? this.tagTone;
  }

  get resolvedSaveVariant(): SolicitudeHeaderButtonTone {
    return this.roleStateConfig?.saveVariant ?? this.saveVariant;
  }

  get resolvedEditVariant(): SolicitudeHeaderButtonTone {
    return this.roleStateConfig?.editVariant ?? 'secondary';
  }

  get resolvedShowDelete(): boolean {
    return this.roleStateConfig?.showDelete ?? this.showDelete;
  }

  get resolvedDeleteDisabled(): boolean {
    return this.roleStateConfig?.deleteDisabled ?? false;
  }

  get resolvedShowEdit(): boolean {
    return this.roleStateConfig?.showEdit ?? this.showEdit;
  }

  get resolvedShowVerify(): boolean {
    return this.roleStateConfig?.showVerify ?? this.showVerify;
  }

  get resolvedShowApprove(): boolean {
    return this.roleStateConfig?.showApprove ?? false;
  }

  get resolvedShowObserve(): boolean {
    return this.roleStateConfig?.showObserve ?? false;
  }

  get resolvedShowReject(): boolean {
    return this.roleStateConfig?.showReject ?? false;
  }

  readonly mobileActionClass = MOBILE_ACTION_CLASS;
  readonly mobilePrimaryActionClass = MOBILE_PRIMARY_ACTION_CLASS;

  get showMobileActionBar(): boolean {
    // Con acciones proyectadas, los botones ya se muestran inline (flex wrap)
    // también en móvil — no aplica la barra fija inferior.
    return !this.customActions && this.showButtonGroup && this.mobileActions.length > 0;
  }

  /** Acciones de la barra móvil en el orden de escritorio; la última es la principal. */
  get mobileActions(): SolicitudeHeaderMobileAction[] {
    const actions: SolicitudeHeaderMobileAction[] = [];
    const add = (visible: boolean, label: string, icon: string, variant: SolicitudeHeaderButtonTone, disabled: boolean, event: EventEmitter<void>) => {
      if (visible) actions.push({ label, icon, variant, disabled, event });
    };

    if (this.resolvedType === 'actions') {
      add(true, 'Cancelar', 'close', 'secondary', false, this.canceled);
      add(true, 'Grabar', 'save', this.resolvedSaveVariant, this.saveDisabled, this.saved);
      add(this.resolvedShowVerify, this.verifyLabel, 'task_alt', 'accent', this.verifyDisabled, this.verified);
      return actions;
    }

    add(this.resolvedShowReject, this.rejectLabel, 'content_paste_off', 'secondary', false, this.rejected);
    add(this.resolvedShowObserve, this.observeLabel, 'assignment_late', 'secondary', false, this.observed);
    add(this.resolvedShowDelete, this.deleteLabel, 'delete', 'secondary', this.resolvedDeleteDisabled, this.deleted);
    add(this.resolvedShowEdit, this.editLabel, 'edit', this.resolvedEditVariant, false, this.edited);
    add(this.resolvedShowApprove, this.approveLabel, 'inventory', 'accent', false, this.approved);
    add(this.resolvedShowVerify, this.verifyLabel, 'task_alt', 'accent', this.verifyDisabled, this.verified);
    return actions;
  }

  private get roleStateConfig(): SolicitudeHeaderConfig | undefined {
    if (!this.role || !this.state) {
      return undefined;
    }

    return HEADER_CONFIG_BY_ROLE[this.role]?.[this.state];
  }
}
