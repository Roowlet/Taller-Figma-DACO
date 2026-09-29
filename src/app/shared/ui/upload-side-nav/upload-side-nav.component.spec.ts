import { ComponentFixture, TestBed, discardPeriodicTasks, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { UploaderComponent } from '../uploader/uploader.component';
import { UploadSideNavComponent } from './upload-side-nav.component';

describe('UploadSideNavComponent', () => {
  let fixture: ComponentFixture<UploadSideNavComponent>;
  let panel: UploadSideNavComponent;
  let confirmados: File[];
  const el = (): HTMLElement => fixture.nativeElement;
  const aceptar = (): HTMLButtonElement =>
    Array.from(el().querySelectorAll<HTMLButtonElement>('siaf-button button')).find((b) => b.textContent!.includes('Aceptar'))!;
  const uploader = (): UploaderComponent => fixture.debugElement.query(By.directive(UploaderComponent)).componentInstance;
  const pdf = (nombre: string): File => new File(['%PDF'], nombre, { type: 'application/pdf' });

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UploadSideNavComponent] }).compileComponents();
    fixture = TestBed.createComponent(UploadSideNavComponent);
    panel = fixture.componentInstance;
    confirmados = [];
    panel.confirmed.subscribe((archivo) => confirmados.push(archivo));
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('«Aceptar» se habilita con el archivo cargado, lo entrega y vuelve a deshabilitarse al quitarlo', () => {
    const sustento = pdf('Sustento.pdf');
    expect(aceptar().disabled).toBeTrue();

    uploader().fileSelected.emit(sustento);
    fixture.detectChanges();
    expect(aceptar().disabled).toBeFalse();
    aceptar().click();
    expect(confirmados).toEqual([sustento]);

    uploader().fileRemoved.emit(sustento);
    fixture.detectChanges();
    expect(aceptar().disabled).toBeTrue();
    aceptar().click();
    expect(confirmados.length).withContext('no vuelve a entregar el archivo quitado').toBe(1);
  });

  it('con dos archivos cargados, quitar el primero deja confirmar el que sigue en su tarjeta', () => {
    const primero = pdf('Primero.pdf');
    const segundo = pdf('Segundo.pdf');
    uploader().fileSelected.emit(primero);
    uploader().fileSelected.emit(segundo);
    uploader().fileRemoved.emit(primero);
    fixture.detectChanges();

    aceptar().click();
    expect(confirmados).toEqual([segundo]);
  });

  it('al volver a abrirse empieza sin archivo, aunque antes se haya cargado uno', () => {
    uploader().fileSelected.emit(pdf('Sustento.pdf'));
    fixture.componentRef.setInput('open', false);
    fixture.detectChanges();
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    expect(panel.selectedFile()).toBeNull();
    expect(aceptar().disabled).toBeTrue();
  });

  it('con el uploader real: soltar un .pdf, esperar la carga y quitarlo con la × deshabilita «Aceptar»', fakeAsync(() => {
    const datos = new DataTransfer();
    datos.items.add(pdf('Sustento.pdf'));
    el().querySelector<HTMLElement>('siaf-uploader .border-dashed')!
      .dispatchEvent(new DragEvent('drop', { dataTransfer: datos, bubbles: true, cancelable: true }));
    tick(20_000);
    fixture.detectChanges();
    expect(aceptar().disabled).withContext('carga terminada').toBeFalse();

    el().querySelector<HTMLButtonElement>('siaf-uploader button[aria-label="Cancelar"]')!.click();
    fixture.detectChanges();
    expect(el().querySelector('siaf-uploader')?.textContent).not.toContain('Sustento.pdf');
    expect(aceptar().disabled).toBeTrue();
    discardPeriodicTasks();
  }));
});
