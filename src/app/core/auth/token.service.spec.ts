import { TestBed } from '@angular/core/testing';

import { TokenService } from './token.service';

/** Construye un JWT falso (header.payload.firma) con el payload dado. */
function fakeJwt(payload: Record<string, unknown>): string {
  const b64 = (obj: unknown) => btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_');
  return `${b64({ alg: 'HS256' })}.${b64(payload)}.firma`;
}

describe('TokenService', () => {
  let service: TokenService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(TokenService);
  });

  afterEach(() => localStorage.clear());

  it('guarda y recupera el access token, y marca autenticado', () => {
    service.saveAccessToken('acceso-1');
    expect(service.getAccessToken()).toBe('acceso-1');
    expect(service.isAuthenticated()).toBeTrue();
  });

  it('no expone el refresh token a JavaScript (vive en cookie httpOnly)', () => {
    expect((service as unknown as Record<string, unknown>)['getRefreshToken']).toBeUndefined();
    expect(localStorage.getItem('siaf_refresh_token')).toBeNull();
  });

  it('clearTokens elimina todo y desautentica', () => {
    service.saveAccessToken('acceso-1');
    service.saveSession({ perfil: 'x' });
    service.clearTokens();
    expect(service.getAccessToken()).toBeNull();
    expect(service.getSession()).toBeNull();
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('decodifica el payload del JWT (base64url incluido)', () => {
    const exp = Math.floor(Date.now() / 1000) + 900;
    service.saveAccessToken(fakeJwt({ sub: 'usuario-1', sesionId: 'sesion-1', exp }));
    const payload = service.getJwtPayload();
    expect(payload?.sub).toBe('usuario-1');
    expect(payload?.sesionId).toBe('sesion-1');
  });

  it('isTokenExpired distingue tokens vigentes de vencidos', () => {
    const ahora = Math.floor(Date.now() / 1000);
    service.saveAccessToken(fakeJwt({ exp: ahora + 600 }));
    expect(service.isTokenExpired()).toBeFalse();

    service.saveAccessToken(fakeJwt({ exp: ahora - 10 }));
    expect(service.isTokenExpired()).toBeTrue();
  });

  it('un token corrupto se trata como expirado y payload null', () => {
    service.saveAccessToken('no-es-un-jwt');
    expect(service.getJwtPayload()).toBeNull();
    expect(service.isTokenExpired()).toBeTrue();
  });

  it('getSession devuelve null ante JSON corrupto en storage', () => {
    localStorage.setItem('siaf_session', '{rota');
    expect(service.getSession()).toBeNull();
  });
});
