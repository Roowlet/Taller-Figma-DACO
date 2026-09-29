import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimelineDetailPanelComponent } from './timeline-detail-panel.component';
import { TimelineItem } from './timeline.model';

describe('TimelineDetailPanelComponent', () => {
  let fixture: ComponentFixture<TimelineDetailPanelComponent>;
  const el = (): HTMLElement => fixture.nativeElement;
  const filas = (): HTMLElement[] => Array.from(el().querySelectorAll<HTMLElement>('li[data-estado]'));
  const texto = (e: Element | null): string => (e?.textContent ?? '').replace(/\s+/g, ' ').trim();
  /** Textos visibles de una fila, uno por elemento, separados por espacio. */
  const textosDeFila = (fila: Element): string =>
    Array.from(fila.querySelectorAll('span, p')).map((n) => texto(n)).filter(Boolean).join(' ');

  const hitos: TimelineItem[] = [
    { label: 'Comisión de Inventario', date: '10/10/25', dateInfo: 'Aprobado', description: 'Comisión 2025-01.' },
    { label: 'Plan de Inventario', date: '20/10/25', dateInfo: 'Aprobado', description: '2 planes por almacén.' },
    { label: 'Conciliación Contable' },
    { label: 'Informe Final' },
  ];

  const abrir = (): void => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TimelineDetailPanelComponent] }).compileComponents();
    fixture = TestBed.createComponent(TimelineDetailPanelComponent);
    fixture.componentRef.setInput('processName', 'Proceso inventario masivo de existencias');
    fixture.componentRef.setInput('itemLabel', 'procedimiento');
    fixture.componentRef.setInput('itemsLabel', 'procedimientos');
    fixture.componentRef.setInput('items', hitos);
    fixture.componentRef.setInput('current', 2);
    fixture.detectChanges();
  });

  it('cerrado no pinta nada', () => {
    expect(el().querySelector('[role="dialog"]')).toBeNull();
  });

  it('abierto muestra el avance con la cuenta y el resumen', () => {
    abrir();
    expect(texto(el().querySelector('h2'))).toBe('Detalle del seguimiento');
    const barra = el().querySelector<HTMLElement>('[role="progressbar"]')!;
    expect(barra.getAttribute('aria-valuenow')).toBe('2');
    expect(barra.getAttribute('aria-valuemax')).toBe('4');
    expect((barra.firstElementChild as HTMLElement).style.width).toBe('50%');
    expect(el().textContent).toContain('2/4');
    expect(el().textContent).toContain('2 procedimientos completados de 4');
  });

  it('cada fila sigue el estado del hito: fecha e información si está cumplido, «-» si no', () => {
    abrir();
    expect(filas().map((f) => f.dataset['estado'])).toEqual(['done', 'done', 'current', 'pending']);
    expect(textosDeFila(filas()[0])).toBe('10/10/25 Aprobado 1. Comisión de Inventario Comisión 2025-01.');
    expect(textosDeFila(filas()[2])).toBe('- En proceso 3. Conciliación Contable En proceso');
    expect(textosDeFila(filas()[3])).toBe('- No iniciado 4. Informe Final Aún no iniciado');
    expect(filas()[2].getAttribute('aria-current')).toBe('step');
  });

  it('usa el singular con un solo hito cumplido', () => {
    fixture.componentRef.setInput('current', 1);
    abrir();
    expect(el().textContent).toContain('1 procedimiento completado de 4');
  });

  it('cierra con el botón y con el fondo, pero no al pulsar dentro del panel', () => {
    abrir();
    let cierres = 0;
    fixture.componentInstance.closed.subscribe(() => cierres++);

    el().querySelector<HTMLElement>('aside')!.click();
    expect(cierres).toBe(0);

    el().querySelector<HTMLButtonElement>('button[aria-label="Cerrar"]')!.click();
    el().querySelector<HTMLElement>('[role="dialog"]')!.click();
    expect(cierres).toBe(2);
  });
});
