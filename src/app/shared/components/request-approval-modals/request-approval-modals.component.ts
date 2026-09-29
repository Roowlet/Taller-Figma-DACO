import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { LoaderOverlayComponent } from '../../ui/loader-overlay/loader-overlay.component';
import { ModalComponent } from '../../ui/modal/modal.component';
import { SnackbarComponent, SnackbarVariant } from '../../ui/snackbar/snackbar.component';

/**
 * Bloque de modales del flujo de aprobación de una solicitud/documento
 * (grabar, verificar, eliminar, aprobar, observar, rechazar) + loader
 * overlay + snackbar de confirmación. Reemplaza el bloque idéntico de
 * ~90 líneas repetido al final de las 5 páginas de request.
 *
 * El estado (qué modal está abierto, el comentario de aprobación, etc.)
 * lo sigue manejando el padre — este componente solo renderiza y
 * reenvía eventos:
 *
 *   <siaf-request-approval-modals
 *     [saveOpen]="saveModalOpen" ...
 *     [saving]="saving()"
 *     [reason]="approvalComment()"
 *     (saveConfirmed)="onConfirmSave()"
 *     (saveClosed)="saveModalOpen = false"
 *     (approvalClosed)="closeApprovalModals()"
 *     ...
 *   />
 *
 * @usar
 * - Al final de toda request-page con el ciclo grabar → verificar → aprobar, observar o rechazar: plan de cuentas
 *   (solicitud y carga masiva), asiento de ajuste, catálogo de ajuste (tipo y clase), catálogo de eventos (SCE y SCM),
 *   eventos contables y apertura contable.
 * - Para confirmar y avisar con un solo bloque: `saving` muestra el loader y el snackbar dice el tipo real de acción
 *   (`requestType`) y el número de la solicitud (`requestNumber`).
 * - Con `snackbarTone="error"` y `snackbarMessage` para mostrar el mensaje del backend cuando la acción falla.
 * @evitar
 * - Para una confirmación fuera del flujo de aprobación (p. ej. cambiar contraseña): usar `siaf-modal` directo.
 * - En la bandeja: `siaf-documents-records-page` ya trae sus modales de verificar y aprobar múltiples.
 * - Para la carga inicial de la página: el loader es solo para acciones; la espera inicial va con `loading` del layout
 *   o `siaf-table-skeleton`.
 * - Volver a pintar a mano `siaf-modal`, `siaf-loader-overlay` o `siaf-snackbar` junto a él: el padre solo maneja
 *   `saveOpen`, `approveOpen`… y los eventos.
 * @teclado
 * - No agrega teclado propio: cada confirmación sigue `siaf-modal` (el foco entra al abrir, Tab da la vuelta dentro,
 *   Escape cancela y Enter o Espacio activan Cancelar y Aceptar).
 * - El aviso sigue `siaf-snackbar`: no toma el foco al aparecer y su X se alcanza con Tab.
 * @accesibilidad
 * - **4.1.2 Nombre, función y valor (A)**: cada confirmación es un `siaf-modal` (`role="dialog"`, `aria-modal`) cuyo
 *   nombre es el título del preset: «¿Grabar solicitud?», «¿Aprobar solicitud?», «¿Rechazar solicitud?»…
 * - **2.4.3 Orden del foco (A)**: hereda de `siaf-modal` el foco al abrir y la vuelta al disparador al cerrar; el padre
 *   debe bajar `saveOpen`, `approveOpen`… a false en vez de destruir el componente.
 * - **2.1.2 Sin trampas de teclado (A)**: Escape cierra cada modal como Cancelar y emite `saveClosed`, `verifyClosed`,
 *   `deleteClosed` o `approvalClosed`.
 * - **4.1.3 Mensajes de estado (AA)**: el resultado se anuncia con `siaf-snackbar` (`role="status"`; `role="alert"` con
 *   `snackbarTone="error"`) y la espera con `siaf-loader-overlay` (`role="status"`, `aria-live="polite"` y
 *   `loaderLabel` como nombre).
 * - **Pendiente · 3.3.2 Etiquetas o instrucciones (A)**: observar y rechazar exigen el motivo sin marcarlo como
 *   obligatorio (hereda de `siaf-modal`).
 * - **Pendiente · 1.4.11 Contraste no textual (AA)**: en oscuro el anillo de foco de la X de cada modal queda bajo 3:1
 *   (hereda de `siaf-modal`).
 */
@Component({
  selector: 'siaf-request-approval-modals',
  standalone: true,
  imports: [LoaderOverlayComponent, ModalComponent, SnackbarComponent],
  template: `
    <siaf-modal
      variant="save"
      [open]="saveOpen"
      confirmVariant="primary"
      confirmLabel="Aceptar"
      cancelLabel="Cancelar"
      [showIllustration]="true"
      [confirmDisabled]="saving"
      (canceled)="saveClosed.emit()"
      (closed)="saveClosed.emit()"
      (confirmed)="saveConfirmed.emit()"
    />

    <siaf-modal
      variant="verify"
      [open]="verifyOpen"
      confirmVariant="primary"
      confirmLabel="Aceptar"
      cancelLabel="Cancelar"
      [showIllustration]="true"
      [confirmDisabled]="saving"
      (canceled)="verifyClosed.emit()"
      (closed)="verifyClosed.emit()"
      (confirmed)="verifyConfirmed.emit()"
    />

    <siaf-modal
      variant="delete-request"
      [open]="deleteOpen"
      confirmVariant="primary"
      [showIllustration]="true"
      [confirmDisabled]="saving"
      (canceled)="deleteClosed.emit()"
      (closed)="deleteClosed.emit()"
      (confirmed)="deleteConfirmed.emit()"
    />

    <siaf-modal
      variant="approve"
      [open]="approveOpen"
      confirmVariant="primary"
      [showIllustration]="true"
      [confirmDisabled]="saving"
      (canceled)="approvalClosed.emit()"
      (closed)="approvalClosed.emit()"
      (confirmed)="approveConfirmed.emit()"
    />

    <siaf-modal
      variant="observe"
      [open]="observeOpen"
      confirmVariant="primary"
      [reason]="reason"
      reasonLabel="Descripción de la observación"
      [reasonMaxLength]="500"
      [confirmDisabled]="saving || reason.trim().length === 0"
      (reasonChange)="reasonChange.emit($event)"
      (canceled)="approvalClosed.emit()"
      (closed)="approvalClosed.emit()"
      (confirmed)="observeConfirmed.emit()"
    />

    <siaf-modal
      variant="reject"
      [open]="rejectOpen"
      confirmVariant="primary"
      [reason]="reason"
      [reasonType]="rejectReasonType"
      reasonTypeLabel="Motivo de rechazo"
      reasonLabel="Descripción del motivo de rechazo"
      [reasonTypeOptions]="rejectReasonTypeOptions"
      [reasonMaxLength]="200"
      [confirmDisabled]="saving || reason.trim().length === 0"
      (reasonChange)="reasonChange.emit($event)"
      (reasonTypeChange)="rejectReasonTypeChange.emit($event)"
      (canceled)="approvalClosed.emit()"
      (closed)="approvalClosed.emit()"
      (confirmed)="rejectConfirmed.emit()"
    />

    <!-- Overlay solo para acciones de guardado/verificado/aprobado — no para carga inicial -->
    <siaf-loader-overlay [open]="saving" [message]="loaderMessage" [label]="loaderLabel" />

    <div class="fixed bottom-siaf-lg left-1/2 z-50 w-[min(430px,calc(100vw-32px))] -translate-x-1/2">
      <siaf-snackbar
        [variant]="snackbarVariant"
        [tone]="snackbarTone"
        [message]="snackbarMessage"
        [open]="snackbarOpen"
        [requestType]="requestType"
        [requestNumber]="requestNumber"
        (closed)="snackbarClosed.emit()"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestApprovalModalsComponent {
  // ── Apertura de cada modal (el padre es dueño del estado) ──
  @Input() saveOpen = false;
  @Input() verifyOpen = false;
  @Input() deleteOpen = false;
  @Input() approveOpen = false;
  @Input() observeOpen = false;
  @Input() rejectOpen = false;

  /** Acción en curso — deshabilita confirmar y muestra el loader. */
  @Input() saving = false;

  // ── Observar / Rechazar ──
  /** Comentario de la observación / motivo del rechazo. */
  @Input() reason = '';
  @Input() rejectReasonType = '';
  @Input() rejectReasonTypeOptions: string[] = [];

  // ── Loader ──
  @Input() loaderMessage = 'Grabando solicitud...';
  @Input() loaderLabel = 'Grabando';

  // ── Snackbar ──
  @Input() snackbarVariant: SnackbarVariant = 'custom';
  /** Tono del snackbar (success/error) y mensaje libre (pisa a variant). */
  @Input() snackbarTone: 'success' | 'error' = 'success';
  @Input() snackbarMessage = '';
  @Input() snackbarOpen = false;
  /** Tipo de acción real ('modificación', 'reversión', …) — pisa la palabra
   *  del preset para que el snackbar no diga siempre "creación". */
  @Input() requestType = '';
  @Input() requestNumber = '';

  // ── Confirmaciones ──
  @Output() saveConfirmed = new EventEmitter<void>();
  @Output() verifyConfirmed = new EventEmitter<void>();
  @Output() deleteConfirmed = new EventEmitter<void>();
  @Output() approveConfirmed = new EventEmitter<void>();
  @Output() observeConfirmed = new EventEmitter<void>();
  @Output() rejectConfirmed = new EventEmitter<void>();

  // ── Cierres (cancelar / X / backdrop) ──
  @Output() saveClosed = new EventEmitter<void>();
  @Output() verifyClosed = new EventEmitter<void>();
  @Output() deleteClosed = new EventEmitter<void>();
  /** Cierre de cualquiera de los modales de aprobación (approve/observe/reject). */
  @Output() approvalClosed = new EventEmitter<void>();

  // ── Observar / Rechazar ──
  @Output() reasonChange = new EventEmitter<string>();
  @Output() rejectReasonTypeChange = new EventEmitter<string>();

  // ── Snackbar ──
  @Output() snackbarClosed = new EventEmitter<void>();
}
