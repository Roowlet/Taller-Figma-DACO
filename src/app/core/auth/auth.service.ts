import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap, catchError, throwError, map } from 'rxjs';

import {
  AuthApiService,
  LoginResponse,
  PerfilItem,
  CambiarPerfilResponse,
} from '../api/auth-api.service';
import { TokenService } from './token.service';
import { CurrentUserService } from './current-user.service';
import { PermissionService } from './permission.service';
import { mapRolCodigo } from './role.model';
import { NotificationsStateService } from '../realtime/notifications-state.service';

/** Construye la oficina legible del usuario: "ENTIDAD - ÓRGANO DE LÍNEA".
 *  Para un usuario de U.E. su identidad operativa es la Unidad Ejecutora
 *  (p. ej. el hospital), no el Pliego; para DGCP/Pliego se usa la entidad. */
function buildOfficeLabel(p: PerfilItem): string {
  const principal =
    p.nivelAmbito === 'UE'
      ? (p.ueSiglas ?? p.ue ?? p.entidadSiglas ?? p.entidad)
      : (p.entidadSiglas ?? p.entidad);
  const partes = [principal, p.unidadSigla ?? p.unidad].filter(Boolean) as string[];
  return partes.join(' - ') || 'ENTIDAD ESTADO';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(AuthApiService);
  private readonly tokenService = inject(TokenService);
  private readonly currentUser = inject(CurrentUserService);
  private readonly permissions = inject(PermissionService);
  private readonly notifications = inject(NotificationsStateService);

  private readonly _isLoading = signal(false);
  private readonly _authError = signal<string | null>(null);
  private readonly _debeCambiarPassword = signal(false);
  private readonly _perfilesDisponibles = signal<PerfilItem[]>([]);

  readonly isLoading = this._isLoading.asReadonly();
  readonly authError = this._authError.asReadonly();
  readonly debeCambiarPassword = this._debeCambiarPassword.asReadonly();
  readonly perfilesDisponibles = this._perfilesDisponibles.asReadonly();

  login(dni: string, password: string): Observable<void> {
    this._isLoading.set(true);
    this._authError.set(null);

    return this.api.login({ dni, password }).pipe(
      tap(res => this.establecerSesion(res)),
      map(() => void 0),
      catchError(err => {
        const mensaje = err?.error?.message ?? 'Credenciales incorrectas. Intente nuevamente.';
        this._authError.set(Array.isArray(mensaje) ? mensaje.join(', ') : mensaje);
        this._isLoading.set(false);
        return throwError(() => err);
      }),
    );
  }

  logout(): Observable<void> {
    return this.api.logout().pipe(
      tap(() => {
        this.notifications.stop();
        this.tokenService.clearTokens();
      }),
      catchError(err => {
        this.notifications.stop();
        this.tokenService.clearTokens();
        return throwError(() => err);
      }),
    );
  }

  /**
   * Cambia el perfil activo del usuario.
   * El backend ahora devuelve solo {accessToken, perfilActivo}, por lo que
   * preservamos refreshToken y la lista de perfiles desde el estado actual.
   */
  cambiarPerfil(perfilId: string): Observable<void> {
    return this.api.cambiarPerfil({ perfilId }).pipe(
      tap(res => this.applyCambioPerfil(res)),
      map(() => void 0),
    );
  }

  initFromStorage(): void {
    if (!this.tokenService.isAuthenticated()) return;

    const session = this.tokenService.getSession<{
      perfilActivo: PerfilItem;
      perfilesDisponibles: PerfilItem[];
      debeCambiarPassword: boolean;
    }>();

    if (!session) {
      // Access token presente pero sin sesión (borrado parcial de
      // localStorage, JSON corrupto, formato de una versión vieja): no hay
      // forma de resolver el rol real. Tratarla como sesión inválida en vez
      // de dejar al usuario autenticado con el rol por defecto — evitaba
      // caer en fail-open (SEC-001, auditoría 2026-08).
      this.tokenService.clearTokens();
      return;
    }

    this.hydrateCurrentUser(session.perfilActivo);
    this._perfilesDisponibles.set(session.perfilesDisponibles);
    this._debeCambiarPassword.set(session.debeCambiarPassword);

    if (this.tokenService.isTokenExpired()) {
      this.tryRefresh();
    }

    // Iniciar socket + carga inicial de notificaciones
    this.notifications.start();
  }

  private tryRefresh(): void {
    // El refresh token está en una cookie httpOnly; si falta o expiró, el
    // backend responde 401 y limpiamos la sesión local.
    this.api.refresh().pipe(
      catchError(() => {
        this.tokenService.clearTokens();
        return throwError(() => null);
      }),
    ).subscribe(tokens => {
      this.tokenService.saveAccessToken(tokens.accessToken);
    });
  }

  /**
   * Establece la sesión completa a partir de una respuesta tipo LoginResponse:
   * guarda tokens, hidrata usuario/permisos y arranca notificaciones en tiempo
   * real. Punto único usado por login, OTP (recuperar contraseña) y cualquier
   * otro flujo que autentique con esta forma de respuesta — evita que cada
   * flujo reimplemente a mano el armado de sesión (y se olvide un paso, como
   * pasaba con el socket de notificaciones en OTP).
   */
  establecerSesion(res: LoginResponse): void {
    this.tokenService.saveAccessToken(res.accessToken);
    this.tokenService.saveSession({
      perfilActivo: res.perfilActivo,
      perfilesDisponibles: res.perfilesDisponibles,
      debeCambiarPassword: res.debeCambiarPassword,
    });

    this.hydrateCurrentUser(res.perfilActivo);

    this._debeCambiarPassword.set(res.debeCambiarPassword);
    this._perfilesDisponibles.set(res.perfilesDisponibles);
    this._isLoading.set(false);
    this._authError.set(null);

    this.notifications.start();
  }

  /**
   * Aplica el cambio de perfil — la sesión (y su cookie de refresh) no cambia,
   * solo se actualizan accessToken y perfilActivo.
   */
  private applyCambioPerfil(res: CambiarPerfilResponse): void {
    this.tokenService.saveAccessToken(res.accessToken);

    const perfilesActuales = this._perfilesDisponibles();
    this.tokenService.saveSession({
      perfilActivo: res.perfilActivo,
      perfilesDisponibles: perfilesActuales,
      debeCambiarPassword: this._debeCambiarPassword(),
    });

    this.hydrateCurrentUser(res.perfilActivo);
    this.notifications.start();
  }

  /** Vuelca todos los campos del perfil al CurrentUserService + Permissions. */
  private hydrateCurrentUser(p: PerfilItem): void {
    this.currentUser.setUser({
      name: p.rol,
      office: buildOfficeLabel(p),
      entidadId: p.entidadId ?? null,
      entidadSiglas: p.entidadSiglas ?? null,
      entidadCodigo: p.entidadCodigo ?? null,
      ue: p.ue ?? null,
      ueId: p.ueId ?? null,
      unidad: p.unidad ?? null,
      unidadId: p.unidadId ?? null,
      procedimiento: p.procedimiento ?? null,
      procedimientoCodigo: p.procedimientoCodigo ?? null,
      perfilFuncional: p.perfilFuncional ?? null,
      nivelAmbito: p.nivelAmbito ?? null,
      entidadAmbitoId: p.entidadAmbitoId ?? null,
      entidadAmbitoCodigo: p.entidadAmbitoCodigo ?? null,
    });

    this.permissions.setRole(mapRolCodigo(p.rolCodigo));
    // Permisos efectivos desde el backend (fuente única); si la sesión no los
    // trae, PermissionService cae a su matriz local por rol.
    this.permissions.setPermissions(p.permisos);
  }
}
