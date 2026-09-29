import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';

import { errorInterceptor } from './error.interceptor';

/**
 * Red de seguridad del 403: si el backend niega una operación, el usuario
 * vuelve al panel en vez de quedarse en una pantalla que no le corresponde.
 * El resto de errores debe pasar intacto — quien llama necesita verlos para
 * mostrar su propio mensaje.
 */
describe('errorInterceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;
  const routerSpy = { navigate: jasmine.createSpy('navigate') };

  beforeEach(() => {
    routerSpy.navigate.calls.reset();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerSpy },
      ],
    });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => controller.verify());

  it('deja pasar las respuestas correctas sin tocarlas', () => {
    let respuesta: unknown;
    http.get('/api/v1/solicitudes').subscribe(r => (respuesta = r));

    controller.expectOne('/api/v1/solicitudes').flush({ ok: true });

    expect(respuesta).toEqual({ ok: true });
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('ante un 403 redirige al panel', () => {
    http.post('/api/v1/solicitudes/1/aprobar', {}).subscribe({ error: () => undefined });

    controller
      .expectOne('/api/v1/solicitudes/1/aprobar')
      .flush({ message: 'Sin permiso' }, { status: 403, statusText: 'Forbidden' });

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/panel']);
  });

  it('el 403 sigue llegando a quien llamó, no se traga el error', () => {
    let error: HttpErrorResponse | undefined;
    http.get('/api/v1/usuarios').subscribe({ error: e => (error = e) });

    controller
      .expectOne('/api/v1/usuarios')
      .flush({ message: 'Sin permiso' }, { status: 403, statusText: 'Forbidden' });

    // Redirigir no debe impedir que el componente muestre su propio mensaje.
    expect(error?.status).toBe(403);
    expect(error?.error).toEqual({ message: 'Sin permiso' });
  });

  it('no redirige con otros errores del servidor', () => {
    for (const status of [400, 401, 404, 409, 500]) {
      routerSpy.navigate.calls.reset();
      let error: HttpErrorResponse | undefined;

      http.get(`/api/v1/recurso-${status}`).subscribe({ error: e => (error = e) });
      controller
        .expectOne(`/api/v1/recurso-${status}`)
        .flush(null, { status, statusText: 'Error' });

      expect(error?.status)
        .withContext(`el error ${status} debe propagarse`)
        .toBe(status);
      expect(routerSpy.navigate)
        .withContext(`el error ${status} no debe redirigir al panel`)
        .not.toHaveBeenCalled();
    }
  });

  it('tampoco redirige ante un fallo de red (status 0)', () => {
    let error: HttpErrorResponse | undefined;
    http.get('/api/v1/solicitudes').subscribe({ error: e => (error = e) });

    controller.expectOne('/api/v1/solicitudes').error(new ProgressEvent('error'));

    expect(error).toBeTruthy();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });
});
