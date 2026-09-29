import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { RecordsSearchToolbarComponent } from './records-search-toolbar.component';

describe('RecordsSearchToolbarComponent', () => {
  let fixture: ComponentFixture<RecordsSearchToolbarComponent>;
  let component: RecordsSearchToolbarComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [RecordsSearchToolbarComponent] }).compileComponents();
    fixture = TestBed.createComponent(RecordsSearchToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('placeholder default es "Buscar"', () => {
    const input = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
    expect(input.placeholder).toBe('Buscar');
  });

  it('cambia el placeholder via input', () => {
    fixture.componentRef.setInput('placeholder', 'Filtrar por documento');
    fixture.detectChanges();
    const input = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
    expect(input.placeholder).toBe('Filtrar por documento');
  });

  it('tipear NO emite: la búsqueda se dispara con Enter o la lupa', () => {
    let emitted: string | undefined;
    component.valueChange.subscribe(v => (emitted = v));

    const input = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
    input.value = 'AA-093';
    input.dispatchEvent(new Event('input'));

    // Con la búsqueda en el servidor, emitir por tecleo sería una consulta
    // por letra. El valor queda registrado y se emite al confirmar.
    expect(emitted).toBeUndefined();
  });

  it('Enter emite valueChange y searchSubmit con lo tecleado', () => {
    let value: string | undefined;
    let search: string | undefined;
    component.valueChange.subscribe(v => (value = v));
    component.searchSubmit.subscribe(v => (search = v));

    const input = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
    input.value = 'AA-093';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

    expect(value).toBe('AA-093');
    expect(search).toBe('AA-093');
  });

  it('el campo es el siaf-input del design system, no un input artesanal', () => {
    // Etiqueta flotante y borde de éxito vienen del componente compartido —
    // el buscador debe verse y comportarse como el resto de inputs de la app.
    // De paso: al ser type=text no existe la ✕ nativa de type=search, cuyo
    // evento DOM `search` causó el bug del "[object Event]" (25/08).
    expect(fixture.debugElement.query(By.css('siaf-input'))).toBeTruthy();

    const input = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
    expect(input.type).toBe('text');
  });

  it('un evento DOM `search` perdido no dispara nada (regresión del [object Event])', () => {
    const emisiones: unknown[] = [];
    component.searchSubmit.subscribe(v => emisiones.push(v));

    const input = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
    input.dispatchEvent(new Event('search', { bubbles: true }));

    expect(emisiones).toEqual([]);
  });

  it('la lupa dispara la búsqueda igual que Enter', () => {
    let search: string | undefined;
    component.searchSubmit.subscribe(v => (search = v));

    const input = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
    input.value = 'AA-093';
    input.dispatchEvent(new Event('input'));

    const lupa = fixture.debugElement.query(By.css('button[aria-label="Buscar"]')).nativeElement as HTMLButtonElement;
    lupa.click();

    expect(search).toBe('AA-093');
  });

  it('si el padre reescribe value, lo tecleado pendiente deja de valer', () => {
    // Quitar la búsqueda desde el chip limpia `value`; un Enter posterior no
    // debe resucitar el texto viejo que quedó en lastTyped.
    let emitted: string | undefined;
    component.searchSubmit.subscribe(v => (emitted = v));

    const input = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
    input.value = 'texto-viejo';
    input.dispatchEvent(new Event('input'));

    fixture.componentRef.setInput('value', '');
    fixture.detectChanges();

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

    expect(emitted).toBe('');
  });

  it('disabled aplica al input', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const input = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
    expect(input.disabled).toBeTrue();
  });
});
