import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertComponent } from './alert.component';

describe('AlertComponent', () => {
  let fixture: ComponentFixture<AlertComponent>;
  const caja = (): HTMLElement => fixture.nativeElement.querySelector('[role="alert"]');
  const arriba = (el: Element | null): number => Math.round(el!.getBoundingClientRect().top - caja().getBoundingClientRect().top);

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AlertComponent] }).compileComponents();
    fixture = TestBed.createComponent(AlertComponent);
    (fixture.nativeElement as HTMLElement).style.cssText = 'display: block; width: 600px';
    fixture.componentRef.setInput('title', 'No se pudo grabar la solicitud');
    fixture.componentRef.setInput('description', 'Vuelve a intentarlo en unos minutos.');
    fixture.detectChanges();
  });

  it('con varias líneas, el ícono y la × quedan arriba, a la altura del título (Figma «Alerts»)', () => {
    fixture.componentRef.setInput('description', 'El servidor rechazó el documento porque dos cuentas repiten el código. '.repeat(6));
    fixture.componentRef.setInput('showClose', true);
    fixture.detectChanges();

    const cerrar = caja().querySelector('button')!;
    expect(caja().getBoundingClientRect().height).toBeGreaterThan(80);
    expect(arriba(caja().querySelector('siaf-icon'))).toBe(arriba(caja().querySelector('span.font-bold')));
    expect(arriba(cerrar)).toBe(16);
    expect([cerrar.getBoundingClientRect().width, cerrar.getBoundingClientRect().height]).toEqual([40, 40]);
  });

  it('título y descripción van con interlineado normal, y la × emite closed', () => {
    fixture.componentRef.setInput('showClose', true);
    fixture.detectChanges();
    const textos = [caja().querySelector('span.font-bold')!, caja().querySelector('span.text-xs')!];
    expect(textos.map((t) => getComputedStyle(t).lineHeight)).toEqual(['normal', 'normal']);

    let cierres = 0;
    fixture.componentInstance.closed.subscribe(() => cierres++);
    caja().querySelector<HTMLButtonElement>('button[aria-label="Cerrar alerta"]')!.click();
    expect(cierres).toBe(1);
  });

  it('el título y el ícono se apagan por separado', () => {
    fixture.componentRef.setInput('title', '');
    fixture.detectChanges();
    expect(caja().querySelector('span.font-bold')).toBeNull();
    expect(caja().querySelector('siaf-icon')).not.toBeNull();

    fixture.componentRef.setInput('leadingIcon', false);
    fixture.detectChanges();
    expect(caja().querySelector('siaf-icon')).toBeNull();
    expect(caja().querySelector('span.text-xs')!.textContent).toContain('Vuelve a intentarlo');
  });
});
