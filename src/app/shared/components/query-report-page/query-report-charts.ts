/**
 * Cálculo de la vista de gráficas de `siaf-query-report-page`: los KPI y los gráficos que la configuración declara, a
 * partir de las filas que muestra la tabla (con la búsqueda y los filtros aplicados). Funciones puras, sin Angular.
 */
import type {
  QueryReportAggregate,
  QueryReportChart,
  QueryReportChartType,
  QueryReportKpi,
  QueryReportRow,
  QueryReportRowFilter,
} from '../../types/query-report.types';
import type { KpiCardTone } from '../../ui/kpi-card/kpi-card.component';

export interface KpiCalculado {
  title: string;
  icon: string;
  tone: KpiCardTone;
  amount: string;
  /** Parte del total de la columna, de 0 a 100. */
  progress: number;
}

export interface GraficoCalculado {
  title: string;
  description: string;
  type: QueryReportChartType;
  categories: string[];
  values: number[];
  seriesName: string;
  categoryLabel: string;
  /** «%» con `index` o `change`. */
  valueSuffix: string;
  negativeLabel: string;
  positiveLabel: string;
  width: 'wide' | 'narrow';
}

const MESES = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SET', 'OCT', 'NOV', 'DIC'];

/** «1,031,200.00» → 1031200; «S/ -5.50» → -5.5; lo que no es número cuenta como 0. */
export function numeroDe(texto: string | undefined): number {
  const limpio = String(texto ?? '').replace(/[^\d.-]/g, '');
  const numero = parseFloat(limpio);
  return Number.isFinite(numero) ? numero : 0;
}

/** Monto con separador de miles y dos decimales, con punto como el resto del kit: 1031200 → «1,031,200.00». */
export function formatearMonto(valor: number): string {
  return valor.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const cumple = (fila: QueryReportRow, filtro?: QueryReportRowFilter): boolean => !filtro || fila[filtro.column] === filtro.value;

function agregar(filas: readonly QueryReportRow[], columna: string | undefined, agregado: QueryReportAggregate): number {
  if (agregado === 'count' || !columna) return filas.length;
  return filas.reduce((suma, fila) => suma + numeroDe(fila[columna]), 0);
}

export function calcularKpis(filas: readonly QueryReportRow[], kpis: readonly QueryReportKpi[]): KpiCalculado[] {
  return kpis.map((kpi) => {
    const agregado = kpi.aggregate ?? 'sum';
    const valor = agregar(filas.filter((f) => cumple(f, kpi.where)), kpi.column, agregado);
    const total = agregar(filas, kpi.column, agregado);
    const progreso = total > 0 ? Math.round((valor / total) * 100) : 0;
    const monto = agregado === 'count' ? String(valor) : formatearMonto(valor);
    return {
      title: kpi.title,
      icon: kpi.icon ?? 'arrow_outward',
      tone: kpi.tone ?? 'informative',
      amount: `${kpi.prefix ?? ''}${monto}`,
      progress: Math.min(100, Math.max(0, progreso)),
    };
  });
}

/** Clave y etiqueta de la categoría de una fila; por mes, con la fecha dd/mm/aaaa. */
function categoriaDe(fila: QueryReportRow, grafico: QueryReportChart): { clave: string; etiqueta: string; anio: string } | null {
  const valor = fila[grafico.groupBy] ?? '';
  if (!grafico.byMonth) return { clave: valor, etiqueta: valor, anio: '' };
  const fecha = /(\d{2})\/(\d{2})\/(\d{4})/.exec(valor);
  if (!fecha) return null;
  const [, , mes, anio] = fecha;
  return { clave: `${anio}-${mes}`, etiqueta: MESES[Number(mes) - 1] ?? mes, anio };
}

const redondear = (valor: number): number => Math.round(valor * 10) / 10;

export function calcularGrafico(filas: readonly QueryReportRow[], grafico: QueryReportChart): GraficoCalculado {
  const grupos = new Map<string, { etiqueta: string; anio: string; filas: QueryReportRow[] }>();
  for (const fila of filas) {
    if (!cumple(fila, grafico.where)) continue;
    const categoria = categoriaDe(fila, grafico);
    if (!categoria) continue;
    const grupo = grupos.get(categoria.clave) ?? { etiqueta: categoria.etiqueta, anio: categoria.anio, filas: [] };
    grupo.filas.push(fila);
    grupos.set(categoria.clave, grupo);
  }

  let claves = [...grupos.keys()];
  if (grafico.byMonth) claves = claves.sort();
  const variosAnios = grafico.byMonth && new Set(claves.map((c) => grupos.get(c)!.anio)).size > 1;
  let categorias = claves.map((c) => (variosAnios ? `${grupos.get(c)!.etiqueta} ${grupos.get(c)!.anio}` : grupos.get(c)!.etiqueta));
  let valores = claves.map((c) => agregar(grupos.get(c)!.filas, grafico.column, grafico.aggregate ?? 'sum'));

  const base = valores[0] ?? 0;
  if (grafico.transform === 'index') {
    valores = valores.map((v) => (base ? redondear((v / base) * 100) : 0));
  } else if (grafico.transform === 'change') {
    categorias = categorias.slice(1);
    valores = valores.slice(1).map((v) => (base ? redondear(((v - base) / base) * 100) : 0));
  }

  return {
    title: grafico.title,
    description: grafico.description ?? '',
    type: grafico.type,
    categories: categorias,
    values: valores,
    seriesName: grafico.seriesName ?? grafico.title,
    categoryLabel: grafico.categoryLabel ?? (grafico.byMonth ? 'Mes' : 'Categoría'),
    valueSuffix: grafico.transform ? '%' : '',
    negativeLabel: grafico.negativeLabel ?? 'Disminución',
    positiveLabel: grafico.positiveLabel ?? 'Aumento',
    width: grafico.width ?? 'wide',
  };
}
