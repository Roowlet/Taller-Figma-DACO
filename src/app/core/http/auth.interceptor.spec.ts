import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';

import { authInterceptor } from './auth.interceptor';
import { TokenService } from '../auth/token.service';
import { APP_CONFIG } from '../config/app.config';

const REFRESH_URL = `${APP_CONFIG.api.baseUrl}/auth/refresh`;

/** JWT falso (el refresh token ya no vive en JS, así que basta el access token). */
function fakeJwt(): string {
  const b64 = (obj: unknown) => btoa(JSON.stringify(obj));
  return `${b64({ alg: 'HS256' })}.${b64({ sub: 'u1', sesionId: 'sesion-1', exp: 9999999999 })}.f`;
}

describe('authInterceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;
  let tokenService: TokenService;
  const routerSpy = { navigate: jasmine.createSpy('navigate') };

  beforeEach(() => {
    localStorage.clear();
    routerSpy.navigate.calls.reset();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerSpy },
      ],
    });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
    tokenService = TestBed.inject(TokenService);
    tokenService.saveAccessToken(fakeJwt());
  });

  afterEach(() => {
    controller.verify();
    localStorage.clear();
  });

  it('agrega el Bearer a las peticiones protegidas', () => {
    http.get('/api/v1/usuarios').subscribe();
    const req = controller.expectOne('/api/v1/usuarios');
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${fakeJwt()}`);
    req.flush([]);
  });

  it('no agrega Bearer a las URLs públicas (login)', () => {
    http.post('/api/v1/auth/login', {}).subscribe();
    const req = controller.expectOne('/api/v1/auth/login');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it('ante un 401 refresca (con cookies, sin body) y reintenta la petición original', () => {
    let respuesta: unknown;
    http.get('/api/v1/usuarios').subscribe(r => (respuesta = r));

    controller.expectOne('/api/v1/usuarios').flush(null, { status: 401, statusText: 'Unauthorized' });

    const refresh = controller.expectOne(REFRESH_URL);
    // El refresh token y el sesionId viajan en cookies httpOnly: sin body, con credenciales.
    expect(refresh.request.body).toEqual({});
    expect(refresh.request.withCredentials).toBeTrue();
    refresh.flush({ accessToken: 'acceso-nuevo' });

    const reintento = controller.expectOne('/api/v1/usuarios');
    expect(reintento.request.headers.get('Authorization')).toBe('Bearer acceso-nuevo');
    reintento.flush({ ok: true });

    expect(respuesta).toEqual({ ok: true });
    expect(tokenService.getAccessToken()).toBe('acceso-nuevo');
  });

  it('dos 401 simultáneos comparten UN solo refresh (deduplicación)', () => {
    http.get('/api/v1/usuarios').subscribe();
    http.get('/api/v1/solicitudes/bandeja-creador').subscribe();

    controller.expectOne('/api/v1/usuarios').flush(null, { status: 401, statusText: 'Unauthorized' });
    controller.expectOne('/api/v1/solicitudes/bandeja-creador').flush(null, { status: 401, statusText: 'Unauthorized' });

    // Con la rotación del backend, dos refresh paralelos se invalidarían
    // entre sí: debe existir exactamente UNA llamada a /auth/refresh.
    const refresh = controller.expectOne(REFRESH_URL);
    refresh.flush({ accessToken: 'acceso-nuevo' });

    controller.expectOne('/api/v1/usuarios').flush({});
    controller.expectOne('/api/v1/solicitudes/bandeja-creador').flush({});
  });

  it('si el refresh falla (cookie ausente/expirada) limpia la sesión y redirige a login', () => {
    let error: unknown;
    http.get('/api/v1/usuarios').subscribe({ error: e => (error = e) });

    controller.expectOne('/api/v1/usuarios').flush(null, { status: 401, statusText: 'Unauthorized' });
    controller.expectOne(REFRESH_URL).flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(error).toBeTruthy();
    expect(tokenService.getAccessToken()).toBeNull();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });
});
