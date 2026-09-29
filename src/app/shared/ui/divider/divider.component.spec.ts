import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DividerComponent } from './divider.component';

describe('DividerComponent', () => {
  let fixture: ComponentFixture<DividerComponent>;
  const host = (): HTMLElement => fixture.nativeElement;
  const linea = (): HTMLElement => host().querySelector<HTMLElement>('[role="separator"]')!;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [DividerComponent] }).compileComponents();
    fixture = TestBed.createComponent(DividerComponent);
    fixture.detectChanges();
  });

  it('por defecto es horizontal full-width, 1 px con el token de divisor', () => {
    expect(host().classList).toContain('block');
    expect(linea().classList).toContain('h-px');
    expect(linea().classList).toContain('bg-[var(--sys-color-divider-default)]');
    expect(linea().classList).not.toContain('ml-4');
    expect(linea().getAttribute('aria-orientation')).toBe('horizontal');
  });

  it('inset deja 16 px al inicio y middle-inset a ambos lados', () => {
    fixture.componentRef.setInput('variant', 'inset');
    fixture.detectChanges();
    expect(linea().classList).toContain('ml-4');
    expect(linea().classList).not.toContain('mr-4');

    fixture.componentRef.setInput('variant', 'middle-inset');
    fixture.detectChanges();
    expect(linea().classList).toContain('ml-4');
    expect(linea().classList).toContain('mr-4');
  });

  it('vertical ocupa el alto de la fila y lleva la sangría arriba y abajo', () => {
    fixture.componentRef.setInput('orientation', 'vertical');
    fixture.componentRef.setInput('variant', 'middle-inset');
    fixture.detectChanges();
    expect(host().classList).toContain('self-stretch');
    expect(linea().classList).toContain('w-px');
    expect(linea().classList).toContain('mt-4');
    expect(linea().classList).toContain('mb-4');
    expect(linea().classList).not.toContain('ml-4');
  });
});
