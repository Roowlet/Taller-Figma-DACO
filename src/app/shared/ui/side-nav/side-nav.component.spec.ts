import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SideNavComponent } from './side-nav.component';

@Component({
  standalone: true,
  imports: [SideNavComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <siaf-side-nav
      title="Detalle del registro"
      [open]="abierto()"
      [embedded]="embebido()"
      [showClose]="conCerrar()"
      [showReturn]="conVolver()"
      [showFooter]="conPie()"
      [confirmDisabled]="bloqueado()"
      (closed)="eventos.push('closed')"
      (canceled)="eventos.push('canceled')"
      (confirmed)="eventos.push('confirmed')"
      (returned)="eventos.push('returned')"
    >
      <p id="contenido">Contenido del panel</p>
    </siaf-side-nav>
  `,
})
class AnfitrionComponent {
  readonly abierto = signal(true);
  readonly embebido = signal(false);
  readonly conCerrar = signal(true);
  readonly conVolver = signal(false);
  readonly conPie = signal(true);
  readonly bloqueado = signal(false);
  eventos: string[] = [];
}

describe('SideNavComponent', () => {
  let fixture: ComponentFixture<AnfitrionComponent>;
  let app: AnfitrionComponent;
  const el = (): HTMLElement => fixture.nativeElement;
  const boton = (texto: string): HTMLButtonElement =>
    Array.from(el().querySelectorAll<HTMLButtonElement>('button')).find((b) => (b.getAttribute('aria-label') ?? b.textContent!.trim()) === texto)!;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AnfitrionComponent] }).compileComponents();
    fixture = TestBed.createComponent(AnfitrionComponent);
    app = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('abierto es un diálogo de 420 px con el título en mayúsculas, la X, el contenido y el pie Cancelar / Aceptar', () => {
    const dialogo = el().querySelector<HTMLElement>('[role="dialog"]')!;
    expect(dialogo.getAttribute('aria-modal')).toBe('true');
    const titulo = el().querySelector<HTMLElement>(`#${dialogo.getAttribute('aria-labelledby')}`)!;
    expect(titulo.tagName).toBe('H2');
    expect(titulo.textContent?.trim()).toBe('Detalle del registro');
    expect(titulo.classList).toContain('uppercase');
    expect(el().querySelector('aside')?.classList).toContain('max-w-[420px]');
    expect(el().querySelector('aside #contenido')).not.toBeNull();
    expect(boton('Cerrar Detalle del registro').querySelector('siaf-icon')?.textContent?.trim()).toBe('close');
    expect(Array.from(el().querySelectorAll('footer siaf-button')).map((b) => b.textContent?.trim())).toEqual(['Cancelar', 'Aceptar']);
  });

  it('cerrado no pinta el diálogo', () => {
    const vacio = TestBed.createComponent(AnfitrionComponent);
    vacio.componentInstance.abierto.set(false);
    vacio.detectChanges();
    expect((vacio.nativeElement as HTMLElement).querySelector('[role="dialog"]')).toBeNull();
    vacio.destroy();
  });

  it('Cancelar emite canceled y closed, Aceptar emite confirmed, la flecha emite returned y la X, closed', () => {
    app.conVolver.set(true);
    fixture.detectChanges();

    boton('Cancelar').click();
    boton('Aceptar').click();
    boton('Volver').click();
    boton('Cerrar Detalle del registro').click();
    expect(app.eventos).toEqual(['canceled', 'closed', 'confirmed', 'returned', 'closed']);
  });

  it('confirmDisabled deshabilita Aceptar y showFooter en false quita el pie', () => {
    app.bloqueado.set(true);
    fixture.detectChanges();
    expect(boton('Aceptar').disabled).toBeTrue();

    app.conPie.set(false);
    fixture.detectChanges();
    expect(el().querySelector('footer')).toBeNull();
  });

  it('embedded: sin diálogo ni fondo oscuro, título h3, sobre surface-highest y Cancelar solo emite canceled', () => {
    app.abierto.set(false);
    app.embebido.set(true);
    app.conCerrar.set(false);
    fixture.detectChanges();

    expect(el().querySelector('[role="dialog"]')).toBeNull();
    expect(el().querySelector('.siaf-sidepanel-overlay')).toBeNull();
    const seccion = el().querySelector<HTMLElement>('section[aria-labelledby]')!;
    const titulo = el().querySelector<HTMLElement>(`#${seccion.getAttribute('aria-labelledby')}`)!;
    expect(titulo.tagName).toBe('H3');
    expect(seccion.classList).toContain('bg-[var(--sys-color-bg-surfaces-surface-highest)]');
    expect(seccion.querySelector('#contenido')).not.toBeNull();
    expect(boton('Cerrar Detalle del registro')).toBeUndefined();

    boton('Cancelar').click();
    expect(app.eventos).toEqual(['canceled']);
  });
});
