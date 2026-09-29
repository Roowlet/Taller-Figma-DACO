import { ChangeDetectionStrategy, Component, Input, inject, signal } from '@angular/core';

import { CurrentUserService } from '../../../core/auth/current-user.service';
import { PermissionService } from '../../../core/auth/permission.service';

import { DocumentsRecordsPageComponent } from '../../../shared/components/documents-records-page/documents-records-page.component';
import { QueryReportExportEvent, QueryReportPageComponent } from '../../../shared/components/query-report-page/query-report-page.component';
import type { QueryReportResult } from '../../../shared/types/query-report.types';
import { BANDEJA_CONFIG_DE_MUESTRA, PROVEEDORES_BANDEJA_DE_MUESTRA, sembrarSesionDeMuestra } from './datos-de-muestra';
import { CONFIG_REPORTE_DE_MUESTRA, FILAS_REPORTE_DE_MUESTRA, RESULTADO_REPORTE_DE_MUESTRA } from './reporte-de-muestra';

/**
 * Ejemplos en vivo de la categoría Plantillas de pantalla: flujos completos que cada proceso arma
 * solo con su configuración. La pantalla de bandeja recibe esa configuración y sus servicios de
 * `datos-de-muestra.ts`, con la sesión sembrada, así que no toca la API. La de Consultas y reportes
 * no llama a la API: el ejemplo le entrega el resultado de `reporte-de-muestra.ts` al aplicar.
 */
@Component({
  selector: 'ui-kit-ejemplos-plantillas',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: PROVEEDORES_BANDEJA_DE_MUESTRA,
  imports: [DocumentsRecordsPageComponent, QueryReportPageComponent],
  template: `
    @switch (selector) {
      @case ('siaf-documents-records-page') {
        <div class="overflow-hidden rounded-siaf-md border border-border [transform:translateZ(0)]">
          <siaf-documents-records-page [config]="bandeja" />
        </div>
      }
      @case ('siaf-query-report-page') {
        <!-- translateZ(0) contiene el panel de parámetros (fixed) dentro del marco del ejemplo. -->
        <div class="overflow-hidden rounded-siaf-md border border-border [transform:translateZ(0)]">
          <siaf-query-report-page
            [config]="reporte"
            [result]="resultadoReporte()"
            (queried)="consultar()"
            (tabChanged)="evento.set('Emitió «tabChanged»: la pantalla entrega el resultado de esa pestaña.')"
            (exported)="exportar($event)"
            (favoritesRequested)="evento.set('Emitió «favoritesRequested»: el panel de favoritos llega en otra tanda.')"
            (advancedFiltersRequested)="evento.set('Emitió «advancedFiltersRequested»: Filtros avanzados llega en otra tanda.')"
            (columnsRequested)="evento.set('Emitió «columnsRequested»: Columnas visibles llega en otra tanda.')"
            (linkClicked)="evento.set('Emitió «linkClicked» con el documento ' + $event.row['documento'] + '.')"
          />
        </div>
        <p class="mt-2 text-xs text-text-muted" aria-live="polite">
          Pulsa «Parámetros», completa las dos fechas y aplica la consulta; el selector junto a «Exportar» cambia a la vista de
          gráficas.@if (evento()) { {{ evento() }} }
        </p>
      }
    }
  `,
})
export class EjemplosPlantillasComponent {
  static readonly selectores = ['siaf-documents-records-page', 'siaf-query-report-page'];
  @Input({ required: true }) selector!: string;

  constructor() {
    sembrarSesionDeMuestra(inject(CurrentUserService), inject(PermissionService));
  }

  readonly bandeja = BANDEJA_CONFIG_DE_MUESTRA;
  readonly reporte = CONFIG_REPORTE_DE_MUESTRA;
  readonly resultadoReporte = signal<QueryReportResult | null>(null);
  readonly evento = signal('');

  consultar(): void {
    this.resultadoReporte.set(RESULTADO_REPORTE_DE_MUESTRA);
    this.evento.set(`Emitió «queried»: la pantalla consultó y entregó ${FILAS_REPORTE_DE_MUESTRA.length} filas.`);
  }

  exportar(evento: QueryReportExportEvent): void {
    const formato = { excel: 'Excel', csv: 'CSV', pdf: 'PDF' }[evento.format];
    this.evento.set(`Emitió «exported» en ${formato} con ${evento.rows.length} filas: la pantalla genera el archivo.`);
  }
}
