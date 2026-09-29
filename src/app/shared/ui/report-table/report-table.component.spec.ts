import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportTableColumn, ReportTableComponent, ReportTableRow } from './report-table.component';

describe('ReportTableComponent', () => {
  let fixture: ComponentFixture<ReportTableComponent>;
  const el = (): HTMLElement => fixture.nativeElement;

  const columnas: ReportTableColumn[] = [
    { key: 'secuencia', label: 'Secuencia', group: 'Acreditación', width: 104 },
    { key: 'fecha', label: 'Fecha', group: 'Acreditación', width: 120 },
    { key: 'operacion', label: 'Tipo de operación', width: 220 },
    { key: 'documento', label: 'Documento', kind: 'link' },
    { key: 'saldo', label: 'Saldo final', group: 'Importe', align: 'right', fixed: true, width: 150 },
  ];
  const filas: ReportTableRow[] = [
    { secuencia: '000001', fecha: '28/06/2026', operacion: '1 - Saldos Iniciales', documento: '000001-2026', saldo: '10,000.00' },
    { secuencia: '000002', fecha: '28/06/2026', operacion: '2 - Reporte SUNAT', documento: '', saldo: '19,000.00' },
  ];

  const montar = (cols: ReportTableColumn[], rows: ReportTableRow[]): void => {
    fixture = TestBed.createComponent(ReportTableComponent);
    fixture.componentRef.setInput('columns', cols);
    fixture.componentRef.setInput('rows', rows);
    fixture.componentRef.setInput('rowKey', 'secuencia');
    fixture.componentRef.setInput('ariaLabel', 'Movimientos');
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ReportTableComponent] }).compileComponents();
  });

  it('con grupos, la cabecera tiene dos filas: los grupos contiguos en una celda y las columnas sueltas ocupan las dos', () => {
    montar(columnas, filas);
    const superior = Array.from(el().querySelectorAll<HTMLTableCellElement>('[data-cabecera-superior]'));
    expect(superior.map((c) => [c.textContent!.trim(), c.colSpan, c.rowSpan, c.getAttribute('scope')])).toEqual([
      ['Acreditación', 2, 1, 'colgroup'],
      ['Tipo de operación', 1, 2, 'col'],
      ['Documento', 1, 2, 'col'],
      ['Importe', 1, 1, 'colgroup'],
    ]);
    expect(superior[0].style.width).withContext('suma de los anchos del grupo').toBe('224px');
    expect(Array.from(el().querySelectorAll('[data-cabecera-columna]')).map((c) => c.textContent!.trim())).toEqual(['Secuencia', 'Fecha', 'Saldo final']);
  });

  it('sin grupos, una sola fila de cabecera', () => {
    montar([{ key: 'secuencia', label: 'Secuencia' }, { key: 'saldo', label: 'Saldo', align: 'right' }], filas);
    expect(el().querySelectorAll('thead tr').length).toBe(1);
    expect(el().querySelectorAll('[data-cabecera-superior]').length).toBe(2);
  });

  it('los importes van a la derecha y la última columna queda fija con la línea de cabecera opaca', () => {
    montar(columnas, filas);
    const celdaFija = el().querySelectorAll<HTMLTableRowElement>('tbody tr')[0].cells[4];
    expect(celdaFija.textContent!.trim()).toBe('10,000.00');
    expect(celdaFija.classList).toContain('text-right');
    expect(celdaFija.classList).toContain('sticky');
    expect(celdaFija.classList).toContain('right-0');
    const cabeceraFija = el().querySelector<HTMLElement>('[data-cabecera-columna].sticky')!;
    expect(cabeceraFija.textContent!.trim()).toBe('Saldo final');
    expect(cabeceraFija.classList).toContain('border-b-0');
  });

  it('una columna link pinta un botón que emite la fila y la columna; sin valor no hay botón', () => {
    montar(columnas, filas);
    const emitidos: string[] = [];
    fixture.componentInstance.linkClicked.subscribe(({ row, column }) => emitidos.push(`${column.key}:${row['secuencia']}`));
    const botones = Array.from(el().querySelectorAll<HTMLButtonElement>('tbody button'));
    expect(botones.map((b) => b.textContent!.trim())).toEqual(['000001-2026']);
    botones[0].click();
    expect(emitidos).toEqual(['documento:000001']);
  });

  it('la zona desplazable es una región con nombre que recibe el foco, y sin filas avisa con role="status"', () => {
    montar(columnas, []);
    const region = el().querySelector<HTMLElement>('[role="region"]')!;
    expect(region.getAttribute('aria-label')).toBe('Movimientos');
    expect(region.tabIndex).toBe(0);
    const aviso = el().querySelector<HTMLTableCellElement>('td[role="status"]')!;
    expect(aviso.colSpan).toBe(5);
    expect(aviso.textContent).toContain('No se encontraron resultados');
  });
});
