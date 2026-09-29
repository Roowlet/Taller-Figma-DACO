import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { FormTableSearchComponent } from './form-table-search.component';

/**
 * Buscador de tablas y paneles de selección (18 usos). Desde el cambio a
 * búsqueda confirmada, `valueChange` se emite con Enter o la lupa — no por
 * tecleo. Sus consumidores heredan el comportamiento sin cambiar una línea.
 */
describe('FormTableSearchComponent', () => {
  let fixture: ComponentFixture<FormTableSearchComponent>;
  let component: FormTableSearchComponent;
  let emitted: string | undefined;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [FormTableSearchComponent] }).compileComponents();
    fixture = TestBed.createComponent(FormTableSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    emitted = undefined;
    component.valueChange.subscribe(v => (emitted = v));
  });

  function input(): HTMLInputElement {
    return fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
  }

  it('tipear NO emite: la búsqueda se confirma con Enter o la lupa', () => {
    input().value = '1.1.5';
    input().dispatchEvent(new Event('input'));

    expect(emitted).toBeUndefined();
  });

  it('Enter emite lo tecleado', () => {
    input().value = '1.1.5';
    input().dispatchEvent(new Event('input'));
    input().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

    expect(emitted).toBe('1.1.5');
  });

  it('la lupa emite igual que Enter', () => {
    input().value = 'provisiones';
    input().dispatchEvent(new Event('input'));

    const lupa = fixture.debugElement.query(By.css('button[aria-label="Buscar"]')).nativeElement as HTMLButtonElement;
    lupa.click();

    expect(emitted).toBe('provisiones');
  });

  it('confirmar sin haber tecleado emite el value del padre', () => {
    fixture.componentRef.setInput('value', 'previo');
    fixture.detectChanges();

    input().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

    expect(emitted).toBe('previo');
  });

  it('los botones de filtro y más opciones siguen emitiendo aparte', () => {
    let filtro = false;
    component.filter.subscribe(() => (filtro = true));

    const btn = fixture.debugElement.query(By.css('button[aria-label="Filtrar"]')).nativeElement as HTMLButtonElement;
    btn.click();

    expect(filtro).toBeTrue();
    expect(emitted).toBeUndefined();
  });

  const iconoDe = (boton: HTMLElement): string => boton.querySelector('siaf-icon')?.textContent?.trim() ?? '';

  it('por defecto el segundo botón es Más opciones (more_vert) y emite more', () => {
    let mas = false;
    component.more.subscribe(() => (mas = true));
    const segundo = fixture.nativeElement.querySelector('button[data-accion]') as HTMLButtonElement;

    expect(segundo.getAttribute('aria-label')).toBe('Mas opciones');
    expect(iconoDe(segundo)).toBe('more_vert');
    segundo.click();
    expect(mas).toBeTrue();
  });

  it('variant="reports" (Consultas y reportes): Filtrar y Columnas, que emite columns y no more', () => {
    let columnas = false;
    let mas = false;
    component.columns.subscribe(() => (columnas = true));
    component.more.subscribe(() => (mas = true));
    fixture.componentRef.setInput('variant', 'reports');
    fixture.detectChanges();

    const botones = Array.from(fixture.nativeElement.querySelectorAll('button[aria-label]')) as HTMLButtonElement[];
    expect(botones.map((b) => b.getAttribute('aria-label'))).toEqual(['Buscar', 'Filtrar', 'Ocultar o mostrar columnas']);
    const segundo = fixture.nativeElement.querySelector('button[data-accion="columns"]') as HTMLButtonElement;
    expect(iconoDe(segundo)).toBe('view_column');
    segundo.click();
    expect(columnas).toBeTrue();
    expect(mas).toBeFalse();
  });
});
