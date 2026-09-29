import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { NotificacionResponse } from '../api/notificaciones-api.service';

/**
 * Notificaciones en tiempo real — versión del taller.
 *
 * En SIAF-RP este servicio abre un Socket.IO contra el backend. El taller no tiene backend: las notificaciones se piden
 * al backend simulado al iniciar sesión y al abrir la campana (`NotificationsStateService.refresh()`). Se conserva la
 * misma API para que el resto de la app no cambie; `notification$` sigue disponible por si se quiere simular un aviso
 * en vivo.
 */
@Injectable({ providedIn: 'root' })
export class NotificationsSocketService {
  /** Emite cada vez que llega una notificación nueva. */
  readonly notification$ = new Subject<NotificacionResponse>();

  connect(): void {
    // Sin servidor de sockets en el taller.
  }

  disconnect(): void {
    // Nada que cerrar.
  }

  /** Re-conecta con el token actual (sin efecto en el taller). */
  reconnect(): void {
    this.disconnect();
    this.connect();
  }
}
