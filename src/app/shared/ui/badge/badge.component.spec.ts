import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BadgeComponent } from './badge.component';

describe('BadgeComponent', () => {
  let fixture: ComponentFixture<BadgeComponent>;
  const badge = (): HTMLElement => fixture.nativeElement.querySelector('span');

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [BadgeComponent] }).compileComponents();
    fixture = TestBed.createComponent(BadgeComponent);
    fixture.detectChanges();
  });

  it('sin label es un punto accent de 12 px, decorativo', () => {
    expect(badge().dataset['shape']).toBe('dot');
    expect(badge().classList).toContain('size-3');
    expect(badge().classList).toContain('bg-[var(--sys-color-bg-brand-accent)]');
    expect(badge().textContent?.trim()).toBe('');
    expect(badge().getAttribute('aria-hidden')).toBe('true');
  });

  it('small y primary: punto de 8 px azul', () => {
    fixture.componentRef.setInput('size', 'small');
    fixture.componentRef.setInput('color', 'primary');
    fixture.detectChanges();
    expect(badge().classList).toContain('size-2');
    expect(badge().classList).toContain('bg-brand-primary');
  });

  it('con label es un contador de 20 px (16 px en small) que crece con el texto', () => {
    fixture.componentRef.setInput('label', 3);
    fixture.detectChanges();
    expect(badge().dataset['shape']).toBe('label');
    expect(badge().textContent?.trim()).toBe('3');
    expect(badge().classList).toContain('h-5');
    expect(badge().classList).toContain('min-w-5');
    expect(badge().classList).toContain('font-medium');

    fixture.componentRef.setInput('size', 'small');
    fixture.detectChanges();
    expect(badge().classList).toContain('h-4');
    expect(badge().classList).not.toContain('font-medium');
  });

  it('max recorta los números grandes', () => {
    fixture.componentRef.setInput('label', 128);
    fixture.componentRef.setInput('max', 99);
    fixture.detectChanges();
    expect(badge().textContent?.trim()).toBe('99+');

    fixture.componentRef.setInput('label', 88);
    fixture.detectChanges();
    expect(badge().textContent?.trim()).toBe('88');
  });

  it('con ariaLabel se anuncia', () => {
    fixture.componentRef.setInput('label', 3);
    fixture.componentRef.setInput('ariaLabel', '3 notificaciones sin leer');
    fixture.detectChanges();
    expect(badge().getAttribute('role')).toBe('status');
    expect(badge().getAttribute('aria-label')).toBe('3 notificaciones sin leer');
    expect(badge().getAttribute('aria-hidden')).toBeNull();
  });
});
