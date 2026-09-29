import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadedFileCardComponent } from './uploaded-file-card.component';

describe('UploadedFileCardComponent', () => {
  let fixture: ComponentFixture<UploadedFileCardComponent>;
  const el = (): HTMLElement => fixture.nativeElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UploadedFileCardComponent] }).compileComponents();
    fixture = TestBed.createComponent(UploadedFileCardComponent);
    fixture.componentRef.setInput('file', { name: 'DocEntregable001.xls', size: 512_000 });
    fixture.detectChanges();
  });

  it('sin error muestra el peso y el borde neutro', () => {
    const tarjeta = el().querySelector('div')!;
    expect(el().textContent).toContain('500kb');
    expect(tarjeta.classList).toContain('border-border');
    expect(el().querySelector('[role="alert"]')).toBeNull();
  });

  it('con error pasa al estado fallido: mensaje en lugar del peso y tono de error', () => {
    fixture.componentRef.setInput('error', 'No se pudo cargar el archivo');
    fixture.detectChanges();

    const tarjeta = el().querySelector('div')!;
    expect(tarjeta.classList).toContain('border-[var(--sys-color-border-feedback-danger)]');
    expect(tarjeta.classList).not.toContain('border-border');
    expect(el().querySelector('[role="alert"]')?.textContent?.trim()).toBe('No se pudo cargar el archivo');
    expect(el().textContent).not.toContain('500kb');
  });

  it('un error en blanco no cuenta como fallido', () => {
    fixture.componentRef.setInput('error', '   ');
    fixture.detectChanges();
    expect(el().querySelector('[role="alert"]')).toBeNull();
  });

  it('fallido conserva las acciones de reemplazar y quitar, salvo en solo lectura', () => {
    fixture.componentRef.setInput('error', 'Formato no permitido');
    fixture.detectChanges();
    expect(el().querySelectorAll('button').length).toBe(2);

    fixture.componentRef.setInput('readonly', true);
    fixture.detectChanges();
    expect(el().querySelectorAll('button').length).toBe(0);
    expect(el().querySelector('[role="alert"]')).not.toBeNull();
  });
});
