import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SnackbarComponent, SnackbarTone } from './snackbar.component';

describe('SnackbarComponent', () => {
  let fixture: ComponentFixture<SnackbarComponent>;
  const el = (): HTMLElement => fixture.nativeElement;
  const aviso = (): HTMLElement => el().querySelector<HTMLElement>('[data-tone]')!;
  /** Ícono del tipo: el que va junto al texto, no el de la X. */
  const icono = (): HTMLElement | null => aviso().querySelector<HTMLElement>(':scope > div > siaf-icon');

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SnackbarComponent] }).compileComponents();
    fixture = TestBed.createComponent(SnackbarComponent);
    fixture.componentRef.setInput('message', 'Alert danger information');
    fixture.detectChanges();
  });

  it('por defecto es success: check con el token de ícono del snackbar', () => {
    expect(aviso().dataset['tone']).toBe('success');
    expect(icono()!.textContent).toContain('check_circle');
    expect(icono()!.classList).toContain('text-[var(--sys-color-icon-snackbar-success)]');
    expect(aviso().getAttribute('role')).toBe('status');
  });

  const casos: Array<[SnackbarTone, string, string]> = [
    ['info', 'info', 'text-[var(--sys-color-icon-snackbar-info)]'],
    ['warning', 'warning', 'text-[var(--sys-color-icon-snackbar-warning)]'],
    ['error', 'error', 'text-[var(--sys-color-icon-snackbar-danger)]'],
  ];
  for (const [tono, nombre, clase] of casos) {
    it(`${tono}: ícono ${nombre} con su token`, () => {
      fixture.componentRef.setInput('tone', tono);
      fixture.detectChanges();
      expect(icono()!.textContent).toContain(nombre);
      expect(icono()!.classList).toContain(clase);
      expect(icono()!.classList).toContain('shrink-0');
    });
  }

  it('neutral no lleva ícono', () => {
    fixture.componentRef.setInput('tone', 'neutral');
    fixture.detectChanges();
    expect(icono()).toBeNull();
    expect(aviso().textContent).toContain('Alert danger information');
  });

  it('warning y error se anuncian como alerta', () => {
    fixture.componentRef.setInput('tone', 'warning');
    fixture.detectChanges();
    expect(aviso().getAttribute('role')).toBe('alert');
    fixture.componentRef.setInput('tone', 'info');
    fixture.detectChanges();
    expect(aviso().getAttribute('role')).toBe('status');
  });

  it('con actionLabel muestra el botón antes de la X y emite action', () => {
    expect(aviso().querySelectorAll('button').length).toBe(1);
    fixture.componentRef.setInput('actionLabel', 'Deshacer');
    fixture.detectChanges();

    const [accion, cerrar] = Array.from(aviso().querySelectorAll('button'));
    expect(accion.textContent?.trim()).toBe('Deshacer');
    expect(cerrar.getAttribute('aria-label')).toBe('Cerrar mensaje');

    let acciones = 0;
    fixture.componentInstance.action.subscribe(() => acciones++);
    accion.click();
    expect(acciones).toBe(1);
  });

  it('sin dismissible no hay X', () => {
    fixture.componentRef.setInput('dismissible', false);
    fixture.detectChanges();
    expect(aviso().querySelector('button[aria-label="Cerrar mensaje"]')).toBeNull();
  });
});
