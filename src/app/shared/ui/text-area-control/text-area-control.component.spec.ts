import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { TextAreaControlComponent } from './text-area-control.component';

describe('TextAreaControlComponent', () => {
  let fixture: ComponentFixture<TextAreaControlComponent>;
  let component: TextAreaControlComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TextAreaControlComponent] }).compileComponents();
    fixture = TestBed.createComponent(TextAreaControlComponent);
    component = fixture.componentInstance;
  });

  /** Simula escribir y salir del campo, que es cuando se reclama el mínimo. */
  function escribirYSalir(texto: string): void {
    const textarea = fixture.debugElement.query(By.css('textarea')).nativeElement as HTMLTextAreaElement;
    textarea.dispatchEvent(new Event('focus'));
    textarea.value = texto;
    textarea.dispatchEvent(new Event('input'));
    fixture.componentRef.setInput('value', texto);
    textarea.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
  }

  describe('minlength (Glosa / Justificación: mínimo 3)', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('minlength', 3);
      fixture.componentRef.setInput('required', true);
      fixture.detectChanges();
    });

    it('no reclama nada antes de que el usuario pase por el campo', () => {
      fixture.componentRef.setInput('value', 'ab');
      fixture.detectChanges();

      expect(component.errorMessage).toBe('');
      expect(component.effectiveState).not.toBe('error');
    });

    it('no reclama mientras el usuario sigue escribiendo', () => {
      const textarea = fixture.debugElement.query(By.css('textarea')).nativeElement as HTMLTextAreaElement;
      textarea.dispatchEvent(new Event('focus'));
      fixture.componentRef.setInput('value', 'ab');
      fixture.detectChanges();

      expect(component.errorMessage).toBe('');
    });

    it('reclama el mínimo al salir del campo con menos caracteres', () => {
      escribirYSalir('ab');

      expect(component.errorMessage).toBe('Mínimo 3 caracteres');
      expect(component.effectiveState).toBe('error');
    });

    it('muestra el mensaje en el template', () => {
      escribirYSalir('ab');

      const pie = fixture.nativeElement.textContent as string;
      expect(pie).toContain('Mínimo 3 caracteres');
    });

    it('marca aria-invalid para el lector de pantalla', () => {
      escribirYSalir('ab');

      const textarea = fixture.debugElement.query(By.css('textarea')).nativeElement as HTMLTextAreaElement;
      expect(textarea.getAttribute('aria-invalid')).toBe('true');
    });

    it('acepta exactamente el mínimo', () => {
      escribirYSalir('abc');

      expect(component.errorMessage).toBe('');
      expect(component.effectiveState).toBe('success');
    });

    it('los espacios no cuentan como contenido', () => {
      escribirYSalir('a  ');

      expect(component.errorMessage).toBe('Mínimo 3 caracteres');
    });

    it('no reclama el mínimo sobre un campo vacío — de eso se encarga el obligatorio', () => {
      escribirYSalir('');

      expect(component.errorMessage).toBe('');
    });
  });

  it('sin minlength no valida longitud', () => {
    fixture.componentRef.setInput('minlength', 0);
    fixture.detectChanges();
    escribirYSalir('a');

    expect(component.errorMessage).toBe('');
  });

  it('el error que manda el padre tiene prioridad sobre el del mínimo', () => {
    fixture.componentRef.setInput('minlength', 3);
    fixture.componentRef.setInput('error', 'La glosa ya existe');
    fixture.detectChanges();
    escribirYSalir('ab');

    expect(component.errorMessage).toBe('La glosa ya existe');
    expect(component.effectiveState).toBe('error');
  });
});
