import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, computed, inject, signal } from '@angular/core';

import { SidePanelAnimacion } from '../../ui/side-panel-animacion';

import { PaginationComponent } from '../../components/pagination/pagination.component';
import type { DocumentsRecordsRow } from '../../types/documents-records.types';
import { ActionTrackerComponent, ActionTrackerSummary } from '../../ui/action-tracker/action-tracker.component';
import { IconComponent } from '../../ui/icon/icon.component';
import { TextFieldComponent } from '../../ui/text-field/text-field.component';
import { RecordStatus, RecordStatusTagComponent } from '../../ui/record-status-tag/record-status-tag.component';
import { StepItem, StepsComponent } from '../../ui/steps/steps.component';
import { SolicitudesApiService, SolicitudResponse } from '../../../core/api/solicitudes-api.service';
import { AperturaContableApiService, PeriodoContableResponse } from '../../../core/api/apertura-contable-api.service';
import { CurrentUserService } from '../../../core/auth/current-user.service';
import { isoToDdmmyyyy, formatFechaHora } from '../../utils/fecha.util';
import { TooltipDirective } from '../../ui/tooltip/tooltip.directive';
import { ESTADO } from '../../../core/models/documento.model';
import { FocoDirective } from '../../ui/foco/foco.directive';

type HistoryField = {
  label: string;
  value: string;
};

type MovimientoRow = {
  codigo: string;
  nombre: string;
  tipoMovimiento: string;
  importe: number;
};

/**
 * Historial del registro para asientos de ajuste (SRAA) — pestaña Registros.
 *
 * Misma cáscara que `siaf-account-history-panel` (overlay + stepper +
 * documento + secciones + sustento + tracker) pero con la estructura del
 * asiento: ámbito, período, fecha de contabilización, clase/detalle, glosa
 * y la grilla de cuentas contables con totales Debe/Haber. Todo sale del
 * documento ya grabado (`obtenerDetalle`); las fechas del período se
 * resuelven contra la configuración de Apertura Contable.
 *
 * @usar
 * - Para ver desde la bandeja de asientos de ajuste (pestaña Registros, `recordHistoryKind: 'asiento'`) cómo quedó un
 *   asiento y quién elaboró, verificó y aprobó su solicitud.
 * - Para revisar en solo lectura ámbito, período, glosa y cuentas con sus totales Debe y Haber, buscando y paginando
 *   cuando el asiento tiene muchas cuentas.
 * @evitar
 * - Para registros del plan de cuentas: usar `siaf-account-history-panel`; para el historial de estados de un
 *   documento, `siaf-document-history-panel`.
 * - Dentro de la solicitud abierta: usar la pantalla del asiento con `siaf-detail-history-tabs` y
 *   `siaf-action-tracker`.
 * - Para revertir o modificar el asiento: el panel es de solo lectura; el cambio va por una solicitud.
 * @teclado
 * - **Tab**: al abrir, el foco entra en la X; recorre «Código de asiento», el buscador y la paginación, y da la vuelta
 *   sin salir del panel.
 * - **Enter / Espacio** en la X: cierran el panel (emite `closed`).
 * - **Escape**: cierra el panel (emite `closed`) y el foco vuelve al botón de historial.
 * - **Enter / Espacio** en «Código de asiento»: pliegan o despliegan las cuentas contables.
 * - **Enter** en el buscador: aplica el filtro. El buscador sigue `siaf-input` y la paginación `siaf-pagination`.
 * @accesibilidad
 * - **Pendiente · 4.1.2 Nombre, función y valor (A)**: el panel es `role="dialog"` con `aria-modal` y nombre desde su
 *   título, y la X se llama «Cerrar historial del asiento de ajuste»; pero «Código de asiento» no publica
 *   `aria-expanded` ni `aria-controls`: su estado solo se ve en la flecha.
 * - **1.3.1 Información y relaciones (A)**: títulos `h2` y `h3` por sección y cuentas en una `table` con `thead` y
 *   `th`; los totales Debe y Haber van en filas con su rótulo.
 * - **1.4.1 Uso del color (A)**: el tipo de movimiento va en texto, el estado del registro en
 *   `siaf-record-status-tag` con ícono, y los obligatorios llevan asterisco.
 * - **1.4.3 Contraste mínimo (AA)**: valores `text-neutral-high` 16.29:1 (oscuro 16.53:1), etiquetas
 *   `text-neutral-low` 5.01:1 (8.86:1) y asterisco `text-feedback-danger` 9.84:1 (10.59:1) sobre la superficie.
 * - **2.4.3 Orden del foco (A)**: con `siafFoco`, al abrir lleva el foco a la X y lo retiene en el panel; al cerrar (X,
 *   Escape o clic en el fondo) lo devuelve al botón de historial.
 * - **2.4.7 Foco visible (AA)**: la X y «Código de asiento» no definen estilo de foco: muestran el contorno por
 *   defecto del navegador.
 * - **Pendiente · 4.1.3 Mensajes de estado (AA)**: ni la carga del detalle ni el resultado del buscador se anuncian;
 *   mientras responde la API los campos muestran «--».
 * - **1.4.13 Contenido en hover o foco (AA)**: desde `sm` los valores truncados se completan con `siafTooltip`, que
 *   se cierra con Escape y se puede recorrer con el puntero.
 * - **Pendiente · 2.1.1 Teclado (A)**: esos valores no reciben foco, así que con teclado el globo no aparece (el lector
 *   de pantalla sí lee el valor entero).
 */
@Component({
  selector: 'siaf-asiento-history-panel',
  standalone: true,
  imports: [FocoDirective, TextFieldComponent, ActionTrackerComponent, IconComponent, NgTemplateOutlet, PaginationComponent, RecordStatusTagComponent, StepsComponent, TooltipDirective],
  template: `
    @if (anim.visible()) {
      <section class="siaf-sidepanel-overlay fixed inset-y-0 left-0 right-0 z-50 bg-black/55 pl-0 lg:pl-[65px]" [class.cerrando]="anim.cerrando()" aria-modal="true" role="dialog" aria-labelledby="asiento-history-title" (click)="closed.emit()">
        <aside class="flex h-screen w-full flex-col overflow-hidden bg-surface text-text shadow-siaf-lg lg:rounded-l-siaf-md" [siafFoco]="open" (siafFocoEscape)="closed.emit()" (click)="$event.stopPropagation()">
          <header class="flex h-14 shrink-0 items-center gap-siaf-xs px-siaf-md">
            <h2 id="asiento-history-title" class="m-0 min-w-0 flex-1 text-base font-bold uppercase leading-normal tracking-[0.02px] text-text">Historial del registro</h2>
            <button class="inline-flex size-10 items-center justify-center rounded-siaf-md text-text transition hover:bg-surface-muted active:bg-[var(--sys-color-bg-states-light-pressed)]" type="button" aria-label="Cerrar historial del asiento de ajuste" (click)="closed.emit()">
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
                  <div class="mt-siaf-lg grid gap-siaf-md md:grid-cols-4">
                    <ng-container [ngTemplateOutlet]="plainField" [ngTemplateOutletContext]="{ field: numberSummaryField }" />
                    <ng-container [ngTemplateOutlet]="plainField" [ngTemplateOutletContext]="{ field: accountingNumberField }" />
                    <ng-container [ngTemplateOutlet]="plainField" [ngTemplateOutletContext]="{ field: actionSummaryField }" />
                    <div class="flex min-w-0 flex-col gap-siaf-xxs">
                      <span class="sm:truncate text-[11px] font-medium uppercase leading-none tracking-[0.66px] text-text-muted" siafTooltip>Estado del registro</span>
                      <siaf-record-status-tag [status]="recordStatus" size="small" />
                    </div>
                  </div>
                </section>

                <section class="rounded-siaf-md border border-[var(--sys-color-divider-strong)] bg-surface px-siaf-xl py-siaf-xl">
                  <header class="mb-siaf-xl">
                    <h2 class="m-0 text-base font-bold uppercase leading-normal tracking-[0.02px] text-text">Registro de asiento de ajuste</h2>
                  </header>

                  <div class="flex flex-col gap-siaf-xl">
                    <section class="flex flex-col gap-siaf-md">
                      <ng-container [ngTemplateOutlet]="sectionTitle" [ngTemplateOutletContext]="{ title: 'Ámbito institucional' }" />
                      <ng-container [ngTemplateOutlet]="readonlyCard" [ngTemplateOutletContext]="{ field: ambitoField }" />
                    </section>

                    <section class="flex flex-col gap-siaf-md">
                      <ng-container [ngTemplateOutlet]="sectionTitle" [ngTemplateOutletContext]="{ title: 'Periodo' }" />
                      <section class="relative rounded-siaf-md border border-[var(--sys-color-divider-strong)] px-siaf-md py-siaf-sm">
                        <span class="absolute left-0 top-5 h-6 w-[3px] rounded-r bg-brand-primary" aria-hidden="true"></span>
                        <div class="grid gap-siaf-md md:grid-cols-4">
                          @for (field of periodoFields; track field.label) {
                            <ng-container [ngTemplateOutlet]="plainField" [ngTemplateOutletContext]="{ field: field }" />
                          }
                        </div>
                      </section>
                    </section>

                    <section class="flex flex-col gap-siaf-md">
                      <ng-container [ngTemplateOutlet]="sectionTitle" [ngTemplateOutletContext]="{ title: 'Fecha de contabilización' }" />
                      <ng-container [ngTemplateOutlet]="plainField" [ngTemplateOutletContext]="{ field: fechaContabilizacionField, required: true }" />
                    </section>

                    <section class="flex flex-col gap-siaf-md">
                      <ng-container [ngTemplateOutlet]="sectionTitle" [ngTemplateOutletContext]="{ title: 'Código de clase de ajuste' }" />
                      <ng-container [ngTemplateOutlet]="readonlyCard" [ngTemplateOutletContext]="{ field: claseField }" />
                    </section>

                    <section class="flex flex-col gap-siaf-md">
                      <ng-container [ngTemplateOutlet]="sectionTitle" [ngTemplateOutletContext]="{ title: 'Código de detalle de ajuste' }" />
                      <ng-container [ngTemplateOutlet]="readonlyCard" [ngTemplateOutletContext]="{ field: detalleField }" />
                    </section>

                    <section class="flex flex-col gap-siaf-md">
                      <ng-container [ngTemplateOutlet]="sectionTitle" [ngTemplateOutletContext]="{ title: 'Glosa' }" />
                      <ng-container [ngTemplateOutlet]="plainField" [ngTemplateOutletContext]="{ field: glosaField, multiline: true, required: true }" />
                    </section>

                    <section class="rounded-siaf-md border border-[var(--sys-color-divider-strong)]">
                      <button class="flex min-h-12 w-full items-center gap-siaf-sm px-siaf-md text-left" type="button" (click)="cuentasExpanded.set(!cuentasExpanded())">
                        <siaf-icon [name]="cuentasExpanded() ? 'keyboard_arrow_down' : 'keyboard_arrow_right'" [size]="24" />
                        <span class="text-sm font-bold uppercase tracking-[0.02px] text-text">Código de asiento: {{ codigoAsiento }}</span>
                      </button>

                      @if (cuentasExpanded()) {
                        <div class="flex flex-col gap-siaf-md px-siaf-md pb-siaf-md">
                          <h3 class="m-0 text-sm font-bold uppercase leading-normal tracking-[0.02px] text-text">Cuentas contables</h3>

                          <siaf-input
                            label="Buscar"
                            [value]="filtro()"
                            trailingIcon="search"
                            trailingButtonLabel="Buscar"
                            (valueChange)="onFiltroTyped($any($event))"
                            (keydown.enter)="onFiltroSubmit()"
                            (trailingAction)="onFiltroSubmit()"
                          />

                          <div class="siaf-table-scroll min-w-0">
                            <table class="w-full min-w-[640px] border-collapse text-left text-sm">
                              <thead>
                                <tr class="h-10 bg-[var(--sys-color-bg-surfaces-surface-high)] text-xs font-bold uppercase text-text">
                                  <th class="w-[170px] rounded-l-siaf-sm px-siaf-md py-siaf-sm">Cod. cuentas contables</th>
                                  <th class="px-siaf-md py-siaf-sm">Nombre de la cuenta contable</th>
                                  <th class="w-[150px] px-siaf-md py-siaf-sm">Tipo de movimiento</th>
                                  <th class="w-[130px] rounded-r-siaf-sm px-siaf-md py-siaf-sm text-right">Importe</th>
                                </tr>
                              </thead>
                              <tbody>
                                @for (mov of movimientosPagina; track $index) {
                                  <tr class="h-12 border-b border-[var(--sys-color-divider-default)] bg-surface text-[var(--sys-color-text-neutral-medium)]">
                                    <td class="px-siaf-md py-siaf-sm font-mono">{{ mov.codigo }}</td>
                                    <td class="px-siaf-md py-siaf-sm text-text">{{ mov.nombre }}</td>
                                    <td class="px-siaf-md py-siaf-sm">{{ mov.tipoMovimiento }}</td>
                                    <td class="px-siaf-md py-siaf-sm text-right">{{ formatImporte(mov.importe) }}</td>
                                  </tr>
                                } @empty {
                                  <tr>
                                    <td class="px-siaf-md py-siaf-md text-center text-sm text-text-muted" colspan="4">Sin cuentas contables registradas</td>
                                  </tr>
                                }
                                <tr class="h-12 border-b border-[var(--sys-color-divider-default)]">
                                  <td></td><td></td>
                                  <td class="px-siaf-md py-siaf-sm text-sm font-medium text-text">Total Debe</td>
                                  <td class="px-siaf-md py-siaf-sm text-right font-bold text-text">{{ formatImporte(totalDebe) }}</td>
                                </tr>
                                <tr class="h-12">
                                  <td></td><td></td>
                                  <td class="px-siaf-md py-siaf-sm text-sm font-medium text-text">Total Haber</td>
                                  <td class="px-siaf-md py-siaf-sm text-right font-bold text-text">{{ formatImporte(totalHaber) }}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>

                          <siaf-pagination
                            position="Bottom"
                            [rowPage]="true"
                            [page]="pagina()"
                            [pageSize]="filasPorPagina()"
                            [totalItems]="movimientosFiltrados.length"
                            [totalPages]="totalPaginas"
                            [rowsPerPage]="filasPorPagina()"
                            (previous)="pagina.set(pagina() - 1)"
                            (next)="pagina.set(pagina() + 1)"
                            (rowsPerPageChange)="onFilasPorPagina($event)"
                          />
                        </div>
                      }
                    </section>
                  </div>
                </section>

                <section class="rounded-siaf-md border border-[var(--sys-color-divider-strong)] bg-surface px-siaf-xl py-siaf-lg">
                  <header class="mb-siaf-md">
                    <h2 class="m-0 text-base font-bold uppercase leading-normal tracking-[0.02px] text-text">Justificación del sustento</h2>
                  </header>
                  <div class="flex flex-col gap-siaf-xl">
                    <ng-container [ngTemplateOutlet]="plainField" [ngTemplateOutletContext]="{ field: justificationField, multiline: true, required: true }" />
                    <section class="flex flex-col gap-siaf-md">
                      <ng-container [ngTemplateOutlet]="sectionTitle" [ngTemplateOutletContext]="{ title: 'Documento de sustento' }" />
                      @if (supportDocument) {
                        <div class="flex min-h-16 items-center gap-siaf-md rounded-siaf-md border border-[var(--sys-color-divider-strong)] bg-surface px-siaf-md">
                          <siaf-icon name="description" [size]="24" />
                          <div class="min-w-0 flex-1">
                            <strong class="block sm:truncate text-sm font-bold text-text" siafTooltip>{{ supportDocument }}</strong>
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

          <ng-template #plainField let-field="field" let-multiline="multiline" let-required="required">
            <div class="min-w-0">
              <span class="block text-[11px] font-medium uppercase leading-none tracking-[0.66px] text-text-muted">{{ field.label }}@if (required) {<span class="text-[var(--sys-color-text-feedback-danger)]"> *</span>}</span>
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
export class AsientoHistoryPanelComponent implements OnChanges {
  private readonly solicitudesApi = inject(SolicitudesApiService);
  private readonly aperturaApi = inject(AperturaContableApiService);
  private readonly currentUser = inject(CurrentUserService);

  @Input() open = false;
  @Input() record: DocumentsRecordsRow | null = null;

  @Output() closed = new EventEmitter<void>();

  readonly solicitud = signal<SolicitudResponse | null>(null);
  readonly periodoDetalle = signal<PeriodoContableResponse | null>(null);
  readonly cuentasExpanded = signal(true);
  readonly filtro = signal('');
  readonly pagina = signal(1);
  readonly filasPorPagina = signal(10);

  /** Render animado del panel (entrada/salida por la derecha, 300ms). */
  readonly anim = new SidePanelAnimacion();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open']) this.anim.actualizar(this.open);
    if (changes['open'] && this.open && this.record?.['recordId']) {
      const id = String(this.record['recordId']);
      this.solicitud.set(null);
      this.periodoDetalle.set(null);
      this.filtro.set('');
      this.pagina.set(1);

      this.solicitudesApi.obtenerDetalle(id).subscribe({
        next: (s) => {
          this.solicitud.set(s);
          this.resolverPeriodo(s);
        },
      });
    }
  }

  /** Resuelve las fechas del período contra la configuración de Apertura. */
  private resolverPeriodo(s: SolicitudResponse): void {
    const etiqueta = s.detalleAsientoAjuste?.periodoLabel ?? undefined;
    const entidadId = s.entidadCreadora?.id;
    if (!etiqueta || !entidadId) return;
    const anio = Number(etiqueta.split('-')[0]?.trim()) || new Date().getFullYear();

    this.aperturaApi.listarConfiguracion(anio, 'PLIEGO').subscribe({
      next: (configs) => {
        const propio = configs.find(c => c.ambitoId === entidadId) ?? configs[0];
        const periodo = propio?.periodos.find(p => p.etiqueta === etiqueta) ?? null;
        this.periodoDetalle.set(periodo);
      },
    });
  }

  private get asiento() {
    return this.solicitud()?.detalleAsientoAjuste ?? null;
  }

  private get tipo() {
    return this.asiento?.tipoAsientoAjuste ?? null;
  }

  // ── Stepper (izquierda) ──────────────────────────────────────────
  /** Versiones del registro para la columna de `siaf-steps`: hoy solo la de creación. */
  readonly versiones = computed<StepItem[]>(() => [{ label: 'Creación', fields: this.stepperSummary }]);

  get stepperSummary(): HistoryField[] {
    const s = this.solicitud();
    // El N° de creación es el segmento correlativo del número formal
    // (PRAA-SRAA-00005-2026-... → "00005").
    const num = s?.numero?.split('-')[2] ?? '--';
    return [
      { label: 'N° creación', value: num },
      { label: 'Tipo de acción', value: this.tipoAccionLabel(s?.tipoAccion) },
      { label: 'Fecha', value: formatFechaHora(s?.fechaRegistro ?? s?.createdAt) },
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

  // ── Card del documento ───────────────────────────────────────────
  get documentSummaryField(): HistoryField {
    return { label: 'Documento', value: this.solicitud()?.catDocumento?.nombre ?? 'Solicitud de Registro de Asiento de Ajuste' };
  }

  get numberSummaryField(): HistoryField {
    return { label: 'Nro de documento', value: this.solicitud()?.numero ?? '--' };
  }

  get accountingNumberField(): HistoryField {
    return { label: 'Nro de doc. contable', value: this.solicitud()?.numeroAsientoContable ?? '--' };
  }

  get actionSummaryField(): HistoryField {
    return { label: 'Tipo de acción', value: this.tipoAccionLabel(this.solicitud()?.tipoAccion) };
  }

  get recordStatus(): RecordStatus {
    const estado = this.solicitud()?.estado;
    if (estado === 'ELIMINADO') return ESTADO.ELIMINADO;
    return 'Activo';
  }

  // ── Registro del asiento ─────────────────────────────────────────
  get ambitoField(): HistoryField {
    // El detalle trae todos los ámbitos del tipo; se muestra el del usuario
    // (mismo criterio que la grilla de Registros).
    const ambitos = this.tipo?.ambitos ?? [];
    const ambitoUsuario = this.currentUser.user().entidadAmbitoId;
    const elegido = ambitos.find(a => a.ambitoInstitucionalId === ambitoUsuario) ?? ambitos[0];
    const info = elegido?.ambitoInstitucional ?? this.tipo?.ambito;
    return {
      label: 'Ámbito institucional',
      value: info ? `${info.codigo} - ${info.descripcion}` : '--',
    };
  }

  get periodoFields(): HistoryField[] {
    const etiqueta = this.asiento?.periodoLabel ?? '--';
    const p = this.periodoDetalle();
    return [
      { label: 'Periodo', value: etiqueta },
      { label: 'Fecha de inicio', value: p ? isoToDdmmyyyy(p.fechaInicio) : '--' },
      { label: 'Fecha fin', value: p ? isoToDdmmyyyy(p.fechaFin) : '--' },
      { label: 'Fecha vigencia adicional', value: p ? isoToDdmmyyyy(p.fechaVigenciaAdicional) : '--' },
    ];
  }

  get fechaContabilizacionField(): HistoryField {
    const fecha = this.asiento?.fechaAsiento;
    return { label: 'Fecha', value: fecha ? isoToDdmmyyyy(fecha) : '--' };
  }

  get claseField(): HistoryField {
    const c = this.tipo?.claseAjuste;
    return { label: 'Código de clase de ajuste', value: c ? `${c.codigo}. - ${c.descripcion}` : '--' };
  }

  get detalleField(): HistoryField {
    const d = this.tipo?.detalleAjuste;
    return { label: 'Detalle de ajuste', value: d ? `${d.codigo}. - ${d.descripcion}` : '--' };
  }

  get glosaField(): HistoryField {
    return { label: 'Glosa', value: this.asiento?.glosa || '--' };
  }

  get codigoAsiento(): string {
    return this.solicitud()?.numeroAsientoContable ?? this.tipo?.codigo ?? '--';
  }

  // ── Cuentas contables ────────────────────────────────────────────
  private get movimientos(): MovimientoRow[] {
    return (this.asiento?.movimientos ?? []).map(m => ({
      codigo: m.cuentaContable?.codigoCompleto ?? '--',
      nombre: m.cuentaContable?.nombre ?? '--',
      tipoMovimiento: m.tipoMovimiento,
      importe: Number(m.monto ?? 0),
    }));
  }

  get movimientosFiltrados(): MovimientoRow[] {
    const q = this.filtro().trim().toLowerCase();
    if (!q) return this.movimientos;
    return this.movimientos.filter(m =>
      m.codigo.toLowerCase().includes(q) || m.nombre.toLowerCase().includes(q) || m.tipoMovimiento.toLowerCase().includes(q),
    );
  }

  get movimientosPagina(): MovimientoRow[] {
    const inicio = (this.pagina() - 1) * this.filasPorPagina();
    return this.movimientosFiltrados.slice(inicio, inicio + this.filasPorPagina());
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.movimientosFiltrados.length / this.filasPorPagina()));
  }

  get totalDebe(): number {
    return this.movimientos.filter(m => m.tipoMovimiento === 'Debe').reduce((s, m) => s + m.importe, 0);
  }

  get totalHaber(): number {
    return this.movimientos.filter(m => m.tipoMovimiento === 'Haber').reduce((s, m) => s + m.importe, 0);
  }

  /** Texto vivo del input; se aplica recién con Enter (igual que las bandejas). */
  private filtroInput = '';

  onFiltroTyped(value: string): void {
    this.filtroInput = String(value ?? '');
  }

  onFiltroSubmit(): void {
    this.filtro.set(this.filtroInput);
  }

  onFiltroChange(event: Event): void {
    this.filtro.set((event.target as HTMLInputElement).value);
    this.pagina.set(1);
  }

  onFilasPorPagina(filas: number): void {
    this.filasPorPagina.set(filas);
    this.pagina.set(1);
  }

  formatImporte(monto: number): string {
    return monto.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }

  // ── Sustento y tracker ───────────────────────────────────────────
  get justificationField(): HistoryField {
    const raw = this.solicitud()?.asuntoMotivo ?? '';
    return {
      label: 'Justificación del requerimiento solicitado',
      value: raw.replace(/^\[[^\]]*\]\s*/, '') || '--',
    };
  }

  get supportDocument(): string | null {
    return this.solicitud()?.sustentos?.[0]?.archivo?.nombreOriginal ?? null;
  }

  get actionSummary(): ActionTrackerSummary[] {
    const historial = this.solicitud()?.historialEstados ?? [];
    const getEntry = (estado: string) => {
      const h = historial.find(x => x.estadoNuevo === estado);
      if (!h) return { actionBy: 'No asignado aún', date: 'Fecha y hora no registradas' };
      const actor = h.creador
        ? `${h.creador.nombres} ${h.creador.apellidoPaterno} ${h.creador.apellidoMaterno ?? ''}`.trim().toUpperCase()
        : '--';
      return { actionBy: actor, date: formatFechaHora(h.createdAt) };
    };
    return [
      { label: 'Elaborado por', ...getEntry('ELABORADO') },
      { label: 'Verificado por', ...getEntry('VERIFICADO') },
      { label: 'Aprobado por', ...getEntry('APROBADO') },
    ];
  }
}
