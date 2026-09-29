import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportSummaryCardComponent } from './report-summary-card.component';

describe('ReportSummaryCardComponent', () => {
  let fixture: ComponentFixture<ReportSummaryCardComponent>;
  const el = (): HTMLElement => fixture.nativeElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ReportSummaryCardComponent] }).compileComponents();
    fixture = TestBed.createComponent(ReportSummaryCardComponent);
    fixture.componentRef.setInput('label', 'Entidad');
    fixture.componentRef.setInput('icon', 'account_balance_wallet');
    fixture.componentRef.setInput('title', 'MINCETUR');
    fixture.componentRef.setInput('description', 'Ministerio de Comercio Exterior y Turismo');
    fixture.componentRef.setInput('fields', [
      { label: 'Código', value: '000360' },
      { label: 'Saldo final', value: 'S/ 1,031,200.00' },
    ]);
    fixture.detectChanges();
  });

  it('es una sección nombrada con la etiqueta, con el título y la descripción del ítem', () => {
    expect(el().querySelector('section')?.getAttribute('aria-label')).toBe('Entidad');
    expect(el().querySelector('[data-resumen-titulo]')?.textContent?.trim()).toBe('MINCETUR');
    expect(el().textContent).toContain('Ministerio de Comercio Exterior y Turismo');
    expect(el().querySelector('siaf-icon')?.textContent).toContain('account_balance_wallet');
  });

  it('los datos son una lista de definiciones: cada valor con su etiqueta', () => {
    const pares = Array.from(el().querySelectorAll('dl > div')).map((d) => [d.querySelector('dt')?.textContent?.trim(), d.querySelector('dd')?.textContent?.trim()]);
    expect(pares).toEqual([
      ['Código', '000360'],
      ['Saldo final', 'S/ 1,031,200.00'],
    ]);
  });

  it('sin datos no pinta la lista, y sin etiqueta la sección toma el título', () => {
    fixture.componentRef.setInput('fields', []);
    fixture.componentRef.setInput('label', '');
    fixture.detectChanges();
    expect(el().querySelector('dl')).toBeNull();
    expect(el().querySelector('section')?.getAttribute('aria-label')).toBe('MINCETUR');
  });
});
