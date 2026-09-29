import type { QueryReportChart, QueryReportRow } from '../../types/query-report.types';
import { calcularGrafico, calcularKpis, formatearMonto, numeroDe } from './query-report-charts';

const FILAS: QueryReportRow[] = [
  { fecha: '10/03/2026 09:00:00', operacion: 'A', monto: '800.00' },
  { fecha: '15/01/2026 14:22:00', operacion: 'A', monto: '1,000.00' },
  { fecha: '20/01/2026', operacion: 'B', monto: '500.50' },
  { fecha: '03/02/2026', operacion: 'A', monto: '1,500.00' },
  { fecha: 'sin fecha', operacion: 'A', monto: '99.00' },
];

const porMes = (extra: Partial<QueryReportChart> = {}): QueryReportChart => ({
  title: 'Monto por mes',
  type: 'bar',
  groupBy: 'fecha',
  byMonth: true,
  column: 'monto',
  where: { column: 'operacion', value: 'A' },
  ...extra,
});

describe('query-report-charts', () => {
  it('numeroDe lee importes con separador de miles, signo y prefijo; lo que no es número vale 0', () => {
    expect(numeroDe('1,031,200.00')).toBe(1031200);
    expect(numeroDe('S/ -5.50')).toBe(-5.5);
    expect(numeroDe('')).toBe(0);
    expect(numeroDe(undefined)).toBe(0);
    expect(numeroDe('sin monto')).toBe(0);
  });

  it('formatearMonto usa coma de miles y punto decimal, con dos decimales', () => {
    expect(formatearMonto(1031200)).toBe('1,031,200.00');
    expect(formatearMonto(0.5)).toBe('0.50');
  });

  describe('calcularKpis', () => {
    it('suma la columna de las filas del filtro, con prefijo, y la barra es su parte del total', () => {
      const [kpi] = calcularKpis(FILAS, [{ title: 'Operación A', column: 'monto', where: { column: 'operacion', value: 'A' }, prefix: 'S/ ' }]);
      // A: 800 + 1,000 + 1,500 + 99 = 3,399 de un total de 3,899.50 → 87 %.
      expect(kpi).toEqual({ title: 'Operación A', icon: 'arrow_outward', tone: 'informative', amount: 'S/ 3,399.00', progress: 87 });
    });

    it('count cuenta filas sin decimales; sin filtro la barra está llena', () => {
      const [contadas, todas] = calcularKpis(FILAS, [
        { title: 'Operaciones B', aggregate: 'count', where: { column: 'operacion', value: 'B' }, tone: 'warning', icon: 'arrow_right_alt' },
        { title: 'Total', column: 'monto' },
      ]);
      expect(contadas).toEqual({ title: 'Operaciones B', icon: 'arrow_right_alt', tone: 'warning', amount: '1', progress: 20 });
      expect(todas.amount).toBe('3,899.50');
      expect(todas.progress).toBe(100);
    });

    it('sin filas, montos en cero y barra en 0 %', () => {
      expect(calcularKpis([], [{ title: 'Total', column: 'monto' }])[0]).toEqual(jasmine.objectContaining({ amount: '0.00', progress: 0 }));
    });
  });

  describe('calcularGrafico', () => {
    it('por mes: agrupa las filas del filtro en orden cronológico, con el mes abreviado, y salta las que no tienen fecha', () => {
      expect(calcularGrafico(FILAS, porMes())).toEqual({
        title: 'Monto por mes',
        description: '',
        type: 'bar',
        categories: ['ENE', 'FEB', 'MAR'],
        values: [1000, 1500, 800],
        seriesName: 'Monto por mes',
        categoryLabel: 'Mes',
        valueSuffix: '',
        negativeLabel: 'Disminución',
        positiveLabel: 'Aumento',
        width: 'wide',
      });
    });

    it('con meses de varios años, suma el año a cada mes', () => {
      const filas: QueryReportRow[] = [
        { fecha: '05/01/2026', monto: '10.00' },
        { fecha: '10/12/2025', monto: '20.00' },
      ];
      expect(calcularGrafico(filas, porMes({ where: undefined })).categories).toEqual(['DIC 2025', 'ENE 2026']);
    });

    it('index lleva cada valor a porcentaje del primero y change da la variación respecto de él, sin el primero', () => {
      const indice = calcularGrafico(FILAS, porMes({ transform: 'index' }));
      expect(indice.values).toEqual([100, 150, 80]);
      expect(indice.valueSuffix).toBe('%');

      const variacion = calcularGrafico(FILAS, porMes({ transform: 'change', type: 'diverging', width: 'narrow', negativeLabel: 'Baja', positiveLabel: 'Sube' }));
      expect(variacion.categories).toEqual(['FEB', 'MAR']);
      expect(variacion.values).toEqual([50, -20]);
      expect(variacion).toEqual(jasmine.objectContaining({ valueSuffix: '%', width: 'narrow', negativeLabel: 'Baja', positiveLabel: 'Sube' }));
    });

    it('con base en cero, index y change dan 0 en vez de infinito', () => {
      const filas: QueryReportRow[] = [
        { fecha: '05/01/2026', monto: '0.00' },
        { fecha: '05/02/2026', monto: '30.00' },
      ];
      expect(calcularGrafico(filas, porMes({ where: undefined, transform: 'index' })).values).toEqual([0, 0]);
      expect(calcularGrafico(filas, porMes({ where: undefined, transform: 'change' })).values).toEqual([0]);
    });

    it('por una columna que no es fecha: categorías en el orden en que aparecen, y count cuenta filas', () => {
      const grafico = calcularGrafico(FILAS, { title: 'Por operación', type: 'donut', groupBy: 'operacion', aggregate: 'count', seriesName: 'Filas' });
      expect(grafico.categories).toEqual(['A', 'B']);
      expect(grafico.values).toEqual([4, 1]);
      expect(grafico.categoryLabel).toBe('Categoría');
      expect(grafico.seriesName).toBe('Filas');
    });
  });
});
