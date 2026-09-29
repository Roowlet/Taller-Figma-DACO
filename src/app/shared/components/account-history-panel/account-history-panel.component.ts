import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, computed, inject, signal } from '@angular/core';

import { SidePanelAnimacion } from '../../ui/side-panel-animacion';

import { PaginationComponent } from '../../components/pagination/pagination.component';
import type { DocumentsRecordsRow } from '../../types/documents-records.types';
import { ActionTrackerComponent, ActionTrackerSummary } from '../../ui/action-tracker/action-tracker.component';
import { IconComponent } from '../../ui/icon/icon.component';
import { RecordStatus, RecordStatusTagComponent } from '../../ui/record-status-tag/record-status-tag.component';
import { PlanesApiService, CuentaContableResponse, CuentaHistorialEntry } from '../../../core/api/planes-api.service';
import { TableControlsComponent } from '../../components/table-controls/table-controls.component';
import { StepItem, StepsComponent } from '../../ui/steps/steps.component';
import { SummaryCardComponent, SummaryCardField } from '../../ui/summary-card/summary-card.component';
import { TooltipDirective } from '../../ui/tooltip/tooltip.directive';
import { FocoDirective } from '../../ui/foco/foco.directive';

type EntityRow = {
  code: string;
  name: string;
};

type HistoryField = {
  label: string;
  value: string;
};

type SupportDocument = {
  name: string;
  size: string;
};

const DEMO_RECORD_DOCUMENT = 'Solicitud de Cuentas Contables';
const DEMO_PLAN_NAME = 'Plan Contable Gubernamental Unico';

/**
 * Panel lateral a pantalla completa «Historial del registro» de una cuenta contable, que abre la bandeja
 * `siaf-documents-records-page` desde la pestaña Registros.
 *
 * Al abrirse con un `record` pide a la API el detalle de la cuenta y su historial de solicitudes, y muestra la cuenta
 * (datos, atributos, dinámica contable y entidades del estado) junto con la solicitud que la creó (documento,
 * sustento y `siaf-action-tracker`). Se cierra con la X o pulsando el fondo, que emiten `closed`.
 *
 * @usar
 * - Para ver desde la bandeja del plan de cuentas cómo quedó una cuenta contable y quién elaboró, verificó y aprobó
 *   la solicitud que la creó, sin abrir esa solicitud.
 * - Para consultar en solo lectura atributos, dinámica contable, cuentas anteriores, entidades del estado y sustento
 *   de un registro.
 * @evitar
 * - Para registros que no son cuentas contables: sus secciones son las del plan de cuentas; los asientos de ajuste
 *   usan `siaf-asiento-history-panel` (`recordHistoryKind: 'asiento'`).
 * - Para el historial de estados de un documento (pestaña Documentos): usar `siaf-document-history-panel`.
 * - Dentro de la solicitud abierta: usar `siaf-detail-history-tabs` y `siaf-action-tracker` en la página.
 * - Para modificar la cuenta: el panel es de solo lectura; el cambio va por una solicitud de modificación.
 * @teclado
 * - **Tab**: al abrir, el foco entra en la X; recorre los controles de la tabla de entidades y da la vuelta sin salir
 *   del panel (`siaf-table-controls` y `siaf-pagination` siguen su propio teclado).
 * - **Enter / Espacio** en la X: cierran el panel (emite `closed`).
 * - **Escape**: cierra el panel (emite `closed`) y el foco vuelve al botón de historial.
 * @accesibilidad
 * - **4.1.2 Nombre, función y valor (A)**: es `role="dialog"` con `aria-modal="true"` y nombre desde su título
 *   (`aria-labelledby`); la X se llama «Cerrar historial de cuenta contable».
 * - **1.3.1 Información y relaciones (A)**: títulos `h2` y `h3` por sección, cuentas anteriores y entidades en una
 *   `table` con `thead` y `th`, y «¿Está visible?» como checkbox nativo deshabilitado dentro de su `label`.
 * - **1.4.1 Uso del color (A)**: el estado del registro va en `siaf-record-status-tag`, con ícono y texto.
 * - **1.4.3 Contraste mínimo (AA)**: títulos y valores `text-neutral-high` 16.29:1 (oscuro 16.53:1), etiquetas
 *   `text-neutral-low` 5.01:1 (8.86:1) y textos `text-neutral-medium` 14.53:1 (12.87:1) sobre la superficie.
 * - **2.4.3 Orden del foco (A)**: con `siafFoco`, al abrir lleva el foco a la X y lo retiene en el panel; al cerrar (X,
 *   Escape o clic en el fondo) lo devuelve al botón de historial.
 * - **2.4.7 Foco visible (AA)**: la X no define estilo de foco: muestra el contorno por defecto del navegador.
 * - **Pendiente · 4.1.3 Mensajes de estado (AA)**: la señal `loading` no se pinta: mientras responde la API los
 *   campos muestran «--» sin aviso visual ni `aria-live`.
 * - **1.4.13 Contenido en hover o foco (AA)**: desde `sm` los valores truncados se completan con `siafTooltip`, que
 *   se cierra con Escape y se puede recorrer con el puntero.
 * - **Pendiente · 2.1.1 Teclado (A)**: esos valores no reciben foco, así que con teclado el globo no aparece (el lector
 *   de pantalla sí lee el valor entero).
 */
@Component({
  selector: 'siaf-account-history-panel',
  standalone: true,
  imports: [FocoDirective, 
    TableControlsComponent, ActionTrackerComponent, IconComponent, NgTemplateOutlet, PaginationComponent, RecordStatusTagComponent, StepsComponent, SummaryCardComponent, TooltipDirective],
  template: `
    @if (anim.visible()) {
      <section class="siaf-sidepanel-overlay fixed inset-y-0 left-0 right-0 z-50 bg-black/55 pl-0 lg:pl-[65px]" [class.cerrando]="anim.cerrando()" aria-modal="true" role="dialog" aria-labelledby="account-history-title" (click)="closed.emit()">
        <aside class="flex h-screen w-full flex-col overflow-hidden bg-surface text-text shadow-siaf-lg lg:rounded-l-siaf-md" [siafFoco]="open" (siafFocoEscape)="closed.emit()" (click)="$event.stopPropagation()">
          <header class="flex h-14 shrink-0 items-center gap-siaf-xs px-siaf-md">
            <h2 id="account-history-title" class="m-0 min-w-0 flex-1 text-base font-bold uppercase leading-normal tracking-[0.02px] text-text">Historial del registro</h2>
            <button class="inline-flex size-10 items-center justify-center rounded-siaf-md text-text transition hover:bg-surface-muted active:bg-[var(--sys-color-bg-states-light-pressed)]" type="button" aria-label="Cerrar historial de cuenta contable" (click)="closed.emit()">
              <siaf-icon name="close" [size]="24" />
            </button>
          </header>

          <div class="min-h-0 flex-1 overflow-y-auto bg-surface">
            <div class="mx-auto grid min-h-full w-full max-w-[1160px] grid-cols-1 gap-[64px] px-siaf-md py-siaf-md sm:px-siaf-xl lg:grid-cols-[210px_minmax(0,890px)] lg:px-0">
              <aside class="hidden lg:block">
                <!-- Columna de versiones: siaf-steps con tarjetas; hoy solo la versión de creación. -->
                <siaf-steps class="sticky top-siaf-md block" variant="cards" [steps]="versiones()" [activeStep]="1" />
              </aside>

              <section class="flex min-w-0 flex-col gap-siaf-sm">
                <section class="rounded-siaf-md border border-[var(--sys-color-divider-strong)] bg-surface px-siaf-lg py-siaf-md">
                  <ng-container [ngTemplateOutlet]="plainField" [ngTemplateOutletContext]="{ field: documentSummaryField }" />
                  <div class="mt-siaf-lg grid gap-siaf-md md:grid-cols-3">
                    <ng-container [ngTemplateOutlet]="plainField" [ngTemplateOutletContext]="{ field: numberSummaryField }" />
                    <ng-container [ngTemplateOutlet]="plainField" [ngTemplateOutletContext]="{ field: actionSummaryField }" />
                    <div class="flex min-w-0 flex-col gap-siaf-xxs">
                      <span class="sm:truncate text-[11px] font-medium uppercase leading-none tracking-[0.66px] text-text-muted" siafTooltip>Estado del registro</span>
                      <siaf-record-status-tag [status]="recordStatus" size="small" />
                    </div>
                  </div>
                </section>

                <section class="rounded-siaf-md border border-[var(--sys-color-divider-strong)] bg-surface px-siaf-xl py-siaf-xl">
                  <header class="mb-siaf-xl">
                    <h2 class="m-0 text-base font-bold uppercase leading-normal tracking-[0.02px] text-text">Registro de cuenta contable</h2>
                  </header>

                  <div class="flex flex-col gap-siaf-xl">
                    <section class="flex flex-col gap-siaf-md">
                      <ng-container [ngTemplateOutlet]="sectionTitle" [ngTemplateOutletContext]="{ title: 'Plan de cuentas contable' }" />
                      <ng-container [ngTemplateOutlet]="readonlyCard" [ngTemplateOutletContext]="{ field: generalFields[0] }" />
                    </section>

                    <section class="flex flex-col gap-siaf-md">
                      <ng-container [ngTemplateOutlet]="sectionTitle" [ngTemplateOutletContext]="{ title: 'Cuenta contable' }" />
                      <section class="relative rounded-siaf-md border border-[var(--sys-color-divider-strong)] px-siaf-md py-siaf-sm">
                        <span class="absolute left-0 top-5 h-6 w-[3px] rounded-r bg-brand-primary" aria-hidden="true"></span>
                        <div class="grid gap-siaf-md md:grid-cols-2">
                          <ng-container [ngTemplateOutlet]="plainField" [ngTemplateOutletContext]="{ field: accountHeaderFields[0] }" />
                          <ng-container [ngTemplateOutlet]="plainField" [ngTemplateOutletContext]="{ field: accountHeaderFields[2] }" />
                        </div>
                      </section>
                      <ng-container [ngTemplateOutlet]="plainField" [ngTemplateOutletContext]="{ field: imputableField }" />
                    </section>

                    <section class="flex flex-col gap-siaf-md">
                      <ng-container [ngTemplateOutlet]="sectionTitle" [ngTemplateOutletContext]="{ title: 'Codigo de cuenta contable anterior' }" />
                      @if (previousAccounts.length === 0) {
                        <p class="m-0 text-sm text-[var(--sys-color-text-neutral-medium)]">No se asoció ninguna cuenta contable anterior.</p>
                      } @else if (previousAccounts.length === 1) {
                        <siaf-summary-card
                          [fields]="previousAccountCardFields(previousAccounts[0])"
                          [showIndicator]="true"
                          [bordered]="true"
                          [showClose]="false"
                        />
                      } @else {
                        <div class="siaf-table-scroll min-w-0">
                          <table class="w-full border-collapse text-left text-sm">
                            <thead>
                              <tr class="h-10 bg-[var(--sys-color-bg-surfaces-surface-high)] text-xs font-bold uppercase text-text">
                                <th class="w-[160px] rounded-l-siaf-sm px-siaf-md py-siaf-sm">Código</th>
                                <th class="rounded-r-siaf-sm px-siaf-md py-siaf-sm">Nombre de la cuenta contable</th>
                              </tr>
                            </thead>
                            <tbody>
                              @for (prev of previousAccounts; track prev.codigo) {
                                <tr class="h-12 border-b border-[var(--sys-color-divider-default)] bg-surface text-[var(--sys-color-text-neutral-medium)]">
                                  <td class="px-siaf-md py-siaf-sm font-mono">{{ prev.codigo }}</td>
                                  <td class="px-siaf-md py-siaf-sm text-text">{{ prev.nombre }}</td>
                                </tr>
                              }
                            </tbody>
                          </table>
                        </div>
                      }
                    </section>

                    <section class="flex flex-col gap-siaf-md">
                      <ng-container [ngTemplateOutlet]="sectionTitle" [ngTemplateOutletContext]="{ title: 'Atributos de la cuenta contable' }" />
                      <div class="grid gap-x-siaf-xl gap-y-siaf-md md:grid-cols-3">
                        @for (field of attributeFields; track field.label) {
                          <ng-container [ngTemplateOutlet]="plainField" [ngTemplateOutletContext]="{ field: field }" />
                        }
                      </div>
                    </section>

                    <section class="flex flex-col gap-siaf-md">
                      <ng-container [ngTemplateOutlet]="sectionTitle" [ngTemplateOutletContext]="{ title: 'Dinamica contable' }" />
                      <div class="grid gap-x-siaf-xl gap-y-siaf-md md:grid-cols-2">
                        @for (field of dynamicFields; track field.label) {
                          <ng-container [ngTemplateOutlet]="plainField" [ngTemplateOutletContext]="{ field: field }" />
                        }
                      </div>
                    </section>

                    <ng-container [ngTemplateOutlet]="plainField" [ngTemplateOutletContext]="{ field: classifierEnabledField }" />

                    <section class="flex flex-col gap-siaf-md">
                      <ng-container [ngTemplateOutlet]="sectionTitle" [ngTemplateOutletContext]="{ title: 'Entidades del estado' }" />
                      @if (entityRows.length === 0) {
                        <p class="m-0 text-sm text-[var(--sys-color-text-neutral-medium)]">No se asoció ninguna entidad del estado.</p>
                      } @else if (entityRows.length === 1) {
                        <siaf-summary-card
                          [fields]="entityCardFields(entityRows[0])"
                          [showIndicator]="true"
                          [bordered]="true"
                          [showClose]="false"
                        />
                      } @else {
                        <siaf-table-controls [showSelection]="false" [page]="1" [pageSize]="entityRows.length" [totalItems]="entityRows.length" [totalPages]="1" />
                        <div class="siaf-table-scroll min-w-0">
                          <table class="w-full min-w-[720px] border-collapse text-left text-sm">
                            <thead>
                              <tr class="h-10 bg-[var(--sys-color-bg-surfaces-surface-high)] text-xs font-bold uppercase text-text">
                                <th class="w-[120px] rounded-l-siaf-sm px-siaf-md py-siaf-sm">Codigo</th>
                                <th class="rounded-r-siaf-sm px-siaf-md py-siaf-sm">Nombre de la entidad</th>
                              </tr>
                            </thead>
                            <tbody>
                              @for (row of entityRows; track row.code) {
                                <tr class="h-12 border-b border-[var(--sys-color-divider-default)] bg-surface text-[var(--sys-color-text-neutral-medium)]">
                                  <td class="px-siaf-md py-siaf-sm">{{ row.code }}</td>
                                  <td class="px-siaf-md py-siaf-sm">{{ row.name }}</td>
                                </tr>
                              }
                            </tbody>
                          </table>
                        </div>
                        <siaf-pagination position="Bottom" [rowPage]="true" [page]="1" [pageSize]="entityRows.length" [totalItems]="entityRows.length" [totalPages]="1" [rowsPerPage]="10" />
                      }
                    </section>

                    <section class="flex flex-col gap-siaf-md">
                      <ng-container [ngTemplateOutlet]="sectionTitle" [ngTemplateOutletContext]="{ title: 'Inicio de vigencia' }" />
                      <ng-container [ngTemplateOutlet]="plainField" [ngTemplateOutletContext]="{ field: validityStartField }" />
                      <label class="flex min-h-10 items-center gap-siaf-sm text-sm font-medium text-[var(--sys-color-text-neutral-medium)]">
                        <input class="size-4 accent-[var(--sys-color-icon-states-enabled)]" type="checkbox" [checked]="cuentaDetalle()?.esVisible ?? true" disabled />
                        ¿Está visible?
                      </label>
                    </section>
                  </div>
                </section>

                <section class="rounded-siaf-md border border-[var(--sys-color-divider-strong)] bg-surface px-siaf-xl py-siaf-lg">
                  <header class="mb-siaf-md">
                    <h2 class="m-0 text-base font-bold uppercase leading-normal tracking-[0.02px] text-text">Justificación del sustento</h2>
                  </header>
                  <div class="flex flex-col gap-siaf-xl">
                    <ng-container [ngTemplateOutlet]="plainField" [ngTemplateOutletContext]="{ field: justificationField, multiline: true }" />
                    <section class="flex flex-col gap-siaf-md">
                      <ng-container [ngTemplateOutlet]="sectionTitle" [ngTemplateOutletContext]="{ title: 'Documento de sustento' }" />
                      @if (supportDocument) {
                        <div class="flex min-h-16 items-center gap-siaf-md rounded-siaf-md border border-[var(--sys-color-divider-strong)] bg-surface px-siaf-md">
                          <siaf-icon name="description" [size]="24" />
                          <div class="min-w-0 flex-1">
                            <strong class="block sm:truncate text-sm font-bold text-text" siafTooltip>{{ supportDocument.name }}</strong>
                            <span class="block text-xs text-text-muted">{{ supportDocument.size }}</span>
                          </div>
                          <siaf-icon name="download" [size]="24" />
                        </div>
                      } @else {
                        <p class="m-0 text-sm text-[var(--sys-color-text-neutral-medium)]">No se han adjuntado archivos.</p>
                      }
                    </section>
                  </div>
                </section>

                <section class="rounded-siaf-md border border-[var(--sys-color-divider-strong)] bg-surface">
                  <siaf-action-tracker [summaryItems]="actionSummary" />
                </section>
              </section>
            </div>
          </div>

          <ng-template #readonlyCard let-field="field">
            <div class="relative flex min-h-[72px] min-w-0 flex-col justify-center gap-siaf-xxs rounded-siaf-md border border-[var(--sys-color-divider-strong)] bg-surface px-siaf-md py-siaf-xs">
              <span class="absolute left-0 top-5 h-6 w-[3px] rounded-r bg-brand-primary" aria-hidden="true"></span>
              <span class="sm:truncate text-[11px] font-medium uppercase leading-none tracking-[0.66px] text-text-muted" siafTooltip>{{ field.label }}</span>
              <span class="sm:truncate text-sm font-bold leading-normal text-text" siafTooltip>{{ field.value }}</span>
            </div>
          </ng-template>

          <ng-template #plainField let-field="field" let-multiline="multiline">
            <div class="min-w-0">
              <span class="block text-[11px] font-medium uppercase leading-none tracking-[0.66px] text-text-muted">{{ field.label }}</span>
              @if (multiline) {
                <p class="m-0 mt-siaf-xs text-sm font-normal leading-normal text-text">{{ field.value }}</p>
              } @else {
                <strong class="mt-siaf-xs block sm:truncate text-sm font-bold leading-normal text-text" siafTooltip>{{ field.value }}</strong>
              }
            </div>
          </ng-template>

          <ng-template #sectionTitle let-title="title">
            <div class="flex min-h-10 items-center">
              <h3 class="m-0 text-sm font-bold uppercase leading-normal tracking-[0.02px] text-text">{{ title }}</h3>
            </div>
          </ng-template>
        </aside>
      </section>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountHistoryPanelComponent implements OnChanges {
  private readonly planesApi = inject(PlanesApiService);

  @Input() open = false;
  @Input() record: DocumentsRecordsRow | null = null;

  @Output() closed = new EventEmitter<void>();

  readonly loading = signal(false);
  readonly cuentaDetalle = signal<CuentaContableResponse | null>(null);
  readonly cuentaHistorial = signal<CuentaHistorialEntry[]>([]);

  /** Render animado del panel (entrada/salida por la derecha, 300ms). */
  readonly anim = new SidePanelAnimacion();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open']) this.anim.actualizar(this.open);
    if (changes['open'] && this.open && this.record?.['recordId']) {
      const id = String(this.record['recordId']);
      this.loading.set(true);
      this.cuentaDetalle.set(null);
      this.cuentaHistorial.set([]);

      // Llamadas en paralelo: detalle + historial de solicitudes
      this.planesApi.obtenerCuenta(id).subscribe({
        next: (c) => this.cuentaDetalle.set(c),
      });
      this.planesApi.obtenerHistorialCuenta(id).subscribe({
        next: (h) => { this.cuentaHistorial.set(h); this.loading.set(false); },
        error: () => this.loading.set(false),
      });
    }
  }

  /** Primera solicitud que creó esta cuenta. */
  private get creacionEntry(): CuentaHistorialEntry | undefined {
    return this.cuentaHistorial().find(e => !e.esModificacion);
  }

  /** Versiones del registro para la columna de `siaf-steps`: hoy solo la de creación. */
  readonly versiones = computed<StepItem[]>(() => [{ label: 'Creación', fields: this.stepperSummary }]);

  get stepperSummary(): HistoryField[] {
    const e = this.creacionEntry;
    const fecha = e?.fechaRequerimiento
      ? new Date(e.fechaRequerimiento).toLocaleDateString('es-PE') + '\n' + new Date(e.fechaRequerimiento).toLocaleTimeString('es-PE', { hour12: false })
      : '--';
    return [
      { label: 'Nro Documento', value: e?.numeroDocumento ?? '--' },
      { label: 'Tipo de acción', value: this.tipoAccionLabel(e?.tipoAccion) },
      { label: 'Fecha', value: fecha }
    ];
  }

  private tipoAccionLabel(tipo: string | undefined): string {
    const labels: Record<string, string> = {
      creacion: 'Creación',
      modificacion: 'Modificación',
      anulacion: 'Anulación',
      reversion: 'Reversión',
    };
    return labels[tipo ?? ''] ?? (tipo || '--');
  }

  get generalFields(): HistoryField[] {
    const c = this.cuentaDetalle();
    const planDesc = c?.plan?.descripcion ?? c?.plan?.numeroPlanContable ?? DEMO_PLAN_NAME;
    return [
      { label: 'Nombre del plan de cuentas contable', value: planDesc }
    ];
  }

  get entityRows(): EntityRow[] {
    const c = this.cuentaDetalle();
    if (!c) return [];
    // El backend expone la pivote como `entidad` (siglas/codMef/nombre).
    return c.entidades?.map(e => ({
      code: e.entidad?.siglas ?? e.entidad?.codMef ?? '--',
      name: e.entidad?.nombre ?? '--',
    })) ?? [];
  }

  get supportDocument(): SupportDocument | null {
    const e = this.creacionEntry;
    if (!e?.sustento) return null;
    return { name: e.sustento.nombreOriginal, size: '--' };
  }

  get actionSummary(): ActionTrackerSummary[] {
    const e = this.creacionEntry;
    if (!e) {
      return [
        { label: 'Elaborado por', actionBy: '--', date: '--' },
        { label: 'Verificado por', actionBy: '--', date: '--' },
        { label: 'Aprobado por', actionBy: '--', date: '--' },
      ];
    }
    const getEntry = (estado: string) => {
      const h = e.historialEstados.find(h => h.estadoNuevo === estado);
      if (!h) return { actionBy: 'No asignado aún', date: 'Fecha y hora no registradas' };
      const actor = h.creador
        ? `${h.creador.nombres} ${h.creador.apellidoPaterno} ${h.creador.apellidoMaterno ?? ''}`.trim().toUpperCase()
        : '--';
      const fecha = new Date(h.createdAt).toLocaleDateString('es-PE') + '\n' + new Date(h.createdAt).toLocaleTimeString('es-PE', { hour12: false });
      return { actionBy: actor, date: fecha };
    };
    return [
      { label: 'Elaborado por', ...getEntry('ELABORADO') },
      { label: 'Verificado por', ...getEntry('VERIFICADO') },
      { label: 'Aprobado por', ...getEntry('APROBADO') },
    ];
  }

  get documentSummaryField(): HistoryField {
    return { label: 'Documento', value: this.creacionEntry?.tipoDocumento?.nombre ?? DEMO_RECORD_DOCUMENT };
  }

  get numberSummaryField(): HistoryField {
    return { label: 'Nro de documento', value: this.creacionEntry?.numeroDocumento ?? '--' };
  }

  get actionSummaryField(): HistoryField {
    return { label: 'Tipo de acción', value: this.tipoAccionLabel(this.creacionEntry?.tipoAccion) };
  }

  get recordStatus(): RecordStatus {
    const status = this.value('status');
    return this.isRecordStatus(status) ? status : 'Activo';
  }

  get accountHeaderFields(): HistoryField[] {
    return [
      { label: 'Codigo de cuenta contable', value: this.accountCode },
      { label: 'Elemento', value: this.value('element') },
      { label: 'Nombre de la cuenta contable', value: this.value('accountName') }
    ];
  }

  get imputableField(): HistoryField {
    return { label: '¿Es una cuenta imputable?', value: this.value('imputable').toUpperCase() };
  }

  /**
   * Cuentas del plan anterior asociadas. codigoAnterior persiste los códigos
   * unidos por coma; nombreAnterior solo existe cuando es una sola cuenta.
   */
  get previousAccounts(): { codigo: string; nombre: string }[] {
    const c = this.cuentaDetalle();
    const codigos = (c?.codigoAnterior ?? this.valueOr('previousCode', ''))
      .split(',')
      .map(v => v.trim())
      .filter(v => v && v !== '--');
    return codigos.map((codigo) => ({
      codigo,
      nombre: codigos.length === 1 ? (c?.nombreAnterior || '--') : '--',
    }));
  }

  entityCardFields(row: EntityRow): SummaryCardField[] {
    return [
      { label: 'Código', value: row.code },
      { label: 'Nombre de la entidad', value: row.name },
    ];
  }

  previousAccountCardFields(prev: { codigo: string; nombre: string }): SummaryCardField[] {
    return [
      { label: 'Código', value: prev.codigo },
      { label: 'Nombre de la cuenta contable', value: prev.nombre },
    ];
  }

  private valueOr(key: string, fallback: string): string {
    const v = this.record?.[key];
    return v == null || v === '--' ? fallback : String(v);
  }

  private boolVal(v: boolean | undefined | null): string {
    if (v === undefined || v === null) return '--';
    return v ? 'Si' : 'No';
  }

  get attributeFields(): HistoryField[] {
    const c = this.cuentaDetalle();
    const ambitos = c
      ? c.ambitos.map(a => a.ambitoInstitucional?.descripcion ?? a.ambitoInstitucional?.codigo ?? '').filter(Boolean).join(', ') || '--'
      : this.value('institutionalScopes');
    return [
      { label: 'Naturaleza', value: c?.naturaleza ?? this.value('naturaleza') },
      { label: 'Tipo de elemento', value: c?.tipoElemento ?? this.elementType },
      { label: '¿Es monetaria?', value: this.boolVal(c?.esMonetaria) },
      { label: 'Ámbito institucional de aplicación', value: ambitos },
      { label: '¿Aplica Extra Presupuestaria? (AEP)', value: this.boolVal(c?.aplicaExtraPresupuestaria) },
      { label: '¿Es Recíproca? (RECI)', value: this.boolVal(c?.esReciproca) },
      { label: 'AC Activo', value: c?.acActivo ?? '--' },
      { label: 'PC Pasivo', value: c?.pcPasivo ?? '--' },
      { label: 'ANC Activo', value: c?.ancActivo ?? '--' },
      { label: 'PNC Pasivo', value: c?.pncPasivo ?? '--' },
    ];
  }

  get dynamicFields(): HistoryField[] {
    const c = this.cuentaDetalle();
    return [
      { label: '¿Tiene dinámica contable?', value: this.boolVal(c?.tieneDinamicaContable) },
      { label: 'Se debita por', value: c?.dinamicaDebita ?? '--' },
      { label: 'Se acredita por', value: c?.dinamicaAcredita ?? '--' },
      { label: 'Objeto', value: c?.dinamicaObjeto ?? '--' },
      { label: 'Saldos', value: c?.dinamicaSaldos ?? '--' },
    ];
  }

  get validityStartField(): HistoryField {
    const created = this.cuentaDetalle()?.createdAt;
    return {
      label: 'Fecha inicio desde',
      value: created ? new Date(created).toLocaleDateString('es-PE') : '--',
    };
  }

  get classifierEnabledField(): HistoryField {
    const c = this.cuentaDetalle();
    return { label: 'Cuenta contable para una entidad del estado', value: this.boolVal(c?.esParaEntidadEstado) };
  }

  get justificationField(): HistoryField {
    // La justificación viaja en asuntoMotivo con el formato "[organo] texto".
    const raw = this.creacionEntry?.justificacion ?? '';
    return {
      label: 'Justificación del requerimiento solicitado',
      value: raw.replace(/^\[[^\]]*\]\s*/, '') || '--',
    };
  }

  get elementType(): string {
    const c = this.cuentaDetalle();
    return c?.tipoElemento ?? (this.value('element') === '1' ? 'Activo' : '--');
  }

  get accountCode(): string {
    const parts = ['element', 'group', 'account', 'subAccount1', 'subAccount2', 'subAccount3']
      .map((key) => this.value(key))
      .filter((value) => value && value !== '-');

    return parts.join('.') || '--';
  }

  value(key: string): string {
    return String(this.record?.[key] ?? '--');
  }

  private isRecordStatus(value: string): value is RecordStatus {
    return ['Activo', 'Inactivo', 'Anulado', 'En Proceso', 'Validado', 'Eliminado'].includes(value);
  }
}
