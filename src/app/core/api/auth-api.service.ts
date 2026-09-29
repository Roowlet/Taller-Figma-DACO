import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { APP_CONFIG } from '../config/app.config';

/**
 * Vista del "perfil activo" tal como la entrega el backend tras el refactor v2.
 * Combina el SegUsuarioPerfil del usuario con el contexto institucional
 * derivado de su uePrincipal (entidad + UE + unidadOrg) y el CfgPerfil
 * (procedimiento + rol + perfil funcional).
 */
export interface PerfilItem {
  id: string;

  // ── Contexto institucional ──
  entidad: string | null;
  entidadId: string | null;
  /** Código MEF de la entidad (ej. "0001") */
  entidadCodigo?: string | null;
  /** Siglas legibles de la entidad (ej. "MEF", "GR-LIM") */
  entidadSiglas?: string | null;

  /** Unidad Ejecutora (nueva en el modelo: cuelga de la entidad) */
  ueId?: string | null;
  ue?: string | null;
  /** Sigla corta de la Unidad Ejecutora (ej. "HHV") */
  ueSiglas?: string | null;

  /** Unidad orgánica principal (DGCP, OGTI, etc.) */
  unidad: string | null;
  /** Sigla de la unidad orgánica principal (ej. "OGC") */
  unidadSigla?: string | null;
  unidadId: string | null;

  // ── Rol y perfil funcional ──
  rol: string;
  rolCodigo: string;

  /**
   * Permisos efectivos del rol (códigos como 'document.read'), provistos por
   * el backend desde SegRolPermiso. Fuente única del gating de UI; si falta
   * (sesión vieja), el frontend cae a su matriz ROLE_PERMISSIONS local.
   */
  permisos?: string[];

  /** Procedimiento (PCC, CTAA, RAA…) — viene del CatProcedimiento del CfgPerfil. */
  procedimiento?: string | null;
  procedimientoCodigo?: string | null;

  /** Nombre del perfil funcional (ej. "Operador de Plan de Cuentas Contables"). */
  perfilFuncional?: string | null;

  /** Nivel en la cascada de Apertura Contable: DGCP (MEF) / PLIEGO / UE. */
  nivelAmbito?: 'DGCP' | 'PLIEGO' | 'UE' | null;

  // ── Ámbito institucional (compat con código existente) ──
  /**
   * @deprecated En el modelo viejo era el ámbito de acceso del usuario en
   * esa entidad. Hoy el backend ya no lo entrega; se mantiene por compat
   * con código UI legacy y resuelve a `entidadAmbitoCodigo`.
   */
  ambito?: string;

  /** ID del ámbito institucional de la entidad (GN, GR, GL…) — para SRAA. */
  entidadAmbitoId: string | null;
  /** Código del ámbito institucional (ej. 'GR', 'GN', 'GL'). */
  entidadAmbitoCodigo: string | null;

  /** Solo informativo: si el usuario marcó este perfil como principal. */
  esPrincipal?: boolean;
}

export interface LoginResponse {
  accessToken: string;
  // El refreshToken ya no viaja en el body: el backend lo fija en una cookie
  // httpOnly inaccesible a JavaScript.
  debeCambiarPassword: boolean;
  perfilActivo: PerfilItem;
  perfilesDisponibles: PerfilItem[];
}

/** Respuesta de `cambiarPerfil` — el backend ya no devuelve refreshToken ni la lista de perfiles. */
export interface CambiarPerfilResponse {
  accessToken: string;
  perfilActivo: PerfilItem;
}

export interface TokensResponse {
  accessToken: string;
}

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly base = APP_CONFIG.api.baseUrl;

  // withCredentials en las llamadas de auth: necesario para que el navegador
  // reciba y reenvíe la cookie httpOnly del refresh token (cross-site en prod).
  login(dto: { dni: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.base}/auth/login`, dto, { withCredentials: true });
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.base}/auth/logout`, {}, { withCredentials: true });
  }

  refresh(): Observable<TokensResponse> {
    // El refresh token y el sesionId van en cookies httpOnly; no se envía body.
    return this.http.post<TokensResponse>(`${this.base}/auth/refresh`, {}, { withCredentials: true });
  }

  cambiarPerfil(dto: { perfilId: string }): Observable<CambiarPerfilResponse> {
    return this.http.patch<CambiarPerfilResponse>(`${this.base}/auth/cambiar-perfil`, dto);
  }

  solicitarOtp(email: string): Observable<void> {
    return this.http.post<void>(`${this.base}/auth/solicitar-otp`, { email });
  }

  verificarOtp(dto: { email: string; codigo: string; passwordNuevo?: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.base}/auth/verificar-otp`, dto, { withCredentials: true });
  }

  reenviarOtpWhatsapp(email: string): Observable<void> {
    return this.http.post<void>(`${this.base}/auth/reenviar-otp-whatsapp`, { email });
  }

  cambiarPassword(dto: { passwordActual: string; passwordNuevo: string }): Observable<void> {
    return this.http.post<void>(`${this.base}/auth/cambiar-password`, dto);
  }
}
