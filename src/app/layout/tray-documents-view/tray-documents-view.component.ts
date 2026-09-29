import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, inject } from '@angular/core';

import { CustomFilterApplyEvent, CustomFilterComponent, FilterRow } from '../../shared/components/custom-filter/custom-filter.component';
import { FilterPillComponent } from '../../shared/components/filter-pill/filter-pill.component';
import { FlowStatusTagComponent } from '../../shared/ui/flow-status-tag/flow-status-tag.component';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { IconDropdownMenuComponent, IconDropdownMenuItem } from '../../shared/ui/icon-dropdown-menu/icon-dropdown-menu.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { RecordsSearchToolbarComponent } from '../../shared/components/records-search-toolbar/records-search-toolbar.component';
import { TableControlsComponent } from '../../shared/components/table-controls/table-controls.component';
import { SolicitudesStateService, SolicitudDemo } from '../../core/state/solicitudes-state.service';
import { SolicitudesFacadeService } from '../../core/state/solicitudes-facade.service';
import { PermissionService } from '../../core/auth/permission.service';
import { TooltipDirective } from '../../shared/ui/tooltip/tooltip.directive';
import { ESTADO, ESTADOS_RESPUESTA_APROBADOR } from '../../core/models/documento.model';

type TrayDocumentRow = {
  document: string;
  number: string;
  actionType: string;
  status: TrayDocumentStatus;
  system: string;
  date: string;
  institutionalScope: string;
  entity: string;
};

type TrayDocumentStatus = 'Elaborado' | 'Verificado' | 'Eliminado' | 'Aprobado' | 'Observado' | 'Rechazado';
type TrayTitle = 'Recibidos' | 'Enviados' | 'Borradores' | 'Papelera' | string;

type AppliedCustomFilter = {
  id: string;
  campo: keyof TrayDocumentRow;
  campoLabel: string;
  condicion: string;
  valor: string;
};

/**
 * Vista de la Bandeja de Documentos: la grilla de una sección (`title` = Recibidos, Enviados,
 * Borradores o Papelera) con buscador, filtros de Estado y Tipo de acción, filtros personalizados y favoritos.
 *
 * Las filas salen del facade de solicitudes (carga la bandeja de creador o de aprobador según el rol) y se
 * recortan con `SECTION_STATES`, que define qué estados ve cada sección; sin filtro de estado explícito
 * ordena "pendientes primero". El buscador es `siaf-records-search-toolbar`, la misma barra de Documentos y registros,
 * con los menús Campos y Favorito y el botón Más opciones proyectados: solo aplica con Enter o la lupa.
 *
 * @usar
 * - Como contenido de la Bandeja de Documentos en `siaf-app-shell`: se pinta al elegir Recibidos, Enviados, Borradores
 *   o Papelera en `siaf-tray-menu`, con esa sección en `title`.
 * - Para revisar los documentos propios según el rol: el creador ve borradores, enviados, respuestas del aprobador y
 *   eliminados; el aprobador, lo que recibe para aprobar y lo que ya respondió.
 * @evitar
 * - Para los documentos de un proceso (plan de cuentas, asientos de ajuste, catálogo de eventos…): usar
 *   `siaf-documents-records-page`, con pestañas Documentos / Registros e historial.
 * - Para la sección Notificaciones de la bandeja: usar `siaf-tray-notifications-view`.
 * - Como base de una grilla nueva: varios controles aún no hacen nada (casillas, Campos, Favorito, Más opciones,
 *   Historial e Inicio); partir de `siaf-table-controls`, `siaf-documents-records-table` y `siaf-pagination`.
 * @teclado
 * - **Enter** en el buscador: aplica la búsqueda, igual que la lupa; escribir no filtra por sí solo.
 * - **Enter / Espacio** en la X de un filtro personalizado: lo quita; sobre el resto del chip, lo abre para editarlo.
 * - **Tab**: al abrir el panel de filtros personalizados el foco entra en su primer campo, aunque se pinte después de
 *   la paginación; se cierra con Aplicar, Cancelar o Escape.
 * - Los demás controles siguen su componente: `siaf-records-search-toolbar`, `siaf-filter-pill`, `siaf-icon-dropdown-menu`,
 *   `siaf-table-controls`, `siaf-pagination` y `siaf-custom-filter`.
 * @accesibilidad
 * - **Pendiente · 1.3.1 Información y relaciones (A)**: `h1`, `h2` y `<table>` con `<th>` están bien, pero la ruta de
 *   navegación es un `nav` hecho a mano, sin `ol`/`li` ni `aria-current` (`siaf-breadcrumb` ya lo resuelve); las
 *   columnas de casilla e Historial tienen `<th>` vacío y el encabezado «Fecha de re...» viene cortado en el texto.
 * - **Pendiente · 1.4.3 Contraste mínimo (AA)**: celdas en `text-neutral-medium` sobre la superficie (14.53:1 / 12.87:1),
 *   pero la etiqueta Observado (`siaf-flow-status-tag`) queda en 3.39:1 en claro.
 * - **2.4.3 Orden del foco (A)**: el panel de filtros personalizados (`siaf-custom-filter`) recibe el foco al abrirse,
 *   cierra con Escape y lo devuelve al botón que lo abrió, aunque se pinte después de la grilla.
 * - **2.4.7 Foco visible (AA)**: los botones propios (Inicio, Más opciones, chips de filtro personalizado, «Agregar
 *   filtro personalizado» e Historial) y las casillas no tienen estilo de foco y quedan con el anillo del navegador;
 *   los controles del kit traen el suyo.
 * - **Pendiente · 2.5.8 Tamaño del objetivo (AA)**: la X para quitar un filtro personalizado mide 20 px (`size-5`) y está
 *   dentro del chip, que es otro objetivo.
 * - **Pendiente · 4.1.2 Nombre, función y valor (A)**: las casillas de fila no tienen nombre; el chip de filtro
 *   personalizado se llama siempre «Filtro personalizado aplicado» (tapa campo y valor) y su X es un `role="button"`
 *   dentro de otro `<button>`, que los lectores no anuncian bien; «Agregar filtro personalizado» no publica
 *   `aria-expanded`.
 * - **Pendiente · 4.1.3 Mensajes de estado (AA)**: buscar, filtrar o paginar cambia la grilla y el contador «1-10 de N»
 *   sin anunciarlo, y sin resultados la tabla queda vacía, sin mensaje.
 */
@Component({
  selector: 'siaf-tray-documents-view',
  standalone: true,
  imports: [CustomFilterComponent, FilterPillComponent, FlowStatusTagComponent, IconComponent, IconDropdownMenuComponent, PaginationComponent, RecordsSearchToolbarComponent, TableControlsComponent, TooltipDirective],
  template: `
    <section class="min-h-[calc(100vh-56px)] bg-[var(--sys-color-bg-surfaces-surface-lowest)]">
      <section class="bg-surface">
        <nav class="flex h-10 items-center gap-siaf-xxs px-siaf-md py-siaf-xxs text-xs" aria-label="Breadcrumb">
          <button class="inline-flex size-8 items-center justify-center rounded-siaf-md transition hover:bg-surface-muted" type="button" aria-label="Inicio">
            <siaf-icon name="home" [size]="20" />
          </button>
          <siaf-icon class="text-text-muted" name="keyboard_arrow_right" [size]="12" />
          <span class="font-medium text-[var(--sys-color-text-neutral-medium)]">Bandeja de Documentos</span>
          <siaf-icon class="text-text-muted" name="keyboard_arrow_right" [size]="12" />
          <span class="font-normal text-[var(--sys-color-text-neutral-low)]">{{ title }}</span>
        </nav>

        <header class="flex min-h-[73px] items-start border-b border-[var(--sys-color-divider-default)] px-siaf-lg py-siaf-md">
          <h1 class="m-0 min-h-6 max-w-[448px] sm:truncate text-base font-bold uppercase leading-normal tracking-[0.02px] text-text" siafTooltip>
            {{ title }}
          </h1>
        </header>
      </section>

      <section class="relative p-siaf-md">
        <article class="min-h-[808px] overflow-hidden rounded-siaf-md bg-surface">
          <header class="flex min-h-14 items-center px-siaf-lg pt-siaf-md">
            <h2 class="m-0 text-base font-bold uppercase leading-normal tracking-[0.02px] text-text">Lista de documentos</h2>
          </header>

          <div class="flex flex-col gap-siaf-lg px-siaf-lg pb-siaf-lg pt-siaf-md">
            <!-- La misma barra que Documentos y registros: Enter o la lupa confirman y los menús van proyectados. -->
            <siaf-records-search-toolbar [value]="searchTerm" placeholder="Buscar" (searchSubmit)="onSearchChange($event)">
              <ng-container actions>
                <siaf-icon-dropdown-menu icon="layers" ariaLabel="Campos" [items]="fieldsMenuOptions" (selected)="selectFieldsMenuOption($event)" />
                <siaf-icon-dropdown-menu icon="star_border" ariaLabel="Favorito" [items]="favoriteMenuOptions" (selected)="selectFavoriteOption($any($event))" />

                <button class="inline-flex size-10 items-center justify-center rounded-siaf-md transition hover:bg-surface-muted active:bg-[var(--sys-color-bg-states-light-pressed)]" type="button" aria-label="Mas opciones">
                  <siaf-icon name="more_vert" [size]="24" />
                </button>
              </ng-container>
            </siaf-records-search-toolbar>

            <div class="flex min-h-8 flex-wrap items-center gap-siaf-xs">
              <siaf-filter-pill label="Estado" [options]="statusFilterOptions" [selectedValue]="selectedStatusFilter" (selectedValueChange)="onStatusFilterChange($event)" />
              <siaf-filter-pill label="Tipo de acción" [options]="actionTypeFilterOptions" [selectedValue]="selectedActionTypeFilter" (selectedValueChange)="onActionTypeFilterChange($event)" />

              @for (filter of appliedCustomFilters; track filter.id) {
                <button class="inline-flex h-8 items-center gap-siaf-xs overflow-hidden rounded-siaf-md border border-[var(--sys-color-border-states-active)] bg-[var(--sys-color-bg-states-light-selected)] px-siaf-xs py-siaf-xxs text-sm leading-normal tracking-[0.025px] text-[var(--sys-color-text-neutral-activated)] transition hover:bg-[var(--sys-color-bg-states-light-hover)]" type="button" aria-label="Filtro personalizado aplicado" (click)="editCustomAppliedFilter(filter)">
                  <siaf-icon name="bolt" [size]="20" />
                  {{ filter.campoLabel }}: {{ filter.valor }}
                  <span class="inline-flex size-5 items-center justify-center rounded-siaf-sm" role="button" tabindex="0" aria-label="Quitar filtro personalizado" (click)="clearCustomAppliedFilter(filter.id, $event)" (keydown.enter)="clearCustomAppliedFilter(filter.id, $event)" (keydown.space)="clearCustomAppliedFilter(filter.id, $event)">
                    <siaf-icon name="close" [size]="20" />
                  </span>
                </button>
              }

              <button class="inline-flex size-8 items-center justify-center rounded-siaf-md transition hover:bg-surface-muted active:bg-[var(--sys-color-bg-states-light-pressed)]" type="button" aria-label="Agregar filtro personalizado" [class.bg-surface-muted]="customFilterOpen" (click)="openCustomFilterForCreate()">
                <siaf-icon name="add" [size]="20" />
              </button>
            </div>

            <siaf-table-controls
              selectAllLabel="Seleccionar documentos de bandeja"
              [page]="page"
              [pageSize]="rowsPerPage"
              [totalItems]="filteredRows.length"
              [totalPages]="totalPages"
              (previous)="onPreviousPage()"
              (next)="onNextPage()"
            />

            <div class="siaf-table-scroll min-w-0">
              <table class="w-full min-w-[1216px] border-collapse text-left text-sm">
                <thead>
                  <tr class="h-10 bg-[var(--sys-color-bg-surfaces-surface-high)] text-xs font-bold uppercase text-text">
                    <th class="w-12 rounded-l-siaf-sm px-siaf-sm py-siaf-sm"></th>
                    <th class="w-[260px] px-siaf-md py-siaf-sm">Documento</th>
                    <th class="w-[90px] px-siaf-md py-siaf-sm">N&uacute;mero</th>
                    <th class="w-[140px] px-siaf-md py-siaf-sm">Tipo de acci&oacute;n</th>
                    <th class="w-[120px] px-siaf-md py-siaf-sm">Estado</th>
                    <th class="w-[200px] px-siaf-md py-siaf-sm">Sistema</th>
                    <th class="w-[120px] px-siaf-md py-siaf-sm">Fecha de re...</th>
                    <th class="w-[131px] px-siaf-md py-siaf-sm">ID Entidad</th>
                    <th class="w-[286px] px-siaf-md py-siaf-sm">Entidad</th>
                    <th class="sticky right-0 w-14 rounded-r-siaf-sm bg-[var(--sys-color-bg-surfaces-surface-high)] px-siaf-sm py-siaf-sm"></th>
                  </tr>
                </thead>
                <tbody>
                  @for (row of paginatedRows; track row.document + row.number) {
                    <tr class="h-[58px] border-b border-[var(--sys-color-divider-default)] bg-surface text-[var(--sys-color-text-neutral-medium)] hover:bg-[var(--sys-color-bg-states-light-hover)]">
                      <td class="px-siaf-sm py-siaf-sm"><input class="size-4 accent-[var(--sys-color-icon-states-enabled)]" type="checkbox" /></td>
                      <td class="px-siaf-md py-siaf-sm" [class.font-bold]="$index === 0">{{ row.document }}</td>
                      <td class="px-siaf-md py-siaf-sm" [class.font-bold]="$index === 0">{{ row.number }}</td>
                      <td class="px-siaf-md py-siaf-sm" [class.font-bold]="$index === 0">{{ row.actionType }}</td>
                      <td class="px-siaf-md py-siaf-sm">
                        <siaf-flow-status-tag [status]="row.status" size="small" />
                      </td>
                      <td class="px-siaf-md py-siaf-sm" [class.font-bold]="$index === 0">{{ row.system }}</td>
                      <td class="px-siaf-md py-siaf-sm" [class.font-bold]="$index === 0">{{ row.date }}</td>
                      <td class="px-siaf-md py-siaf-sm" [class.font-bold]="$index === 0">{{ row.institutionalScope }}</td>
                      <td class="px-siaf-md py-siaf-sm" [class.font-bold]="$index === 0">{{ row.entity }}</td>
                      <td class="sticky right-0 border-l border-[var(--sys-color-divider-strong)] bg-surface px-siaf-sm py-siaf-xs">
                        <button class="inline-flex size-8 items-center justify-center rounded-siaf-md transition hover:bg-surface-muted active:bg-[var(--sys-color-bg-states-light-pressed)]" type="button" aria-label="Historial">
                          <siaf-icon name="history" [size]="20" />
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <siaf-pagination
              navigation="Activate"
              position="Bottom"
              [rowPage]="true"
              [page]="page"
              [pageSize]="rowsPerPage"
              [totalItems]="filteredRows.length"
              [totalPages]="totalPages"
              [rowsPerPage]="rowsPerPage"
              [rowsPerPageOptions]="rowsPerPageOptions"
              (previous)="onPreviousPage()"
              (next)="onNextPage()"
              (rowsPerPageChange)="onRowsPerPageChange($event)"
            />
          </div>
        </article>

        @if (customFilterOpen) {
          <button class="fixed inset-0 z-20 cursor-default bg-transparent" type="button" data-capa-cierre tabindex="-1" aria-hidden="true" (mousedown)="$event.preventDefault()" (click)="closeCustomFilter()"></button>
          <div class="fixed inset-x-siaf-md top-24 z-30 sm:absolute sm:left-[40px] sm:top-[188px] sm:w-[936px] sm:max-w-[calc(100%-80px)]" (click)="$event.stopPropagation()">
            <siaf-custom-filter
              [campoOptions]="filterCampoOptions"
              [condicionOptions]="filterCondicionOptions"
              [valorOptions]="filterValorOptions"
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
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrayDocumentsViewComponent implements OnInit, OnChanges {
  private readonly solicitudesState = inject(SolicitudesStateService);
  private readonly solicitudesFacade = inject(SolicitudesFacadeService);
  private readonly permissionService = inject(PermissionService);

  @Input() title = 'Borradores';

  customFilterOpen = false;
  selectedStatusFilter = '';
  selectedActionTypeFilter = '';
  searchTerm = '';
  appliedCustomFilters: AppliedCustomFilter[] = [];
  customFilterInitialRows: FilterRow[] = [];
  editingCustomFilterId = '';
  private customFilterSequence = 0;

  readonly rowsPerPageOptions = [10, 25, 50, 100];
  rowsPerPage = 10;
  page = 1;

  readonly filterCampoOptions = [
    { label: 'Documento', value: 'document' },
    { label: 'Numero', value: 'number' },
    { label: 'Tipo de acción', value: 'actionType' },
    { label: 'Estado', value: 'status' },
    { label: 'Sistema', value: 'system' },
    { label: 'Fecha', value: 'date' },
    { label: 'ID Entidad', value: 'institutionalScope' },
    { label: 'Entidad', value: 'entity' }
  ];

  readonly filterCondicionOptions = [
    { label: 'Es igual a', value: 'eq' },
    { label: 'No es igual a', value: 'neq' },
    { label: 'Contiene', value: 'contains' },
    { label: 'No contiene', value: 'not_contains' },
    { label: 'Empieza con', value: 'starts_with' },
    { label: 'Termina con', value: 'ends_with' }
  ];

  readonly filterValorOptions = [
    { label: ESTADO.ELABORADO, value: ESTADO.ELABORADO },
    { label: ESTADO.VERIFICADO, value: ESTADO.VERIFICADO },
    { label: ESTADO.ELIMINADO, value: ESTADO.ELIMINADO },
    { label: ESTADO.APROBADO, value: ESTADO.APROBADO },
    { label: ESTADO.OBSERVADO, value: ESTADO.OBSERVADO },
    { label: ESTADO.RECHAZADO, value: ESTADO.RECHAZADO },
    { label: 'Creacion', value: 'Creacion' },
    { label: 'Solicitud de notificacion', value: 'Solicitud de notificacion' },
    { label: 'Sistema Nacional de Contabilidad', value: 'Sistema Nacional de Contabilidad' },
    { label: '1. Institucional', value: '1. Institucional' }
  ];

  /** Menús de la barra: siaf-icon-dropdown-menu, que dibuja con siaf-menu. */
  readonly fieldsMenuOptions: IconDropdownMenuItem[] = [
    { label: 'Documento' },
    { label: 'Tipo de acción' },
    { label: 'Estado' },
    { label: 'Sistema' },
    { label: 'Fecha de registro', hasChildren: true },
    { label: 'Entidad' }
  ];

  readonly favoriteMenuOptions: IconDropdownMenuItem[] = [
    { label: 'Solicitudes observadas', value: 'observed', divider: true },
    { label: 'Guardar búsqueda actual', value: 'save-search' },
  ];

  /** Estados visibles por sección y rol — define qué muestra cada bandeja. */
  private readonly SECTION_STATES: Record<string, Record<string, TrayDocumentStatus[]>> = {
    creator: {
      Recibidos:  ESTADOS_RESPUESTA_APROBADOR,
      Enviados:   [ESTADO.VERIFICADO],
      Borradores: [ESTADO.ELABORADO],
      Papelera:   [ESTADO.ELIMINADO],
    },
    approver: {
      Recibidos: [ESTADO.VERIFICADO],
      Enviados:  ESTADOS_RESPUESTA_APROBADOR,
    },
  };

  get statusFilterOptions(): TrayDocumentStatus[] {
    const role = this.permissionService.currentRole();
    const roleKey = role === 'approver' ? 'approver' : 'creator';
    return this.SECTION_STATES[roleKey][this.title] ?? [];
  }

  readonly actionTypeFilterOptions = ['Creacion'];

  /** Pendientes primero: Observado/Rechazado arriba en Recibidos del creador; Verificado arriba para el aprobador. */
  private readonly STATUS_PRIORITY_BY_ROLE: Record<string, Record<string, number>> = {
    approver: { Verificado: 0, Observado: 1, Aprobado: 2, Rechazado: 3 },
    creator:  { Observado: 0, Rechazado: 1, Elaborado: 2, Verificado: 3, Aprobado: 4, Eliminado: 5 },
  };

  readonly rows: TrayDocumentRow[] = [];

  get filteredRows(): TrayDocumentRow[] {
    const filtered = this.rowsForCurrentTray.filter((row) => {
      const normalizedSearch = this.normalize(this.searchTerm);
      const matchesSearch = !normalizedSearch || this.normalize(Object.values(row).join(' ')).includes(normalizedSearch);
      const matchesStatus = !this.selectedStatusFilter || row.status === this.selectedStatusFilter;
      const matchesActionType = !this.selectedActionTypeFilter || row.actionType === this.selectedActionTypeFilter;
      const matchesCustomFilters = this.appliedCustomFilters.every((filter) => this.matchesCustomFilter(row, filter));

      return matchesSearch && matchesStatus && matchesActionType && matchesCustomFilters;
    });

    // Pendientes primero según el rol (cuando no hay filtro de estado explícito)
    if (!this.selectedStatusFilter) {
      const role = this.permissionService.currentRole();
      const priority = this.STATUS_PRIORITY_BY_ROLE[role] ?? {};
      const fallback = 99;
      return [...filtered].sort((a, b) => (priority[a.status] ?? fallback) - (priority[b.status] ?? fallback));
    }

    return filtered;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredRows.length / this.rowsPerPage));
  }

  get paginatedRows(): TrayDocumentRow[] {
    const start = (this.page - 1) * this.rowsPerPage;
    return this.filteredRows.slice(start, start + this.rowsPerPage);
  }

  ngOnInit(): void {
    this.cargarBandeja();
  }

  ngOnChanges(): void {
    // Resetea filtros activos al cambiar de sección (Recibidos → Enviados, etc.)
    this.selectedStatusFilter = '';
    this.selectedActionTypeFilter = '';
    this.searchTerm = '';
    this.page = 1;
  }

  private cargarBandeja(): void {
    const role = this.permissionService.currentRole();
    if (role === 'approver') {
      this.solicitudesFacade.cargarBandejaAprobador();
    } else {
      this.solicitudesFacade.cargarBandejaCreador();
    }
  }

  get rowsForCurrentTray(): TrayDocumentRow[] {
    const role = this.permissionService.currentRole();
    const roleKey = role === 'approver' ? 'approver' : 'creator';
    const solicitudes = role === 'approver'
      ? this.solicitudesState.bandejaAprobador()
      : this.solicitudesState.bandejaCreador();

    const allowedStates = this.SECTION_STATES[roleKey][this.title];
    const filtered = allowedStates
      ? solicitudes.filter(s => allowedStates.includes(s.estado as TrayDocumentStatus))
      : solicitudes;

    return filtered.map(s => this.mapSolicitudToRow(s));
  }

  private mapSolicitudToRow(s: SolicitudDemo): TrayDocumentRow {
    return {
      document: s.tipoDocumento,
      number: s.numero || '-',
      actionType: s.tipoAccion,
      status: s.estado as TrayDocumentStatus,
      system: 'Sistema Nacional de Contabilidad',
      date: s.fecha,
      institutionalScope: s.cuentas[0]?.institutionalScopes || '-',
      entity: s.entidad,
    };
  }

  selectFieldsMenuOption(option: string): void {
    void option;
  }

  inputValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  /** Búsqueda confirmada con Enter o la lupa de `siaf-records-search-toolbar`; escribir no filtra. */
  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.page = 1;
  }

  selectFavoriteOption(option: 'observed' | 'save-search'): void {
    void option;
  }

  /** `siaf-filter-pill` emite el estado elegido, o '' al quitar el filtro. */
  onStatusFilterChange(status: string): void {
    this.selectedStatusFilter = status;
    this.page = 1;
  }

  onActionTypeFilterChange(actionType: string): void {
    this.selectedActionTypeFilter = actionType;
    this.page = 1;
  }

  openCustomFilterForCreate(): void {
    this.closeInlineMenus();
    this.editingCustomFilterId = '';
    this.customFilterInitialRows = [];
    this.customFilterOpen = true;
  }

  editCustomAppliedFilter(filter: AppliedCustomFilter): void {
    this.closeInlineMenus();
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
      campo: filter.campo as keyof TrayDocumentRow,
      campoLabel: this.getFilterCampoLabel(filter.campo),
      condicion: filter.condicion,
      valor: filter.valor
    }));

    if (this.editingCustomFilterId) {
      const updatedFilters = this.appliedCustomFilters.map((filter) =>
        filter.id === this.editingCustomFilterId ? nextFilters[0] : filter
      );
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

  onRowsPerPageChange(value: number): void {
    this.rowsPerPage = value;
    this.page = 1;
  }

  onPreviousPage(): void {
    this.page = Math.max(1, this.page - 1);
  }

  onNextPage(): void {
    this.page = Math.min(this.totalPages, this.page + 1);
  }

  private closeInlineMenus(): void {
    this.customFilterOpen = false;
  }

  private getFilterCampoLabel(campo: string): string {
    return this.filterCampoOptions.find((option) => option.value === campo)?.label ?? campo;
  }

  private createCustomFilterId(): string {
    this.customFilterSequence += 1;
    return `tray-custom-filter-${this.customFilterSequence}`;
  }

  private matchesCustomFilter(row: TrayDocumentRow, filter: AppliedCustomFilter): boolean {
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
