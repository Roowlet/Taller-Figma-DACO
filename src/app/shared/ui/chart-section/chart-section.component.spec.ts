import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartSectionComponent } from './chart-section.component';

@Component({
  standalone: true,
  imports: [ChartSectionComponent],
  template: `
    <siaf-chart-section title="Evolución comparada" description="Crecimiento acumulado de recaudación">
      <p id="grafico">Gráfico</p>
    </siaf-chart-section>
    <siaf-chart-section id="sin-textos"><p>Solo contenido</p></siaf-chart-section>
  `,
})
class AnfitrionComponent {}

describe('ChartSectionComponent', () => {
  let fixture: ComponentFixture<AnfitrionComponent>;
  const q = <T extends HTMLElement>(selector: string): T | null => fixture.nativeElement.querySelector(selector);

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AnfitrionComponent] }).compileComponents();
    fixture = TestBed.createComponent(AnfitrionComponent);
    fixture.detectChanges();
  });

  it('es una sección nombrada por su título, con la descripción y el gráfico proyectado', () => {
    const seccion = q('siaf-chart-section section')!;
    const titulo = seccion.querySelector('h3')!;
    expect(titulo.textContent?.trim()).toBe('Evolución comparada');
    expect(seccion.getAttribute('aria-labelledby')).toBe(titulo.id);
    expect(seccion.textContent).toContain('Crecimiento acumulado de recaudación');
    expect(seccion.querySelector('#grafico')).not.toBeNull();
  });

  it('sin título ni descripción no deja encabezado vacío ni aria-labelledby', () => {
    const seccion = q('#sin-textos section')!;
    expect(seccion.querySelector('h3')).toBeNull();
    expect(seccion.hasAttribute('aria-labelledby')).toBeFalse();
  });
});
