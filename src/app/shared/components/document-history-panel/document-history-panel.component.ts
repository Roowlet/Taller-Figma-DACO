import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, inject, signal } from '@angular/core';

import { FlowStatusTagComponent, FlowStatus } from '../../ui/flow-status-tag/flow-status-tag.component';
import { IconComponent } from '../../ui/icon/icon.component';
import { SolicitudesApiService } from '../../../core/api/solicitudes-api.service';
import { ESTADO } from '../../../core/models/documento.model';
import { FocoDirective } from '../../ui/foco/foco.directive';

export type DocumentHistoryRow = {
  usuario: string;
  rol: string;
  fecha: string;
  hora: string;
  estado: string;
  comentario: string;
};

export type DocumentHistorySummary = {
  solicitudId: string;
  document: string;
  number: string;
  actionType: string;
  /**
   * Sección plegable de atributos propios del documento (ej. "Atributos
   * de asiento de apertura contable": N° doc. de cierre, N° doc.
   * contable, asiento anterior). Solo se renderiza si viene poblada.
   */
  attributesTitle?: string;
  attributes?: { label: string; value: string }[];
  /**
   * Filas de historial pre-resueltas por el consumidor (documentos que
   * no son solicitudes del workflow, ej. asientos de apertura anual).
   * Si vienen, el panel no consulta la API de solicitudes.
   */
  staticRows?: DocumentHistoryRow[];
};

type HistoryRow = DocumentHistoryRow;

/** Estado del backend (MAYUSCULAS) -> etiqueta que pinta `siaf-flow-status-tag`. */
const FLOW_STATUS_MAP: Record<string, FlowStatus> = {
  ELABORADO:  ESTADO.ELABORADO,
  VERIFICADO: ESTADO.VERIFICADO,
  APROBADO:   ESTADO.APROBADO,
  OBSERVADO:  ESTADO.OBSERVADO,
  RECHAZADO:  ESTADO.RECHAZADO,
  ELIMINADO:  ESTADO.ELIMINADO,
};

/**
 * Panel lateral a pantalla completa «Historial del documento», que abre la bandeja `siaf-documents-records-page`
 * desde la pestaña Documentos.
 *
 * Muestra el documento, su N° y el tipo de acción, una sección plegable opcional de atributos y la tabla «Historial
 * de estados» (usuario, unidad organizacional, fecha y estado con `siaf-flow-status-tag`), que pide a la API con
 * `solicitudId` o toma de `staticRows` sin consultar. Se cierra con la X o pulsando el fondo, que emiten `closed`.
 *
 * @usar
 * - Para ver desde la pestaña Documentos de cualquier bandeja quién movió el documento y cuándo pasó por Elaborado,
 *   Verificado, Observado o Aprobado, sin abrir la solicitud.
 * - Con `attributes` y `staticRows` para documentos que no son solicitudes del flujo, como los asientos de apertura
 *   anual (Registrado, Procesado, Anulado).
 * @evitar
 * - Para registros (pestaña Registros): usar `siaf-account-history-panel` o `siaf-asiento-history-panel`.
 * - Dentro de la solicitud abierta: usar `siaf-detail-history-tabs` y `siaf-action-tracker` en la página.
 * - Para mostrar comentarios u observaciones: la tabla no pinta el `comentario` aunque viaje en cada fila; usar
 *   `siaf-detail-history-tabs`.
 * @teclado
 * - **Tab**: al abrir, el foco entra en la X; recorre el botón de atributos y da la vuelta sin salir del panel.
 * - **Enter / Espacio** en la X: cierran el panel (emite `closed`).
 * - **Escape**: cierra el panel (emite `closed`) y el foco vuelve al botón de historial.
 * - **Enter / Espacio** en el botón de atributos: pliegan o despliegan la sección.
 * @accesibilidad
 * - **Pendiente · 4.1.2 Nombre, función y valor (A)**: es `role="dialog"` con `aria-modal`, nombre desde su título y
 *   la X «Cerrar historial»; pero el botón de atributos no publica `aria-expanded` ni `aria-controls`: su estado solo
 *   se ve en la flecha.
 * - **1.3.1 Información y relaciones (A)**: título `h2`, subtítulo `h3` y estados en una `table` con `thead` y `th`.
 * - **1.4.1 Uso del color (A)**: cada estado va escrito en `siaf-flow-status-tag`.
 * - **Pendiente · 1.4.3 Contraste mínimo (AA)**: etiquetas `text-neutral-low` 5.01:1 (oscuro 8.86:1), valores
 *   `text-neutral-high` 16.29:1 (16.53:1) y celdas `text-neutral-medium` 14.53:1 (12.87:1) cumplen, pero el estado
 *   Observado da 3.39:1 en claro.
 * - **2.4.3 Orden del foco (A)**: con `siafFoco`, al abrir lleva el foco a la X y lo retiene en el panel; al cerrar (X,
 *   Escape o clic en el fondo) lo devuelve al botón de historial.
 * - **2.4.7 Foco visible (AA)**: la X y el botón de atributos no definen estilo de foco: muestran el contorno por
 *   defecto del navegador.
 * - **Pendiente · 4.1.3 Mensajes de estado (AA)**: la carga pinta filas grises animadas sin texto ni `aria-busy`, así
 *   que no se anuncia.
 */
@Component({
  selector: 'siaf-document-history-panel',
  standalone: true,
  imports: [FocoDirective, FlowStatusTagComponent, IconComponent],
  template: `
    @if (open) {
      <section
        class="fixed inset-y-0 left-0 right-0 z-50 bg-black/55 pl-0 lg:pl-[65px]"
        aria-modal="true"
        role="dialog"
        aria-labelledby="document-history-title"
        (click)="closed.emit()"
      >
        <aside class="flex h-screen w-full flex-col overflow-hidden bg-surface shadow-siaf-lg lg:rounded-l-siaf-md" [siafFoco]="open" (siafFocoEscape)="closed.emit()" (click)="$event.stopPropagation()">

          <!-- Header -->
          <header class="flex h-14 shrink-0 items-center gap-siaf-xs px-siaf-md">
            <h2 id="document-history-title" class="m-0 flex-1 text-base font-bold uppercase leading-normal tracking-[0.02px] text-text">
              Historial del documento
            </h2>
            <button
              class="inline-flex size-10 items-center justify-center rounded-siaf-md text-text transition hover:bg-surface-muted"
              type="button"
              aria-label="Cerrar historial"
              (click)="closed.emit()"
            >
              <siaf-icon name="close" [size]="24" />
            </button>
          </header>

          <!-- Body -->
          <div class="min-h-0 flex-1 overflow-y-auto px-siaf-md py-siaf-md sm:px-siaf-xl">
            <div class="flex flex-col gap-siaf-lg">

              <!-- Summary card -->
              <section class="rounded-siaf-md border border-[var(--sys-color-border-states-enabled)] p-siaf-md">
                <div class="grid gap-siaf-md md:grid-cols-3">
                  <div class="flex min-w-0 flex-col gap-siaf-xxs">
                    <span class="text-[11px] font-medium uppercase tracking-[0.66px] text-text-muted">Documento</span>
                    <span class="text-sm font-medium text-text">{{ summary.document }}</span>
                  </div>
                  <div class="flex min-w-0 flex-col gap-siaf-xxs">
                    <span class="text-[11px] font-medium uppercase tracking-[0.66px] text-text-muted">Nro de documento</span>
                    <span class="text-sm font-medium text-text">{{ summary.number || '—' }}</span>
                  </div>
                  <div class="flex min-w-0 flex-col gap-siaf-xxs">
                    <span class="text-[11px] font-medium uppercase tracking-[0.66px] text-text-muted">Tipo de acción</span>
                    <span class="text-sm font-medium text-text">{{ summary.actionType }}</span>
                  </div>
                </div>
              </section>

              <!-- Atributos propios del documento (opcional) -->
              @if (summary.attributes?.length) {
                <section class="rounded-siaf-md border border-[var(--sys-color-border-states-enabled)] p-siaf-md">
                  <button
                    class="flex w-full items-center gap-siaf-xs text-left"
                    type="button"
                    (click)="attributesExpanded.set(!attributesExpanded())"
                  >
                    <siaf-icon [name]="attributesExpanded() ? 'keyboard_arrow_up' : 'keyboard_arrow_down'" [size]="20" />
                    <span class="text-sm font-medium text-text">{{ summary.attributesTitle || 'Atributos del documento' }}</span>
                  </button>
                  @if (attributesExpanded()) {
                    <div class="mt-siaf-md grid gap-siaf-md md:grid-cols-3">
                      @for (attr of summary.attributes; track attr.label) {
                        <div class="flex min-w-0 flex-col gap-siaf-xxs">
                          <span class="text-[11px] font-medium uppercase tracking-[0.66px] text-text-muted">{{ attr.label }}</span>
                          <span class="text-sm font-medium text-text">{{ attr.value }}</span>
                        </div>
                      }
                    </div>
                  }
                </section>
              }

              <!-- History table -->
              <section>
                <h3 class="mb-siaf-md m-0 text-sm font-bold uppercase tracking-[0.02px] text-text">
                  Historial de estados
                </h3>

                @if (loading()) {
                  <div class="overflow-x-auto">
                    <table class="w-full min-w-[640px] border-collapse text-left text-sm">
                      <thead>
                        <tr class="h-10 bg-[var(--sys-color-bg-surfaces-surface-high)] text-xs font-bold uppercase text-text">
                          <th class="rounded-l-siaf-sm px-siaf-md py-siaf-sm">Usuario</th>
                          <th class="px-siaf-md py-siaf-sm">Unidad Organizacional</th>
                          <th class="px-siaf-md py-siaf-sm w-[160px]">Fecha</th>
                          <th class="rounded-r-siaf-sm px-siaf-md py-siaf-sm w-[130px]">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (i of skeletonRows; track $index) {
                          <tr class="border-b border-[var(--sys-color-divider-default)]">
                            <td class="px-siaf-md py-siaf-sm">
                              <span class="block h-3 w-40 rounded bg-[var(--sys-color-bg-surfaces-surface-low)] siaf-skeleton-pulse"></span>
                            </td>
                            <td class="px-siaf-md py-siaf-sm">
                              <span class="block h-3 w-28 rounded bg-[var(--sys-color-bg-surfaces-surface-low)] siaf-skeleton-pulse"></span>
                            </td>
                            <td class="px-siaf-md py-siaf-sm">
                              <span class="block h-3 w-20 rounded bg-[var(--sys-color-bg-surfaces-surface-low)] siaf-skeleton-pulse mb-1"></span>
                              <span class="block h-2.5 w-14 rounded bg-[var(--sys-color-bg-surfaces-surface-low)] siaf-skeleton-pulse"></span>
                            </td>
                            <td class="px-siaf-md py-siaf-sm">
                              <span class="block h-6 w-24 rounded-full bg-[var(--sys-color-bg-surfaces-surface-low)] siaf-skeleton-pulse"></span>
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                } @else if (rows().length === 0) {
                  <p class="m-0 text-sm text-[var(--sys-color-text-neutral-medium)]">Sin historial disponible.</p>
                } @else {
                  <div class="overflow-x-auto">
                    <table class="w-full min-w-[640px] border-collapse text-left text-sm">
                      <thead>
                        <tr class="h-10 bg-[var(--sys-color-bg-surfaces-surface-high)] text-xs font-bold uppercase text-text">
                          <th class="rounded-l-siaf-sm px-siaf-md py-siaf-sm">Usuario</th>
                          <th class="px-siaf-md py-siaf-sm">Unidad Organizacional</th>
                          <th class="px-siaf-md py-siaf-sm w-[160px]">Fecha</th>
                          <th class="rounded-r-siaf-sm px-siaf-md py-siaf-sm w-[130px]">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (row of rows(); track $index) {
                          <tr class="border-b border-[var(--sys-color-divider-default)]">
                            <td class="px-siaf-md py-siaf-sm text-[var(--sys-color-text-neutral-medium)]">{{ row.usuario || '—' }}</td>
                            <td class="whitespace-pre-wrap px-siaf-md py-siaf-sm text-[var(--sys-color-text-neutral-medium)]">{{ row.rol || '—' }}</td>
                            <td class="px-siaf-md py-siaf-sm text-[var(--sys-color-text-neutral-medium)]">
                              <div>{{ row.fecha }}</div>
                              <div class="text-[var(--sys-color-text-neutral-low)]">{{ row.hora }}</div>
                            </td>
                            <td class="px-siaf-md py-siaf-sm">
                              <siaf-flow-status-tag [status]="flowStatus(row.estado)" size="small" />
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                }
              </section>

            </div>
          </div>
        </aside>
      </section>
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentHistoryPanelComponent implements OnChanges {
  private readonly solicitudesApi = inject(SolicitudesApiService);

  @Input() open = false;
  @Input() summary: DocumentHistorySummary = { solicitudId: '', document: '', number: '', actionType: '' };
  @Output() closed = new EventEmitter<void>();

  readonly loading = signal(false);
  /** Sección de atributos expandida por defecto (como en el Figma). */
  readonly attributesExpanded = signal(true);
  readonly rows = signal<HistoryRow[]>([]);
  readonly skeletonRows = Array.from({ length: 4 });

  ngOnChanges(): void {
    if (this.open && this.summary.staticRows?.length) {
      // Historial provisto por el consumidor — sin consulta a la API.
      this.loading.set(false);
      this.rows.set(this.summary.staticRows);
    } else if (this.open && this.summary.solicitudId) {
      this.cargarHistorial(this.summary.solicitudId);
    } else if (!this.open) {
      this.rows.set([]);
    }
  }

  private cargarHistorial(id: string): void {
    this.loading.set(true);
    this.rows.set([]);
    this.solicitudesApi.obtenerDetalle(id).subscribe({
      next: (solicitud) => {
        const historial = [...(solicitud.historialEstados ?? [])]
          .filter(h => (h.estadoNuevo ?? '').toUpperCase() !== 'NUEVO') // NUEVO es estado interno, no se muestra
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        this.rows.set(historial.map(h => {
          const d = new Date(h.createdAt);
          const nombreUsuario = h.creador
            ? `${h.creador.nombres} ${h.creador.apellidoPaterno} ${h.creador.apellidoMaterno}`.trim()
            : '';
          // En el modelo v2 el perfil solo expone cfgPerfil.rol (la entidad/
          // unidad ya no viajan en el historial — se derivan del usuario si
          // se necesitan).
          const rolNombre = h.perfil?.cfgPerfil?.rol?.nombre ?? '';
          return {
            usuario: nombreUsuario,
            rol: rolNombre,
            fecha: d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }),
            hora: d.toLocaleTimeString('es-PE', { hour12: false }),
            estado: (h.estadoNuevo ?? '').toUpperCase(),
            comentario: h.comentario ?? '',
          };
        }));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  flowStatus(estado: string): FlowStatus {
    // Estados fuera del workflow estándar (ej. Registrado/Procesado/
    // Anulado de los asientos de apertura) llegan ya como etiqueta
    // legible: se pasan tal cual al tag.
    const passthrough: FlowStatus[] = ['Registrado', 'Procesado', 'Anulado', 'Fallido', 'En proceso'];
    if (passthrough.includes(estado as FlowStatus)) return estado as FlowStatus;
    return FLOW_STATUS_MAP[estado] ?? ESTADO.ELABORADO;
  }
}
