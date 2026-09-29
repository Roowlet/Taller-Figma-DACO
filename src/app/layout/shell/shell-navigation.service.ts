import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * Canal de eventos para que cualquier página le pida al shell abrir uno de sus paneles flotantes.
 *
 * Expone dos `Subject` sin estado (menú de procesos y crear documento) a los que `AppShellComponent` se
 * suscribe; evita que las páginas tengan que inyectar el shell o duplicar su lógica de apertura.
 */
@Injectable({ providedIn: 'root' })
export class ShellNavigationService {
  private readonly processMenuRequestedSubject = new Subject<void>();
  private readonly createDocumentRequestedSubject = new Subject<void>();

  readonly processMenuRequested$ = this.processMenuRequestedSubject.asObservable();
  readonly createDocumentRequested$ = this.createDocumentRequestedSubject.asObservable();

  openProcessMenu(): void {
    this.processMenuRequestedSubject.next();
  }

  openCreateDocument(): void {
    this.createDocumentRequestedSubject.next();
  }
}
