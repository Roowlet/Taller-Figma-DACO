import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepperCardComponent, StepperCardField } from './stepper-card.component';

describe('StepperCardComponent', () => {
  let fixture: ComponentFixture<StepperCardComponent>;
  const boton = (): HTMLButtonElement => (fixture.nativeElement as HTMLElement).querySelector('button')!;
  const barra = (): HTMLElement | null => (fixture.nativeElement as HTMLElement).querySelector('[data-stepper-barra]');

  const campos: StepperCardField[] = [
    { label: 'N° modificación', value: '02' },
    { label: 'Tipo de acción', value: 'Modificación' },
    { label: 'Fecha', value: '19/08/25 08:00:59' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [StepperCardComponent] }).compileComponents();
    fixture = TestBed.createComponent(StepperCardComponent);
    fixture.componentRef.setInput('fields', campos);
    fixture.detectChanges();
  });

  it('sin elegir: borde, sin sombra ni barra, aria-pressed en false', () => {
    expect(boton().getAttribute('aria-pressed')).toBe('false');
    expect(boton().classList).toContain('border-[var(--sys-color-divider-strong)]');
    expect(boton().classList).not.toContain('shadow-siaf-elevation-2');
    expect(barra()).toBeNull();
  });

  it('elegida: sombra y barra azul de 3 × 80 px a 20 px del borde de arriba, sin anillo', () => {
    fixture.componentRef.setInput('selected', true);
    fixture.detectChanges();

    expect(boton().getAttribute('aria-pressed')).toBe('true');
    expect(boton().classList).toContain('shadow-siaf-elevation-2');
    expect(boton().className).not.toContain('ring');
    const estilo = getComputedStyle(barra()!);
    expect(estilo.top).toBe('20px');
    expect(estilo.height).toBe('80px');
    expect(estilo.width).toBe('3px');
  });

  it('pulsarla emite el valor contrario a selected; el padre decide', () => {
    const emitidos: boolean[] = [];
    fixture.componentInstance.selectedChange.subscribe((valor) => emitidos.push(valor));
    boton().click();
    fixture.componentRef.setInput('selected', true);
    fixture.detectChanges();
    boton().click();
    expect(emitidos).toEqual([true, false]);
  });

  it('pinta cada campo con su etiqueta y su valor', () => {
    const texto = boton().textContent ?? '';
    for (const campo of campos) {
      expect(texto).toContain(campo.label);
      expect(texto).toContain(String(campo.value));
    }
  });
});
