import { Injectable, signal } from '@angular/core';

const ACCESS_KEY = 'siaf_access_token';
const SESSION_KEY = 'siaf_session';

export interface JwtPayload {
  sub: string;
  sesionId: string;
  perfilId: string;
  iat: number;
  exp: number;
}

@Injectable({ providedIn: 'root' })
export class TokenService {
  private readonly _isAuthenticated = signal(!!localStorage.getItem(ACCESS_KEY));
  readonly isAuthenticated = this._isAuthenticated.asReadonly();

  /**
   * Guarda el access token (corta vida) en localStorage. El refresh token NO
   * se guarda aquí: vive en una cookie httpOnly que JavaScript no puede leer.
   */
  saveAccessToken(accessToken: string): void {
    localStorage.setItem(ACCESS_KEY, accessToken);
    this._isAuthenticated.set(true);
  }

  clearTokens(): void {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(SESSION_KEY);
    this._isAuthenticated.set(false);
  }

  saveSession<T>(session: T): void {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  getSession<T>(): T | null {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_KEY);
  }

  getJwtPayload(): JwtPayload | null {
    const token = this.getAccessToken();
    if (!token) return null;
    try {
      const segment = token.split('.')[1];
      const decoded = atob(segment.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded) as JwtPayload;
    } catch {
      return null;
    }
  }

  isTokenExpired(): boolean {
    const payload = this.getJwtPayload();
    if (!payload) return true;
    return Date.now() >= payload.exp * 1000;
  }
}
