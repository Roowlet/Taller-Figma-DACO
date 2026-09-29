import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalComponent, ModalVariant } from './modal.component';

/** Los presets con ilustración; `approve-multiple.svg` lo pasa `siaf-documents-records-page` con `illustrationSrc`. */
const VARIANTES: Exclude<ModalVariant, 'custom'>[] = [
  'delete-request', 'delete-record', 'review', 'undo-changes', 'save', 'verify', 'verify-multiple', 'validate',
  'approve', 'approve-multiple', 'cancel', 'settings', 'observe', 'reject',
];

/**
 * La versión oscura de cada ilustración es la de claro con dos cambios de color: las líneas grises pasan a gris claro y
 * el rojo a rosado. Así en oscuro se ve el mismo dibujo y no otro.
 */
const conPaletaOscura = (svg: string): string => svg.replace(/#4B4B4D/gi, '#D5DCE7').replace(/#D13255/gi, '#FF8DA5');

describe('ModalComponent', () => {
  let fixture: ComponentFixture<ModalComponent>;
  let modal: ModalComponent;
  const raiz = document.documentElement;
  let temaAnterior: string | null;

  beforeEach(async () => {
    temaAnterior = raiz.getAttribute('data-theme');
    await TestBed.configureTestingModule({ imports: [ModalComponent] }).compileComponents();
    fixture = TestBed.createComponent(ModalComponent);
    modal = fixture.componentInstance;
  });

  afterEach(() => {
    if (temaAnterior === null) raiz.removeAttribute('data-theme');
    else raiz.setAttribute('data-theme', temaAnterior);
  });

  it('en tema oscuro toma la ilustración de modals-dark, también la que llega por illustrationSrc', () => {
    fixture.componentRef.setInput('variant', 'approve');
    raiz.setAttribute('data-theme', 'light');
    expect(modal.resolvedIllustrationSrc).toBe('assets/figma/modals/approve.svg');

    raiz.setAttribute('data-theme', 'dark');
    expect(modal.resolvedIllustrationSrc).toBe('assets/figma/modals-dark/approve.svg');

    fixture.componentRef.setInput('variant', 'custom');
    fixture.componentRef.setInput('illustrationSrc', 'assets/figma/modals/approve-multiple.svg');
    expect(modal.resolvedIllustrationSrc).toBe('assets/figma/modals-dark/approve-multiple.svg');
  });

  it('cada ilustración oscura es el mismo dibujo que la de claro, con la paleta oscura', async () => {
    raiz.setAttribute('data-theme', 'light');
    const claras = new Set<string>(['assets/figma/modals/approve-multiple.svg']);
    for (const variante of VARIANTES) {
      fixture.componentRef.setInput('variant', variante);
      claras.add(modal.resolvedIllustrationSrc);
    }

    // Sin distinguir fines de línea: en Windows, con core.autocrlf, una copia puede tener CRLF y la otra LF.
    const leer = async (ruta: string): Promise<string> => {
      const respuesta = await fetch(ruta);
      expect(respuesta.ok).withContext(`${ruta} no se sirvió`).toBeTrue();
      return (await respuesta.text()).replace(/\r\n/g, '\n');
    };

    for (const clara of claras) {
      const oscura = clara.replace('assets/figma/modals/', 'assets/figma/modals-dark/');
      expect(await leer(oscura)).withContext(`${oscura} no es ${clara} con la paleta oscura`).toBe(conPaletaOscura(await leer(clara)));
    }
  });
});
