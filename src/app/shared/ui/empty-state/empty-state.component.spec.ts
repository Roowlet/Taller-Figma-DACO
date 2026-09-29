import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { EmptyStateComponent } from './empty-state.component';
import { EMPTY_STATE_ILLUSTRATIONS } from './empty-state-illustrations';

describe('EmptyStateComponent', () => {
  let fixture: ComponentFixture<EmptyStateComponent>;
  let component: EmptyStateComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [EmptyStateComponent] }).compileComponents();
    fixture = TestBed.createComponent(EmptyStateComponent);
    component = fixture.componentInstance;
  });

  it('renderiza titulo y descripcion', () => {
    fixture.componentRef.setInput('title', 'Aún no se encontraron resultados');
    fixture.componentRef.setInput('description', 'Ingrese los criterios de búsqueda.');
    fixture.detectChanges();

    const h2 = fixture.debugElement.query(By.css('h2')).nativeElement as HTMLElement;
    const p = fixture.debugElement.query(By.css('p')).nativeElement as HTMLElement;

    expect(h2.textContent?.trim()).toBe('Aún no se encontraron resultados');
    expect(p.textContent?.trim()).toBe('Ingrese los criterios de búsqueda.');
  });

  it('omite el parrafo cuando no hay description', () => {
    fixture.componentRef.setInput('title', 'Sin descripcion');
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('p'))).toBeNull();
  });

  it('default illustration es no-results y se puede cambiar via input', () => {
    fixture.detectChanges();
    const svgInicial = fixture.debugElement.query(By.css('svg')).nativeElement.innerHTML;
    expect(svgInicial).toContain('M76 100'); // path caracteristico de la mano

    fixture.componentRef.setInput('illustration', 'no-data');
    fixture.detectChanges();

    const svgFinal = fixture.debugElement.query(By.css('svg')).nativeElement.innerHTML;
    expect(svgFinal).not.toContain('M76 100');
    expect(svgFinal.length).toBeGreaterThan(50);
  });

  it('renderiza CTA solo si actionLabel esta presente, y emite actionClicked', () => {
    fixture.componentRef.setInput('title', 'Sin CTA');
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('siaf-button'))).toBeNull();

    fixture.componentRef.setInput('actionLabel', 'Búsqueda');
    fixture.componentRef.setInput('actionIcon', 'manage_search');
    fixture.detectChanges();

    const btn = fixture.debugElement.query(By.css('siaf-button'));
    expect(btn).not.toBeNull();

    let emitted = false;
    component.actionClicked.subscribe(() => (emitted = true));
    btn.triggerEventHandler('click', null);
    expect(emitted).toBeTrue();
  });

  it('el catalogo de ilustraciones cubre las 4 variantes', () => {
    expect(Object.keys(EMPTY_STATE_ILLUSTRATIONS).sort()).toEqual([
      'no-data',
      'no-records',
      'no-results',
      'no-selection',
    ]);
  });

  it('«no-records» es la hoja del Figma con su único color como currentColor, sin colores crudos', () => {
    const svg = EMPTY_STATE_ILLUSTRATIONS['no-records'];
    expect((svg.match(/<path/g) ?? []).length).toBe(4);
    expect(svg).toContain('fill="currentColor"');
    expect(svg.replace(/d="[^"]*"/g, '')).not.toMatch(/#[0-9a-f]{3,8}/i);
  });
});
