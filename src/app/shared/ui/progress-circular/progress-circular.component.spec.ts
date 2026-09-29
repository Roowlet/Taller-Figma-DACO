import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressCircularComponent } from './progress-circular.component';

describe('ProgressCircularComponent', () => {
  let fixture: ComponentFixture<ProgressCircularComponent>;
  const el = (): HTMLElement => fixture.nativeElement;
  const barra = (): HTMLElement => el().querySelector<HTMLElement>('[role="progressbar"]')!;
  const relleno = (): SVGCircleElement => el().querySelectorAll<SVGCircleElement>('circle')[1];

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ProgressCircularComponent] }).compileComponents();
    fixture = TestBed.createComponent(ProgressCircularComponent);
    fixture.detectChanges();
  });

  it('en 0 % no llena el anillo y muestra el porcentaje sin etiqueta', () => {
    expect(relleno().getAttribute('stroke-dashoffset')).toBe('100');
    expect(el().querySelectorAll('p').length).toBe(1);
    expect(el().textContent?.trim()).toBe('0%');
    expect(barra().getAttribute('aria-label')).toBe('Avance');
  });

  it('llena el anillo según el valor y muestra la etiqueta tal como se escribe', () => {
    fixture.componentRef.setInput('value', 50);
    fixture.componentRef.setInput('label', 'Label');
    fixture.detectChanges();

    expect(relleno().getAttribute('stroke-dashoffset')).toBe('50');
    const [etiqueta, valor] = Array.from(el().querySelectorAll('p'));
    expect(etiqueta.textContent?.trim()).toBe('Label');
    expect(etiqueta.classList).not.toContain('uppercase');
    expect(valor.textContent?.trim()).toBe('50%');
    expect(barra().getAttribute('aria-valuenow')).toBe('50');
    expect(barra().getAttribute('aria-label')).toBe('Label');
  });

  it('recorta fuera de 0-100 y redondea el texto', () => {
    fixture.componentRef.setInput('value', 140);
    fixture.detectChanges();
    expect(relleno().getAttribute('stroke-dashoffset')).toBe('0');
    expect(el().textContent).toContain('100%');

    fixture.componentRef.setInput('value', 33.6);
    fixture.detectChanges();
    expect(el().textContent).toContain('34%');

    fixture.componentRef.setInput('value', -5);
    fixture.detectChanges();
    expect(el().textContent).toContain('0%');
  });

  it('size escala el anillo y los textos', () => {
    fixture.componentRef.setInput('size', 75);
    fixture.detectChanges();
    expect(barra().style.width).toBe('75px');
    const valor = Array.from(el().querySelectorAll('p')).pop()!;
    expect(valor.style.fontSize).toBe('11px');
  });
});
