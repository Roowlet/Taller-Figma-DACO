import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidePanelComponent } from './side-panel.component';

@Component({
  standalone: true,
  imports: [SidePanelComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <siaf-side-panel
      title="Movimientos de la cuenta"
      [open]="true"
      [showNav]="conFiltros()"
      [confirmDisabled]="bloqueado()"
      (closed)="eventos.push('closed')"
      (canceled)="eventos.push('canceled')"
      (confirmed)="eventos.push('confirmed')"
      (navCanceled)="eventos.push('navCanceled')"
      (navConfirmed)="eventos.push('navConfirmed')"
    >
      <p id="contenido">Tabla del detalle</p>
      <div id="filtro" sidePanelNav>Tipo de operación</div>
    </siaf-side-panel>
  `,
})
class AnfitrionComponent {
  readonly conFiltros = signal(false);
  readonly bloqueado = signal(false);
  eventos: string[] = [];
}

describe('SidePanelComponent', () => {
  let fixture: ComponentFixture<AnfitrionComponent>;
  let app: AnfitrionComponent;
  const el = (): HTMLElement => fixture.nativeElement;
  const botones = (contenedor: Element | null, texto: string): HTMLButtonElement =>
    Array.from(contenedor?.querySelectorAll<HTMLButtonElement>('button') ?? []).find((b) => b.textContent!.trim() === texto)!;
  const pie = (): HTMLElement | null => el().querySelector('aside > footer');

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AnfitrionComponent] }).compileComponents();
    fixture = TestBed.createComponent(AnfitrionComponent);
    app = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('es un diálogo a la derecha del riel, con esquinas de 8 px, elevación 16, título, X, contenido y pie', () => {
    const dialogo = el().querySelector<HTMLElement>('[role="dialog"]')!;
    expect(dialogo.getAttribute('aria-modal')).toBe('true');
    expect(el().querySelector(`#${dialogo.getAttribute('aria-labelledby')}`)?.textContent?.trim()).toBe('Movimientos de la cuenta');

    const panel = el().querySelector<HTMLElement>('aside')!;
    for (const clase of ['lg:left-[65px]', 'right-0', 'rounded-siaf-md', 'shadow-siaf-elevation-16']) {
      expect(panel.classList).withContext(clase).toContain(clase);
    }
    expect(el().querySelector('button[aria-label="Cerrar Movimientos de la cuenta"]')).not.toBeNull();
    expect(el().querySelector('[data-side-panel-cuerpo] #contenido')).not.toBeNull();
    expect(el().querySelector('[data-side-panel-filtros]')).toBeNull();
    expect(el().querySelector('#filtro')).withContext('sin showNav no se pinta el contenido de filtros').toBeNull();
    expect(el().querySelector('[data-side-panel-cuerpo]')?.classList).not.toContain('border-y');
    expect(Array.from(pie()!.querySelectorAll('siaf-button')).map((b) => b.textContent?.trim())).toEqual(['Cancelar', 'Aceptar']);
  });

  it('Cancelar emite canceled y closed, Aceptar emite confirmed y confirmDisabled lo deshabilita', () => {
    botones(pie(), 'Cancelar').click();
    botones(pie(), 'Aceptar').click();
    expect(app.eventos).toEqual(['canceled', 'closed', 'confirmed']);

    app.bloqueado.set(true);
    fixture.detectChanges();
    expect(botones(pie(), 'Aceptar').disabled).toBeTrue();
  });

  it('showNav: panel de filtros con siaf-side-nav embebido; el pie principal desaparece y el cuerpo lleva las dos líneas', () => {
    app.conFiltros.set(true);
    fixture.detectChanges();

    const filtros = el().querySelector<HTMLElement>('[data-side-panel-filtros]')!;
    const nav = filtros.querySelector<HTMLElement>('siaf-side-nav')!;
    expect(nav.querySelector('h3')?.textContent?.trim()).toBe('Filtros');
    expect(nav.querySelector('#filtro')).not.toBeNull();
    expect(nav.querySelector('#contenido')).withContext('el contenido principal no va en los filtros').toBeNull();
    expect(nav.querySelector('[aria-label^="Cerrar"]')).withContext('el panel de filtros no tiene X').toBeNull();
    expect(filtros.classList).toContain('lg:w-[420px]');
    expect(pie()).toBeNull();
    expect(el().querySelector('[data-side-panel-cuerpo]')?.classList).toContain('border-y');

    botones(nav, 'Cancelar').click();
    botones(nav, 'Aplicar').click();
    expect(app.eventos).toEqual(['navCanceled', 'navConfirmed']);
  });
});
