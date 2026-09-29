import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CascadingMenuComponent, CascadingMenuGroup, CascadingMenuSelection } from './cascading-menu.component';

const GRUPOS: CascadingMenuGroup[] = [
  {
    id: 'gastos',
    label: '1.- Gastos',
    options: [
      { id: '1.1', label: '1.1.- Con Afectación Presupuestal de Gastos' },
      { id: '1.2', label: '1.2.- Sin Afectación Presupuestal de Gastos' }
    ]
  },
  {
    id: 'tesoro',
    label: '5.- Operaciones Tesoro',
    options: [{ id: '5.1', label: '5.1.- Traspasos' }, { id: '5.2', label: '5.2.- Bloqueado', disabled: true }]
  }
];

describe('CascadingMenuComponent', () => {
  let fixture: ComponentFixture<CascadingMenuComponent>;
  let comp: CascadingMenuComponent;
  const el = (): HTMLElement => fixture.nativeElement;
  const categorias = (): HTMLElement[] =>
    Array.from(el().querySelectorAll<HTMLElement>('siaf-menu:not([data-submenu] siaf-menu) > [role="menu"] > [role="menuitem"]'));
  const opciones = (): HTMLElement[] => Array.from(el().querySelectorAll<HTMLElement>('[data-submenu] [role="menuitem"]'));
  const abrir = (i: number): void => {
    categorias()[i].click();
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CascadingMenuComponent] }).compileComponents();

    fixture = TestBed.createComponent(CascadingMenuComponent);
    comp = fixture.componentInstance;
    fixture.componentRef.setInput('groups', GRUPOS);
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
  });

  it('usa siaf-menu: las categorías son opciones con flecha y arranca sin submenú', () => {
    expect(el().querySelector('siaf-menu')).not.toBeNull();
    expect(categorias().map((c) => c.textContent?.replace('arrow_right', '').trim())).toEqual(['1.- Gastos', '5.- Operaciones Tesoro']);
    expect(categorias()[0].getAttribute('aria-haspopup')).toBe('menu');
    expect(opciones().length).toBe(0);
  });

  it('cerrado no pinta el menú', () => {
    fixture.componentRef.setInput('open', false);
    fixture.detectChanges();
    expect(el().querySelector('siaf-menu')).toBeNull();
  });

  it('elegir una categoría abre sus opciones, sin íconos', () => {
    abrir(0);
    expect(opciones().map((o) => o.textContent?.trim())).toEqual([
      '1.1.- Con Afectación Presupuestal de Gastos',
      '1.2.- Sin Afectación Presupuestal de Gastos',
    ]);
    expect(el().querySelectorAll('[data-submenu] siaf-icon').length).toBe(0);

    abrir(1);
    expect(opciones().map((o) => o.textContent?.trim())).toEqual(['5.1.- Traspasos', '5.2.- Bloqueado']);
  });

  it('emite la selección con su categoría y pide cerrar', () => {
    let seleccion: CascadingMenuSelection | null = null;
    let cerrado = false;
    comp.selected.subscribe((s) => (seleccion = s));
    comp.closed.subscribe(() => (cerrado = true));

    abrir(0);
    opciones()[1].click();

    expect(seleccion!).toEqual({
      groupId: 'gastos',
      groupLabel: '1.- Gastos',
      optionId: '1.2',
      optionLabel: '1.2.- Sin Afectación Presupuestal de Gastos'
    });
    expect(cerrado).toBeTrue();
  });

  it('una opción deshabilitada no emite selección', () => {
    let emitido = false;
    comp.selected.subscribe(() => (emitido = true));
    abrir(1);
    opciones()[1].click();
    expect(emitido).toBeFalse();
    expect(opciones()[1].getAttribute('aria-disabled')).toBe('true');
  });

  it('la capa de fondo y Escape avisan al padre para cerrar', () => {
    let cierres = 0;
    comp.closed.subscribe(() => cierres++);
    el().querySelector<HTMLButtonElement>('button[data-capa-cierre]')!.click();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(cierres).toBe(2);
  });
});
