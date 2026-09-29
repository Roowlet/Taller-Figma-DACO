import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { APP_CONFIG } from '../config/app.config';

/**
 * Notificación tal como la entrega el backend tras el refactor v2.
 * El campo `solicitud` (legacy) pasa a llamarse `documento`; conservamos
 * el legacy como opcional para no romper UI todavía no migrada.
 */
export interface NotificacionResponse {
  id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  leidaEn: string | null;
  emailEnviado?: boolean;
  emailEnviadoEn?: string | null;
  createdAt: string;

  /** Documento al que apunta la notificación (modelo v2). */
  documento: {
    id: string;
    numero: string | null;
    catDocumento?: { id: string; codigo: string; nombre: string } | null;
  } | null;

  /** @deprecated Usa `documento`. Se mantiene como alias por compat. */
  solicitud?: {
    id: string;
    numeroSolicitud: string | null;
    tipoDocumento?: { id: string; codigo: string; nombre: string } | null;
  } | null;
}

export interface ContadorResponse {
  total: number;
}

@Injectable({ providedIn: 'root' })
export class NotificacionesApiService {
  private readonly http = inject(HttpClient);
  private readonly base = APP_CONFIG.api.baseUrl;

  obtener(): Observable<NotificacionResponse[]> {
    return this.http.get<NotificacionResponse[]>(`${this.base}/notificaciones`);
  }

  obtenerHistorial(): Observable<NotificacionResponse[]> {
    return this.http.get<NotificacionResponse[]>(`${this.base}/notificaciones/historial`);
  }

  contarNoLeidas(): Observable<ContadorResponse> {
    return this.http.get<ContadorResponse>(`${this.base}/notificaciones/contador`);
  }

  marcarLeidas(): Observable<void> {
    return this.http.patch<void>(`${this.base}/notificaciones/marcar-leidas`, {});
  }

  marcarLeidaPorDocumento(documentoId: string): Observable<void> {
    return this.http.patch<void>(`${this.base}/notificaciones/marcar-leida-documento/${documentoId}`, {});
  }
}
