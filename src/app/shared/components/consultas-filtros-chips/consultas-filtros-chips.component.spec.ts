import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultasFiltrosChipsComponent } from './consultas-filtros-chips.component';

describe('ConsultasFiltrosChipsComponent', () => {
  let fixture: ComponentFixture<ConsultasFiltrosChipsComponent>;
  const el = (): HTMLElement => fixture.nativeElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ConsultasFiltrosChipsComponent] }).compileComponents();
    fixture = TestBed.createComponent(ConsultasFiltrosChipsComponent);
    fixture.componentRef.setInput('chips', [
      { label: 'Estado', values: ['Aprobado', 'Verificado'] },
      { label: 'Año', values: ['2026'] },
    ]);
    fixture.detectChanges();
  });

  it('cada chip es un siaf-tag input elegido que se lee «Etiqueta: valores», con el espacio tras los dos puntos', () => {
    const chips = Array.from(el().querySelectorAll<HTMLElement>('siaf-tag [data-variante]'));
    expect(chips.map((chip) => chip.textContent?.trim())).toEqual(['Estado: Aprobado, Verificado', 'Año: 2026']);
    for (const chip of chips) {
      expect(chip.getAttribute('data-variante')).toBe('input');
      expect(chip.getAttribute('data-elegido')).toBe('true');
      expect(chip.querySelector('button')).withContext('los chips no son interactivos').toBeNull();
    }
  });

  it('«Quitar filtros» emite cleared', () => {
    const quitados = jasmine.createSpy('cleared');
    fixture.componentInstance.cleared.subscribe(quitados);
    el().querySelector<HTMLButtonElement>('siaf-button button')!.click();
    expect(quitados).toHaveBeenCalledTimes(1);
  });
});
