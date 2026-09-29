import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploaderComponent } from './uploader.component';

describe('UploaderComponent', () => {
  let fixture: ComponentFixture<UploaderComponent>;
  const el = (): HTMLElement => fixture.nativeElement;

  const soltar = (archivo: File): void => {
    const datos = new DataTransfer();
    datos.items.add(archivo);
    const zona = el().querySelector<HTMLElement>('.border-dashed')!;
    zona.dispatchEvent(new DragEvent('drop', { dataTransfer: datos, bubbles: true, cancelable: true }));
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UploaderComponent] }).compileComponents();
    fixture = TestBed.createComponent(UploaderComponent);
  });

  afterEach(() => fixture.destroy());

  it('por defecto pinta la variante extendida con su ayuda', () => {
    fixture.componentRef.setInput('hint', 'PDF de hasta 10 MB');
    fixture.detectChanges();
    expect(el().textContent).toContain('elige archivo');
    expect(el().textContent).toContain('PDF de hasta 10 MB');
    expect(el().textContent).not.toContain('o soltar archivo');
  });

  it('la compacta es una fila con el botón a la izquierda y el texto ocupando el resto', () => {
    fixture.componentRef.setInput('variant', 'compact');
    fixture.detectChanges();

    const zona = el().querySelector<HTMLElement>('.border-dashed')!;
    const [boton, texto] = Array.from(zona.children) as HTMLElement[];
    expect(zona.classList).not.toContain('justify-center');
    expect(zona.classList).toContain('bg-[var(--sys-color-bg-surfaces-surface-highest)]');
    expect(boton.tagName).toBe('LABEL');
    expect(boton.textContent).toContain('Elegir archivo');
    expect(boton.querySelector('input[type="file"]')).not.toBeNull();
    expect(texto.textContent?.trim()).toBe('o soltar archivo');
    expect(texto.classList).toContain('flex-1');
  });

  it('la compacta también acepta soltar archivos y valida el formato', () => {
    fixture.componentRef.setInput('variant', 'compact');
    fixture.detectChanges();

    soltar(new File(['x'], 'planilla.xlsx'));

    const alerta = el().textContent ?? '';
    expect(alerta).toContain('planilla.xlsx');
    expect(alerta).toContain('Solo se admiten archivos .pdf');
  });

  it('quitar un archivo con la × de su tarjeta emite fileRemoved con ese archivo', () => {
    const quitados: File[] = [];
    fixture.componentInstance.fileRemoved.subscribe((archivo) => quitados.push(archivo));
    fixture.componentRef.setInput('variant', 'compact');
    fixture.detectChanges();

    const archivo = new File(['x'], 'planilla.xlsx');
    soltar(archivo);
    el().querySelector<HTMLButtonElement>('button[aria-label="Cancelar"]')!.click();
    fixture.detectChanges();

    expect(quitados).toEqual([archivo]);
    expect(el().textContent).not.toContain('planilla.xlsx');
  });
});
