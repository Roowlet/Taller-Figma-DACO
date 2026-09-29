import { DestroyRef, computed, inject, signal } from '@angular/core';

import { NotificationsStateService } from '../../core/realtime/notifications-state.service';

const NEW_BADGE_DURATION_MS = 6000;

/**
 * Devuelve un signal con los IDs de documentos que tienen una notificación
 * sin leer y llegaron hace menos de NEW_BADGE_DURATION_MS. Debe llamarse
 * dentro de un contexto de inyección (campo de clase o constructor).
 */
export function createNewDocumentIdsSignal() {
  const notificationsState = inject(NotificationsStateService);
  const destroyRef = inject(DestroyRef);

  const seenAt = new Map<string, number>();
  const tick = signal(Date.now());

  const intervalId = setInterval(() => tick.set(Date.now()), 1000);
  destroyRef.onDestroy(() => clearInterval(intervalId));

  return computed(() => {
    const now = tick();
    const ids = new Set<string>();
    for (const n of notificationsState.notifications()) {
      if (n.leida || !n.documento?.id) continue;
      const docId = n.documento.id;
      if (!seenAt.has(docId)) seenAt.set(docId, now);
      if (now - seenAt.get(docId)! < NEW_BADGE_DURATION_MS) {
        ids.add(docId);
      }
    }
    return ids;
  });
}
