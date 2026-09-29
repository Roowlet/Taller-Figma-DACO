import { ComponentFixture, TestBed } from '@angular/core/testing';

import type { QueryReportParameterField, QueryReportParameters } from '../../types/query-report.types';
import { QueryParametersPanelComponent, tieneValor } from './query-parameters-panel.component';

describe('QueryParametersPanelComponent', () => {
  let fixture: ComponentFixture<QueryParametersPanelComponent>;
  let panel: QueryParametersPanelComponent;
  const el = (): HTMLElement => fixture.nativeElement;
  const boton = (texto: string): HTMLButtonElement =>
    Array.from(el().querySelectorAll<HTMLButtonElement>('footer button')).find((b) => b.textContent!.trim() === texto)!;

  const campos: QueryReportParameterField[] = [
    { key: 'desde', label: 'Fecha desde', type: 'date', required: true, icon: 'calendar_today' },
    { key: 'entidades', label: 'Entidades', type: 'select-multiple', icon: 'apartment', options: [{ label: 'MINCETUR', value: 'mincetur' }] },
    { key: 'fuente', label: 'Fuente', type: 'select', icon: 'account_balance_wallet', options: [{ label: '1.00 Recursos Ordinarios', value: '1.00' }] },
  ];

  const abrir = (valores: QueryReportParameters | null = null): void => {
    fixture.componentRef.setInput('fields', campos);
    fixture.componentRef.setInput('values', valores);
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [QueryParametersPanelComponent] }).compileComponents();
    fixture = TestBed.createComponent(QueryParametersPanelComponent);
    panel = fixture.componentInstance;
  });

  it('tieneValor: una lista vacía o un texto vacío no cuentan', () => {
    expect(tieneValor('')).toBeFalse();
    expect(tieneValor([])).toBeFalse();
    expect(tieneValor(undefined)).toBeFalse();
    expect(tieneValor('2026-06-01')).toBeTrue();
    expect(tieneValor(['a'])).toBeTrue();
  });

  it('pinta un diálogo con título y un control por campo, según su tipo', () => {
    abrir();
    const dialogo = el().querySelector<HTMLElement>('[role="dialog"]')!;
    expect(dialogo.getAttribute('aria-modal')).toBe('true');
    expect(el().querySelector(`#${dialogo.getAttribute('aria-labelledby')}`)?.textContent?.trim()).toBe('Parámetros de consulta');
    expect(Array.from(el().querySelectorAll('[data-parametro]')).map((c) => [c.getAttribute('data-parametro'), c.tagName.toLowerCase()])).toEqual([
      ['desde', 'siaf-date-time-picker'],
      ['entidades', 'siaf-input'],
      ['fuente', 'siaf-input'],
    ]);
  });

  it('«Aplicar consulta» se habilita con los obligatorios y emite solo los valores ingresados', () => {
    abrir();
    const emitidos: QueryReportParameters[] = [];
    panel.applied.subscribe((v) => emitidos.push(v));
    expect(boton('Aplicar consulta').disabled).withContext('vacío').toBeTrue();

    panel.cambiar('fuente', '1.00');
    fixture.detectChanges();
    expect(boton('Aplicar consulta').disabled).withContext('falta la fecha obligatoria').toBeTrue();

    panel.cambiar('desde', '2026-06-01');
    panel.cambiar('entidades', []);
    fixture.detectChanges();
    expect(boton('Aplicar consulta').disabled).toBeFalse();
    boton('Aplicar consulta').click();

    expect(emitidos).toEqual([{ fuente: '1.00', desde: '2026-06-01' }]);
  });

  it('«Limpiar todo» vacía el borrador y cerrar sin aplicar no cambia nada', () => {
    abrir();
    const aplicados: QueryReportParameters[] = [];
    let cerrado = 0;
    panel.applied.subscribe((v) => aplicados.push(v));
    panel.closed.subscribe(() => cerrado++);

    panel.cambiar('desde', '2026-06-01');
    boton('Limpiar todo').click();
    fixture.detectChanges();
    expect(panel.hayValores()).toBeFalse();
    expect(boton('Aplicar consulta').disabled).toBeTrue();

    el().querySelector<HTMLButtonElement>('header button')!.click();
    expect(cerrado).toBe(1);
    expect(aplicados).toEqual([]);
  });

  it('al abrirse parte de los parámetros aplicados', () => {
    abrir({ desde: '2026-06-28', entidades: ['mincetur'] });
    expect(panel.texto('desde')).toBe('2026-06-28');
    expect(panel.lista('entidades')).toEqual(['mincetur']);
    expect(boton('Aplicar consulta').disabled).toBeFalse();
  });
});
