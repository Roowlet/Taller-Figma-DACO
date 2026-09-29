import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconDropdownMenuItem } from '../icon-dropdown-menu/icon-dropdown-menu.component';
import { ExpansionPanelComponent } from './expansion-panel.component';

@Component({
  standalone: true,
  imports: [ExpansionPanelComponent],
  template: `
    <siaf-expansion-panel title="head panel" [actions]="acciones()" [(expanded)]="abierto" (action)="elegidas.push($event)">
      <p class="cuerpo">body panel</p>
    </siaf-expansion-panel>
  `,
})
class AnfitrionComponent {
  readonly abierto = signal(false);
  readonly acciones = signal<IconDropdownMenuItem[]>([{ label: 'Eliminar', value: 'eliminar', icon: 'delete' }]);
  elegidas: string[] = [];
}

describe('ExpansionPanelComponent', () => {
  let fixture: ComponentFixture<AnfitrionComponent>;
  const el = (): HTMLElement => fixture.nativeElement;
  const flecha = (): HTMLButtonElement => el().querySelector<HTMLButtonElement>('button[aria-expanded]')!;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AnfitrionComponent] }).compileComponents();
    fixture = TestBed.createComponent(AnfitrionComponent);
    fixture.detectChanges();
  });

  it('cerrado muestra solo la cabecera con expand_more', () => {
    expect(el().querySelector('.cuerpo')).toBeNull();
    expect(flecha().getAttribute('aria-expanded')).toBe('false');
    expect(flecha().textContent).toContain('expand_more');
    expect(el().querySelector('h3')?.textContent?.trim()).toBe('head panel');
  });

  it('la flecha y el título lo abren y cierran, y [(expanded)] se mantiene al día', () => {
    flecha().click();
    fixture.detectChanges();
    expect(el().querySelector('.cuerpo')?.textContent).toBe('body panel');
    expect(flecha().textContent).toContain('expand_less');
    expect(fixture.componentInstance.abierto()).toBeTrue();
    expect(el().querySelector('[role="region"]')?.getAttribute('aria-labelledby')).toBe(el().querySelector('h3')?.id);

    el().querySelector<HTMLElement>('h3')!.click();
    fixture.detectChanges();
    expect(el().querySelector('.cuerpo')).toBeNull();
    expect(fixture.componentInstance.abierto()).toBeFalse();
  });

  it('el menú ⋮ muestra sus opciones con ícono y emite la elegida', () => {
    el().querySelector<HTMLButtonElement>('button[aria-haspopup="menu"]')!.click();
    fixture.detectChanges();
    const opcion = el().querySelector<HTMLButtonElement>('[role="menuitem"]')!;
    expect(opcion.textContent).toContain('delete');
    expect(opcion.textContent).toContain('Eliminar');
    opcion.click();
    expect(fixture.componentInstance.elegidas).toEqual(['eliminar']);
  });

  it('sin acciones no hay botón ⋮', () => {
    fixture.componentInstance.acciones.set([]);
    fixture.detectChanges();
    expect(el().querySelector('siaf-icon-dropdown-menu')).toBeNull();
  });
});
