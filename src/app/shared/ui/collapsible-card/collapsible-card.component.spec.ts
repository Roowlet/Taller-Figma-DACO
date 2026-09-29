import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollapsibleCardComponent } from './collapsible-card.component';

@Component({
  standalone: true,
  imports: [CollapsibleCardComponent],
  template: `
    <siaf-collapsible-card [(expanded)]="abierto" [closable]="cerrable()" (closed)="cierres = cierres + 1">
      <p card-info class="cabecera">Documento PAA-SRAA-00012-2026</p>
      <p class="detalle">Detalle del documento</p>
    </siaf-collapsible-card>
  `,
})
class AnfitrionComponent {
  readonly abierto = signal(false);
  readonly cerrable = signal(true);
  cierres = 0;
}

describe('CollapsibleCardComponent', () => {
  let fixture: ComponentFixture<AnfitrionComponent>;
  const el = (): HTMLElement => fixture.nativeElement;
  const flecha = (): HTMLButtonElement => el().querySelector<HTMLButtonElement>('button[aria-expanded]')!;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AnfitrionComponent] }).compileComponents();
    fixture = TestBed.createComponent(AnfitrionComponent);
    fixture.detectChanges();
  });

  it('cerrada muestra la cabecera proyectada, la marca lateral y la X', () => {
    expect(el().querySelector('.cabecera')?.textContent).toContain('PAA-SRAA-00012-2026');
    expect(el().querySelector('.detalle')).toBeNull();
    expect(el().querySelector('span[aria-hidden="true"].w-\\[3px\\]')).not.toBeNull();
    expect(el().querySelector('button[aria-label="Quitar"]')).not.toBeNull();
  });

  it('la flecha abre el detalle bajo una línea y mantiene [(expanded)]', () => {
    flecha().click();
    fixture.detectChanges();
    const region = el().querySelector<HTMLElement>('[role="region"]')!;
    expect(region.classList).toContain('border-t');
    expect(region.textContent).toContain('Detalle del documento');
    expect(flecha().textContent).toContain('expand_less');
    expect(fixture.componentInstance.abierto()).toBeTrue();
  });

  it('la X emite closed y se oculta con closable en false', () => {
    el().querySelector<HTMLButtonElement>('button[aria-label="Quitar"]')!.click();
    expect(fixture.componentInstance.cierres).toBe(1);

    fixture.componentInstance.cerrable.set(false);
    fixture.detectChanges();
    expect(el().querySelector('button[aria-label="Quitar"]')).toBeNull();
  });
});
