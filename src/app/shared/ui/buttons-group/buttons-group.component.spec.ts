import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonGroupItem, ButtonsGroupComponent } from './buttons-group.component';

describe('ButtonsGroupComponent', () => {
  let fixture: ComponentFixture<ButtonsGroupComponent>;
  const botones = (): HTMLButtonElement[] => Array.from(fixture.nativeElement.querySelectorAll('button'));

  const montar = (items: ButtonGroupItem[], extra: Record<string, unknown> = {}): void => {
    fixture = TestBed.createComponent(ButtonsGroupComponent);
    fixture.componentRef.setInput('items', items);
    for (const [clave, valor] of Object.entries(extra)) fixture.componentRef.setInput(clave, valor);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ButtonsGroupComponent] }).compileComponents();
  });

  it('es un grupo nombrado; la opción elegida lleva aria-pressed y elegir otra emite valueChange', () => {
    montar(
      [
        { label: 'Día', value: 'dia' },
        { label: 'Mes', value: 'mes' },
      ],
      { value: 'mes', ariaLabel: 'Periodo' },
    );
    const emitidos: string[] = [];
    fixture.componentInstance.valueChange.subscribe((v) => emitidos.push(v));

    expect(fixture.nativeElement.querySelector('[role="group"]').getAttribute('aria-label')).toBe('Periodo');
    expect(botones().map((b) => b.getAttribute('aria-pressed'))).toEqual(['false', 'true']);
    expect(botones()[0].hasAttribute('aria-label')).withContext('con texto visible no hace falta aria-label').toBeFalse();

    botones()[0].click();
    fixture.detectChanges();
    expect(emitidos).toEqual(['dia']);
    expect(botones().map((b) => b.getAttribute('aria-pressed'))).toEqual(['true', 'false']);
  });

  it('con iconOnly, cada opción muestra solo su ícono y se nombra con su etiqueta', () => {
    montar(
      [
        { label: 'Vista de datos', value: 'datos', icon: 'info' },
        { label: 'Vista de gráficas', value: 'graficas', icon: 'insert_chart' },
      ],
      { value: 'datos', iconOnly: true, ariaLabel: 'Vista del resultado' },
    );

    expect(botones().map((b) => b.getAttribute('aria-label'))).toEqual(['Vista de datos', 'Vista de gráficas']);
    expect(botones().map((b) => b.querySelector('siaf-icon')?.textContent?.trim())).toEqual(['info', 'insert_chart']);
    expect(botones()[1].textContent).not.toContain('Vista de gráficas');
  });

  it('sin iconOnly, el ícono acompaña a la etiqueta visible', () => {
    montar([{ label: 'Tabla', value: 'tabla', icon: 'table_chart' }], { value: 'tabla' });
    const [boton] = botones();
    expect(boton.querySelector('siaf-icon')).not.toBeNull();
    expect(boton.textContent).toContain('Tabla');
    expect(boton.hasAttribute('aria-label')).toBeFalse();
  });
});
