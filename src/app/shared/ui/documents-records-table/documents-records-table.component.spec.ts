import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ESPERA_AL_SALIR_MS } from '../tooltip/tooltip.directive';
import { DocumentsRecordsTableComponent } from './documents-records-table.component';
import type { DocumentsRecordsColumn, DocumentsRecordsRow } from '../../types/documents-records.types';

/** N° de documento largo: el formato real del sistema, que se corta en la columna. */
const NUMERO_LARGO = 'SCMPC-SPC-0001-2026-MEF-DGCP-UNIDAD-EJECUTORA-DE-PRUEBA-MUY-LARGA';

describe('DocumentsRecordsTableComponent — tooltip de textos truncados', () => {
  let fixture: ComponentFixture<DocumentsRecordsTableComponent>;

  const columns: DocumentsRecordsColumn[] = [
    { key: 'document', label: 'N° Documento', visibility: 'visible', group: 'default', widthClass: 'w-[440px]', kind: 'document-link' },
    { key: 'entidad', label: 'Entidad', visibility: 'visible', group: 'default' }
  ];

  const rows: DocumentsRecordsRow[] = [{ number: '1', document: NUMERO_LARGO, entidad: NUMERO_LARGO }];

  beforeEach(async () => {
    // El tooltip por hover solo actúa en dispositivos con hover real, y un
    // Chrome headless sin puntero (el del CI en Linux) reporta `hover: none`.
    // Forzamos la consulta para que estos specs no dependan del entorno.
    spyOn(window, 'matchMedia').and.returnValue({ matches: true } as MediaQueryList);

    await TestBed.configureTestingModule({
      imports: [DocumentsRecordsTableComponent],
      providers: [provideRouter([]), provideHttpClient()]
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentsRecordsTableComponent);
    fixture.componentRef.setInput('columns', columns);
    fixture.componentRef.setInput('rows', rows);
    fixture.componentRef.setInput('documentRoute', () => '/');
    // El host debe estar en el layout real para que scrollWidth/clientWidth midan.
    fixture.nativeElement.style.width = '320px';
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
  });

  afterEach(() => {
    document.querySelectorAll('[role="tooltip"]').forEach((t) => t.remove());
    fixture.nativeElement.remove();
  });

  function tooltipVisible(): HTMLElement | null {
    return document.body.querySelector('[role="tooltip"]');
  }

  it('muestra el N° de documento completo al pasar el mouse sobre el enlace truncado', () => {
    const enlace: HTMLElement = fixture.nativeElement.querySelector('a');
    expect(enlace.scrollWidth).toBeGreaterThan(enlace.clientWidth);

    enlace.dispatchEvent(new MouseEvent('mouseenter'));

    expect(tooltipVisible()?.textContent).toBe(NUMERO_LARGO);
  });

  it('muestra el contenido completo de una celda de texto truncada', () => {
    // La tabla usa table-layout automático: la celda solo se trunca si algo
    // le pone tope de ancho (como el max-w del enlace de documento).
    const celda: HTMLElement = fixture.nativeElement.querySelector('tbody span.truncate');
    (celda.closest('td') as HTMLElement).style.maxWidth = '80px';

    celda.dispatchEvent(new MouseEvent('mouseenter'));

    expect(tooltipVisible()?.textContent).toBe(NUMERO_LARGO);
  });

  it('no muestra tooltip cuando el texto entra completo', () => {
    fixture.componentRef.setInput('rows', [{ number: '1', document: 'A-1', entidad: 'B' }]);
    fixture.detectChanges();

    fixture.nativeElement.querySelector('a').dispatchEvent(new MouseEvent('mouseenter'));

    expect(tooltipVisible()).toBeNull();
  });

  it('oculta el tooltip al salir el mouse, tras la espera que permite llevar el puntero al globo', fakeAsync(() => {
    const enlace: HTMLElement = fixture.nativeElement.querySelector('a');

    enlace.dispatchEvent(new MouseEvent('mouseenter'));
    enlace.dispatchEvent(new MouseEvent('mouseleave'));
    tick(ESPERA_AL_SALIR_MS);

    expect(tooltipVisible()).toBeNull();
  }));
});
