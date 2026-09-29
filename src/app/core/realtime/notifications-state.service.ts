import { Injectable, computed, inject, signal } from '@angular/core';

import { NotificacionesApiService, NotificacionResponse } from '../api/notificaciones-api.service';
import { NotificationsSocketService } from './notifications-socket.service';

/**
 * Estado global de notificaciones del usuario actual.
 * - Carga inicial desde REST al startear.
 * - Se suscribe al socket: cada `notification:new` se prepende a la lista y aumenta el contador.
 * - `marcarLeidas()` limpia el contador y la lista vía REST.
 */
@Injectable({ providedIn: 'root' })
export class NotificationsStateService {
  private readonly api = inject(NotificacionesApiService);
  private readonly socket = inject(NotificationsSocketService);

  private readonly _notifications = signal<NotificacionResponse[]>([]);
  private readonly _unreadCount = signal(0);
  private readonly _loading = signal(false);

  readonly notifications = this._notifications.asReadonly();
  readonly unreadCount = this._unreadCount.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly hasUnread = computed(() => this._unreadCount() > 0);

  private socketSub: { unsubscribe: () => void } | null = null;

  /** Inicia: conecta socket, carga lista, queda escuchando eventos. */
  start(): void {
    this.socket.connect();
    void this.refresh();

    if (!this.socketSub) {
      const sub = this.socket.notification$.subscribe((notif) => {
        this._notifications.update((list) => [notif, ...list]);
        this._unreadCount.update((n) => n + 1);
      });
      this.socketSub = sub;
    }
  }

  /** Detiene: desconecta socket y limpia el estado local. */
  stop(): void {
    this.socketSub?.unsubscribe();
    this.socketSub = null;
    this.socket.disconnect();
    this._notifications.set([]);
    this._unreadCount.set(0);
  }

  /** Recarga lista + contador desde el backend (REST). */
  async refresh(): Promise<void> {
    this._loading.set(true);
    try {
      const [list, counter] = await Promise.all([
        this.api.obtener().toPromise(),
        this.api.contarNoLeidas().toPromise(),
      ]);
      this._notifications.set(list ?? []);
      this._unreadCount.set(counter?.total ?? 0);
    } finally {
      this._loading.set(false);
    }
  }

  async marcarLeidas(): Promise<void> {
    await this.api.marcarLeidas().toPromise();
    this._notifications.set([]);
    this._unreadCount.set(0);
  }

  /** Marca como leídas las notificaciones no leídas asociadas a un documento. */
  async marcarLeidaPorDocumento(documentoId: string): Promise<void> {
    const noLeidas = this._notifications().filter((n) => !n.leida && n.documento?.id === documentoId);
    if (noLeidas.length === 0) return;

    await this.api.marcarLeidaPorDocumento(documentoId).toPromise();
    const leidaEn = new Date().toISOString();
    this._notifications.update((list) =>
      list.map((n) => (!n.leida && n.documento?.id === documentoId) ? { ...n, leida: true, leidaEn } : n)
    );
    this._unreadCount.update((n) => Math.max(0, n - noLeidas.length));
  }
}
