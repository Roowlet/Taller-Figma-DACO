import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopoverAction, PopoverComponent } from './popover.component';

@Component({
  standalone: true,
  imports: [PopoverComponent],
  template: `
    <siaf-popover
      [open]="abierto()"
      [title]="titulo()"
      text="Lorem ipsum dolor sit amet."
      [actions]="acciones()"
      (closed)="cierres = cierres + 1; abierto.set(false)"
      (action)="elegidas.push($event)"
    >
      <button popover-trigger type="button" (click)="abierto.set(!abierto())">Abrir</button>
    </siaf-popover>
    <button class="fuera" type="button">Fuera</button>
  `,
})
class AnfitrionComponent {
  readonly abierto = signal(false);
  readonly titulo = signal('Cuenta 1101.01');
  readonly acciones = signal<PopoverAction[]>([{ label: 'Ver detalle', value: 'detalle' }, { label: 'Cerrar' }]);
  cierres = 0;
  elegidas: string[] = [];
}

describe('PopoverComponent', () => {
  let fixture: ComponentFixture<AnfitrionComponent>;
  const el = (): HTMLElement => fixture.nativeElement;
  const panel = (): HTMLElement | null => el().querySelector<HTMLElement>('[role="dialog"]');
  const abrir = (): void => {
    el().querySelector<HTMLButtonElement>('[popover-trigger]')!.click();
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AnfitrionComponent] }).compileComponents();
    fixture = TestBed.createComponent(AnfitrionComponent);
    fixture.detectChanges();
  });

  it('cerrado no pinta el panel; el disparador lo abre', () => {
    expect(panel()).toBeNull();
    abrir();
    expect(panel()).not.toBeNull();
  });

  it('Full: título, texto y acciones, con el título como nombre accesible', () => {
    abrir();
    const titulo = panel()!.querySelector('p')!;
    expect(titulo.textContent?.trim()).toBe('Cuenta 1101.01');
    expect(panel()!.getAttribute('aria-labelledby')).toBe(titulo.id);
    expect(panel()!.textContent).toContain('Lorem ipsum dolor sit amet.');
    expect(Array.from(panel()!.querySelectorAll('button')).map((b) => b.textContent?.trim())).toEqual(['Ver detalle', 'Cerrar']);
    expect(panel()!.classList).toContain('w-[268px]');
    expect(panel()!.classList).toContain('shadow-siaf-elevation-6');
  });

  it('Title + Content: sin acciones no hay fila de botones', () => {
    fixture.componentInstance.acciones.set([]);
    abrir();
    expect(panel()!.querySelectorAll('button').length).toBe(0);
  });

  it('Content + Actions: sin título no hay encabezado', () => {
    fixture.componentInstance.titulo.set('');
    abrir();
    expect(panel()!.getAttribute('aria-labelledby')).toBeNull();
    expect(panel()!.querySelectorAll('p').length).toBe(1);
  });

  it('una acción emite su value, o su label si no tiene', () => {
    abrir();
    const [detalle, cerrar] = Array.from(panel()!.querySelectorAll('button'));
    detalle.click();
    cerrar.click();
    expect(fixture.componentInstance.elegidas).toEqual(['detalle', 'Cerrar']);
  });

  it('se cierra con Escape y al pulsar fuera, pero no al pulsar dentro', () => {
    abrir();
    panel()!.click();
    expect(fixture.componentInstance.cierres).toBe(0);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(fixture.componentInstance.cierres).toBe(1);
    expect(panel()).toBeNull();

    abrir();
    el().querySelector<HTMLButtonElement>('.fuera')!.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.cierres).toBe(2);
  });
});
