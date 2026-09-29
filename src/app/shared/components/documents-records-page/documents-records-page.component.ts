import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { PermissionService } from '../../../core/auth/permission.service';
import type { UserRole } from '../../../core/auth/role.model';
import { SolicitudesApiService } from '../../../core/api/solicitudes-api.service';
import { SolicitudesFacadeService } from '../../../core/state/solicitudes-facade.service';

import { BreadcrumbComponent } from '../../components/breadcrumb/breadcrumb.component';
import { CustomFilterApplyEvent, CustomFilterComponent, FilterRow } from '../../components/custom-filter/custom-filter.component';
import { FilterPillComponent } from '../../components/filter-pill/filter-pill.component';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { RecordsSearchToolbarComponent } from '../../components/records-search-toolbar/records-search-toolbar.component';
import { RecordsTabItem, RecordsTabsComponent } from '../../components/records-tabs/records-tabs.component';
import { TableControlsComponent } from '../../components/table-controls/table-controls.component';
import type { DocumentsQuery, DocumentsRecordsColumn, DocumentsRecordsConfig, DocumentsRecordsRow, DocumentsRecordsTab } from '../../types/documents-records.types';
import { AccountHistoryPanelComponent } from '../account-history-panel/account-history-panel.component';
import { AsientoHistoryPanelComponent } from '../asiento-history-panel/asiento-history-panel.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { ColumnVisibilityPanelComponent } from '../../ui/column-visibility-panel/column-visibility-panel.component';
import { CreateDocumentAccepted, CreateDocumentComponent, CreateDocumentField, CreateDocumentSelection } from '../create-document/create-document.component';
import { DocumentHistoryPanelComponent, DocumentHistorySummary } from '../document-history-panel/document-history-panel.component';
import { DocumentsRecordsSelectionChange, DocumentsRecordsTableComponent } from '../../ui/documents-records-table/documents-records-table.component';
import { IconComponent } from '../../ui/icon/icon.component';
import { IconDropdownMenuComponent, IconDropdownMenuItem } from '../../ui/icon-dropdown-menu/icon-dropdown-menu.component';
import { ModalComponent } from '../../ui/modal/modal.component';
import { SnackbarComponent } from '../../ui/snackbar/snackbar.component';
import { TableSkeletonComponent } from '../../ui/table-skeleton/table-skeleton.component';
import { ESTADO } from '../../../core/models/documento.model';
import { FocoDirective } from '../../ui/foco/foco.directive';

type AppliedCustomFilter = {
  id: string;
  campo: string;
  campoLabel: string;
  condicion: string;
  valor: string;
};

// Estados visibles para el APROBADOR (filtra Elaborado y Eliminado)
const ESTADOS_APROBADOR: string[] = [ESTADO.VERIFICADO, ESTADO.APROBADO, ESTADO.OBSERVADO, ESTADO.RECHAZADO];
// El CREADOR ve todos los estados de su ciclo — para auditoría y trazabilidad visual completa
const ESTADOS_CREADOR: string[] = [ESTADO.ELABORADO, ESTADO.VERIFICADO, ESTADO.APROBADO, ESTADO.OBSERVADO, ESTADO.RECHAZADO, ESTADO.ELIMINADO];

type DocumentsRecordsRoleMode = 'creator' | 'approver' | 'readOnly';

/**
 * Pantalla «Documentos y registros» de un proceso, armada desde un `DocumentsRecordsConfig`: breadcrumb, título,
 * «Crear documento», pestañas Documentos / Registros, buscador con menús y filtros, grilla estándar con paginación y
 * los paneles de historial y de columnas.
 * Aplica las reglas de rol (el creador verifica elaborados, el aprobador aprueba verificados y el resto solo consulta;
 * `modoConsulta` quita crear y las acciones) y ejecuta verificar o aprobar en lote contra el backend.
 * Con `serverQuery` / `serverRecordsQuery` la búsqueda y la paginación las resuelve el padre en el servidor, y la
 * selección sobrevive al refresco por polling.
 *
 * @usar
 * - Como pantalla principal de cada proceso: plan de cuentas, asiento de ajuste, catálogo de ajuste, catálogo de
 *   eventos, eventos contables, contabilización y apertura contable (por entidad y anual).
 * - Cuando el creador verifica o el aprobador aprueba varias solicitudes a la vez: el botón, el modal y el snackbar
 *   salen del rol, sin código en el padre.
 * - Con `modoConsulta` en procesos de solo consulta (contabilización, apertura anual) y con `serverQuery` /
 *   `serverRecordsQuery` cuando el backend busca y pagina (plan de cuentas, asiento de ajuste, catálogos, apertura).
 * @evitar
 * - Para «Consultas y reportes» con búsqueda por criterios: usar `siaf-page-shell` con `siaf-page-header`.
 * - Para ver o editar una solicitud: usar `siaf-solicitude-page-layout`.
 * - Rearmar una bandeja con `siaf-table-controls`, `siaf-documents-records-table` y `siaf-pagination` sueltos, o
 *   duplicar las reglas de rol: declarar otro `DocumentsRecordsConfig`.
 * - Para la Bandeja de Documentos del shell (Recibidos, Enviados, Borradores, Papelera): es `siaf-tray-documents-view`.
 * @teclado
 * - **Tab**: recorre el breadcrumb, «Crear documento», las pestañas, el buscador y sus menús, los filtros, «Agregar
 *   filtro», la barra de la grilla, la tabla y la paginación; cada control sigue su componente.
 * - **Flechas izquierda / derecha, Inicio y Fin**: cambian entre Documentos y Registros (`siaf-tabs`).
 * - **Enter** en el buscador: aplica la búsqueda (con búsqueda en el servidor, recién ahí consulta).
 * - **Enter / Espacio** en un chip de filtro personalizado: lo abre para editarlo; en su X, lo quita.
 * - **Escape**: cierra el popover «Crear documento» o el filtro personalizado y el foco vuelve a su botón; salir del
 *   popover con Tab también lo cierra. Las capas transparentes que cierran al pulsar fuera no son paradas de Tab.
 * @accesibilidad
 * - **1.3.1 Información y relaciones (A)**: el título del proceso es el `h1` y «Documentos existentes» / «Registros
 *   existentes», el `h2` de la grilla; el breadcrumb es un `nav` y la página vive dentro del `main` del shell.
 * - **Pendiente · 4.1.2 Nombre, función y valor (A)**: las pestañas no apuntan a un `role="tabpanel"` (la grilla no lo
 *   declara), y la X que quita un filtro personalizado es un `span` `role="button"` dentro de otro `<button>`: un
 *   control anidado en un botón puede no anunciarse.
 * - **Pendiente · 2.5.3 Etiqueta en el nombre (A)**: cada chip de filtro personalizado se llama «Filtro personalizado
 *   aplicado» y su texto visible («Campo: valor») no forma parte del nombre.
 * - **2.4.3 Orden del foco (A)**: el popover «Crear documento» y el filtro personalizado reciben el foco al abrirse,
 *   cierran con Escape y lo devuelven a su botón (`siafFoco`).
 * - **Pendiente · 2.4.11 Foco no oculto (AA)**: en escritorio la cabecera (breadcrumb, título y pestañas) queda fija
 *   bajo el navbar y no hay `scroll-padding`: al volver con Shift + Tab, un control de la grilla puede quedar tapado.
 * - **4.1.3 Mensajes de estado (AA)**: la carga de la grilla se anuncia con `siaf-table-skeleton` (`role="status"`) y
 *   el resultado de verificar o aprobar en lote con `siaf-snackbar` (`role="status"`; `role="alert"` si falla).
 * - **2.4.7 Foco visible (AA)**: los chips de filtro personalizado y «Agregar filtro» no tienen estilo propio ni
 *   `outline-none`: queda el anillo nativo; el resto sigue su componente.
 * - **1.4.3 Contraste mínimo (AA)**: `h1` y `h2` en `text-text` (16.29:1 / 16.53:1) y el subtítulo en
 *   `text-text-muted` (5.01:1 / 8.86:1) sobre `bg-surface`.
 */
@Component({
  selector: 'siaf-documents-records-page',
  standalone: true,
  imports: [FocoDirective, 
    AccountHistoryPanelComponent, AsientoHistoryPanelComponent, BreadcrumbComponent, ButtonComponent, ColumnVisibilityPanelComponent,
    CreateDocumentComponent, CustomFilterComponent, DocumentHistoryPanelComponent,
    DocumentsRecordsTableComponent, FilterPillComponent, IconComponent, IconDropdownMenuComponent,
    ModalComponent, PaginationComponent, RecordsSearchToolbarComponent, RecordsTabsComponent,
    SnackbarComponent, TableControlsComponent, TableSkeletonComponent,
  ],
  template: `
    <div class="min-h-[calc(100vh-56px)] bg-[var(--sys-color-bg-surfaces-surface-lowest)] text-text">
      @if (effectiveConfig.recordHistoryKind === 'asiento') {
        <siaf-asiento-history-panel
          [open]="accountHistoryOpen"
          [record]="selectedAccountHistoryRecord"
          (closed)="closeAccountHistory()"
        />
      } @else {
        <siaf-account-history-panel
          [open]="accountHistoryOpen"
          [record]="selectedAccountHistoryRecord"
          (closed)="closeAccountHistory()"
        />
      }

      <siaf-document-history-panel
        [open]="documentHistoryOpen"
        [summary]="selectedHistorySummary"
        (closed)="closeDocumentHistory()"
      />

      <siaf-modal
        [open]="verifyModalOpen"
        variant="custom"
        title="¿Deseas verificar múltiples solicitudes?"
        [description]="verifyModalDescription"
        illustrationSrc="assets/figma/modals/approve-multiple.svg"
        confirmVariant="primary"
        confirmLabel="Aceptar"
        [showIllustration]="true"
        (canceled)="closeVerifyModal()"
        (closed)="closeVerifyModal()"
        (confirmed)="confirmVerifyModal()"
      />

      <siaf-modal
        [open]="approveModalOpen"
        variant="custom"
        title="¿Deseas aprobar múltiples solicitudes?"
        [description]="approveModalDescription"
        illustrationSrc="assets/figma/modals/approve-multiple.svg"
        confirmVariant="primary"
        confirmLabel="Aceptar"
        [showIllustration]="true"
        (canceled)="closeApproveModal()"
        (closed)="closeApproveModal()"
        (confirmed)="confirmApproveModal()"
      />

      <div class="fixed bottom-siaf-lg left-1/2 z-50 w-[min(430px,calc(100vw-32px))] -translate-x-1/2">
        <siaf-snackbar [open]="approvalSnackbarOpen" [tone]="approvalSnackbarTone" (closed)="closeApprovalSnackbar()">
          @if (approvalSnackbarTone === 'error') {
            <span>{{ approvalSnackbarError }}</span>
          } @else {
            <span>Las solicitudes número </span>
            <strong class="font-bold">{{ approvalSnackbarNumbers }}</strong>
            <span> se han </span>
            <strong class="font-bold">{{ approvalSnackbarAction }}</strong>
            <span> con éxito.</span>
          }
        </siaf-snackbar>
      </div>

        <section class="min-w-0">
          <!--
            Cabecera fija en escritorio (breadcrumb + título + Crear documento
            + tabs). El borde inferior lo aporta siaf-records-tabs.
            Mismo criterio que siaf-solicitude-page-layout: top-14 por el
            navbar sticky y z-10 para quedar bajo navbar (z-30) y overlays
            (z-20). La barra de la grilla scrollea normal, a propósito.
          -->
          <section class="bg-surface lg:sticky lg:top-14 lg:z-10">
            <siaf-breadcrumb class="block" [items]="effectiveConfig.breadcrumbs" />

            <header class="flex min-h-[72px] flex-col gap-siaf-sm px-siaf-md pb-siaf-xs pt-siaf-sm md:flex-row md:items-start md:justify-between">
              <div class="min-w-0">
                <h1 class="m-0 text-sm font-bold uppercase leading-normal text-text">{{ effectiveConfig.title }}</h1>
                <p class="m-0 text-[10px] font-medium uppercase leading-normal tracking-[0.66px] text-text-muted">Documentos y registros</p>
              </div>

              <div class="relative shrink-0">
                @if (effectiveConfig.createDocumentOptions.length) {
                <siaf-button variant="accent" icon="add" (click)="toggleCreateDocumentPopover()">Crear documento</siaf-button>

                @if (createDocumentPopoverOpen) {
                  <button class="fixed inset-0 z-20 cursor-default bg-transparent" type="button" data-capa-cierre tabindex="-1" aria-hidden="true" (mousedown)="$event.preventDefault()" (click)="closeCreateDocumentPopover()"></button>
                  <div class="absolute right-0 top-12 z-30 w-[min(360px,calc(100vw-32px))] rounded-siaf-md shadow-siaf-elevation-1" siafFoco [siafFocoAtrapar]="false" (siafFocoEscape)="closeCreateDocumentPopover()" (siafFocoSalida)="closeCreateDocumentPopover()" (click)="$event.stopPropagation()">
                    <siaf-create-document
                      variant="dropdown"
                      [processOptions]="effectiveConfig.createDocumentOptions"
                      [fields]="createDocumentFields"
                      [acceptDisabled]="createDocumentAcceptDisabled"
                      (fieldValueChange)="onCreateDocumentFieldChange($event)"
                      (canceled)="closeCreateDocumentPopover()"
                      (accepted)="onCreateDocumentAccepted($event)"
                    />
                  </div>
                }
                }
              </div>
            </header>

            <siaf-records-tabs
              ariaLabel="Documentos y registros"
              [tabs]="tabsItems"
              [activeId]="activeTab"
              (activeIdChange)="selectTab($any($event))"
            />
          </section>

          <section class="relative p-siaf-md">
            <article class="flex min-h-[458px] flex-col gap-siaf-md rounded-siaf-md bg-surface p-siaf-lg">
              <header class="flex flex-col gap-siaf-md md:flex-row md:items-center md:justify-between">
                <h2 class="m-0 text-sm font-bold uppercase leading-normal text-text">
                  {{ activeTab === 'documents' ? 'Documentos existentes' : 'Registros existentes' }}
                </h2>
                @if (activeTab === 'documents' && effectiveConfig.accionPrincipal) {
                  @if (effectiveConfig.accionPrincipal === 'aprobar') {
                    <siaf-button variant="primary" icon="check_circle" [disabled]="!canApproveSelectedDocuments" (click)="openApproveModal()">
                      Aprobar
                    </siaf-button>
                  } @else {
                    <siaf-button variant="primary" icon="task_alt" [disabled]="!canVerifySelectedDocuments" (click)="openVerifyModal()">Verificar</siaf-button>
                  }
                }
              </header>

              @if (activeTab === 'records') {
                <ng-content select="[records-header]" />
              }

              <div class="flex flex-col gap-siaf-md">
                <siaf-records-search-toolbar
                  [value]="searchInput"
                  placeholder="Buscar"
                  (valueChange)="onSearchChange($event)"
                  (searchSubmit)="onSearchSubmit($event)"
                >
                  <ng-container actions>
                    <siaf-icon-dropdown-menu
                      icon="layers"
                      ariaLabel="Campos"
                      [items]="fieldsMenuItems"
                    />
                    <siaf-icon-dropdown-menu
                      icon="star_border"
                      ariaLabel="Favorito"
                      [items]="favoriteMenuItems"
                      (selected)="onFavoriteOption($any($event))"
                    />
                    <siaf-icon-dropdown-menu
                      icon="more_vert"
                      ariaLabel="Más opciones"
                      [items]="moreOptionsMenuItems"
                      [menuWidth]="280"
                      (selected)="onMoreOptionsAction($event)"
                    />
                  </ng-container>
                </siaf-records-search-toolbar>

                <div class="flex flex-wrap items-center gap-siaf-xs">
                  @if (activeTab === 'documents') {
                    <siaf-filter-pill
                      label="Estado"
                      [options]="effectiveConfig.statusFilterOptions"
                      [selectedValue]="selectedStatusFilter"
                      (selectedValueChange)="onStatusFilterChange($event)"
                    />
                    <siaf-filter-pill
                      label="Tipo de acción"
                      [options]="effectiveConfig.actionTypeFilterOptions"
                      [selectedValue]="selectedActionTypeFilter"
                      (selectedValueChange)="onActionTypeFilterChange($event)"
                    />
                  } @else if (activeTab === 'records' && effectiveConfig.recordFilter1Options?.length) {
                    <siaf-filter-pill
                      [label]="effectiveConfig.recordFilter1Label ?? ''"
                      [options]="effectiveConfig.recordFilter1Options ?? []"
                      [selectedValue]="selectedRecordFilter1"
                      (selectedValueChange)="onRecordFilter1Change($event)"
                    />
                    @if (effectiveConfig.recordFilter2Options?.length) {
                      <siaf-filter-pill
                        [label]="effectiveConfig.recordFilter2Label ?? ''"
                        [options]="effectiveConfig.recordFilter2Options ?? []"
                        [selectedValue]="selectedRecordFilter2"
                        (selectedValueChange)="onRecordFilter2Change($event)"
                      />
                    }
                  }

                  @for (filter of appliedCustomFilters; track filter.id) {
                    <button class="inline-flex h-8 items-center gap-siaf-xs overflow-hidden rounded-siaf-md border border-[var(--sys-color-border-states-active)] bg-[var(--sys-color-bg-states-light-selected)] px-siaf-xs py-siaf-xxs text-sm font-normal leading-normal tracking-[0.025px] text-[var(--sys-color-text-neutral-activated)] transition hover:bg-[var(--sys-color-bg-states-light-hover)]" type="button" aria-label="Filtro personalizado aplicado" (click)="editCustomAppliedFilter(filter)">
                      <siaf-icon name="bolt" [size]="20" />
                      {{ filter.campoLabel }}: {{ filter.valor }}
                      <span class="inline-flex size-5 items-center justify-center rounded-siaf-sm" role="button" tabindex="0" aria-label="Quitar filtro personalizado" (click)="clearCustomAppliedFilter(filter.id, $event)" (keydown.enter)="clearCustomAppliedFilter(filter.id, $event)" (keydown.space)="clearCustomAppliedFilter(filter.id, $event)">
                        <siaf-icon name="close" [size]="20" />
                      </span>
                    </button>
                  }

                  <button class="inline-flex size-8 items-center justify-center rounded-siaf-md transition hover:bg-surface-muted active:bg-[var(--sys-color-bg-states-dark-pressed)]" type="button" aria-label="Agregar filtro" [class.bg-surface-muted]="customFilterOpen" (click)="openCustomFilterForCreate()">
                    <siaf-icon name="add" [size]="20" />
                  </button>
                </div>
              </div>

              @if (activeTab === 'documents') {
                <siaf-table-controls
                  selectAllLabel="Seleccionar documentos o registros"
                  [hideTopPaginationOnMobile]="true"
                  [checked]="allVisibleElaboradoDocumentsSelected"
                  [indeterminate]="someVisibleElaboradoDocumentsSelected"
                  [disabled]="visibleSelectableElaboradoDocuments.length === 0"
                  [page]="page"
                  [pageSize]="rowsPerPage"
                  [totalItems]="totalItemsPaginador"
                  [totalPages]="totalPages"
                  (selectionChange)="toggleVisibleElaboradoDocuments($event)"
                  (previous)="onPreviousPage()"
                  (next)="onNextPage()"
                />
              } @else {
                <siaf-table-controls [showSelection]="false"
                  [page]="page"
                  [pageSize]="rowsPerPage"
                  [totalItems]="totalItemsPaginador"
                  [totalPages]="totalPages"
                  (previous)="onPreviousPage()"
                  (next)="onNextPage()"
                />
              }

              @if (loading) {
                <siaf-table-skeleton
                  [columns]="visibleColumns.length"
                  [rows]="rowsPerPage"
                  [minWidthClass]="activeTab === 'documents' ? effectiveConfig.documentTableMinWidthClass : effectiveConfig.recordTableMinWidthClass"
                />
              } @else {
                <siaf-documents-records-table
                  [activeTab]="activeTab"
                  [columns]="visibleColumns"
                  [rows]="paginatedRows"
                  [minWidthClass]="activeTab === 'documents' ? effectiveConfig.documentTableMinWidthClass : effectiveConfig.recordTableMinWidthClass"
                  [recordTrackKey]="effectiveConfig.recordTrackKey"
                  [documentRoute]="documentRoute"
                  [selectionDisabled]="selectionDisabled"
                  (selectionChanged)="toggleRowSelection($event)"
                  (historyOpened)="openHistory($event)"
                />
              }

              <siaf-pagination
                navigation="Activate"
                position="Bottom"
                [rowPage]="true"
                [page]="page"
                [pageSize]="rowsPerPage"
                [totalItems]="totalItemsPaginador"
                [totalPages]="totalPages"
                [rowsPerPage]="rowsPerPage"
                [rowsPerPageOptions]="rowsPerPageOptions"
                (previous)="onPreviousPage()"
                (next)="onNextPage()"
                (rowsPerPageChange)="onRowsPerPageChange($event)"
              />
            </article>

            @if (customFilterOpen) {
              <button class="fixed inset-0 z-20 cursor-default bg-transparent" type="button" data-capa-cierre tabindex="-1" aria-hidden="true" (mousedown)="$event.preventDefault()" (click)="closeCustomFilter()"></button>
              <div class="fixed inset-x-siaf-md top-24 z-30 sm:absolute sm:left-[40px] sm:top-[188px] sm:w-[936px] sm:max-w-[calc(100%-80px)]" (click)="$event.stopPropagation()">
                <siaf-custom-filter
                  [campoOptions]="activeTab === 'records' && effectiveConfig.recordFilterCampoOptions ? effectiveConfig.recordFilterCampoOptions : effectiveConfig.filterCampoOptions"
                  [condicionOptions]="filterCondicionOptions"
                  [valorOptions]="activeTab === 'records' && effectiveConfig.recordFilterValorOptions ? effectiveConfig.recordFilterValorOptions : effectiveConfig.filterValorOptions"
                  [initialRows]="customFilterInitialRows"
                  [deleteEnabled]="!!editingCustomFilterId"
                  (aplicar)="onCustomFilterApply($event)"
                  (cancelar)="closeCustomFilter()"
                  (eliminar)="deleteEditingCustomFilter()"
                />
              </div>
            }
          </section>
        </section>
      <siaf-column-visibility-panel
        [open]="columnPanelOpen"
        [allSelected]="allDraftColumnsSelected"
        [dirty]="columnsPanelDirty"
        [defaultColumns]="defaultColumnOptions"
        [moreColumns]="moreColumnOptions"
        [internalColumns]="internalColumnOptions"
        [isColumnVisible]="isDraftColumnVisible"
        (closed)="closeColumnPanel()"
        (applied)="applyColumnPanel()"
        (toggleAll)="toggleAllDraftColumns($event)"
        (toggleColumn)="toggleDraftColumnVisibility($event.key, $event.event)"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentsRecordsPageComponent implements OnChanges {
  private readonly router = inject(Router);
  private readonly permissionService = inject(PermissionService);
  private readonly solicitudesApi = inject(SolicitudesApiService);
  private readonly solicitudesFacade = inject(SolicitudesFacadeService);
  private readonly cdr = inject(ChangeDetectorRef);

  @Input({ required: true }) config!: DocumentsRecordsConfig;
  @Output() tabChange = new EventEmitter<DocumentsRecordsTab>();
  /**
   * Consulta remota de la pestaña Documentos (solo si la config declara
   * `serverQuery`): se emite al confirmar la búsqueda (Enter/lupa), al cambiar
   * de página y al cambiar el tamaño de página. El padre la resuelve contra el
   * backend y devuelve `documentRows` ya filtrados y paginados.
   */
  @Output() documentsQueryChange = new EventEmitter<DocumentsQuery>();
  /** Igual que `documentsQueryChange`, para la pestaña Registros (`serverRecordsQuery`). */
  @Output() recordsQueryChange = new EventEmitter<DocumentsQuery>();
  @Input() loading = false;

  // Config efectivo con reglas de rol aplicadas automáticamente
  get effectiveConfig(): DocumentsRecordsConfig {
    // Proceso de solo consulta: sin crear ni verificar/aprobar, y sin
    // filtrado de filas por rol (los estados los define el proceso).
    if (this.config.modoConsulta) {
      return {
        ...this.config,
        createDocumentOptions: [],
        accionPrincipal: undefined,
      };
    }

    const roleMode = this.documentsRecordsRoleMode;

    if (roleMode === 'creator') {
      return {
        ...this.config,
        statusFilterOptions: ESTADOS_CREADOR,
        accionPrincipal: 'verificar',
        documentRows: this.config.documentRows.filter(r =>
          ESTADOS_CREADOR.includes(String(r['status'] ?? ''))
        ),
      };
    }

    if (roleMode === 'readOnly') {
      return {
        ...this.config,
        createDocumentOptions: [],
        accionPrincipal: undefined,
      };
    }

    return {
      ...this.config,
      // Sin botón crear
      createDocumentOptions: [],
      // Solo estados del APROBADOR
      statusFilterOptions: ESTADOS_APROBADOR,
      // Acción principal: Aprobar
      accionPrincipal: 'aprobar',
      // Filtrar documentRows para no mostrar Elaborado/Eliminado
      documentRows: this.config.documentRows.filter(r =>
        ESTADOS_APROBADOR.includes(String(r['status'] ?? ''))
      ),
    };
  }

  activeTab: DocumentsRecordsTab = 'documents';
  createDocumentPopoverOpen = false;
  customFilterOpen = false;
  columnPanelOpen = false;
  selectedStatusFilter = '';
  selectedActionTypeFilter = '';
  // Filtros específicos del tab Registros
  selectedRecordFilter1 = '';
  selectedRecordFilter2 = '';
  /** Texto aplicado a la búsqueda (el que filtra). Se fija con Enter/lupa. */
  searchTerm = '';
  /** Texto vivo del input, aún sin aplicar. */
  searchInput = '';
  appliedCustomFilters: AppliedCustomFilter[] = [];
  customFilterInitialRows: FilterRow[] = [];
  editingCustomFilterId = '';
  accountHistoryOpen = false;
  documentHistoryOpen = false;
  verifyModalOpen = false;
  approveModalOpen = false;
  approvalSnackbarOpen = false;
  approvalSnackbarNumbers = '';
  /** Verbo de la acción masiva ejecutada ('verificado' / 'aprobado'). */
  approvalSnackbarAction = 'aprobado';
  approvalSnackbarTone: 'success' | 'error' = 'success';
  /** Mensaje del backend cuando la acción masiva falla. */
  approvalSnackbarError = '';
  createDocumentDocument = '';
  createDocumentActionType = '';
  documentRows: DocumentsRecordsRow[] = [];
  recordRows: DocumentsRecordsRow[] = [];
  hiddenDocumentColumns = new Set<string>();
  hiddenRecordColumns = new Set<string>();
  draftHiddenColumns = new Set<string>();
  selectedAccountHistoryRecord: DocumentsRecordsRow | null = null;
  selectedHistorySummary: DocumentHistorySummary = { solicitudId: '', document: '', number: '', actionType: '' };
  readonly rowsPerPageOptions = [10, 25, 50, 100];
  readonly filterCondicionOptions = [
    { label: 'Es igual a', value: 'eq' },
    { label: 'No es igual a', value: 'neq' },
    { label: 'Contiene', value: 'contains' },
    { label: 'No contiene', value: 'not_contains' },
    { label: 'Empieza con', value: 'starts_with' },
    { label: 'Termina con', value: 'ends_with' }
  ];
  private customFilterSequence = 0;
  rowsPerPage = 10;
  page = 1;

  // ── Items derivados para los nuevos componentes composables ──
  /** Tabs Documentos / Registros — formato esperado por `siaf-records-tabs`. */
  readonly tabsItems: RecordsTabItem[] = [
    { id: 'documents', label: 'Documentos' },
    { id: 'records',   label: 'Registros' },
  ];

  /** Items del menú "Campos" (layers). Derivados de `effectiveConfig`. */
  get fieldsMenuItems(): IconDropdownMenuItem[] {
    return (this.effectiveConfig.fieldsMenuOptions ?? []).map(o => ({
      label: o.label,
      value: o.label,
      hasChildren: o.hasChildren,
    }));
  }

  /** Items del menú "Favorito" (star). Fijo. */
  readonly favoriteMenuItems: IconDropdownMenuItem[] = [
    { label: 'Solicitudes observadas',     value: 'observed', divider: true },
    { label: 'Guardar búsqueda actual',    value: 'save-search' },
  ];

  /** Items del menú "Más opciones" (more_vert). */
  readonly moreOptionsMenuItems: IconDropdownMenuItem[] = [
    { label: 'Ocultar o mostrar columnas', value: 'open-columns' },
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['config'] || !this.config) {
      return;
    }

    const cfg = this.effectiveConfig;
    // Las bandejas refrescan por polling: cada re-emisión de config reconstruye
    // las filas. Preservar la selección del usuario casando por identidad
    // estable, o el checkbox se "des-selecciona solo" al llegar el refresh.
    const prevSelectedDocs = new Set(this.documentRows.filter((r) => r.selected).map((r) => this.rowIdentity(r)));
    const prevSelectedRecords = new Set(this.recordRows.filter((r) => r.selected).map((r) => this.rowIdentity(r)));
    this.documentRows = cfg.documentRows.map((row) => ({ ...row, selected: row.selected || prevSelectedDocs.has(this.rowIdentity(row)) }));
    this.recordRows = cfg.recordRows.map((row) => ({ ...row, selected: row.selected || prevSelectedRecords.has(this.rowIdentity(row)) }));
    this.hiddenDocumentColumns = new Set(cfg.documentColumns.filter((column) => column.visibility !== 'visible').map((column) => column.key));
    this.hiddenRecordColumns = new Set(cfg.recordColumns.filter((column) => column.visibility !== 'visible').map((column) => column.key));
    // Con el historial abierto no se toca su resumen: el refresco de la bandeja (polling) lo cambiaba por el de la
    // primera fila mientras se leía otro documento.
    if (!this.documentHistoryOpen) {
      this.selectedHistorySummary = {
        solicitudId: '',
        document: String(this.documentRows[0]?.['document'] ?? cfg.recordHistoryDocumentLabel),
        number: String(this.documentRows[0]?.['number'] ?? ''),
        actionType: String(this.documentRows[0]?.['actionType'] ?? ''),
      };
    }
  }

  /** Identidad estable de una fila entre refreshes de la bandeja (polling). */
  private rowIdentity(row: DocumentsRecordsRow): string {
    return String(row['documentId'] ?? row['recordId'] ?? row['number'] ?? row['document'] ?? '');
  }

  get filteredRows(): DocumentsRecordsRow[] {
    if (this.activeTab === 'records') {
      // Tab Registros: filtra sobre recordRows con Es imputable / Naturaleza
      const key1 = this.effectiveConfig.recordFilter1Key ?? 'imputable';
      const key2 = this.effectiveConfig.recordFilter2Key ?? 'naturaleza';
      // En modo servidor el texto ya vino filtrado del backend.
      const normalizedSearch = this.esModoServidor ? '' : this.normalize(this.searchTerm);
      return this.recordRows.filter((row) => {
        const matchesSearch = !normalizedSearch || this.normalize(Object.values(row).join(' ')).includes(normalizedSearch);
        const matchesFilter1 = !this.selectedRecordFilter1 || String(row[key1 as keyof DocumentsRecordsRow] ?? '') === this.selectedRecordFilter1;
        const matchesFilter2 = !this.selectedRecordFilter2 || String(row[key2 as keyof DocumentsRecordsRow] ?? '') === this.selectedRecordFilter2;
        const matchesCustomFilters = this.appliedCustomFilters.every((filter) => this.matchesCustomFilter(row, filter));
        return matchesSearch && matchesFilter1 && matchesFilter2 && matchesCustomFilters;
      });
    }
    // Tab Documentos: filtros originales (Estado / Tipo de acción). En modo
    // servidor el texto ya vino filtrado del backend: no se re-filtra acá
    // (volver a filtrar sobre la página cargada ocultaría filas legítimas).
    const normalizedSearch = this.esModoServidor ? '' : this.normalize(this.searchTerm);
    return this.documentRows.filter((row) => {
      const matchesSearch = !normalizedSearch || this.normalize(Object.values(row).join(' ')).includes(normalizedSearch);
      const matchesStatus = !this.selectedStatusFilter || row['status'] === this.selectedStatusFilter;
      const matchesActionType = !this.selectedActionTypeFilter || row['actionType'] === this.selectedActionTypeFilter;
      const matchesCustomFilters = this.appliedCustomFilters.every((filter) => this.matchesCustomFilter(row, filter));
      return matchesSearch && matchesStatus && matchesActionType && matchesCustomFilters;
    });
  }

  get visibleRows(): DocumentsRecordsRow[] {
    // Ambos tabs usan filteredRows (que ya apunta al array correcto según el tab)
    return this.filteredRows;
  }

  get totalPages(): number {
    const total = this.esModoServidor ? this.totalRemoto : this.visibleRows.length;
    return Math.max(1, Math.ceil(total / this.rowsPerPage));
  }

  /** Total para el paginador: el del backend en modo servidor, el local si no. */
  get totalItemsPaginador(): number {
    return this.esModoServidor ? this.totalRemoto : this.visibleRows.length;
  }

  get paginatedRows(): DocumentsRecordsRow[] {
    // Modo servidor: documentRows ya ES la página actual — no se re-rebana.
    if (this.esModoServidor) return this.visibleRows;

    const start = (this.page - 1) * this.rowsPerPage;
    return this.visibleRows.slice(start, start + this.rowsPerPage);
  }

  get canVerifySelectedDocuments(): boolean {
    return this.documentRows.some((row) => row.selected && row['status'] === ESTADO.ELABORADO);
  }

  get canApproveSelectedDocuments(): boolean {
    return this.documentRows.some((row) => row.selected && row['status'] === ESTADO.VERIFICADO);
  }

  get selectedVerificadoCount(): number {
    return this.documentRows.filter((row) => row.selected && row['status'] === ESTADO.VERIFICADO).length;
  }

  get visibleSelectableElaboradoDocuments(): DocumentsRecordsRow[] {
    if (this.activeTab !== 'documents') {
      return [];
    }

    // APROBADOR selecciona Verificados — CREADOR selecciona Elaborados
    const selectableStatus = this.selectableDocumentStatus;
    if (!selectableStatus) {
      return [];
    }
    return this.paginatedRows.filter((row) => row['status'] === selectableStatus);
  }

  get allVisibleElaboradoDocumentsSelected(): boolean {
    const rows = this.visibleSelectableElaboradoDocuments;
    return rows.length > 0 && rows.every((row) => row.selected);
  }

  get someVisibleElaboradoDocumentsSelected(): boolean {
    const rows = this.visibleSelectableElaboradoDocuments;
    return rows.some((row) => row.selected) && !this.allVisibleElaboradoDocumentsSelected;
  }

  get activeColumnOptions(): DocumentsRecordsColumn[] {
    return this.activeTab === 'documents' ? this.effectiveConfig.documentColumns : this.effectiveConfig.recordColumns;
  }

  get visibleColumns(): DocumentsRecordsColumn[] {
    return this.activeColumnOptions.filter((column) => this.isColumnVisible(column.key));
  }

  get selectableColumnOptions(): DocumentsRecordsColumn[] {
    return this.activeColumnOptions.filter((column) => column.visibility !== 'internal');
  }

  get defaultColumnOptions(): DocumentsRecordsColumn[] {
    return this.selectableColumnOptions.filter((column) => column.group === 'default');
  }

  get moreColumnOptions(): DocumentsRecordsColumn[] {
    return this.selectableColumnOptions.filter((column) => column.group === 'more');
  }

  get internalColumnOptions(): DocumentsRecordsColumn[] {
    return this.activeColumnOptions.filter((column) => column.visibility === 'internal');
  }

  get allDraftColumnsSelected(): boolean {
    return this.selectableColumnOptions.every((column) => !this.draftHiddenColumns.has(column.key));
  }

  get columnsPanelDirty(): boolean {
    const hiddenColumns = this.currentHiddenColumns;
    return this.selectableColumnOptions.some((column) => hiddenColumns.has(column.key) !== this.draftHiddenColumns.has(column.key));
  }

  get verifyModalDescription(): string {
    return `Estás a punto de verificar ${this.selectedElaboradoDocuments.length} solicitudes en simultáneo.`;
  }

  get approveModalDescription(): string {
    const count = this.selectedVerificadoCount;
    return `Estás a punto de aprobar ${count} solicitud${count !== 1 ? 'es' : ''} en simultáneo.`;
  }

  get createDocumentFields(): CreateDocumentField[] {
    return [
      {
        placeholder: 'Documento',
        type: 'select',
        required: true,
        value: this.createDocumentDocument,
        options: this.effectiveConfig.createDocumentOptions[0]?.documents ?? []
      },
      {
        placeholder: 'Tipo de acción',
        type: 'select',
        required: true,
        value: this.createDocumentActionType,
        options: this.createDocumentActionTypeOptions,
        disabled: !this.createDocumentDocument
      }
    ];
  }

  get createDocumentActionTypeOptions(): string[] {
    return this.effectiveConfig.createDocumentOptions[0]?.documentOptions?.find((document) => document.label === this.createDocumentDocument)?.actionTypes || this.effectiveConfig.createDocumentOptions[0]?.actionTypes || [];
  }

  get createDocumentAcceptDisabled(): boolean {
    return !this.createDocumentDocument || !this.createDocumentActionType;
  }

  private get currentHiddenColumns(): Set<string> {
    return this.activeTab === 'documents' ? this.hiddenDocumentColumns : this.hiddenRecordColumns;
  }

  private get selectedElaboradoDocuments(): DocumentsRecordsRow[] {
    return this.documentRows.filter((row) => row.selected && row['status'] === ESTADO.ELABORADO);
  }

  private get documentsRecordsRoleMode(): DocumentsRecordsRoleMode {
    const role = this.permissionService.currentRole() as UserRole;

    if (role === 'approver') {
      return 'approver';
    }

    if (role === 'creator') {
      return 'creator';
    }

    return 'readOnly';
  }

  private get selectableDocumentStatus(): 'Elaborado' | 'Verificado' | '' {
    if (this.effectiveConfig.accionPrincipal === 'verificar') {
      return ESTADO.ELABORADO;
    }

    if (this.effectiveConfig.accionPrincipal === 'aprobar') {
      return ESTADO.VERIFICADO;
    }

    return '';
  }

  inputValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  onSearchChange(value: string): void {
    // Tipear ya no filtra: la búsqueda se aplica con Enter o la lupa. Con la
    // búsqueda en el servidor, filtrar por tecleo sería una consulta por letra.
    this.searchInput = value;
  }

  onSearchSubmit(value: string): void {
    this.searchInput = value;
    this.searchTerm = value;
    this.page = 1;
    this.emitirQueryRemota();
  }

  /** ¿La pestaña activa resuelve búsqueda/paginación en el backend? */
  private get esModoServidor(): boolean {
    return this.activeTab === 'documents'
      ? !!this.effectiveConfig.serverQuery
      : !!this.effectiveConfig.serverRecordsQuery;
  }

  /** Total remoto de la pestaña activa. */
  private get totalRemoto(): number {
    return (this.activeTab === 'documents'
      ? this.effectiveConfig.serverQuery?.total
      : this.effectiveConfig.serverRecordsQuery?.total) ?? 0;
  }

  private emitirQueryRemota(): void {
    if (!this.esModoServidor) return;
    const query = { search: this.searchTerm, page: this.page, limit: this.rowsPerPage };
    if (this.activeTab === 'documents') this.documentsQueryChange.emit(query);
    else this.recordsQueryChange.emit(query);
  }

  selectTab(tab: DocumentsRecordsTab): void {
    this.activeTab = tab;
    this.page = 1;
    // Si la pestaña destino es de modo servidor, re-consulta con la búsqueda
    // vigente: el texto aplicado acompaña al usuario entre pestañas.
    this.emitirQueryRemota();
    this.tabChange.emit(tab);
  }

  toggleRowSelection(change: DocumentsRecordsSelectionChange): void {
    if (this.selectionDisabled(change.row)) {
      change.row.selected = false;
      return;
    }

    change.row.selected = change.selected;
  }

  toggleVisibleElaboradoDocuments(selected: boolean): void {
    const selectableStatus = this.selectableDocumentStatus;

    this.paginatedRows.forEach((row) => {
      if (selectableStatus && row['status'] === selectableStatus) {
        row.selected = selected;
        return;
      }

      row.selected = false;
    });
  }

  selectionDisabled = (row: DocumentsRecordsRow): boolean => {
    if (this.activeTab !== 'documents') return false;
    const selectableStatus = this.selectableDocumentStatus;
    if (!selectableStatus) return true;

    // APROBADOR solo puede seleccionar Verificados
    // CREADOR solo puede seleccionar Elaborados
    return row['status'] !== selectableStatus;
  };

  documentRoute = (row: DocumentsRecordsRow): string => {
    if (typeof row['linkRoute'] === 'string') {
      return row['linkRoute'];
    }

    const documentOption = this.effectiveConfig.createDocumentOptions[0]?.documentOptions?.find((document) => document.label === row['document']);
    return documentOption?.route || this.config.defaultRequestRoute;
  };

  openVerifyModal(): void {
    if (!this.canVerifySelectedDocuments) {
      return;
    }

    this.closeToolbarMenus();
    this.verifyModalOpen = true;
  }

  closeVerifyModal(): void {
    this.verifyModalOpen = false;
  }

  openApproveModal(): void {
    if (!this.canApproveSelectedDocuments) return;
    this.closeToolbarMenus();
    this.approveModalOpen = true;
  }

  closeApproveModal(): void {
    this.approveModalOpen = false;
  }

  confirmApproveModal(): void {
    const selectedRows = this.documentRows.filter(row => row.selected && row['status'] === ESTADO.VERIFICADO);
    this.approveModalOpen = false;
    this.ejecutarCambioMasivo(selectedRows, 'APROBADO', ESTADO.APROBADO, 'aprobado');
  }

  confirmVerifyModal(): void {
    const selectedRows = this.selectedElaboradoDocuments;
    this.verifyModalOpen = false;
    this.ejecutarCambioMasivo(selectedRows, 'VERIFICADO', ESTADO.VERIFICADO, 'verificado');
  }

  /**
   * Ejecuta el cambio de estado REAL de las filas seleccionadas contra el
   * backend (antes solo se mutaba el status en memoria y el polling lo
   * revertía). Las filas sin documentId (módulos aún mock, ej. eventos)
   * conservan el comportamiento visual anterior.
   */
  private ejecutarCambioMasivo(
    selectedRows: DocumentsRecordsRow[],
    estadoNuevo: 'VERIFICADO' | 'APROBADO',
    statusVisual: string,
    verbo: string,
  ): void {
    if (!selectedRows.length) return;
    this.approvalSnackbarNumbers = this.formatDocumentNumbers(selectedRows.map((row) => String(row['number'] ?? '')));
    this.approvalSnackbarAction = verbo;

    const conBackend = selectedRows.filter((row) => row['documentId']);
    const soloVisual = selectedRows.filter((row) => !row['documentId']);
    soloVisual.forEach((row) => {
      row['status'] = statusVisual;
      row.selected = false;
    });

    if (!conBackend.length) {
      this.approvalSnackbarTone = 'success';
      this.approvalSnackbarError = '';
      this.approvalSnackbarOpen = true;
      return;
    }

    forkJoin(
      conBackend.map((row) =>
        this.solicitudesApi.cambiarEstado(String(row['documentId']), { estadoNuevo }),
      ),
    ).subscribe({
      next: () => {
        conBackend.forEach((row) => {
          row['status'] = statusVisual;
          row.selected = false;
        });
        this.approvalSnackbarTone = 'success';
        this.approvalSnackbarError = '';
        this.approvalSnackbarOpen = true;
        this.solicitudesFacade.recargarBandeja();
        this.cdr.markForCheck();
      },
      error: (err) => {
        const mensaje = err?.error?.message;
        this.approvalSnackbarTone = 'error';
        this.approvalSnackbarError = Array.isArray(mensaje)
          ? mensaje.join(' · ')
          : (mensaje || 'No se pudo completar la acción sobre las solicitudes seleccionadas.');
        this.approvalSnackbarOpen = true;
        // Algunas pueden haber cambiado antes del fallo: refrescar igual.
        this.solicitudesFacade.recargarBandeja();
        this.cdr.markForCheck();
      },
    });
  }

  closeApprovalSnackbar(): void {
    this.approvalSnackbarOpen = false;
  }

  toggleCreateDocumentPopover(): void {
    this.closeToolbarMenus();
    this.createDocumentPopoverOpen = !this.createDocumentPopoverOpen;
  }

  closeCreateDocumentPopover(): void {
    this.createDocumentPopoverOpen = false;
  }

  onCreateDocumentAccepted(selection?: CreateDocumentAccepted): void {
    this.closeCreateDocumentPopover();

    // Buscar la ruta en el config local por el documento seleccionado
    // (por si create-document no resuelve el documentOption correctamente)
    const selectedDocument = selection?.document || this.createDocumentDocument;
    const localDocOption = this.effectiveConfig.createDocumentOptions
      .flatMap(p => p.documentOptions ?? [])
      .find(d => d.label === selectedDocument);

    const route = localDocOption?.route || selection?.route || this.config.defaultRequestRoute;
    const actionType = selection?.actionType?.toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '');

    void this.router.navigate([route], {
      queryParams: actionType ? { actionType } : undefined,
    });
  }

  onCreateDocumentFieldChange(selection: CreateDocumentSelection): void {
    if (selection.placeholder === 'Documento') {
      this.createDocumentDocument = selection.value;
      this.createDocumentActionType = '';
      return;
    }

    if (selection.placeholder === 'Tipo de acción') {
      this.createDocumentActionType = selection.value;
    }
  }

  openCustomFilterForCreate(): void {
    this.closeToolbarMenus();
    this.editingCustomFilterId = '';
    this.customFilterInitialRows = [];
    this.customFilterOpen = true;
  }

  editCustomAppliedFilter(filter: AppliedCustomFilter): void {
    this.closeToolbarMenus();
    this.editingCustomFilterId = filter.id;
    this.customFilterInitialRows = [{ campo: filter.campo, condicion: filter.condicion, valor: filter.valor }];
    this.customFilterOpen = true;
  }

  closeCustomFilter(): void {
    this.customFilterOpen = false;
    this.editingCustomFilterId = '';
    this.customFilterInitialRows = [];
  }

  onCustomFilterApply(event: CustomFilterApplyEvent): void {
    const nextFilters = event.filters.map((filter, index) => ({
      id: this.editingCustomFilterId && index === 0 ? this.editingCustomFilterId : this.createCustomFilterId(),
      campo: filter.campo,
      campoLabel: this.getFilterCampoLabel(filter.campo),
      condicion: filter.condicion,
      valor: filter.valor
    }));

    if (this.editingCustomFilterId) {
      const updatedFilters = this.appliedCustomFilters.map((filter) => filter.id === this.editingCustomFilterId ? nextFilters[0] : filter);
      this.appliedCustomFilters = [...updatedFilters, ...nextFilters.slice(1)];
    } else {
      this.appliedCustomFilters = [...this.appliedCustomFilters, ...nextFilters];
    }

    this.page = 1;
    this.closeCustomFilter();
  }

  clearCustomAppliedFilter(id: string, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.appliedCustomFilters = this.appliedCustomFilters.filter((filter) => filter.id !== id);
    this.page = 1;
  }

  deleteEditingCustomFilter(): void {
    if (!this.editingCustomFilterId) {
      return;
    }

    this.appliedCustomFilters = this.appliedCustomFilters.filter((filter) => filter.id !== this.editingCustomFilterId);
    this.page = 1;
    this.closeCustomFilter();
  }

  // ── Handlers para los nuevos siaf-filter-pill (Estado / Tipo acción / record1 / record2) ──
  // El componente emite `''` al limpiar y el valor seleccionado al elegir.

  onStatusFilterChange(value: string): void {
    this.selectedStatusFilter = value;
    this.page = 1;
  }

  onActionTypeFilterChange(value: string): void {
    this.selectedActionTypeFilter = value;
    this.page = 1;
  }

  onRecordFilter1Change(value: string): void {
    this.selectedRecordFilter1 = value;
    this.page = 1;
  }

  onRecordFilter2Change(value: string): void {
    this.selectedRecordFilter2 = value;
    this.page = 1;
  }

  // ── Handlers para los siaf-icon-dropdown-menu del toolbar ──

  onFavoriteOption(_option: 'observed' | 'save-search'): void {
    // Stub histórico: cada opción aún no tiene comportamiento real.
  }

  onMoreOptionsAction(action: string): void {
    if (action === 'open-columns') {
      this.openColumnPanel();
    }
  }

  isColumnVisible(columnKey: string): boolean {
    const column = this.activeColumnOptions.find((option) => option.key === columnKey);
    return column?.visibility !== 'internal' && !this.currentHiddenColumns.has(columnKey);
  }

  openColumnPanel(): void {
    this.draftHiddenColumns = new Set(this.currentHiddenColumns);
    this.columnPanelOpen = true;
  }

  closeColumnPanel(): void {
    this.columnPanelOpen = false;
  }

  isDraftColumnVisible = (columnKey: string): boolean => {
    return !this.draftHiddenColumns.has(columnKey);
  };

  toggleDraftColumnVisibility(columnKey: string, event: Event): void {
    event.stopPropagation();

    if (!this.draftHiddenColumns.has(columnKey) && this.selectableColumnOptions.filter((column) => !this.draftHiddenColumns.has(column.key)).length <= 1) {
      (event.target as HTMLInputElement).checked = true;
      return;
    }

    if (this.draftHiddenColumns.has(columnKey)) {
      this.draftHiddenColumns.delete(columnKey);
    } else {
      this.draftHiddenColumns.add(columnKey);
    }
  }

  toggleAllDraftColumns(event: Event): void {
    if ((event.target as HTMLInputElement).checked) {
      this.draftHiddenColumns = new Set<string>();
      return;
    }

    const [, ...remainingColumns] = this.selectableColumnOptions;
    this.draftHiddenColumns = new Set(remainingColumns.map((column) => column.key));
  }

  applyColumnPanel(): void {
    if (this.activeTab === 'documents') {
      this.hiddenDocumentColumns = new Set(this.draftHiddenColumns);
    } else {
      this.hiddenRecordColumns = new Set(this.draftHiddenColumns);
    }

    this.closeColumnPanel();
  }

  openHistory(row: DocumentsRecordsRow): void {
    this.closeToolbarMenus();

    // Con `recordHistoryKind: 'documento'`, el historial de un registro es el de la solicitud que lo creó (su `linkRoute`).
    if (this.activeTab === 'records' && this.effectiveConfig.recordHistoryKind !== 'documento') {
      this.selectedAccountHistoryRecord = row;
      this.accountHistoryOpen = true;
      return;
    }

    // Extraer el ID de solicitud desde linkRoute (ej. "/procesos/.../solicitud/:id")
    const linkRoute = String(row['linkRoute'] ?? '');
    const solicitudId = linkRoute.split('/').pop() ?? '';
    this.selectedHistorySummary = {
      solicitudId,
      document: String(row['document'] ?? ''),
      number: String(row['number'] ?? ''),
      actionType: String(row['actionType'] ?? 'Creación'),
      // Extensión por proceso (atributos + historial pre-resuelto)
      ...((this.effectiveConfig.buildDocumentHistory?.(row) as object) ?? {}),
    };
    this.documentHistoryOpen = true;
  }

  closeAccountHistory(): void {
    this.accountHistoryOpen = false;
  }

  closeDocumentHistory(): void {
    this.documentHistoryOpen = false;
  }

  onRowsPerPageChange(value: number): void {
    this.rowsPerPage = value;
    this.page = 1;
    this.emitirQueryRemota();
  }

  onPreviousPage(): void {
    const anterior = this.page;
    this.page = Math.max(1, this.page - 1);
    if (this.page !== anterior) this.emitirQueryRemota();
  }

  onNextPage(): void {
    const anterior = this.page;
    this.page = Math.min(this.totalPages, this.page + 1);
    if (this.page !== anterior) this.emitirQueryRemota();
  }

  /**
   * Cierra los popovers controlados por el page-component cuando otro
   * popover se abre. Los menús internos de `siaf-icon-dropdown-menu` y
   * `siaf-filter-pill` manejan su propio estado y no necesitan
   * coordinarse desde aquí.
   */
  private closeToolbarMenus(): void {
    this.createDocumentPopoverOpen = false;
    this.customFilterOpen = false;
  }

  private getFilterCampoLabel(campo: string): string {
    return this.effectiveConfig.filterCampoOptions.find((option) => option.value === campo)?.label ?? campo;
  }

  private createCustomFilterId(): string {
    this.customFilterSequence += 1;
    return `custom-filter-${this.customFilterSequence}`;
  }

  private formatDocumentNumbers(numbers: string[]): string {
    if (numbers.length <= 1) {
      return numbers[0] ?? '';
    }

    if (numbers.length === 2) {
      return `${numbers[0]} y ${numbers[1]}`;
    }

    return `${numbers.slice(0, -1).join(', ')} y ${numbers[numbers.length - 1]}`;
  }

  private matchesCustomFilter(row: DocumentsRecordsRow, filter: AppliedCustomFilter): boolean {
    const rowValue = this.normalize(String(row[filter.campo] ?? ''));
    const filterValue = this.normalize(filter.valor);

    if (filter.condicion === 'neq') {
      return rowValue !== filterValue;
    }

    if (filter.condicion === 'contains') {
      return rowValue.includes(filterValue);
    }

    if (filter.condicion === 'not_contains') {
      return !rowValue.includes(filterValue);
    }

    if (filter.condicion === 'starts_with') {
      return rowValue.startsWith(filterValue);
    }

    if (filter.condicion === 'ends_with') {
      return rowValue.endsWith(filterValue);
    }

    return rowValue === filterValue;
  }

  private normalize(value: string): string {
    return value.toLocaleLowerCase();
  }

}
