/**
 * Datos de muestra de la plantilla «Consultas y reportes» y de sus piezas, tomados del Figma (Guía de Estructura de
 * Pantallas, nodo 9455:107865): movimientos de las libretas de las cuentas de registro. Nada de esto se usa fuera del
 * catálogo.
 */
import type { QueryReportConfig, QueryReportParameterField, QueryReportResult } from '../../../shared/types/query-report.types';
import type { ReportSummaryField } from '../../../shared/ui/report-summary-card/report-summary-card.component';
import type { ReportTableColumn, ReportTableRow } from '../../../shared/ui/report-table/report-table.component';

export const CAMPOS_PARAMETROS_DE_MUESTRA: QueryReportParameterField[] = [
  { key: 'desde', label: 'Fecha desde', type: 'date', required: true, icon: 'calendar_today' },
  { key: 'hasta', label: 'Fecha hasta', type: 'date', required: true, icon: 'event' },
  {
    key: 'entidades',
    label: 'Entidades',
    type: 'select-multiple',
    icon: 'apartment',
    options: [
      { label: 'MINCETUR', value: 'mincetur' },
      { label: 'IPD', value: 'ipd' },
      { label: 'MEF', value: 'mef' },
    ],
  },
  {
    key: 'fuente',
    label: 'Fuente de financiamiento',
    type: 'select',
    icon: 'account_balance_wallet',
    options: [
      { label: '1.00 Recursos Ordinarios', value: '1.00' },
      { label: '2.09 Recursos directamente recaudados', value: '2.09' },
    ],
  },
  {
    key: 'ambito',
    label: 'Ámbito institucional',
    type: 'select',
    icon: 'account_balance',
    options: [
      { label: '3 - Gobierno nacional', value: '3' },
      { label: '4 - Gobierno regional', value: '4' },
    ],
  },
];

export const COLUMNAS_REPORTE_DE_MUESTRA: ReportTableColumn[] = [
  { key: 'secuencia', label: 'Secuencia', group: 'Acreditación', width: 104 },
  { key: 'fecha', label: 'Fecha', group: 'Acreditación', width: 120 },
  { key: 'codigo', label: 'Código', group: 'Beneficiario', width: 110 },
  { key: 'beneficiario', label: 'Descripción', group: 'Beneficiario', width: 260 },
  { key: 'cuenta', label: 'Número', group: 'Cuenta de registro', width: 290 },
  { key: 'operacion', label: 'Tipo de operación', width: 220 },
  { key: 'documento', label: 'Documento', width: 140, kind: 'link' },
  { key: 'saldoFinal', label: 'Saldo final', group: 'Importe en moneda nacional', width: 150, align: 'right', fixed: true },
];

/** Código, descripción y número de la cuenta de registro de cada beneficiario. */
type Cuenta = readonly [codigo: string, beneficiario: string, cuenta: string];

const JUEGOS: Cuenta = ['000360', 'MINCETUR - JUEGOS Y APUESTAS', '111111070000 2.09 000000 000000 01'];
const CASINOS: Cuenta = ['000366', 'MINCETUR - CASINOS Y TRAGAMONEDAS', '111111070000 2.09 000000 000000 02'];
const IPD: Cuenta = ['000193', 'IPD', '111110193994 2.09 000000 000000 01'];
const FONCOMUN: Cuenta = ['000120', 'FONDO DE COMPENSACIÓN MUNICIPAL', '111110009000 1.00 000000 000000 02'];
const TESORO: Cuenta = ['000009', 'TESORO PÚBLICO', '111110009000 1.00 000000 000000 01'];

const SALDOS = '1 - Saldos Iniciales';
const SUNAT = '2 - Reporte de Recaudación SUNAT';
const DEVOLUCION = '3 - Devolución';

const fila = (secuencia: string, fecha: string, [codigo, beneficiario, cuenta]: Cuenta, operacion: string, saldoFinal: string): ReportTableRow => ({
  secuencia,
  fecha,
  codigo,
  beneficiario,
  cuenta,
  operacion,
  documento: `${secuencia}-2026`,
  saldoFinal,
});

/**
 * Enero a junio de 2026, para que la vista de gráficas tenga meses que comparar: la recaudación SUNAT de febrero a mayo
 * da el índice del Figma (132.1, 142.9, 180.7 y 363.6 con enero = 100) y las devoluciones varían +0.9, −1.2, +2.2, −7.2
 * y +8.1 % respecto de enero. Junio repite los movimientos de la tabla del Figma.
 */
export const FILAS_REPORTE_DE_MUESTRA: ReportTableRow[] = [
  fila('000001', '02/01/2026 09:00:00', JUEGOS, SALDOS, '10,000.00'),
  fila('000002', '02/01/2026 09:00:00', CASINOS, SALDOS, '2,500.00'),
  fila('000003', '02/01/2026 09:00:00', IPD, SALDOS, '3,000.00'),
  fila('000004', '02/01/2026 09:00:00', FONCOMUN, SALDOS, '15,000.00'),
  fila('000005', '02/01/2026 09:00:00', TESORO, SALDOS, '1,000,000.00'),
  fila('000006', '20/01/2026 14:22:00', JUEGOS, SUNAT, '24,000.00'),
  fila('000007', '20/01/2026 14:22:00', IPD, SUNAT, '21,000.00'),
  fila('000008', '27/01/2026 15:46:00', FONCOMUN, SUNAT, '15,000.00'),
  fila('000009', '29/01/2026 10:26:00', TESORO, DEVOLUCION, '50,000.00'),
  fila('000010', '18/02/2026 14:22:00', JUEGOS, SUNAT, '30,260.00'),
  fila('000011', '18/02/2026 14:22:00', CASINOS, SUNAT, '12,000.00'),
  fila('000012', '25/02/2026 15:46:00', IPD, SUNAT, '37,000.00'),
  fila('000013', '26/02/2026 10:26:00', TESORO, DEVOLUCION, '50,450.00'),
  fila('000014', '17/03/2026 14:22:00', JUEGOS, SUNAT, '33,740.00'),
  fila('000015', '17/03/2026 14:22:00', CASINOS, SUNAT, '14,000.00'),
  fila('000016', '24/03/2026 15:46:00', FONCOMUN, SUNAT, '38,000.00'),
  fila('000017', '27/03/2026 10:26:00', TESORO, DEVOLUCION, '49,400.00'),
  fila('000018', '16/04/2026 14:22:00', JUEGOS, SUNAT, '41,420.00'),
  fila('000019', '16/04/2026 14:22:00', IPD, SUNAT, '38,000.00'),
  fila('000020', '23/04/2026 15:46:00', FONCOMUN, SUNAT, '29,000.00'),
  fila('000021', '28/04/2026 10:26:00', TESORO, DEVOLUCION, '51,100.00'),
  fila('000022', '15/05/2026 14:22:00', JUEGOS, SUNAT, '98,160.00'),
  fila('000023', '15/05/2026 14:22:00', CASINOS, SUNAT, '45,000.00'),
  fila('000024', '22/05/2026 15:46:00', IPD, SUNAT, '40,000.00'),
  fila('000025', '22/05/2026 15:46:00', FONCOMUN, SUNAT, '35,000.00'),
  fila('000026', '27/05/2026 10:26:00', TESORO, DEVOLUCION, '46,400.00'),
  fila('000027', '28/06/2026 14:22:00', JUEGOS, SUNAT, '19,000.00'),
  fila('000028', '28/06/2026 14:22:00', JUEGOS, SUNAT, '22,000.00'),
  fila('000029', '28/06/2026 14:22:00', CASINOS, SUNAT, '5,600.00'),
  fila('000030', '28/06/2026 15:46:00', JUEGOS, SUNAT, '27,000.00'),
  fila('000031', '28/06/2026 15:46:00', IPD, SUNAT, '38,000.00'),
  fila('000032', '28/06/2026 15:46:00', FONCOMUN, SUNAT, '31,200.00'),
  fila('000033', '29/06/2026 10:26:00', TESORO, DEVOLUCION, '17,850.00'),
  fila('000034', '29/06/2026 10:26:00', FONCOMUN, DEVOLUCION, '36,200.00'),
  fila('000035', '29/06/2026 14:26:00', CASINOS, SUNAT, '15,353.00'),
  fila('000036', '29/06/2026 14:26:00', JUEGOS, SUNAT, '33,000.00'),
  fila('000037', '29/06/2026 14:26:00', JUEGOS, SUNAT, '40,500.00'),
];

export const DATOS_RESUMEN_DE_MUESTRA: ReportSummaryField[] = [
  { label: 'Código', value: '000360' },
  { label: 'Saldo final', value: 'S/ 1,031,200.00' },
];

export const RESULTADO_REPORTE_DE_MUESTRA: QueryReportResult = {
  rows: FILAS_REPORTE_DE_MUESTRA,
  summary: {
    label: 'Entidad',
    icon: 'account_balance_wallet',
    title: 'MINCETUR',
    description: 'Ministerio de Comercio Exterior y Turismo · Pliego 035',
    fields: DATOS_RESUMEN_DE_MUESTRA,
  },
};

/** Las migas apuntan al catálogo: el ejemplo no lleva a pantallas autenticadas. */
export const CONFIG_REPORTE_DE_MUESTRA: QueryReportConfig = {
  title: 'Movimientos de las libretas de las cuentas de registro',
  breadcrumbs: [{ label: 'Inicio', href: '/ui-kit' }, { label: 'Consultas y reportes', href: '/ui-kit' }, { label: 'Movimientos de libretas' }],
  parameterFields: CAMPOS_PARAMETROS_DE_MUESTRA,
  columns: COLUMNAS_REPORTE_DE_MUESTRA,
  rowKey: 'secuencia',
  tabs: [
    { id: 'movimientos', label: 'Movimientos' },
    { id: 'resumen', label: 'Resumen por cuenta' },
  ],
  presetFilters: [
    {
      key: 'operacion',
      label: 'Tipo de operación',
      options: [SALDOS, SUNAT, DEVOLUCION].map((operacion) => ({ label: operacion, value: operacion })),
    },
  ],
  /** Los tonos y los íconos de las tarjetas son los del Figma (nodo 22402:16766). */
  charts: {
    kpis: [
      { title: 'Saldos iniciales', icon: 'arrow_outward', tone: 'informative', column: 'saldoFinal', where: { column: 'operacion', value: SALDOS }, prefix: 'S/ ' },
      { title: 'Recaudación SUNAT', icon: 'arrow_circle_up', tone: 'success', column: 'saldoFinal', where: { column: 'operacion', value: SUNAT }, prefix: 'S/ ' },
      { title: 'Devoluciones', icon: 'arrow_right_alt', tone: 'warning', column: 'saldoFinal', where: { column: 'operacion', value: DEVOLUCION }, prefix: 'S/ ' },
      { title: 'IPD', icon: 'article', tone: 'danger', column: 'saldoFinal', where: { column: 'beneficiario', value: 'IPD' }, prefix: 'S/ ' },
    ],
    charts: [
      {
        title: 'Evolución comparada',
        description: 'Recaudación SUNAT de cada mes respecto de enero (base enero = 100)',
        type: 'bar',
        groupBy: 'fecha',
        byMonth: true,
        column: 'saldoFinal',
        where: { column: 'operacion', value: SUNAT },
        transform: 'index',
        seriesName: 'Recaudación',
      },
      {
        title: 'Variación de devoluciones',
        description: 'Devoluciones de cada mes respecto de enero',
        type: 'diverging',
        groupBy: 'fecha',
        byMonth: true,
        column: 'saldoFinal',
        where: { column: 'operacion', value: DEVOLUCION },
        transform: 'change',
        width: 'narrow',
      },
    ],
  },
  tableLabel: 'Movimientos de las libretas',
};
