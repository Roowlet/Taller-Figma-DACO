import { ChangeDetectionStrategy, Component, Input, inject, signal } from '@angular/core';

import { CurrentUserService } from '../../../core/auth/current-user.service';
import { AccountHistoryPanelComponent } from '../../../shared/components/account-history-panel/account-history-panel.component';
import { AsientoHistoryPanelComponent } from '../../../shared/components/asiento-history-panel/asiento-history-panel.component';
import { DetailHistoryEntry, DetailHistoryTabsComponent } from '../../../shared/components/detail-history-tabs/detail-history-tabs.component';
import { DocumentHistoryPanelComponent, DocumentHistorySummary } from '../../../shared/components/document-history-panel/document-history-panel.component';
import { TimelineComponent, TimelineItem } from '../../../shared/components/timeline/timeline.component';
import { ActionTrackerComponent, ActionTrackerSummary } from '../../../shared/ui/action-tracker/action-tracker.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { StepItem, StepsComponent } from '../../../shared/ui/steps/steps.component';
import {
  HISTORIAL_DOCUMENTO_DE_MUESTRA,
  PROVEEDORES_HISTORIAL_DE_MUESTRA,
  REGISTRO_ASIENTO_DE_MUESTRA,
  REGISTRO_CUENTA_DE_MUESTRA,
  sembrarSesionDeMuestra,
} from './datos-de-muestra';

/**
 * Ejemplos en vivo de la categoría Trazabilidad del documento. Los paneles de historial
 * piden sus datos a la API: aquí la reciben de `datos-de-muestra.ts`, sin tocar la red.
 */
@Component({
  selector: 'ui-kit-ejemplos-trazabilidad',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: PROVEEDORES_HISTORIAL_DE_MUESTRA,
  imports: [
    AccountHistoryPanelComponent, ActionTrackerComponent, AsientoHistoryPanelComponent, ButtonComponent, DetailHistoryTabsComponent,
    DocumentHistoryPanelComponent, StepsComponent, TimelineComponent,
  ],
  template: `
    @switch (selector) {
      @case ('siaf-action-tracker') {
        <siaf-action-tracker [showSummaryCards]="true" [showTabs]="false" [summaryItems]="seguimiento" />
      }
      @case ('siaf-detail-history-tabs') {
        <siaf-detail-history-tabs [entries]="historial" />
      }
      @case ('siaf-document-history-panel') {
        <siaf-button data-ui-kit-abrir variant="secondary" icon="history" (click)="panel.set('documento')">Ver historial del documento</siaf-button>
        <siaf-document-history-panel [open]="panel() === 'documento'" [summary]="resumenDocumento" (closed)="panel.set(null)" />
      }
      @case ('siaf-account-history-panel') {
        <siaf-button data-ui-kit-abrir variant="secondary" icon="history" (click)="panel.set('cuenta')">Ver historial de la cuenta</siaf-button>
        <siaf-account-history-panel [open]="panel() === 'cuenta'" [record]="registroCuenta" (closed)="panel.set(null)" />
      }
      @case ('siaf-asiento-history-panel') {
        <siaf-button data-ui-kit-abrir variant="secondary" icon="history" (click)="panel.set('asiento')">Ver historial del asiento</siaf-button>
        <siaf-asiento-history-panel [open]="panel() === 'asiento'" [record]="registroAsiento" (closed)="panel.set(null)" />
      }
      @case ('siaf-timeline') {
        <div class="flex flex-col gap-3 rounded-siaf-md bg-[var(--sys-color-bg-surfaces-surface-lowest)] p-3">
          <siaf-timeline
            title="Seguimiento del proceso inventario masivo de existencias 2026"
            processName="Proceso inventario masivo de existencias"
            itemLabel="procedimiento"
            itemsLabel="procedimientos"
            [items]="hitosInventario"
            [current]="hitoActual()"
            (detail)="detalles.set(detalles() + 1)"
          />
        </div>
        <div class="mt-3 flex flex-wrap items-center gap-2 text-xs text-text-muted">
          <span>Hito en curso:</span>
          <siaf-button size="sm" variant="secondary" [disabled]="hitoActual() < 0" (click)="hitoActual.set(hitoActual() - 1)">Retroceder</siaf-button>
          <siaf-button size="sm" variant="secondary" [disabled]="hitoActual() >= hitosInventario.length" (click)="hitoActual.set(hitoActual() + 1)">Avanzar</siaf-button>
          <span aria-live="polite">{{ hitoActual() + 1 }} de {{ hitosInventario.length }} · «Ver detalle» pulsado {{ detalles() }} {{ detalles() === 1 ? 'vez' : 'veces' }}</span>
        </div>
      }
      @case ('siaf-steps') {
        <p class="mb-2 text-[11px] font-bold uppercase tracking-widest text-text-muted">Horizontal (por defecto)</p>
        <siaf-steps [steps]="pasos" [activeStep]="pasoActivo()" />

        <div class="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <p class="mb-2 text-[11px] font-bold uppercase tracking-widest text-text-muted">Vertical · size="default"</p>
            <siaf-steps orientation="vertical" [steps]="pasos" [activeStep]="pasoActivo()" />
          </div>
          <div>
            <p class="mb-2 text-[11px] font-bold uppercase tracking-widest text-text-muted">Vertical · size="small"</p>
            <siaf-steps orientation="vertical" size="small" [steps]="pasos" [activeStep]="pasoActivo()" />
          </div>
        </div>

        <div class="mt-3 flex flex-wrap items-center gap-2 text-xs text-text-muted">
          <span>Paso activo:</span>
          <siaf-button size="sm" variant="secondary" [disabled]="pasoActivo() <= 1" (click)="pasoActivo.set(pasoActivo() - 1)">Anterior</siaf-button>
          <siaf-button size="sm" variant="secondary" [disabled]="pasoActivo() >= pasos.length" (click)="pasoActivo.set(pasoActivo() + 1)">Siguiente</siaf-button>
          <span aria-live="polite">{{ pasoActivo() }} de {{ pasos.length }}</span>
        </div>

        <p class="mb-2 mt-6 text-[11px] font-bold uppercase tracking-widest text-text-muted">Vertical con tarjetas · variant="cards"</p>
        <!-- Versiones de un registro: cada paso es un siaf-stepper-card; la elegida va con sombra, barra y punto azul. -->
        <siaf-steps variant="cards" [steps]="versiones" [(activeStep)]="versionElegida" />
        <p class="mt-2 text-xs text-text-muted" aria-live="polite">Versión elegida: {{ versiones[versionElegida() - 1].label }}</p>
      }
    }
  `,
})
export class EjemplosTrazabilidadComponent {
  static readonly selectores = [
    'siaf-action-tracker', 'siaf-detail-history-tabs', 'siaf-document-history-panel', 'siaf-account-history-panel',
    'siaf-asiento-history-panel', 'siaf-timeline', 'siaf-steps',
  ];
  @Input({ required: true }) selector!: string;

  constructor() {
    sembrarSesionDeMuestra(inject(CurrentUserService));
  }

  readonly panel = signal<'documento' | 'cuenta' | 'asiento' | null>(null);
  readonly registroCuenta = REGISTRO_CUENTA_DE_MUESTRA;
  readonly registroAsiento = REGISTRO_ASIENTO_DE_MUESTRA;
  readonly resumenDocumento: DocumentHistorySummary = {
    solicitudId: 'doc-scc-1',
    document: 'Solicitud de cuenta contable',
    number: 'PCC-SCC-00001-2026-MEF-DGCP',
    actionType: 'Creación',
    staticRows: HISTORIAL_DOCUMENTO_DE_MUESTRA,
  };

  readonly seguimiento: ActionTrackerSummary[] = [
    { label: 'Elaborado por', actionBy: 'Juan Carlos Pérez', date: '15/01/2026 10:00' },
    { label: 'Verificado por', actionBy: 'Miguel Ángel Rojas', date: '18/01/2026 09:20' },
    { label: 'Aprobado por', actionBy: '', date: '' },
  ];

  readonly historial: DetailHistoryEntry[] = [
    { iteracion: 1, proceso: 'Elaborar', comentario: '', descripcion: 'Documento creado', fecha: '15/01/2026', hora: '10:00', rol: 'Creador', usuario: 'Juan Carlos Pérez' },
    { iteracion: 1, proceso: 'Verificar', comentario: 'Conforme', descripcion: 'Documento verificado', fecha: '18/01/2026', hora: '09:20', rol: 'Creador', usuario: 'Juan Carlos Pérez' },
  ];

  /** Hitos de muestra del timeline: los de la pantalla de Control de Inventarios (Figma), 9 de 11 cumplidos. */
  readonly hitosInventario: TimelineItem[] = [
    { label: 'Comisión de Inventario', date: '10/10/25', dateInfo: 'Aprobado', description: 'Comisión de Inventario 2025-01 (UE026–UE028).' },
    { label: 'Plan de Inventario', date: '20/10/25', dateInfo: 'Aprobado', description: '2 Planes de inventario físico por almacén. 2 cronogramas de actividades de conciliación.' },
    { label: 'Toma de Inventario', date: '03/01/26', dateInfo: 'Aprobado', description: '5,000 ítems inventariados' },
    { label: 'Cierre de Toma de Inventario', date: '08/01/26', dateInfo: 'Aprobado', description: '5,000 ítems verificados y cerrados' },
    { label: 'Validación de la Toma de Inventario', date: '08/01/26', dateInfo: 'Aprobado', description: '80 ítems con diferencias en cantidades, 20 en atributos y 4,950 sin diferencias.' },
    { label: 'Asignación de ubicaciones', date: '09/01/26', dateInfo: 'Aprobado', description: '20 ubicaciones asignadas en 2 almacenes para Conteo focalizado.' },
    { label: 'Conteo focalizado', date: '09/01/26', dateInfo: 'Aprobado', description: 'Conteo de 1,000 ítems con diferencias.' },
    { label: 'Cierre de Conteo focalizado', date: '10/10/25', dateInfo: 'Aprobado', description: '1,000 ítems con diferencias verificados y cerrados.' },
    { label: 'Conciliación Física', date: '10/10/25', dateInfo: 'Aprobado', description: 'Conciliación física de 50 ítems.' },
    { label: 'Conciliación Contable' },
    { label: 'Informe Final de Toma de Inventario' },
  ];
  readonly hitoActual = signal(9);
  readonly detalles = signal(0);

  readonly pasos: StepItem[] = [
    { label: 'Elaborado', description: 'Registro inicial' },
    { label: 'Verificado', description: 'Revisión del creador' },
    { label: 'Aprobado', description: 'Firma del aprobador' },
    { label: 'Registrado', description: 'Pasa al catálogo' },
    { label: 'Publicado', description: 'Visible en la app' },
  ];
  readonly pasoActivo = signal(1);
  /** Más nueva arriba, como un historial: dos modificaciones y la creación. */
  readonly versiones: StepItem[] = [
    { label: 'Modificación 02', fields: [{ label: 'N° modificación', value: '02' }, { label: 'Tipo de acción', value: 'Modificación' }, { label: 'Fecha', value: '19/08/25 08:00:59' }] },
    { label: 'Modificación 01', fields: [{ label: 'N° modificación', value: '01' }, { label: 'Tipo de acción', value: 'Modificación' }, { label: 'Fecha', value: '19/08/25 08:00:59' }] },
    { label: 'Creación 0001', fields: [{ label: 'N° creación', value: '0001' }, { label: 'Tipo de acción', value: 'Creación' }, { label: 'Fecha', value: '19/08/25 08:00:59' }] },
  ];
  readonly versionElegida = signal(1);
}
