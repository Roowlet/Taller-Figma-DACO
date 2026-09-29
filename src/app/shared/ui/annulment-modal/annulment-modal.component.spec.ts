import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { UploaderComponent } from '../uploader/uploader.component';
import { AnnulmentModalComponent, AnnulmentRequest } from './annulment-modal.component';

describe('AnnulmentModalComponent', () => {
  let fixture: ComponentFixture<AnnulmentModalComponent>;
  let modal: AnnulmentModalComponent;
  const el = (): HTMLElement => fixture.nativeElement;
  const boton = (texto: string): HTMLButtonElement =>
    Array.from(el().querySelectorAll<HTMLButtonElement>('siaf-button button')).find((b) => b.textContent!.includes(texto))!;
  const uploader = (): UploaderComponent => fixture.debugElement.query(By.directive(UploaderComponent)).componentInstance;
  const escribirDetalle = (texto: string): void => {
    const campo = el().querySelector<HTMLTextAreaElement>('text-area-control textarea')!;
    campo.value = texto;
    campo.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AnnulmentModalComponent] }).compileComponents();
    fixture = TestBed.createComponent(AnnulmentModalComponent);
    modal = fixture.componentInstance;
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('arma el diálogo con el detalle en text-area-control y el sustento en siaf-uploader compacto', () => {
    const dialogo = el().querySelector<HTMLElement>('[role="dialog"]')!;
    expect(el().querySelector(`#${dialogo.getAttribute('aria-labelledby')}`)?.textContent?.trim()).toBe('Confirmación de solicitud de anulación');
    expect(el().querySelector(`#${dialogo.getAttribute('aria-describedby')}`)?.textContent).toContain('no podrá revertir este proceso. ¿Desea continuar?');

    const detalle = el().querySelector<HTMLTextAreaElement>('text-area-control textarea')!;
    expect(detalle.getAttribute('aria-required')).toBe('true');
    expect(detalle.getAttribute('maxlength')).toBe('1000');
    expect(el().querySelector('text-area-control')?.textContent).toContain('Detalle de anulación');

    expect(uploader().variant).toBe('compact');
    expect(uploader().accept).toBe('.pdf');
    const sustento = el().querySelector<HTMLElement>('[data-sustento]')!;
    expect(sustento.querySelector('h3')?.textContent?.trim()).toBe('Sustento de la anulación');
    expect(sustento.textContent).toContain('Elegir archivo');
    expect(sustento.textContent).toContain('Solo admite archivos .pdf de hasta 10 MB');

    expect(el().textContent).not.toContain('Title Section');
    expect(el().querySelector('img')).withContext('sin las imágenes sueltas de la zona de carga hecha a mano').toBeNull();
  });

  it('«Aceptar» se habilita con detalle y archivo y entrega los dos; quitar el archivo lo vuelve a deshabilitar', () => {
    const aceptados: AnnulmentRequest[] = [];
    modal.accepted.subscribe((solicitud) => aceptados.push(solicitud));
    const archivo = new File(['%PDF'], 'Sustento.pdf', { type: 'application/pdf' });
    expect(boton('Aceptar').disabled).toBeTrue();

    escribirDetalle('   ');
    uploader().fileSelected.emit(archivo);
    fixture.detectChanges();
    expect(boton('Aceptar').disabled).withContext('un detalle solo con espacios no cuenta').toBeTrue();

    escribirDetalle('  Error en la glosa del asiento  ');
    expect(boton('Aceptar').disabled).toBeFalse();
    boton('Aceptar').click();
    expect(aceptados).toEqual([{ detail: 'Error en la glosa del asiento', file: archivo }]);

    uploader().fileRemoved.emit(archivo);
    fixture.detectChanges();
    expect(boton('Aceptar').disabled).toBeTrue();
  });

  it('quitar otro archivo no borra el sustento que sigue cargado', () => {
    const sustento = new File(['%PDF'], 'Sustento.pdf');
    escribirDetalle('Duplicado');
    uploader().fileSelected.emit(new File(['%PDF'], 'Anterior.pdf'));
    uploader().fileSelected.emit(sustento);
    uploader().fileRemoved.emit(new File(['%PDF'], 'Anterior.pdf'));
    fixture.detectChanges();
    expect(modal.archivo()).toBe(sustento);
    expect(boton('Aceptar').disabled).toBeFalse();
  });

  it('al volver a abrirse empieza vacío', () => {
    escribirDetalle('Duplicado');
    uploader().fileSelected.emit(new File(['%PDF'], 'Sustento.pdf'));
    fixture.componentRef.setInput('open', false);
    fixture.detectChanges();
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    expect(modal.detalle()).toBe('');
    expect(modal.archivo()).toBeNull();
    expect(boton('Aceptar').disabled).toBeTrue();
  });

  it('la X y «Cancelar» emiten closed', () => {
    let cierres = 0;
    modal.closed.subscribe(() => cierres++);
    el().querySelector<HTMLButtonElement>('[role="dialog"] > button')!.click();
    boton('Cancelar').click();
    expect(cierres).toBe(2);
  });
});
