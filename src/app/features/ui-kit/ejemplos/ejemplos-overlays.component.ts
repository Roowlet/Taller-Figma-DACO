import { ChangeDetectionStrategy, Component, Input, computed, signal } from '@angular/core';

import { QueryParametersPanelComponent } from '../../../shared/components/query-parameters-panel/query-parameters-panel.component';
import type { QueryReportParameters } from '../../../shared/types/query-report.types';
import { CAMPOS_PARAMETROS_DE_MUESTRA } from './reporte-de-muestra';
import { RequestApprovalModalsComponent } from '../../../shared/components/request-approval-modals/request-approval-modals.component';
import { SelectionColumn, SelectionSideNavComponent } from '../../../shared/components/selection-side-nav/selection-side-nav.component';
import { TimelineDetailPanelComponent } from '../../../shared/components/timeline/timeline-detail-panel.component';
import { TimelineItem } from '../../../shared/components/timeline/timeline.model';
import { DocumentsRecordsColumn } from '../../../shared/types/documents-records.types';
import { AnnulmentModalComponent, AnnulmentRequest } from '../../../shared/ui/annulment-modal/annulment-modal.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { ColumnVisibilityPanelComponent } from '../../../shared/ui/column-visibility-panel/column-visibility-panel.component';
import { FocoDirective } from '../../../shared/ui/foco/foco.directive';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { SideNavComponent } from '../../../shared/ui/side-nav/side-nav.component';
import { SidePanelComponent } from '../../../shared/ui/side-panel/side-panel.component';
import { TextFieldComponent, TextFieldOption } from '../../../shared/ui/text-field/text-field.component';
import { UploadSideNavComponent } from '../../../shared/ui/upload-side-nav/upload-side-nav.component';

interface CuentaEjemplo {
  id: string;
  codigo: string;
  nombre: string;
}

/** Ejemplos en vivo de la categoría Overlays: cada uno se abre con un botón para no tapar el catálogo. */
@Component({
  selector: 'ui-kit-ejemplos-overlays',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AnnulmentModalComponent, ButtonComponent, ColumnVisibilityPanelComponent, FocoDirective, ModalComponent, QueryParametersPanelComponent,
    RequestApprovalModalsComponent, SelectionSideNavComponent, SideNavComponent, SidePanelComponent, TextFieldComponent, TimelineDetailPanelComponent,
    UploadSideNavComponent,
  ],
  template: `
    @switch (selector) {
      @case ('siaf-modal') {
        <div class="flex flex-wrap gap-3">
          <siaf-button variant="secondary" (click)="modal.set('save')">Grabar</siaf-button>
          <siaf-button variant="filled" (click)="modal.set('delete-request')">Eliminar</siaf-button>
        </div>
        <siaf-modal
          [open]="modal() !== null"
          [variant]="modal() ?? 'save'"
          (confirmed)="modal.set(null)"
          (canceled)="modal.set(null)"
          (closed)="modal.set(null)"
        />
      }
      @case ('siaf-request-approval-modals') {
        <div class="flex flex-wrap gap-3">
          <siaf-button variant="secondary" (click)="verificar.set(true)">Verificar</siaf-button>
          <siaf-button (click)="aprobar.set(true)">Aprobar</siaf-button>
        </div>
        <siaf-request-approval-modals
          requestType="Solicitud de cuenta contable"
          requestNumber="0001"
          [verifyOpen]="verificar()"
          [approveOpen]="aprobar()"
          (verifyClosed)="verificar.set(false)"
          (verifyConfirmed)="verificar.set(false)"
          (approvalClosed)="aprobar.set(false)"
          (approveConfirmed)="aprobar.set(false)"
        />
      }
      @case ('siaf-annulment-modal') {
        <siaf-button variant="filled" (click)="anulacion.set(true)">Anular documento</siaf-button>
        <siaf-annulment-modal [open]="anulacion()" (closed)="anulacion.set(false)" (accepted)="anular($event)" />
        <p class="mt-2 text-xs text-text-muted" aria-live="polite">
          Escribe el detalle y carga un .pdf para habilitar «Aceptar».@if (anulacionEnviada()) { {{ anulacionEnviada() }} }
        </p>
      }
      @case ('[siafFoco]') {
        <siaf-button variant="secondary" icon="keyboard" (click)="dialogoFoco.set(true)">Abrir diálogo de prueba</siaf-button>
        <p class="mt-2 text-xs text-text-muted">Con teclado: el foco entra al campo, Tab da la vuelta entre los controles y Escape cierra y devuelve el foco a este botón.</p>
        @if (dialogoFoco()) {
          <div class="fixed inset-0 z-50 grid place-items-center bg-black/40 p-siaf-md" role="presentation" (click)="dialogoFoco.set(false)">
            <section
              class="flex w-full max-w-[420px] flex-col gap-siaf-md rounded-siaf-md bg-surface p-siaf-lg shadow-siaf-lg"
              role="dialog"
              aria-modal="true"
              aria-labelledby="ejemplo-foco-titulo"
              siafFoco
              (siafFocoEscape)="dialogoFoco.set(false)"
              (click)="$event.stopPropagation()"
            >
              <h2 id="ejemplo-foco-titulo" class="m-0 text-base font-bold text-text">Renombrar documento</h2>
              <siaf-input label="Nombre" data-foco-inicial value="Solicitud de cuenta contable" />
              <div class="flex justify-end gap-siaf-xs">
                <siaf-button variant="secondary" (click)="dialogoFoco.set(false)">Cancelar</siaf-button>
                <siaf-button (click)="dialogoFoco.set(false)">Guardar</siaf-button>
              </div>
            </section>
          </div>
        }
      }
      @case ('siaf-side-nav') {
        <siaf-button variant="secondary" (click)="panel.set(true)">Abrir side nav</siaf-button>
        <siaf-side-nav title="Detalle del registro" [open]="panel()" (closed)="panel.set(false)" (confirmed)="panel.set(false)">
          <p class="m-0 text-sm text-[var(--sys-color-text-neutral-medium)]">Contenido proyectado en el side nav: un detalle breve o un formulario corto.</p>
        </siaf-side-nav>
      }
      @case ('siaf-side-panel') {
        <div class="flex flex-wrap gap-3">
          <siaf-button variant="secondary" (click)="abrirSidePanel(false)">Abrir side panel</siaf-button>
          <siaf-button variant="secondary" icon="filter_list" (click)="abrirSidePanel(true)">Con panel de filtros</siaf-button>
        </div>
        <siaf-side-panel
          title="Movimientos de la cuenta"
          [open]="sidePanel()"
          [showNav]="sidePanelFiltros()"
          (closed)="sidePanel.set(false)"
          (confirmed)="sidePanel.set(false)"
          (navCanceled)="eventoSidePanel.set('Emitió «navCanceled».')"
          (navConfirmed)="eventoSidePanel.set('Emitió «navConfirmed»: la pantalla filtra el contenido.')"
        >
          <p class="m-0 text-sm text-[var(--sys-color-text-neutral-medium)]">
            Contenido a todo el ancho: una tabla grande, la vista previa de un documento o un detalle con muchas columnas.
          </p>
          <div class="flex flex-col gap-siaf-lg" sidePanelNav>
            <siaf-input label="Tipo de operación" type="select" [options]="operacionesFiltro" />
            <siaf-input label="Documento" />
          </div>
        </siaf-side-panel>
        <p class="mt-2 text-xs text-text-muted" aria-live="polite">{{ eventoSidePanel() }}</p>
      }
      @case ('siaf-selection-side-nav') {
        <siaf-button variant="secondary" icon="search" (click)="seleccion.set(true)">Seleccionar cuenta contable</siaf-button>
        <siaf-selection-side-nav
          title="Seleccionar cuenta contable"
          mode="single"
          idKey="id"
          [open]="seleccion()"
          [columns]="columnasCuenta"
          [rows]="cuentas"
          [selectedIds]="cuentasElegidas()"
          (selectionChange)="cuentasElegidas.set($event)"
          (accepted)="seleccion.set(false)"
          (closed)="seleccion.set(false)"
        />
      }
      @case ('siaf-timeline-detail-panel') {
        <siaf-button variant="secondary" icon="timeline" (click)="detalleSeguimiento.set(true)">Ver detalle del seguimiento</siaf-button>
        <siaf-timeline-detail-panel
          [open]="detalleSeguimiento()"
          processName="Proceso de cierre contable 2025"
          itemLabel="etapa"
          itemsLabel="etapas"
          [items]="etapasCierre"
          [current]="2"
          (closed)="detalleSeguimiento.set(false)"
        />
        <p class="mt-2 text-xs text-text-muted">También lo abre «Ver detalle» de <code class="font-mono">siaf-timeline</code>.</p>
      }
      @case ('siaf-upload-side-nav') {
        <siaf-button variant="secondary" icon="upload_file" (click)="cargaAbierta.set(true)">Cargar documento</siaf-button>
        <siaf-upload-side-nav
          [open]="cargaAbierta()"
          title="Cargar documento de sustento"
          description="Sube un archivo .PDF en el formato correcto."
          acceptedLabel="Solo admite archivos .pdf"
          hint="Archivos de hasta 10 MB"
          (closed)="cargaAbierta.set(false)"
          (confirmed)="cargaAbierta.set(false)"
        />
      }
      @case ('siaf-column-visibility-panel') {
        <siaf-button variant="secondary" icon="view_column" (click)="columnasAbierto.set(true)">Configurar columnas</siaf-button>
        <siaf-column-visibility-panel
          [open]="columnasAbierto()"
          [defaultColumns]="columnasBase"
          [moreColumns]="columnasExtra"
          [isColumnVisible]="columnaVisible"
          (closed)="columnasAbierto.set(false)"
          (applied)="columnasAbierto.set(false)"
        />
      }
      @case ('siaf-query-parameters-panel') {
        <siaf-button variant="secondary" icon="manage_search" (click)="parametrosAbierto.set(true)">Parámetros de consulta</siaf-button>
        <siaf-query-parameters-panel
          [open]="parametrosAbierto()"
          [fields]="camposParametros"
          [values]="parametrosAplicados()"
          (closed)="parametrosAbierto.set(false)"
          (applied)="parametrosAplicados.set($event); parametrosAbierto.set(false)"
        />
        <p class="mt-2 text-xs text-text-muted" aria-live="polite">
          Las dos fechas son obligatorias.@if (parametrosAplicados()) { Emitió «applied» con {{ resumenParametros() }}. }
        </p>
      }
    }
  `,
})
export class EjemplosOverlaysComponent {
  static readonly selectores = [
    'siaf-modal', 'siaf-request-approval-modals', 'siaf-annulment-modal', 'siaf-side-nav', 'siaf-side-panel',
    'siaf-selection-side-nav', 'siaf-upload-side-nav', 'siaf-timeline-detail-panel', 'siaf-column-visibility-panel',
    'siaf-query-parameters-panel', '[siafFoco]',
  ];

  readonly camposParametros = CAMPOS_PARAMETROS_DE_MUESTRA;
  readonly parametrosAbierto = signal(false);
  readonly parametrosAplicados = signal<QueryReportParameters | null>(null);
  readonly resumenParametros = computed(() =>
    Object.entries(this.parametrosAplicados() ?? {})
      .map(([clave, valor]) => `${clave}: ${Array.isArray(valor) ? valor.join(', ') : valor}`)
      .join(' · '),
  );

  readonly detalleSeguimiento = signal(false);
  readonly etapasCierre: TimelineItem[] = [
    { label: 'Registro de operaciones del periodo', date: '05/01/26', dateInfo: 'Aprobado', description: '1,240 asientos registrados.' },
    { label: 'Asientos de ajuste', date: '12/01/26', dateInfo: 'Aprobado', description: '36 asientos de ajuste aprobados.' },
    { label: 'Conciliación de cuentas' },
    { label: 'Estados financieros' },
  ];
  @Input({ required: true }) selector!: string;

  readonly modal = signal<'save' | 'delete-request' | null>(null);
  readonly anulacion = signal(false);
  readonly anulacionEnviada = signal('');
  readonly verificar = signal(false);
  readonly aprobar = signal(false);
  readonly panel = signal(false);
  readonly sidePanel = signal(false);
  readonly sidePanelFiltros = signal(false);
  readonly eventoSidePanel = signal('');
  readonly operacionesFiltro: TextFieldOption[] = [
    { label: '1 - Saldos Iniciales', value: '1' },
    { label: '2 - Reporte de Recaudación SUNAT', value: '2' },
  ];

  abrirSidePanel(conFiltros: boolean): void {
    this.sidePanelFiltros.set(conFiltros);
    this.eventoSidePanel.set('');
    this.sidePanel.set(true);
  }
  readonly dialogoFoco = signal(false);
  readonly seleccion = signal(false);
  readonly cuentasElegidas = signal<string[]>([]);
  readonly cargaAbierta = signal(false);
  readonly columnasAbierto = signal(false);

  readonly columnasCuenta: SelectionColumn<CuentaEjemplo>[] = [
    { key: 'codigo', label: 'Código', widthClass: 'w-[120px]', cellClass: 'font-mono' },
    { key: 'nombre', label: 'Denominación' },
  ];
  readonly cuentas: CuentaEjemplo[] = [
    { id: 'c1', codigo: '1101.01', nombre: 'Caja M/N' },
    { id: 'c2', codigo: '1101.02', nombre: 'Caja M/E' },
    { id: 'c3', codigo: '2101.01', nombre: 'Cuentas por pagar' },
  ];

  readonly columnasBase: DocumentsRecordsColumn[] = [
    { key: 'number', label: 'N° documento', visibility: 'visible', group: 'default' },
    { key: 'status', label: 'Estado', visibility: 'visible', group: 'default' },
  ];
  readonly columnasExtra: DocumentsRecordsColumn[] = [
    { key: 'creator', label: 'Elaborado por', visibility: 'hidden', group: 'more' },
    { key: 'entity', label: 'Entidad', visibility: 'hidden', group: 'more' },
  ];
  readonly columnaVisible = (clave: string): boolean => clave === 'number' || clave === 'status';

  anular(solicitud: AnnulmentRequest): void {
    this.anulacion.set(false);
    this.anulacionEnviada.set(`Emitió «accepted» con el detalle «${solicitud.detail}» y ${solicitud.file.name}.`);
  }
}
