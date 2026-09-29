import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { QueryReportExportEvent, QueryReportPageComponent } from '../../../../../shared/components/query-report-page/query-report-page.component';
import type { QueryReportConfig, QueryReportParameters, QueryReportResult, QueryReportRow } from '../../../../../shared/types/query-report.types';
import { buildProcessBreadcrumbs } from '../../../../../shared/utils/breadcrumbs.util';
import { CuentasBancariasApiService } from '../../api/cuentas-bancarias-api.service';
import { CONSULTAS_PROCESS_ID, CONSULTAS_ROUTE, REQUEST_ROUTE } from '../../config/cuentas-bancarias.rutas';
import { BANCOS, CuentaBancariaRegistro, MONEDAS, nombreBanco, nombreMoneda, nombreTipoCuenta } from '../../models/cuenta-bancaria.model';
import { exportarCuentasBancarias } from '../../utils/cuentas-bancarias-export.util';

/** yyyy-mm-dd → dd/mm/aaaa (el formato que agrupa por mes la vista de gráficas). */
const aFechaPe = (iso: string): string => iso.split('-').reverse().join('/');

/**
 * «Consultas y reportes» del proceso de ejemplo. La pantalla entera la arma `siaf-query-report-page` desde esta
 * configuración: panel de parámetros, resultado, tabla, filtros, vista de gráficas y Exportar. Esta página solo
 * responde la consulta (filtra las cuentas aprobadas con los parámetros) y genera el archivo al exportar.
 */
@Component({
  selector: 'siaf-cuentas-bancarias-consultas',
  standalone: true,
  imports: [QueryReportPageComponent],
  template: `
    <siaf-query-report-page
      [config]="config"
      [result]="resultado()"
      [loading]="cargando()"
      (queried)="consultar($event)"
      (exported)="exportar($event)"
      (linkClicked)="abrirDocumento($event.row)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CuentasBancariasConsultasComponent {
  private readonly cuentasApi = inject(CuentasBancariasApiService);
  private readonly router = inject(Router);

  readonly resultado = signal<QueryReportResult | null>(null);
  readonly cargando = signal(false);

  readonly config: QueryReportConfig = {
    title: 'Consulta de cuentas bancarias',
    breadcrumbs: buildProcessBreadcrumbs(CONSULTAS_PROCESS_ID, CONSULTAS_ROUTE, 'Consulta de cuentas bancarias'),
    parameterFields: [
      { key: 'desde', label: 'Apertura desde', type: 'date', required: true, icon: 'calendar_today' },
      { key: 'hasta', label: 'Apertura hasta', type: 'date', required: true, icon: 'event' },
      { key: 'bancos', label: 'Bancos', type: 'select-multiple', icon: 'account_balance', options: BANCOS },
      { key: 'moneda', label: 'Moneda', type: 'select', icon: 'payments', options: MONEDAS },
    ],
    columns: [
      { key: 'codigo', label: 'Código', group: 'Cuenta', width: 100 },
      { key: 'banco', label: 'Banco', group: 'Cuenta', width: 220 },
      { key: 'numeroCuenta', label: 'Número', group: 'Cuenta', width: 190 },
      { key: 'denominacion', label: 'Denominación', width: 260 },
      { key: 'moneda', label: 'Moneda', width: 110 },
      { key: 'tipoCuenta', label: 'Tipo de cuenta', width: 140 },
      { key: 'recaudadora', label: 'Recaudadora', width: 120 },
      { key: 'fechaApertura', label: 'Fecha de apertura', width: 150 },
      { key: 'documento', label: 'Documento', width: 280, kind: 'link' },
      { key: 'estado', label: 'Estado', width: 110, fixed: true },
    ],
    rowKey: 'codigo',
    resultTitle: 'Cuentas bancarias de la entidad',
    tableLabel: 'Cuentas bancarias consultadas',
    presetFilters: [
      { key: 'moneda', label: 'Moneda', options: MONEDAS.map((m) => ({ label: m.label, value: m.label })) },
      { key: 'estado', label: 'Estado', options: [{ label: 'Activo', value: 'Activo' }, { label: 'Inactivo', value: 'Inactivo' }] },
    ],
    charts: {
      kpis: [
        { title: 'Cuentas bancarias', icon: 'account_balance', tone: 'informative', aggregate: 'count' },
        { title: 'Cuentas en soles', icon: 'payments', tone: 'success', aggregate: 'count', where: { column: 'moneda', value: 'Soles' } },
        { title: 'Cuentas en dólares', icon: 'attach_money', tone: 'warning', aggregate: 'count', where: { column: 'moneda', value: 'Dólares' } },
      ],
      charts: [
        { title: 'Cuentas por banco', description: 'Cantidad de cuentas aprobadas en cada banco.', type: 'bar', groupBy: 'banco', aggregate: 'count', seriesName: 'Cuentas', categoryLabel: 'Banco', width: 'wide' },
        { title: 'Cuentas por moneda', type: 'donut', groupBy: 'moneda', aggregate: 'count', seriesName: 'Cuentas' },
        { title: 'Aperturas por mes', description: 'Cuentas abiertas en cada mes del periodo consultado.', type: 'line', groupBy: 'fechaApertura', byMonth: true, aggregate: 'count', seriesName: 'Aperturas' },
      ],
    },
    emptyTitle: 'Realice una consulta',
    emptyDescription: 'Elija el rango de fechas de apertura y, si quiere, los bancos y la moneda.',
  };

  consultar(parametros: QueryReportParameters): void {
    const desde = String(parametros['desde'] ?? '');
    const hasta = String(parametros['hasta'] ?? '');
    const bancos = (parametros['bancos'] as string[] | undefined) ?? [];
    const moneda = String(parametros['moneda'] ?? '');

    this.cargando.set(true);
    this.cuentasApi.listarRegistros().subscribe({
      next: (registros) => {
        const filtrados = registros.filter((r) =>
          (!desde || r.fechaApertura >= desde)
          && (!hasta || r.fechaApertura <= hasta)
          && (bancos.length === 0 || bancos.includes(r.bancoCodigo))
          && (!moneda || r.moneda === moneda),
        );
        const filas = filtrados.map((r) => this.aFila(r));
        this.resultado.set({
          rows: filas,
          summary: {
            label: 'Resultado de la consulta',
            icon: 'account_balance',
            title: `${filas.length} ${filas.length === 1 ? 'cuenta bancaria' : 'cuentas bancarias'}`,
            description: desde && hasta ? `Abiertas entre el ${aFechaPe(desde)} y el ${aFechaPe(hasta)}.` : undefined,
            fields: [
              { label: 'Bancos', value: bancos.length ? bancos.map(nombreBanco).join(', ') : 'Todos' },
              { label: 'Moneda', value: moneda ? nombreMoneda(moneda) : 'Todas' },
              { label: 'Recaudadoras', value: String(filtrados.filter((r) => r.esRecaudadora).length) },
            ],
          },
        });
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  exportar(evento: QueryReportExportEvent): void {
    void exportarCuentasBancarias(evento.format, this.config.columns, evento.rows);
  }

  abrirDocumento(fila: QueryReportRow): void {
    if (fila['documentoId']) void this.router.navigate([REQUEST_ROUTE, fila['documentoId']]);
  }

  private aFila(r: CuentaBancariaRegistro): QueryReportRow {
    return {
      codigo: r.codigo,
      banco: nombreBanco(r.bancoCodigo),
      numeroCuenta: r.numeroCuenta,
      denominacion: r.denominacion,
      moneda: nombreMoneda(r.moneda),
      tipoCuenta: nombreTipoCuenta(r.tipoCuenta),
      recaudadora: r.esRecaudadora ? 'Sí' : 'No',
      fechaApertura: aFechaPe(r.fechaApertura),
      documento: r.numeroDocumento,
      documentoId: r.documentoId,
      estado: r.estado,
    };
  }
}
