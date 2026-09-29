import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { CurrentUserService } from '../../core/auth/current-user.service';
import { PermissionService } from '../../core/auth/permission.service';
import { SolicitudesStateService } from '../../core/state/solicitudes-state.service';
import { PROVEEDORES_SHELL_DE_MUESTRA, sembrarSesionDeMuestra } from '../../features/ui-kit/ejemplos/datos-de-muestra';
import { TrayDocumentsViewComponent } from './tray-documents-view.component';

/** La bandeja con la sesión y los documentos de muestra del catálogo: Borradores del creador (dos elaborados). */
describe('TrayDocumentsViewComponent', () => {
  let fixture: ComponentFixture<TrayDocumentsViewComponent>;
  let bandeja: TrayDocumentsViewComponent;
  const el = (): HTMLElement => fixture.nativeElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrayDocumentsViewComponent],
      providers: [...PROVEEDORES_SHELL_DE_MUESTRA, provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    sembrarSesionDeMuestra(TestBed.inject(CurrentUserService), TestBed.inject(PermissionService), TestBed.inject(SolicitudesStateService));
    fixture = TestBed.createComponent(TrayDocumentsViewComponent);
    bandeja = fixture.componentInstance;
    fixture.componentRef.setInput('title', 'Borradores');
    fixture.detectChanges();
  });

  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('el buscador es la barra de Documentos y registros, con Campos, Favorito y Más opciones proyectados', () => {
    const barra = el().querySelector('siaf-records-search-toolbar');
    expect(barra).not.toBeNull();
    const acciones = Array.from(barra!.querySelectorAll('button[aria-label]')).map((b) => b.getAttribute('aria-label'));
    expect(acciones).toEqual(jasmine.arrayContaining(['Campos', 'Favorito', 'Mas opciones']));
    expect(el().querySelectorAll('siaf-input').length).withContext('sin un campo de búsqueda armado a mano').toBe(1);
  });

  it('escribir no filtra; Enter aplica la búsqueda y vuelve a la primera página', () => {
    expect(bandeja.filteredRows.length).toBe(2);
    bandeja.page = 2;
    const campo = el().querySelector<HTMLInputElement>('siaf-records-search-toolbar input')!;

    campo.value = 'SRAA';
    campo.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(bandeja.filteredRows.length).withContext('solo escribir').toBe(2);

    campo.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(bandeja.searchTerm).toBe('SRAA');
    expect(bandeja.page).toBe(1);
    expect(bandeja.filteredRows.map((fila) => fila.number)).toEqual(['PAA-SRAA-00013-2026-MEF-DGCP']);
  });
});
