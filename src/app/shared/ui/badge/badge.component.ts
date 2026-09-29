import { ChangeDetectionStrategy, Component, Input, computed, signal } from '@angular/core';

export type BadgeColor = 'accent' | 'primary';
export type BadgeSize = 'standard' | 'small';

/**
 * Badge de notificación (Figma UI KIT, nodo 7262:6493 «Badges»): indica una notificación o el número de
 * elementos de un destino. Va en el borde final de un ícono o al final de un ítem de lista.
 *
 * Sin `label` es un **punto** (12 px, o 8 px en `small`); con `label` es un **contador** en píldora
 * (20 px de alto, o 16 px en `small`) que crece con el texto. `color`: `accent` (rojo, por defecto) o
 * `primary` (azul). Con `max`, un número mayor se muestra como «99+». Un punto es decorativo salvo que
 * lleve `ariaLabel`; al contador conviene darle uno que diga qué cuenta («3 notificaciones sin leer»).
 *
 * Para el estado de un documento o registro van `siaf-flow-status-tag` / `siaf-record-status-tag`; para otra
 * etiqueta con color, `siaf-status-tag`, y para valores que se eligen, filtran o quitan, `siaf-tag`.
 *
 * @usar
 * - Para el número de pendientes de un destino: cada opción de la Bandeja (`siaf-tray-menu`) y las pestañas con
 *   conteo de `siaf-tabs`.
 * - Sobre la campana del navbar, con `size="small"` y `max` 99, para las notificaciones sin leer.
 * - Al final de un ítem de `siaf-list`, con `minWidth` 32 como en el Figma.
 * - Como punto, sin `label`, para avisar que hay novedades cuando el número no importa.
 * @evitar
 * - Para el estado de un documento o registro: usar `siaf-flow-status-tag` o `siaf-record-status-tag`; para otro estado,
 *   `siaf-status-tag`.
 * - Para etiquetas con texto o categorías con color: usar `siaf-status-tag`; para filtros aplicados u opciones que se
 *   eligen: `siaf-tag`.
 * - Para distinguir tipos de aviso solo por el color (`accent` rojo frente a `primary` azul).
 * - Suelto y sin `ariaLabel`: si el número ya está en el nombre del control, ocultarlo con `aria-hidden` (como
 *   en el navbar); si no, darle `ariaLabel`.
 * @teclado
 * - No recibe foco: no es interactivo.
 * @accesibilidad
 * - **1.1.1 Contenido no textual (A)**: sin `ariaLabel`, el punto lleva `aria-hidden` y el contador se lee como un
 *   número suelto; con `ariaLabel`, recibe ese nombre. El padre debe darlo cuando el número no está ya en el
 *   control que lo contiene.
 * - **4.1.3 Mensajes de estado (AA)**: con `ariaLabel` es `role="status"`, así que los cambios del contador se
 *   anuncian de forma educada; sin él, no se anuncian.
 * - **1.4.1 Uso del color (A)**: `accent` y `primary` solo cambian el color; el punto informa por su presencia y
 *   el contador por su número.
 * - **1.4.3 Contraste mínimo (AA)**: texto blanco sobre `bg-brand-accent` 4.89:1 (5.65:1 en oscuro) y sobre
 *   `bg-brand-primary` 8.79:1 (6.67:1).
 * - **Pendiente · 1.4.11 Contraste no textual (AA)**: en oscuro el punto `primary` (`bg-brand-primary`) queda en
 *   2.66:1 sobre la superficie; el `accent` cumple (4.89:1 en claro, 3.14:1 en oscuro).
 */
@Component({
  selector: 'siaf-badge',
  standalone: true,
  template: `
    <span
      class="inline-flex shrink-0 items-center justify-center rounded-full leading-none text-[var(--sys-color-text-brand-white)]"
      [class.bg-[var(--sys-color-bg-brand-accent)]]="color === 'accent'"
      [class.bg-brand-primary]="color === 'primary'"
      [class.size-3]="!texto() && size === 'standard'"
      [class.size-2]="!texto() && size === 'small'"
      [class.h-5]="!!texto() && size === 'standard'"
      [class.min-w-5]="!!texto() && size === 'standard'"
      [class.h-4]="!!texto() && size === 'small'"
      [class.min-w-4]="!!texto() && size === 'small'"
      [class.px-siaf-xxs]="!!texto()"
      [class.text-xs]="!!texto()"
      [class.font-medium]="!!texto() && size === 'standard'"
      [style.min-width.px]="texto() && minWidth ? minWidth : null"
      [attr.data-shape]="texto() ? 'label' : 'dot'"
      [attr.role]="ariaLabel ? 'status' : null"
      [attr.aria-label]="ariaLabel || null"
      [attr.aria-hidden]="!ariaLabel && !texto() ? 'true' : null"
    >{{ texto() }}</span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BadgeComponent {
  @Input() color: BadgeColor = 'accent';
  @Input() size: BadgeSize = 'standard';
  /** Ancho mínimo del contador en px (ej. 32 al final de un ítem de lista, como en el Figma). */
  @Input() minWidth: number | null = null;
  /** Nombre accesible: qué indica el badge. */
  @Input() ariaLabel = '';

  /** Texto o número del contador. Vacío o `null`: punto. */
  @Input() set label(valor: string | number | null | undefined) {
    this.crudo.set(valor ?? '');
  }

  /** Tope para contadores numéricos: por encima se muestra `max+`. */
  @Input() set max(valor: number | null | undefined) {
    this.tope.set(valor ?? null);
  }

  private readonly crudo = signal<string | number>('');
  private readonly tope = signal<number | null>(null);

  readonly texto = computed(() => {
    const valor = this.crudo();
    const tope = this.tope();
    if (typeof valor === 'number' && tope !== null && valor > tope) return `${tope}+`;
    return `${valor}`;
  });
}
