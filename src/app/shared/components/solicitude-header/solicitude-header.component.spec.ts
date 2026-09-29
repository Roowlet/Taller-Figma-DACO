import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ButtonComponent } from '../../ui/button/button.component';
import { SolicitudeHeaderComponent } from './solicitude-header.component';

describe('SolicitudeHeaderComponent', () => {
  let fixture: ComponentFixture<SolicitudeHeaderComponent>;

  const configurar = (inputs: Record<string, unknown>) => {
    for (const [nombre, valor] of Object.entries(inputs)) fixture.componentRef.setInput(nombre, valor);
    fixture.detectChanges();
  };
  const barraMovil = () => fixture.debugElement.query(By.css('div.fixed.lg\\:hidden'));
  const acciones = () => (barraMovil()?.queryAll(By.directive(ButtonComponent)) ?? []).map((d) => {
    const boton = d.componentInstance as ButtonComponent;
    return {
      texto: (d.nativeElement as HTMLElement).querySelector('button > span')!.textContent!.trim(),
      icono: boton.icon,
      variante: boton.variant,
      deshabilitado: boton.disabled,
    };
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SolicitudeHeaderComponent] }).compileComponents();
    fixture = TestBed.createComponent(SolicitudeHeaderComponent);
  });

  it('barra móvil en Nuevo: Cancelar y Grabar solo con texto, Verificar principal con ícono (Figma «Docked toolbar»)', () => {
    configurar({ role: 'creator', state: 'new' });
    expect(acciones()).toEqual([
      { texto: 'Cancelar', icono: '', variante: 'secondary', deshabilitado: false },
      { texto: 'Grabar', icono: '', variante: 'secondary', deshabilitado: false },
      { texto: 'Verificar', icono: 'task_alt', variante: 'accent', deshabilitado: false },
    ]);
  });

  it('en cada estado la última acción es la principal: solo ella lleva ícono', () => {
    const casos: Array<[string, string, string[], string]> = [
      ['creator', 'edit', ['Cancelar', 'Grabar'], 'save'],
      ['creator', 'elaborated', ['Eliminar', 'Editar', 'Verificar'], 'task_alt'],
      ['creator', 'observed', ['Eliminar', 'Editar'], 'edit'],
      ['approver', 'verified', ['Rechazar', 'Observar', 'Aprobar'], 'inventory'],
    ];
    for (const [role, state, textos, icono] of casos) {
      configurar({ role, state });
      expect(acciones().map((a) => a.texto)).withContext(state).toEqual(textos);
      expect(acciones().map((a) => a.icono)).withContext(state).toEqual([...textos.slice(1).map(() => ''), icono]);
    }
  });

  it('conserva variantes y deshabilitados: Grabar sin cambios, Eliminar en observado y Editar relleno', () => {
    configurar({ role: 'creator', state: 'edit', saveDisabled: true });
    expect(acciones()[1]).toEqual({ texto: 'Grabar', icono: 'save', variante: 'accent', deshabilitado: true });

    configurar({ role: 'creator', state: 'observed', saveDisabled: false });
    expect(acciones()).toEqual([
      { texto: 'Eliminar', icono: '', variante: 'secondary', deshabilitado: true },
      { texto: 'Editar', icono: 'edit', variante: 'primary', deshabilitado: false },
    ]);
  });

  it('cada botón de la barra emite su evento', () => {
    configurar({ role: 'approver', state: 'verified' });
    const emitidos: string[] = [];
    const header = fixture.componentInstance;
    header.rejected.subscribe(() => emitidos.push('rejected'));
    header.observed.subscribe(() => emitidos.push('observed'));
    header.approved.subscribe(() => emitidos.push('approved'));

    barraMovil().queryAll(By.css('button')).forEach((b) => (b.nativeElement as HTMLButtonElement).click());
    expect(emitidos).toEqual(['rejected', 'observed', 'approved']);
  });

  it('no pinta la barra sin botonera, con acciones proyectadas, cargando o sin acciones', () => {
    configurar({ role: 'creator', state: 'new', showButtonGroup: false });
    expect(barraMovil()).toBeNull();
    configurar({ showButtonGroup: true, customActions: true });
    expect(barraMovil()).toBeNull();
    configurar({ customActions: false, loading: true });
    expect(barraMovil()).toBeNull();
    configurar({ loading: false, role: 'approver', state: 'approved' });
    expect(barraMovil()).toBeNull();
  });
});
