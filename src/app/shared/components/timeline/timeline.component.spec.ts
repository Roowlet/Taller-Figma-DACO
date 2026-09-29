import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimelineComponent, TimelineItem } from './timeline.component';

describe('TimelineComponent', () => {
  let fixture: ComponentFixture<TimelineComponent>;
  const el = (): HTMLElement => fixture.nativeElement;
  const puntos = (): HTMLElement[] => Array.from(el().querySelectorAll<HTMLElement>('li > [data-estado]'));
  const relleno = (): HTMLElement => el().querySelector<HTMLElement>('.bg-brand-primary')!;

  const hitos: TimelineItem[] = [
    { label: 'Apertura', date: '05/01/2026' },
    { label: 'Conteo físico', date: '20/01/2026' },
    { label: 'Conciliación' },
    { label: 'Cierre', date: '28/02/2026' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TimelineComponent] }).compileComponents();
    fixture = TestBed.createComponent(TimelineComponent);
    fixture.componentRef.setInput('title', 'Seguimiento del proceso');
    fixture.componentRef.setInput('items', hitos);
    fixture.componentRef.setInput('current', 1);
    fixture.detectChanges();
  });

  it('marca cumplidos los hitos anteriores, en curso el actual y pendientes los siguientes', () => {
    expect(puntos().map((p) => p.dataset['estado'])).toEqual(['done', 'current', 'pending', 'pending']);
    expect(puntos()[1].getAttribute('aria-current')).toBe('step');
  });

  it('llena la barra hasta el punto del hito en curso', () => {
    expect(relleno().style.width).toBe('50%');

    fixture.componentRef.setInput('current', -1);
    fixture.detectChanges();
    expect(relleno().style.width).toBe('0%');

    fixture.componentRef.setInput('current', hitos.length);
    fixture.detectChanges();
    expect(relleno().style.width).toBe('100%');
    expect(puntos().every((p) => p.dataset['estado'] === 'done')).toBeTrue();
  });

  it('cada punto se enfoca y anuncia posición, nombre, fecha y estado', () => {
    const [primero, , tercero] = puntos();
    expect(primero.getAttribute('tabindex')).toBe('0');
    expect(primero.getAttribute('aria-label')).toBe('Hito 1 de 4: Apertura · 05/01/2026, cumplido');
    expect(tercero.getAttribute('aria-label')).toBe('Hito 3 de 4: Conciliación, pendiente');
  });

  it('«Ver detalle» abre el panel de detalle con los mismos hitos y avisa', () => {
    let veces = 0;
    fixture.componentInstance.detail.subscribe(() => veces++);
    expect(el().querySelector('siaf-timeline-detail-panel [role="dialog"]')).toBeNull();

    el().querySelector<HTMLButtonElement>('siaf-button button')!.click();
    fixture.detectChanges();

    expect(veces).toBe(1);
    const panel = el().querySelector('siaf-timeline-detail-panel [role="dialog"]');
    expect(panel).not.toBeNull();
    expect(panel!.querySelectorAll('li[data-estado]').length).toBe(hitos.length);
    expect(panel!.textContent).toContain('Seguimiento del proceso');
    expect(panel!.textContent).toContain('1 hito completado de 4');
  });

  it('con openDetailPanel en false «Ver detalle» solo avisa', () => {
    fixture.componentRef.setInput('openDetailPanel', false);
    fixture.detectChanges();
    let veces = 0;
    fixture.componentInstance.detail.subscribe(() => veces++);

    el().querySelector<HTMLButtonElement>('siaf-button button')!.click();
    fixture.detectChanges();

    expect(veces).toBe(1);
    expect(el().querySelector('siaf-timeline-detail-panel')).toBeNull();
  });

  it('«Ver detalle» se puede ocultar', () => {

    fixture.componentRef.setInput('showDetail', false);
    fixture.detectChanges();
    expect(el().querySelector('siaf-button')).toBeNull();
  });
});
