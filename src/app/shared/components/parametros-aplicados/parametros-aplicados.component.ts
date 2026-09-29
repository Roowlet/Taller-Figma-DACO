import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, Injector, Input, afterNextRender, computed, inject, signal } from '@angular/core';

import { ButtonComponent } from '../../ui/button/button.component';
import { ListComponent, ListItem } from '../../ui/list/list.component';

/** Un parámetro con el que se hizo la consulta: su nombre, el valor elegido y el ícono que lo identifica. */
export interface ParametroAplicado {
  /** Nombre del parámetro, título de la tarjeta (p. ej. «Periodo»). */
  label: string;
  /** Valor elegido, línea de apoyo de la tarjeta (p. ej. «Enero a marzo de 2026»); si no entra, se corta con tooltip. */
  value: string;
  /** Ícono de Material Icons del parámetro (`calendar_today`, `account_balance`, `apartment`…). */
  icon: string;
}

/**
 * «Parámetros aplicados» de Consultas y reportes (Figma «Guía de Estructura de Pantallas», nodo 22402:16429): una
 * fila de tarjetas con el ícono, el nombre y el valor de cada parámetro con que se hizo la consulta. Las tarjetas son
 * `siaf-list` horizontal con borde, dentro de un carril con desplazamiento; si no entran todas, a la derecha aparece
 * un botón con `chevron_right` sobre un desvanecido que avanza el carril y, cuando ya avanzó, a la izquierda otro con
 * `chevron_left` que retrocede. Cada botón aparece solo si hay tarjetas de su lado.
 *
 * @usar
 * - Arriba de los resultados de una consulta, para mostrar con qué parámetros se buscó, cada uno con su ícono.
 * - Con muchos parámetros o valores largos: el carril se desplaza y cada valor se corta con tooltip.
 * @evitar
 * - Para elegir o cambiar un parámetro: las tarjetas no son interactivas; la búsqueda se cambia desde la cabecera de
 *   la consulta, con `siaf-filter-pill` o con `siaf-custom-filter`.
 * - Cuando la pantalla necesita «Quitar filtros»: este bloque no lo tiene (así está en el Figma); las consultas de hoy
 *   siguen con `siaf-consultas-filtros-chips`.
 * @teclado
 * - **Tab**: cuando las tarjetas no entran, el carril recibe el foco y las flechas izquierda y derecha lo desplazan;
 *   después llega a los botones que retroceden y avanzan (los que estén a la vista).
 * - **Enter / Espacio**: en un botón, retroceden o avanzan el carril.
 * @accesibilidad
 * - **1.3.1 Información y relaciones (A)**: título `<h3>` y las tarjetas como `<ul>` / `<li>` de `siaf-list`; cada una se
 *   lee «Nombre, valor».
 * - **2.1.1 Teclado (A)**: el carril con desplazamiento es una `region` enfocable con nombre («Parámetros aplicados»),
 *   así las tarjetas que no entran se alcanzan sin mouse; los botones hacen lo mismo con un clic.
 * - **4.1.2 Nombre, función y valor (A)**: los botones se llaman «Ver parámetros anteriores» y «Ver más parámetros».
 * - **2.4.3 Orden del foco (A)**: al llegar a un extremo desaparece el botón de ese lado; si tenía el foco, este pasa al
 *   botón del otro lado (o al carril) en vez de perderse.
 * - **1.1.1 Contenido no textual (A)**: los íconos son decorativos; el nombre del parámetro va como texto.
 * - **2.4.7 Foco visible (AA)**: el carril y el botón muestran el anillo `border-states-focus` (5.35:1 / 10.15:1).
 * - **1.4.11 Contraste no textual (AA)**: el borde de las tarjetas es decorativo (`border-states-enabled`); cada tarjeta
 *   se distingue también por su espacio y su contenido.
 */
@Component({
  selector: 'siaf-parametros-aplicados',
  standalone: true,
  imports: [ButtonComponent, ListComponent],
  // Bloque: sin él el anfitrión es inline y el carril no toma el ancho disponible (no se sabría si desborda).
  host: { class: 'block min-w-0' },
  styles: `
    .carril-parametros {
      scrollbar-width: none;
    }
    .carril-parametros::-webkit-scrollbar {
      display: none;
    }
  `,
  template: `
    <section class="flex flex-col gap-siaf-xs rounded-siaf-md bg-surface p-siaf-md">
      <h3 class="m-0 text-[11px] font-medium uppercase leading-[normal] tracking-[0.66px] text-[var(--sys-color-text-neutral-medium)]" [id]="idTitulo">
        Parámetros aplicados
      </h3>
      <div class="relative min-w-0">
        <div
          class="carril-parametros min-w-0 overflow-x-auto rounded-siaf-sm focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sys-color-border-states-focus)]"
          data-carril
          [attr.role]="desborda() ? 'region' : null"
          [attr.aria-labelledby]="desborda() ? idTitulo : null"
          [attr.tabindex]="desborda() ? 0 : null"
          (scroll)="medir()"
        >
          <siaf-list orientation="horizontal" [outlined]="true" [items]="items()" />
        </div>
        @if (hayMasALaIzquierda()) {
          <!-- Espejo del de la derecha: retrocede cuando el carril ya avanzó. -->
          <div class="pointer-events-none absolute inset-y-0 left-0 w-[31px] bg-linear-to-r from-[var(--sys-color-bg-surfaces-surface)] to-transparent" aria-hidden="true"></div>
          <div class="absolute left-1 top-1/2 -translate-y-1/2 rounded-siaf-md bg-surface shadow-siaf-elevation-1" data-retroceder>
            <siaf-button variant="outline" size="sm" icon="chevron_left" [iconOnly]="true" ariaLabel="Ver parámetros anteriores" (click)="desplazar(-1)" />
          </div>
        }
        @if (hayMasALaDerecha()) {
          <!-- Desvanecido y botón del Figma («scrolling indicator» y chevron_right): avanzan el carril. -->
          <div class="pointer-events-none absolute inset-y-0 right-0 w-[31px] bg-linear-to-l from-[var(--sys-color-bg-surfaces-surface)] to-transparent" aria-hidden="true"></div>
          <div class="absolute right-1 top-1/2 -translate-y-1/2 rounded-siaf-md bg-surface shadow-siaf-elevation-1" data-avanzar>
            <siaf-button variant="outline" size="sm" icon="chevron_right" [iconOnly]="true" ariaLabel="Ver más parámetros" (click)="desplazar(1)" />
          </div>
        }
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParametrosAplicadosComponent {
  private readonly documento = inject(DOCUMENT);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  private readonly _parametros = signal<readonly ParametroAplicado[]>([]);
  @Input() set parametros(valor: readonly ParametroAplicado[]) {
    this._parametros.set(valor ?? []);
    // Otras tarjetas cambian el ancho del carril: se vuelve a medir con la fila ya pintada.
    afterNextRender(() => this.medir(), { injector: this.injector });
  }

  readonly idTitulo = `siaf-parametros-aplicados-${Math.random().toString(36).slice(2)}`;
  readonly items = computed<ListItem[]>(() => this._parametros().map((p) => ({ id: p.label, title: p.label, description: p.value, icon: p.icon })));

  /** Las tarjetas no entran en el ancho disponible: el carril se desplaza y se puede enfocar. */
  readonly desborda = signal(false);
  /** Quedan tarjetas a la derecha: se muestran el desvanecido y el botón para avanzar. */
  readonly hayMasALaDerecha = signal(false);
  /** El carril ya avanzó y quedan tarjetas a la izquierda: se muestran el desvanecido y el botón para retroceder. */
  readonly hayMasALaIzquierda = signal(false);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      this.medir();
      const carril = this.carril();
      if (!carril || typeof ResizeObserver === 'undefined') return;
      const observador = new ResizeObserver(() => this.medir());
      observador.observe(carril);
      destroyRef.onDestroy(() => observador.disconnect());
    });
  }

  medir(): void {
    const carril = this.carril();
    if (!carril) return;
    const derecha = carril.scrollLeft + carril.clientWidth < carril.scrollWidth - 1;
    const izquierda = carril.scrollLeft > 1;
    // El botón de un extremo desaparece al llegar a él: si tenía el foco, pasa al del otro lado (o al carril).
    const pierdeElFoco = (!derecha && this.tieneElFoco('[data-avanzar]')) || (!izquierda && this.tieneElFoco('[data-retroceder]'));
    this.desborda.set(carril.scrollWidth > carril.clientWidth + 1);
    this.hayMasALaDerecha.set(derecha);
    this.hayMasALaIzquierda.set(izquierda);
    if (pierdeElFoco) {
      afterNextRender(() => (this.host.nativeElement.querySelector<HTMLElement>('[data-avanzar] button, [data-retroceder] button') ?? carril).focus(), {
        injector: this.injector,
      });
    }
  }

  /**
   * Avanza (1) o retrocede (-1) lo que se ve menos una tarjeta, para no perder de vista la última que se estaba leyendo.
   */
  desplazar(sentido: 1 | -1): void {
    const carril = this.carril();
    if (!carril) return;
    const tarjeta = 234;
    carril.scrollBy({ left: sentido * Math.max(tarjeta, carril.clientWidth - tarjeta), behavior: 'smooth' });
  }

  private carril(): HTMLElement | null {
    return this.host.nativeElement.querySelector<HTMLElement>('[data-carril]');
  }

  private tieneElFoco(selector: string): boolean {
    const activo = this.documento.activeElement;
    return !!activo && !!this.host.nativeElement.querySelector(selector)?.contains(activo);
  }
}
