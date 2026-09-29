import { DOCUMENT, NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';

import { MessageBoxComponent } from '../../shared/ui/message-box/message-box.component';
import { leerTemaGuardado } from '../../shared/utils/tema.util';
import { EJEMPLO_POR_SELECTOR } from './ejemplos';

/**
 * Ejemplo de un componente a pantalla completa, sin la interfaz del catálogo: `/ui-kit/vista/:selector`.
 *
 * Existe para los marcos de escritorio y móvil de la ficha. Los breakpoints de Tailwind miran el
 * ancho de la ventana, no el del contenedor, así que la única forma de ver la versión móvil real
 * de un componente responsive es pintarlo dentro de un iframe de 375 px. El tema llega por
 * `?tema=dark|light` para seguir al catálogo sin tocar la preferencia guardada del usuario.
 */
@Component({
  selector: 'siaf-ui-kit-vista',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MessageBoxComponent, NgComponentOutlet],
  template: `
    <div class="min-h-screen bg-surface text-text">
      @if (ejemplo(); as ejemplo) {
        <ng-container *ngComponentOutlet="ejemplo; inputs: { selector: selector() }" />
      } @else {
        <div class="p-4">
          <message-box [text]="'No hay ejemplo para «' + selector() + '».'" />
        </div>
      }
    </div>
  `,
})
export class UiKitVistaComponent {
  private readonly route = inject(ActivatedRoute);

  readonly selector = toSignal(this.route.paramMap.pipe(map((p) => p.get('selector') ?? '')), { initialValue: '' });
  readonly ejemplo = computed(() => EJEMPLO_POR_SELECTOR.get(this.selector()) ?? null);

  constructor() {
    const tema = this.route.snapshot.queryParamMap.get('tema');
    // Solo el atributo: dentro del marco no se reescribe la preferencia que guarda el catálogo.
    inject(DOCUMENT).documentElement.setAttribute('data-theme', tema === 'dark' || tema === 'light' ? tema : leerTemaGuardado());
  }
}
