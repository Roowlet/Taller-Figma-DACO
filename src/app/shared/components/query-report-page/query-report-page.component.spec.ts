import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import type { QueryReportConfig, QueryReportParameters, QueryReportResult } from '../../types/query-report.types';
import { QueryReportExportEvent, QueryReportPageComponent } from './query-report-page.component';

const CONFIG: QueryReportConfig = {
  title: 'Movimientos de las libretas',
  breadcrumbs: [{ label: 'Inicio', href: '/' }, { label: 'Movimientos' }],
  parameterFields: [
    { key: 'desde', label: 'Fecha desde', type: 'date', required: true, icon: 'calendar_today' },
    { key: 'entidades', label: 'Entidades', type: 'select-multiple', icon: 'apartment', options: [{ label: 'MINCETUR', value: 'mincetur' }, { label: 'IPD', value: 'ipd' }] },
    { key: 'fuente', label: 'Fuente', type: 'select', icon: 'account_balance_wallet', options: [{ label: '2.09 Recursos directamente recaudados', value: '2.09' }] },
  ],
  columns: [
    { key: 'secuencia', label: 'Secuencia', group: 'Acreditación' },
    { key: 'beneficiario', label: 'Beneficiario' },
    { key: 'operacion', label: 'Tipo de operación' },
    { key: 'saldo', label: 'Saldo final', align: 'right', fixed: true },
  ],
  rowKey: 'secuencia',
  tabs: [{ id: 'movimientos', label: 'Movimientos' }, { id: 'resumen', label: 'Resumen' }],
  presetFilters: [{ key: 'operacion', label: 'Tipo de operación', options: [{ label: '3 - Devolución', value: '3 - Devolución' }] }],
};

const beneficiarios = ['MINCETUR - JUEGOS Y APUESTAS', 'IPD', 'FONDO DE COMPENSACIÓN MUNICIPAL'];
const RESULTADO: QueryReportResult = {
  rows: Array.from({ length: 12 }, (_, i) => ({
    secuencia: String(i + 1).padStart(6, '0'),
    // Enero, febrero y marzo por turnos; la fecha no es columna de la tabla, solo la usan los gráficos.
    fecha: `10/0${(i % 3) + 1}/2026`,
    beneficiario: beneficiarios[i % 3],
    operacion: i % 4 === 3 ? '3 - Devolución' : '1 - Saldos Iniciales',
    saldo: `${(i + 1) * 1000}.00`,
  })),
  summary: { label: 'Entidad', icon: 'account_balance_wallet', title: 'MINCETUR', fields: [{ label: 'Código', value: '000360' }] },
};

const CONFIG_CON_GRAFICAS: QueryReportConfig = {
  ...CONFIG,
  charts: {
    kpis: [
      { title: 'Total', column: 'saldo', prefix: 'S/ ' },
      { title: 'Devoluciones', column: 'saldo', where: { column: 'operacion', value: '3 - Devolución' }, tone: 'warning', icon: 'arrow_right_alt', prefix: 'S/ ' },
      { title: 'Movimientos', aggregate: 'count' },
      { title: 'IPD', column: 'saldo', where: { column: 'beneficiario', value: 'IPD' }, tone: 'danger', icon: 'article', prefix: 'S/ ' },
    ],
    charts: [
      { title: 'Saldo por mes', type: 'bar', groupBy: 'fecha', byMonth: true, column: 'saldo' },
      { title: 'Variación', type: 'diverging', groupBy: 'fecha', byMonth: true, column: 'saldo', transform: 'change', width: 'narrow' },
      { title: 'Por beneficiario', type: 'donut', groupBy: 'beneficiario', column: 'saldo' },
    ],
  },
};

describe('QueryReportPageComponent', () => {
  let fixture: ComponentFixture<QueryReportPageComponent>;
  let pagina: QueryReportPageComponent;
  const el = (): HTMLElement => fixture.nativeElement;
  const botonCabecera = (texto: string): HTMLButtonElement =>
    Array.from(el().querySelectorAll<HTMLButtonElement>('siaf-page-header button')).find((b) => b.textContent!.includes(texto))!;
  const filasTabla = (): string[] => Array.from(el().querySelectorAll('siaf-report-table tbody tr')).map((f) => (f as HTMLTableRowElement).cells[0]?.textContent?.trim() ?? '');
  const botonExportar = (): HTMLButtonElement => el().querySelector<HTMLButtonElement>('[data-exportar] button[aria-haspopup="menu"]')!;

  const consultar = (parametros: QueryReportParameters = { desde: '2026-06-28', entidades: ['mincetur', 'ipd'], fuente: '2.09' }): void => {
    pagina.aplicar(parametros);
    fixture.componentRef.setInput('result', RESULTADO);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [QueryReportPageComponent], providers: [provideRouter([])] }).compileComponents();
    fixture = TestBed.createComponent(QueryReportPageComponent);
    pagina = fixture.componentInstance;
    fixture.componentRef.setInput('config', CONFIG);
    fixture.detectChanges();
  });

  it('antes de consultar: estado vacío, «Favoritos» deshabilitado y sin resultado', () => {
    const vacia = el().querySelector('[data-consulta-vacia]')!;
    expect(vacia.textContent).toContain('Aún no se encontraron resultados');
    expect(vacia.textContent).toContain('Ingrese los parámetros de consulta');
    expect(el().querySelector('siaf-empty-state svg path')).withContext('ilustración «Sin registros»').not.toBeNull();
    expect(botonCabecera('Favoritos').disabled).toBeTrue();
    expect(el().querySelector('[data-resultado]')).toBeNull();
  });

  it('«Parámetros» abre el panel, y aplicar emite queried, lo cierra y arma los parámetros aplicados con sus etiquetas', () => {
    const consultas: QueryReportParameters[] = [];
    pagina.queried.subscribe((p) => consultas.push(p));
    botonCabecera('Parámetros').click();
    fixture.detectChanges();
    expect(el().querySelector('siaf-query-parameters-panel [role="dialog"]')).not.toBeNull();

    consultar();

    expect(consultas).toEqual([{ desde: '2026-06-28', entidades: ['mincetur', 'ipd'], fuente: '2.09' }]);
    expect(pagina.panelAbierto()).toBeFalse();
    expect(pagina.parametrosAplicados()).toEqual([
      { label: 'Fecha desde', value: '28/06/2026', icon: 'calendar_today' },
      { label: 'Entidades', value: 'MINCETUR, IPD', icon: 'apartment' },
      { label: 'Fuente', value: '2.09 Recursos directamente recaudados', icon: 'account_balance_wallet' },
    ]);
    expect(botonCabecera('Favoritos').disabled).toBeFalse();
  });

  it('con resultado: card resumen, tabla paginada a 25, pestañas y el total anunciado', () => {
    consultar();
    expect(el().querySelector('siaf-report-summary-card')?.textContent).toContain('MINCETUR');
    expect(filasTabla().length).toBe(12);
    expect(el().querySelector('siaf-tabs')).not.toBeNull();
    expect(el().querySelector('[data-anuncio-filas]')?.textContent?.trim()).toBe('12 filas en el resultado');

    pagina.cambiarTamano(10);
    fixture.detectChanges();
    expect(filasTabla()).toEqual(RESULTADO.rows.slice(0, 10).map((r) => r['secuencia']));
    pagina.pagina.set(2);
    fixture.detectChanges();
    expect(filasTabla()).toEqual(['000011', '000012']);
  });

  it('buscar no distingue mayúsculas ni tildes, vuelve a la primera página y se combina con los filtros predeterminados', () => {
    consultar();
    pagina.cambiarTamano(10);
    pagina.pagina.set(2);
    pagina.buscar('compensacion');
    fixture.detectChanges();
    expect(pagina.pagina()).toBe(1);
    expect(filasTabla()).toEqual(['000003', '000006', '000009', '000012']);

    pagina.filtrar('operacion', '3 - Devolución');
    fixture.detectChanges();
    expect(filasTabla()).toEqual(['000012']);
    expect(el().querySelector('[data-anuncio-filas]')?.textContent?.trim()).toBe('1 fila en el resultado');
  });

  it('una consulta nueva limpia la búsqueda y los filtros', () => {
    consultar();
    pagina.buscar('ipd');
    pagina.filtrar('operacion', '3 - Devolución');
    consultar({ desde: '2026-07-01' });
    expect(pagina.busqueda()).toBe('');
    expect(pagina.filtros()).toEqual({});
    expect(filasTabla().length).toBe(12);
  });

  it('«Exportar» abre el menú Excel, CSV y PDF y emite el formato con los parámetros y las filas filtradas; las pestañas emiten tabChanged', () => {
    const exportados: QueryReportExportEvent[] = [];
    const pestanas: string[] = [];
    pagina.exported.subscribe((e) => exportados.push(e));
    pagina.tabChanged.subscribe((id) => pestanas.push(id));
    consultar();
    pagina.buscar('ipd');
    fixture.detectChanges();

    const exportar = botonExportar();
    expect(exportar.textContent).toContain('Exportar');
    exportar.click();
    fixture.detectChanges();
    const opciones = Array.from(el().querySelectorAll<HTMLElement>('[data-exportar] [role="menuitem"]'));
    expect(opciones.map((o) => o.textContent)).toEqual([jasmine.stringContaining('Excel'), jasmine.stringContaining('CSV'), jasmine.stringContaining('PDF')]);
    expect(opciones.map((o) => o.querySelector('siaf-icon')?.textContent?.trim())).toEqual(['table_view', 'table_chart', 'picture_as_pdf']);
    expect(opciones[0].classList).withContext('menú «Opciones de tabla» del Figma, de 48 px').toContain('min-h-12');
    opciones[1].click();
    pagina.cambiarPestana('resumen');

    expect(exportados.length).toBe(1);
    expect(exportados[0].format).toBe('csv');
    expect(exportados[0].rows.map((r) => r['secuencia'])).toEqual(['000002', '000005', '000008', '000011']);
    expect(exportados[0].parameters['desde']).toBe('2026-06-28');
    expect(pestanas).toEqual(['resumen']);
  });

  it('mientras carga, la tabla pasa a esqueleto y «Exportar» se deshabilita', () => {
    consultar();
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    expect(el().querySelector('siaf-table-skeleton')).not.toBeNull();
    expect(el().querySelector('siaf-report-table')).toBeNull();
    expect(botonExportar().disabled).toBeTrue();
  });

  it('sin gráficas en la configuración no aparece el selector de vista', () => {
    consultar();
    expect(el().querySelector('[data-selector-vista]')).toBeNull();
    expect(el().querySelector('siaf-report-table')).not.toBeNull();
  });

  describe('vista de gráficas', () => {
    const botonVista = (nombre: string): HTMLButtonElement => el().querySelector<HTMLButtonElement>(`[data-selector-vista] button[aria-label="${nombre}"]`)!;

    /** La vista llega con @defer: se espera a que carguen sus componentes. */
    const abrirGraficas = async (): Promise<void> => {
      botonVista('Vista de gráficas').click();
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
    };

    beforeEach(() => {
      fixture.componentRef.setInput('config', CONFIG_CON_GRAFICAS);
      fixture.detectChanges();
      consultar();
    });

    it('el selector «Vista de datos | Vista de gráficas» cambia la tabla por las tarjetas KPI y los gráficos', async () => {
      expect(botonVista('Vista de datos').getAttribute('aria-pressed')).toBe('true');
      expect(el().querySelector('[data-selector-vista] [role="group"]')?.getAttribute('aria-label')).toBe('Vista del resultado');

      await abrirGraficas();

      expect(botonVista('Vista de gráficas').getAttribute('aria-pressed')).toBe('true');
      expect(el().querySelector('[data-vista-graficas]')).not.toBeNull();
      expect(el().querySelector('siaf-report-table')).toBeNull();
      expect(el().querySelector('siaf-form-table-search')).toBeNull();
      expect(el().querySelector('siaf-pagination')).toBeNull();
      expect(el().querySelector('siaf-tabs')).withContext('las pestañas siguen arriba').not.toBeNull();

      const tarjetas = Array.from(el().querySelectorAll('siaf-kpi-card'));
      expect(tarjetas.map((t) => t.querySelector('article')?.getAttribute('aria-label'))).toEqual(['Total', 'Devoluciones', 'Movimientos', 'IPD']);
      expect(tarjetas.map((t) => t.textContent!.replace(/\s+/g, ' '))).toEqual([
        jasmine.stringContaining('S/ 78,000.00'),
        jasmine.stringContaining('S/ 24,000.00'),
        jasmine.stringContaining('12'),
        jasmine.stringContaining('S/ 26,000.00'),
      ]);
      expect(el().querySelector('[data-grafico="bar"] siaf-bar-chart')).not.toBeNull();
      expect(el().querySelector('[data-grafico="diverging"] siaf-diverging-chart')).not.toBeNull();
      expect(el().querySelector('[data-grafico="donut"] siaf-donut-chart')).not.toBeNull();
      expect(el().querySelector('[data-nota-graficas]')).withContext('sin búsqueda ni filtros no hay nota').toBeNull();

      botonVista('Vista de datos').click();
      fixture.detectChanges();
      expect(el().querySelector('[data-vista-graficas]')).toBeNull();
      expect(el().querySelector('siaf-report-table')).not.toBeNull();
    });

    it('calcula con las filas de la tabla: meses en orden, variación respecto del primero y la parte del total de cada KPI', () => {
      expect(pagina.kpis().map((k) => [k.amount, k.progress])).toEqual([
        ['S/ 78,000.00', 100],
        ['S/ 24,000.00', 31],
        ['12', 100],
        ['S/ 26,000.00', 33],
      ]);
      const [barras, divergente, dona] = pagina.graficos();
      expect(barras.categories).toEqual(['ENE', 'FEB', 'MAR']);
      expect(barras.series).toEqual([{ name: 'Saldo por mes', values: [22000, 26000, 30000] }]);
      expect(divergente.categories).toEqual(['FEB', 'MAR']);
      expect(divergente.values).toEqual([18.2, 36.4]);
      expect(dona.categories).toEqual(beneficiarios);
    });

    it('en escritorio el gráfico angosto va a la derecha del ancho (336 px) y el resto ocupa toda la fila; la última tarjeta KPI se alinea con él', async () => {
      await abrirGraficas();
      expect(el().querySelector('[data-graficos]')!.className).toContain('xl:grid-cols-[minmax(0,1fr)_336px]');
      expect(el().querySelector('[data-kpis]')!.className).toContain('xl:grid-cols-[repeat(3,minmax(0,1fr))_336px]');
      const secciones = Array.from(el().querySelectorAll<HTMLElement>('[data-graficos] > siaf-chart-section'));
      expect(secciones.map((s) => s.classList.contains('xl:col-span-2'))).toEqual([false, false, true]);
    });

    it('sigue a la búsqueda y a los filtros de la vista de datos, y avisa con cuántas filas calcula', async () => {
      pagina.buscar('ipd');
      await abrirGraficas();

      expect(el().querySelector('[data-nota-graficas]')?.textContent).toContain('Las gráficas usan las 4 filas que quedaron tras buscar o filtrar');
      expect(pagina.kpis().map((k) => k.amount)).toEqual(['S/ 26,000.00', 'S/ 8,000.00', '4', 'S/ 26,000.00']);

      pagina.filtrar('operacion', '3 - Devolución');
      fixture.detectChanges();
      expect(el().querySelector('[data-nota-graficas]')?.textContent).toContain('la única fila que quedó');
      // Con un solo mes no hay variación que dibujar: aviso en vez de ejes vacíos; el de barras sí tiene su mes.
      expect(el().querySelector('[data-grafico="diverging"] siaf-diverging-chart')).toBeNull();
      expect(el().querySelector('[data-grafico="diverging"] [data-grafico-vacio]')?.textContent).toContain('No hay datos suficientes para este gráfico con la búsqueda o los filtros actuales.');
      expect(el().querySelector('[data-grafico="bar"] siaf-bar-chart')).not.toBeNull();

      pagina.buscar('sin coincidencias');
      fixture.detectChanges();
      expect(el().querySelector('siaf-kpi-card')).toBeNull();
      expect(el().querySelector('[data-vista-graficas] siaf-empty-state')?.textContent).toContain('No hay filas para graficar');
    });

    it('«Exportar» sigue disponible en la vista de gráficas con las mismas filas', async () => {
      const exportados: QueryReportExportEvent[] = [];
      pagina.exported.subscribe((e) => exportados.push(e));
      await abrirGraficas();

      botonExportar().click();
      fixture.detectChanges();
      el().querySelectorAll<HTMLElement>('[data-exportar] [role="menuitem"]')[2].click();

      expect(exportados.map((e) => [e.format, e.rows.length])).toEqual([['pdf', 12]]);
    });
  });
});
