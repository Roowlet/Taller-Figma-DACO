import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { AuthApiService } from '../../core/api/auth-api.service';
import { AuthService } from '../../core/auth/auth.service';
import { CurrentUserService } from '../../core/auth/current-user.service';
import { PermissionService } from '../../core/auth/permission.service';
import { SolicitudesStateService } from '../../core/state/solicitudes-state.service';
import { PROVEEDORES_SHELL_DE_MUESTRA, sembrarSesionDeMuestra } from '../../features/ui-kit/ejemplos/datos-de-muestra';
import { ShellNavigationService } from '../shell/shell-navigation.service';
import { VirtualDeskComponent } from './virtual-desk.component';

/** El Panel con la sesión de muestra del catálogo: creador con cuatro documentos y dos notificaciones sin leer. */
describe('VirtualDeskComponent', () => {
  let fixture: ComponentFixture<VirtualDeskComponent>;
  const el = (): HTMLElement => fixture.nativeElement;
  const tarjetas = (): HTMLElement[] => Array.from(el().querySelectorAll<HTMLElement>('siaf-desk-card'));
  const abrirProcesos = jasmine.createSpy('openProcessMenu');

  beforeEach(async () => {
    abrirProcesos.calls.reset();
    await TestBed.configureTestingModule({
      imports: [VirtualDeskComponent],
      providers: [
        ...PROVEEDORES_SHELL_DE_MUESTRA,
        { provide: AuthService, useValue: { debeCambiarPassword: signal(false).asReadonly() } },
        { provide: AuthApiService, useValue: { cambiarPassword: () => of(undefined) } },
        { provide: ShellNavigationService, useValue: { openProcessMenu: abrirProcesos } },
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
    sembrarSesionDeMuestra(TestBed.inject(CurrentUserService), TestBed.inject(PermissionService), TestBed.inject(SolicitudesStateService));
    fixture = TestBed.createComponent(VirtualDeskComponent);
    fixture.detectChanges();
  });

  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('pinta las ocho tarjetas con siaf-desk-card, cada una en su variante y con los contadores de la bandeja', () => {
    const resumen = tarjetas().map((t) => [
      t.querySelector('[data-variante]')?.getAttribute('data-variante'),
      t.querySelector('[data-titulo]')?.textContent?.trim(),
      t.querySelector('[data-numero]')?.textContent?.trim() ?? null,
    ]);
    expect(resumen).toEqual([
      ['featured', 'Bandeja de Documentos', '04'],
      ['featured', 'Procesos', null],
      ['counter', 'Recibidos', '01'],
      ['counter', 'Enviados', '02'],
      ['counter', 'Borradores', '02'],
      ['counter', 'Notificaciones', '02'],
      ['shortcut', 'Consulta y Reportes', null],
      ['shortcut', 'Crear documento', null],
    ]);
    const hechasAMano = Array.from(el().querySelectorAll('article')).filter((a) => !a.closest('siaf-desk-card'));
    expect(hechasAMano.length).withContext('sin tarjetas hechas a mano').toBe(0);
  });

  it('solo Procesos es un botón, y abre el menú de procesos', () => {
    const botones = Array.from(el().querySelectorAll<HTMLButtonElement>('siaf-desk-card button'));
    expect(botones.map((b) => b.querySelector('[data-titulo]')?.textContent?.trim())).toEqual(['Procesos']);
    botones[0].click();
    expect(abrirProcesos).toHaveBeenCalledTimes(1);
  });
});
