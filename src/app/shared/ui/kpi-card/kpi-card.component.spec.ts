import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiCardComponent } from './kpi-card.component';

describe('KpiCardComponent', () => {
  let fixture: ComponentFixture<KpiCardComponent>;
  const q = <T extends HTMLElement>(selector: string): T | null => fixture.nativeElement.querySelector(selector);

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [KpiCardComponent] }).compileComponents();
    fixture = TestBed.createComponent(KpiCardComponent);
    fixture.componentRef.setInput('title', 'Total Activos');
    fixture.componentRef.setInput('amount', '$1,245,800.00');
    fixture.componentRef.setInput('progress', 80);
    fixture.detectChanges();
  });

  it('muestra título, monto y una tarjeta nombrada por el título', () => {
    expect(q('article')?.getAttribute('aria-label')).toBe('Total Activos');
    expect(fixture.nativeElement.textContent).toContain('Total Activos');
    expect(fixture.nativeElement.textContent).toContain('$1,245,800.00');
  });

  it('la barra es un progressbar con el valor y el título; el porcentaje visible no se lee dos veces', () => {
    const barra = q('[role="progressbar"]')!;
    expect(barra.getAttribute('aria-valuenow')).toBe('80');
    expect(barra.getAttribute('aria-valuemin')).toBe('0');
    expect(barra.getAttribute('aria-valuemax')).toBe('100');
    expect(barra.getAttribute('aria-label')).toBe('Total Activos');
    const porcentaje = Array.from(fixture.nativeElement.querySelectorAll('span[aria-hidden="true"]')).find((s) => (s as HTMLElement).textContent?.trim() === '80%');
    expect(porcentaje).withContext('porcentaje en texto con aria-hidden').toBeTruthy();
  });

  it('recorta el avance a 0-100 y la barra se muestra siempre, como en el Figma (0 % sin avance)', () => {
    fixture.componentRef.setInput('progress', 130);
    fixture.detectChanges();
    expect(q('[role="progressbar"]')?.getAttribute('aria-valuenow')).toBe('100');

    const sinAvance = TestBed.createComponent(KpiCardComponent);
    sinAvance.componentRef.setInput('title', 'Documentos observados');
    sinAvance.componentRef.setInput('amount', '18');
    sinAvance.detectChanges();
    const barra = (sinAvance.nativeElement as HTMLElement).querySelector('[role="progressbar"]');
    expect(barra).withContext('la barra no se oculta').not.toBeNull();
    expect(barra?.getAttribute('aria-valuenow')).toBe('0');
    expect((sinAvance.nativeElement as HTMLElement).textContent).toContain('0%');
  });

  it('cada tono pinta la caja del ícono con sus tokens del Figma', () => {
    const caja = (): string => q('siaf-icon')!.parentElement!.className;
    expect(caja()).toContain('bg-surfaces-highlight');
    expect(caja()).toContain('icon-states-active');
    for (const tono of ['success', 'warning', 'danger'] as const) {
      fixture.componentRef.setInput('tone', tono);
      fixture.detectChanges();
      expect(caja()).withContext(tono).toContain(`bg-feedback-light-${tono}`);
      expect(caja()).withContext(tono).toContain(`icon-feedback-light-${tono}`);
    }
  });
});
