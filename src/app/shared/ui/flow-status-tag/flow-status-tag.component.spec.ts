import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlowStatus, FlowStatusTagComponent } from './flow-status-tag.component';

/** Tono de cada estado en el Figma «flow tags» (UI KIT, 2576:10069). */
const TONO_FIGMA: Record<FlowStatus, string> = {
  Elaborado: 'default',
  Registrado: 'default',
  Verificado: 'info',
  Validado: 'info',
  Revisado: 'info',
  Generado: 'info',
  'En proceso': 'info',
  Autorizado: 'success',
  Firmado: 'success',
  Aprobado: 'success',
  Aceptado: 'success',
  Publicado: 'success',
  Procesado: 'success',
  Observado: 'warning',
  Pendiente: 'warning',
  Fallido: 'warning',
  Eliminado: 'danger',
  Rechazado: 'danger',
  Anulado: 'danger',
};

describe('FlowStatusTagComponent', () => {
  let fixture: ComponentFixture<FlowStatusTagComponent>;
  const etiqueta = (): HTMLElement => fixture.nativeElement.querySelector('siaf-status-tag > span');

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [FlowStatusTagComponent] }).compileComponents();
    fixture = TestBed.createComponent(FlowStatusTagComponent);
    document.body.appendChild(fixture.nativeElement);
  });

  afterEach(() => {
    fixture.destroy();
    fixture.nativeElement.remove();
  });

  it('pinta cada uno de los 19 estados con el tono del Figma, en estilo solid y con su nombre', () => {
    for (const [estado, tono] of Object.entries(TONO_FIGMA) as [FlowStatus, string][]) {
      fixture.componentRef.setInput('status', estado);
      fixture.detectChanges();
      expect(etiqueta().getAttribute('data-tono')).withContext(estado).toBe(tono);
      expect(etiqueta().getAttribute('data-apariencia')).toBe('solid');
      expect(etiqueta().textContent?.trim()).toBe(estado);
    }
  });

  it('small (por defecto, el de tablas y resúmenes) mide 24 px y standard, 32 px', () => {
    fixture.detectChanges();
    expect(etiqueta().getBoundingClientRect().height).toBe(24);

    fixture.componentRef.setInput('size', 'standard');
    fixture.detectChanges();
    expect(etiqueta().getBoundingClientRect().height).toBe(32);
  });
});
