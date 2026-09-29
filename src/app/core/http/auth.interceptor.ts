import { HttpClient, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, finalize, shareReplay, switchMap, throwError } from 'rxjs';

import { TokenService } from '../auth/token.service';
import { APP_CONFIG } from '../config/app.config';

const PUBLIC_URLS = ['/auth/login', '/auth/refresh', '/auth/solicitar-otp', '/auth/verificar-otp'];

function isPublicUrl(url: string): boolean {
  return PUBLIC_URLS.some(path => url.includes(path));
}

function addBearer(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}

interface RefreshResponse {
  accessToken: string;
}

// Refresh compartido: si varias peticiones reciben 401 a la vez, todas esperan
// el MISMO POST /auth/refresh en lugar de disparar una estampida (con la
// rotación de tokens del backend, refrescos paralelos se invalidarían entre sí).
let refreshInFlight$: Observable<RefreshResponse> | null = null;

function refreshTokens(http: HttpClient): Observable<RefreshResponse> {
  if (!refreshInFlight$) {
    // El refresh token y el sesionId van en cookies httpOnly; withCredentials
    // hace que el navegador las envíe. No se manda body. URL absoluta del
    // entorno: en producción (Vercel) la ruta relativa /api/v1 no existe.
    refreshInFlight$ = http.post<RefreshResponse>(
      `${APP_CONFIG.api.baseUrl}/auth/refresh`,
      {},
      { withCredentials: true },
    ).pipe(
      shareReplay(1),
      finalize(() => { refreshInFlight$ = null; }),
    );
  }
  return refreshInFlight$;
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);
  const http = inject(HttpClient);

  if (isPublicUrl(req.url)) {
    return next(req);
  }

  const token = tokenService.getAccessToken();
  const authReq = token ? addBearer(req, token) : req;

  return next(authReq).pipe(
    catchError(err => {
      if (err.status === 401) {
        // El refresh token vive en una cookie httpOnly, así que aquí no hay nada
        // que comprobar en JS: intentamos refrescar y, si la cookie falta o
        // expiró, el backend responde 401 y caemos a logout.
        return refreshTokens(http).pipe(
          switchMap(tokens => {
            tokenService.saveAccessToken(tokens.accessToken);
            return next(addBearer(req, tokens.accessToken));
          }),
          catchError(refreshErr => {
            tokenService.clearTokens();
            router.navigate(['/login']);
            return throwError(() => refreshErr);
          })
        );
      }
      return throwError(() => err);
    })
  );
};
