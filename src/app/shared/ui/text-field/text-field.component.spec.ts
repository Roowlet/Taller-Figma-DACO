import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { TextFieldComponent } from './text-field.component';

describe('TextFieldComponent — type="decimal"', () => {
  let fixture: ComponentFixture<TextFieldComponent>;
  let component: TextFieldComponent;
  let emitido: (string | number | string[])[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TextFieldComponent] }).compileComponents();
    fixture = TestBed.createComponent(TextFieldComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('type', 'decimal');
    fixture.componentRef.setInput('label', 'Importe');
    fixture.detectChanges();

    emitido = [];
    component.valueChange.subscribe((v) => emitido.push(v));
  });

  function input(): HTMLInputElement {
    return fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
  }

  /** Simula una pulsación: el navegador ya escribió el carácter en el DOM. */
  function teclear(texto: string): void {
    const el = input();
    el.value = texto;
    el.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  /** Reproduce el eco del padre: guarda el número y lo devuelve por [value]. */
  function ecoDelPadre(): void {
    const guardado = parseFloat(String(component.internalValue)) || 0;
    fixture.componentRef.setInput('value', guardado || '');
    fixture.detectChanges();
  }

  it('usa un input de texto con teclado numérico, no type=number', () => {
    // El type=number nativo devuelve "" en "10." y con coma: por eso no se usa.
    expect(input().type).toBe('text');
    expect(input().getAttribute('inputmode')).toBe('decimal');
  });

  it('deja escribir un importe con decimales de punta a punta', () => {
    input().dispatchEvent(new Event('focus'));

    for (const paso of ['1', '10', '10.', '10.5', '10.50']) {
      teclear(paso);
      // El eco del padre en cada tecla es justo lo que borraba el campo antes.
      ecoDelPadre();
      expect(input().value).toBe(paso);
    }

    expect(emitido[emitido.length - 1]).toBe('10.50');
  });

  it('el punto no vacía el campo (el bug original)', () => {
    input().dispatchEvent(new Event('focus'));
    teclear('10');
    ecoDelPadre();
    teclear('10.');
    ecoDelPadre();

    expect(input().value).toBe('10.');
  });

  it('acepta la coma del teclado numérico y la guarda como punto', () => {
    input().dispatchEvent(new Event('focus'));
    teclear('10,');

    expect(input().value).toBe('10.');

    teclear('10.5');
    expect(component.internalValue).toBe('10.5');
  });

  it('descarta letras y símbolos', () => {
    teclear('10a');
    expect(input().value).toBe('10');

    teclear('10-5');
    expect(input().value).toBe('105');
  });

  it('admite un solo separador decimal', () => {
    teclear('10.5.3');
    expect(input().value).toBe('10.53');
  });

  it('recorta a 2 decimales', () => {
    teclear('10.567');
    expect(input().value).toBe('10.56');
  });

  it('respeta un máximo de decimales distinto', () => {
    fixture.componentRef.setInput('decimals', 4);
    fixture.detectChanges();
    teclear('10.56789');

    expect(input().value).toBe('10.5678');
  });

  it('completa los decimales al salir del campo', () => {
    input().dispatchEvent(new Event('focus'));
    teclear('10');
    input().dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(component.internalValue).toBe('10.00');
    expect(emitido[emitido.length - 1]).toBe('10.00');
  });

  it('cierra un decimal a medio escribir', () => {
    input().dispatchEvent(new Event('focus'));
    teclear('10.5');
    input().dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(component.internalValue).toBe('10.50');
  });

  it('limpia un separador suelto', () => {
    input().dispatchEvent(new Event('focus'));
    teclear('.');
    input().dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(component.internalValue).toBe('');
  });

  it('conserva los decimales escritos aunque el padre devuelva el número redondo', () => {
    input().dispatchEvent(new Event('focus'));
    teclear('10.00');
    input().dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    // El padre guarda 10 (parseFloat) y lo devuelve: no debe borrar el ".00".
    fixture.componentRef.setInput('value', 10);
    fixture.detectChanges();

    expect(component.internalValue).toBe('10.00');
  });

  it('sí acepta un valor distinto que llega del padre', () => {
    fixture.componentRef.setInput('value', 250.75);
    fixture.detectChanges();

    expect(component.internalValue).toBe(250.75);
  });
});

describe('TextFieldComponent — otros tipos', () => {
  let fixture: ComponentFixture<TextFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TextFieldComponent] }).compileComponents();
    fixture = TestBed.createComponent(TextFieldComponent);
  });

  it('text no filtra nada ni pone inputmode', () => {
    fixture.componentRef.setInput('type', 'text');
    fixture.detectChanges();

    const el = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
    el.value = 'abc.5,';
    el.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(el.value).toBe('abc.5,');
    expect(el.getAttribute('inputmode')).toBeNull();
  });

  it('number sigue siendo el input nativo (campos enteros)', () => {
    fixture.componentRef.setInput('type', 'number');
    fixture.detectChanges();

    const el = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
    expect(el.type).toBe('number');
  });

  it('correo se traduce a email', () => {
    fixture.componentRef.setInput('type', 'correo');
    fixture.detectChanges();

    const el = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
    expect(el.type).toBe('email');
  });

  it('select-multiple con selectAllLabel: valor en una línea, lista con casillas y «Seleccionar todo» marca las habilitadas', () => {
    const emitidos: unknown[] = [];
    fixture.componentInstance.valueChange.subscribe((v) => emitidos.push(v));
    fixture.componentRef.setInput('type', 'select-multiple');
    fixture.componentRef.setInput('label', 'Entidades');
    fixture.componentRef.setInput('selectAllLabel', 'Seleccionar todo');
    fixture.componentRef.setInput('options', [
      { label: 'MINCETUR', value: 'mincetur' },
      { label: 'IPD', value: 'ipd' },
    ]);
    fixture.componentRef.setInput('value', ['ipd']);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-resumen-multiple]')?.textContent?.trim()).toBe('IPD');
    expect(el.querySelector('[aria-label^="Quitar"]')).withContext('sin chips').toBeNull();

    el.querySelector<HTMLButtonElement>('button[aria-haspopup="listbox"]')!.click();
    fixture.detectChanges();
    const todo = el.querySelector<HTMLElement>('[data-seleccionar-todo]')!;
    expect(todo.textContent?.trim()).toBe('Seleccionar todo');
    todo.click();
    fixture.detectChanges();

    expect(emitidos.at(-1)).toEqual(['mincetur', 'ipd']);
    expect(el.querySelector('[data-resumen-multiple]')?.textContent?.trim()).toBe('MINCETUR, IPD');
    el.querySelector<HTMLElement>('[data-seleccionar-todo]')!.click();
    expect(emitidos.at(-1)).toEqual([]);
  });
});
