import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectOption, SelectOptionsComponent } from './select-options.component';

describe('SelectOptionsComponent', () => {
  let fixture: ComponentFixture<SelectOptionsComponent>;
  const opciones = (): HTMLButtonElement[] => Array.from(fixture.nativeElement.querySelectorAll('button[role="option"]'));
  const etiqueta = (boton: HTMLButtonElement): string => boton.querySelector('span')!.textContent!.trim();
  const tabulables = (): string[] => opciones().filter((b) => b.getAttribute('tabindex') === '0').map(etiqueta);

  const entidades: SelectOption[] = [
    { label: 'Ministerio de Economía', value: 'mef' },
    { label: 'Ministerio de Salud', value: 'minsa', disabled: true },
    { label: 'Gobierno Regional de Lima', value: 'grlim' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SelectOptionsComponent] }).compileComponents();
    fixture = TestBed.createComponent(SelectOptionsComponent);
    fixture.componentRef.setInput('options', entidades);
    fixture.detectChanges();
    if (!(fixture.nativeElement as HTMLElement).isConnected) document.body.appendChild(fixture.nativeElement);
  });

  it('sin opción elegida, la única parada de Tab es la primera habilitada', () => {
    expect(tabulables()).toEqual(['Ministerio de Economía']);
  });

  it('entra por la elegida y después por la última enfocada; las flechas saltan las deshabilitadas', () => {
    fixture.componentRef.setInput('selectedValue', 'grlim');
    fixture.detectChanges();
    expect(tabulables()).toEqual(['Gobierno Regional de Lima']);

    opciones()[2].focus();
    opciones()[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();

    expect(document.activeElement).withContext('da la vuelta y salta la deshabilitada').toBe(opciones()[0]);
    expect(tabulables()).toEqual(['Ministerio de Economía']);
  });

  it('elegir una opción emite su valor', () => {
    let elegida = '';
    fixture.componentInstance.selected.subscribe((valor) => (elegida = valor));
    opciones()[2].click();
    expect(elegida).toBe('grlim');
  });

  describe('con casillas y «Seleccionar todo» (Figma «Parámetros de consulta»)', () => {
    const filas = (): HTMLElement[] => Array.from(fixture.nativeElement.querySelectorAll('[role="option"]'));
    const casilla = (fila: HTMLElement): HTMLInputElement => fila.querySelector('input[type="checkbox"]')!;

    beforeEach(() => {
      fixture.componentRef.setInput('multiple', true);
      fixture.componentRef.setInput('checkboxes', true);
      fixture.componentRef.setInput('selectAllLabel', 'Seleccionar todo');
      fixture.detectChanges();
    });

    it('cada fila es un role="option" con su casilla nativa decorativa, no un botón', () => {
      expect(fixture.nativeElement.querySelector('button[role="option"]')).toBeNull();
      expect(filas().map((f) => f.textContent!.trim())).toEqual(['Seleccionar todo', 'Ministerio de Economía', 'Ministerio de Salud', 'Gobierno Regional de Lima']);
      const primera = casilla(filas()[1]);
      expect(primera.getAttribute('aria-hidden')).toBe('true');
      expect(primera.tabIndex).toBe(-1);
      expect(filas()[2].getAttribute('aria-disabled')).toBe('true');
    });

    it('«Seleccionar todo» se marca con todas las habilitadas, queda a medias con algunas y emite allSelected', () => {
      const emitidos: boolean[] = [];
      fixture.componentInstance.allSelected.subscribe((v) => emitidos.push(v));

      fixture.componentRef.setInput('selectedValues', ['mef']);
      fixture.detectChanges();
      expect(casilla(filas()[0]).indeterminate).withContext('algunas').toBeTrue();
      expect(filas()[0].getAttribute('aria-selected')).toBe('false');
      filas()[0].click();

      fixture.componentRef.setInput('selectedValues', ['mef', 'grlim']);
      fixture.detectChanges();
      expect(casilla(filas()[0]).checked).withContext('las habilitadas, sin la deshabilitada').toBeTrue();
      expect(filas()[0].getAttribute('aria-selected')).toBe('true');
      filas()[0].click();

      expect(emitidos).toEqual([true, false]);
    });

    it('Enter y Espacio activan la fila enfocada; la deshabilitada no emite', () => {
      const elegidas: string[] = [];
      fixture.componentInstance.selected.subscribe((v) => elegidas.push(v));
      filas()[3].dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
      filas()[1].dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }));
      filas()[2].click();
      expect(elegidas).toEqual(['grlim', 'mef']);
    });

    it('la única parada de Tab empieza en «Seleccionar todo» y las flechas recorren las filas habilitadas', () => {
      expect(filas().filter((f) => f.tabIndex === 0).map((f) => f.textContent!.trim())).toEqual(['Seleccionar todo']);
      filas()[1].focus();
      filas()[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      expect(document.activeElement).withContext('salta la deshabilitada').toBe(filas()[3]);
    });
  });
});
