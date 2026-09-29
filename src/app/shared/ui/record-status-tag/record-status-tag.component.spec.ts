import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordStatus, RecordStatusTagComponent } from './record-status-tag.component';

describe('RecordStatusTagComponent', () => {
  let fixture: ComponentFixture<RecordStatusTagComponent>;
  const etiqueta = (): HTMLElement => fixture.nativeElement.querySelector('siaf-status-tag > span');
  const pintar = (estado: RecordStatus): void => {
    fixture.componentRef.setInput('status', estado);
    fixture.detectChanges();
  };
  const estilo = (): { tono: string | null; apariencia: string | null; icono: string | null } => ({
    tono: etiqueta().getAttribute('data-tono'),
    apariencia: etiqueta().getAttribute('data-apariencia'),
    icono: etiqueta().querySelector('siaf-icon')?.textContent?.trim() ?? null,
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [RecordStatusTagComponent] }).compileComponents();
    fixture = TestBed.createComponent(RecordStatusTagComponent);
    document.body.appendChild(fixture.nativeElement);
  });

  afterEach(() => {
    fixture.destroy();
    fixture.nativeElement.remove();
  });

  it('Abierto y Cerrado siguen las «Period tags» del Figma: fondo suave, azul y gris, sin ícono', () => {
    pintar('Abierto');
    expect(estilo()).toEqual({ tono: 'info', apariencia: 'soft', icono: null });
    pintar('Cerrado');
    expect(estilo()).toEqual({ tono: 'default', apariencia: 'soft', icono: null });
  });

  it('En Proceso y Validado siguen las «status items tags»: solo borde, azul, con change_circle y fact_check', () => {
    pintar('En Proceso');
    expect(estilo()).toEqual({ tono: 'info', apariencia: 'outline', icono: 'change_circle' });
    pintar('Validado');
    expect(estilo()).toEqual({ tono: 'info', apariencia: 'outline', icono: 'fact_check' });
  });

  it('los estados que el Figma no tiene conservan su fondo suave, su ícono y su tono', () => {
    const esperados: [RecordStatus, string, string][] = [
      ['Activo', 'info', 'check_circle'],
      ['Inactivo', 'default', 'info'],
      ['Anulado', 'danger', 'assignment_late'],
      ['Eliminado', 'danger', 'assignment_late'],
      ['Procesado', 'info', 'check_circle'],
    ];
    for (const [estado, tono, icono] of esperados) {
      pintar(estado);
      expect(estilo()).withContext(estado).toEqual({ tono, apariencia: 'soft', icono });
      expect(etiqueta().textContent).toContain(estado);
    }
  });

  it('small (por defecto) mide 24 px y standard, 32 px', () => {
    pintar('Activo');
    expect(etiqueta().getBoundingClientRect().height).toBe(24);
    fixture.componentRef.setInput('size', 'standard');
    fixture.detectChanges();
    expect(etiqueta().getBoundingClientRect().height).toBe(32);
  });
});
