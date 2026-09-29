import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { IconComponent } from '../icon/icon.component';

/**
 * Variantes del Figma: `filled` (rojo acento), `outline` (borde gris) y `text` (sin borde).
 * `accent` y `primary` son sinónimos de `filled`, `secondary` de `outline` y `ghost` de `text`.
 */
export type ButtonVariant = 'filled' | 'outline' | 'text' | 'standard' | 'primary' | 'accent' | 'secondary' | 'ghost';
/** Tamaños del Figma: `md` = Default (40 px) y `sm` = Small (32 px). */
export type ButtonSize = 'sm' | 'md';

type TipoFigma = 'filled' | 'outline' | 'text';

const TIPO_POR_VARIANTE: Record<ButtonVariant, TipoFigma> = {
  filled: 'filled',
  primary: 'filled',
  accent: 'filled',
  outline: 'outline',
  secondary: 'outline',
  text: 'text',
  standard: 'text',
  ghost: 'text',
};

/**
 * Botón base del design system (Figma UI KIT, nodo 8305:2071 «Buttons»).
 *
 * - `variant`: `filled` (rojo acento), `outline` (borde gris) o `text` (sin borde). Siguen valiendo los
 *   nombres de siempre: `accent` / `primary` = filled, `secondary` = outline, `ghost` = text.
 * - `size`: `md` (Default, 40 px) o `sm` (Small, 32 px); en ambos, texto de 14 px e íconos de 24.
 * - Estados del Figma con una capa sobre el fondo: hover (capa + elevación 2; outline con borde azul),
 *   foco con teclado (borde azul + capa + elevación 2), presionado (capa + elevación 8) y deshabilitado
 *   (fondo blanco con capa gris y texto gris; en modo oscuro, la superficie deshabilitada del tema con su borde).
 * - Ícono opcional al inicio, al final o solo ícono (`iconOnly`, que exige `ariaLabel` en español), y `loading`.
 * - Botón de ícono (Figma «Icon buttons», nodo 8307:5607): 40 / 32 px; `standard` es el nombre del Figma para
 *   `text`. En outline y standard el ícono va en gris; en Small mide 20 px (24 en filled). `[activated]` lo deja
 *   presionado como interruptor (`aria-pressed`): filled con capa y elevación 1; outline y standard con capa
 *   azul, ícono azul y, en outline, borde azul.
 *
 * Es el botón canónico de la app: usarlo siempre en vez de un `<button>` con clases sueltas.
 *
 * @usar
 * - `filled` para la acción principal de la vista (una sola por bloque): Grabar, Aprobar, Crear documento.
 * - `outline` para acciones secundarias junto a la principal (Cancelar, Editar) y `text` para las de menor peso.
 * - Botón de ícono (`iconOnly`) en barras de herramientas y filas de tabla, siempre con `ariaLabel`.
 * - `sm` (32 px) dentro de tablas, tarjetas compactas y barras densas; `md` (40 px) en el resto.
 * @evitar
 * - Para navegar a otra pantalla: usar un enlace (`routerLink`); el botón ejecuta acciones.
 * - Varios `filled` en el mismo bloque: compiten entre sí; dejar uno y bajar el resto a `outline` o `text`.
 * - Para acciones destructivas no hay variante `danger`: usar `filled` y confirmar con un modal.
 * - Para abrir un menú de opciones: usar `siaf-icon-dropdown-menu`.
 * @figma 8305:2071 Buttons
 * @figma 8307:5607 Icon buttons
 * @teclado
 * - **Tab**: enfoca el botón; el foco con teclado muestra el borde azul y la capa de estado.
 * - **Enter / Espacio**: ejecutan la acción. Deshabilitado o en `loading`, no recibe el foco.
 * @accesibilidad
 * - **1.1.1 Contenido no textual (A)**: el ícono (`siaf-icon`) y el indicador de `loading` llevan `aria-hidden`; el
 *   nombre sale del texto proyectado o de `ariaLabel`.
 * - **Pendiente · 4.1.2 Nombre, función y valor (A)**: es un `<button>` nativo con `type="button"` por defecto (en
 *   formularios, `type="submit"` explícito) y `disabled` nativo; `iconOnly` necesita `ariaLabel` en español (sin él,
 *   el lector leería el nombre del ícono, p. ej. «file_upload») y `loading` publica `aria-busy`. Falta el estado
 *   apagado del interruptor: `activated` pone `aria-pressed="true"`, pero al desactivarse quita el atributo en vez de
 *   dejar `false`.
 * - **2.4.7 Foco visible (AA)**: `outline-none` se reemplaza en `:focus-visible` por el borde `border-states-focus`
 *   (5.35:1 claro / 10.15:1 oscuro), la capa de foco y la elevación 2.
 * - **1.4.3 Contraste mínimo (AA)**: `filled` pinta `text-brand-white` sobre `bg-brand-accent` (4.89:1 claro / 5.65:1
 *   oscuro); `outline` y `text`, `text-neutral-medium` sobre la superficie (14.53:1 / 12.87:1). El deshabilitado está
 *   exento.
 * - **1.4.11 Contraste no textual (AA)**: relleno de `filled` (`bg-brand-accent`, 4.89:1 / 3.14:1) e ícono gris de
 *   `iconOnly` en outline y standard (`icon-states-enabled`, 8.70:1 / 12.87:1) sobre la superficie. El borde gris de
 *   `outline` (`border-states-enabled`, 2.44:1 / 2.59:1) no llega a 3:1, pero al botón lo identifican su texto o su
 *   ícono.
 * - **Pendiente · 1.4.1 Uso del color (A)**: en `outline` y `standard`, `activated` solo cambia colores (capa, ícono
 *   y, en outline, borde azules; en oscuro ese borde, `border-states-active`, queda en 2.02:1). En `filled` lo
 *   distingue además la elevación 1.
 * - **2.5.8 Tamaño del objetivo (AA)**: `md` mide 40 px de alto y `sm` 32 px; el botón de ícono, 40×40 o 32×32.
 * - **4.1.3 Mensajes de estado (AA)**: `loading` solo deshabilita el botón y publica `aria-busy`; el resultado lo debe
 *   anunciar el padre (por ejemplo, con `siaf-snackbar`).
 */
@Component({
  selector: 'siaf-button',
  standalone: true,
  imports: [IconComponent, NgClass],
  template: `
    <button
      class="siaf-button inline-flex items-center justify-center gap-siaf-xs rounded-siaf-md border outline-none transition-[box-shadow,border-color,background-color] duration-150 disabled:cursor-not-allowed"
      [type]="type"
      [disabled]="disabled || loading"
      [attr.data-tipo]="tipo"
      [attr.data-activo]="activated ? '' : null"
      [attr.aria-pressed]="activated ? 'true' : null"
      [attr.aria-label]="ariaLabel || (iconOnly ? icon : null)"
      [attr.aria-busy]="loading ? 'true' : null"
      [ngClass]="[variantClass, sizeClass]"
    >
      @if (loading) {
        <span class="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden="true"></span>
      }
      @if (!loading && icon && (iconOnly || iconPosition === 'start')) {
        <siaf-icon [name]="icon" [size]="iconSize" />
      }
      @if (!iconOnly) {
        <!-- El tamaño va en el texto: la regla global button { font: inherit } pisa las utilidades del botón. -->
        <span class="text-sm font-medium leading-[normal]"><ng-content /></span>
      }
      @if (!loading && !iconOnly && icon && iconPosition === 'end') {
        <siaf-icon [name]="icon" [size]="iconSize" />
      }
    </button>
  `,
  styles: `
    :host {
      display: inline-block;
    }

    :host(.block),
    :host(.w-full) {
      width: 100%;
    }

    :host(.block) button,
    :host(.w-full) button {
      width: 100%;
    }

    /* Capa de estado del Figma («layer state»): va sobre el fondo y debajo del contenido. */
    .siaf-button {
      position: relative;
    }

    .siaf-button > * {
      position: relative;
    }

    .siaf-button::before {
      content: '';
      position: absolute;
      inset: -1px;
      border-radius: inherit;
      background-color: transparent;
      pointer-events: none;
      transition: background-color 150ms;
    }

    /* Filled */
    .siaf-button[data-tipo='filled']:enabled:hover::before {
      background-color: var(--sys-color-bg-states-dark-hover);
    }

    .siaf-button[data-tipo='filled']:enabled:focus-visible::before {
      background-color: var(--sys-color-bg-states-dark-focus);
    }

    .siaf-button[data-tipo='filled']:enabled:active::before {
      background-color: var(--sys-color-bg-states-dark-pressed);
    }

    /* Outline y Text */
    .siaf-button[data-tipo='outline']:enabled:hover::before,
    .siaf-button[data-tipo='text']:enabled:hover::before {
      background-color: var(--sys-color-bg-states-light-hover);
    }

    .siaf-button[data-tipo='outline']:enabled:hover {
      border-color: var(--sys-color-border-states-hover);
    }

    .siaf-button[data-tipo='outline']:enabled:focus-visible::before,
    .siaf-button[data-tipo='text']:enabled:focus-visible::before {
      background-color: var(--sys-color-bg-states-light-focus);
    }

    .siaf-button[data-tipo='outline']:enabled:active::before,
    .siaf-button[data-tipo='text']:enabled:active::before {
      background-color: var(--sys-color-bg-states-light-pressed);
    }

    /* Elevación: 2 en hover y foco, 8 al presionar. El foco con teclado lleva además borde azul. */
    .siaf-button:enabled:hover,
    .siaf-button:enabled:focus-visible {
      box-shadow: var(--sys-shadow-elevation-2);
    }

    .siaf-button:enabled:focus-visible {
      border-color: var(--sys-color-border-states-focus);
    }

    .siaf-button:enabled:active {
      box-shadow: var(--sys-shadow-elevation-8);
    }

    /* Activado (botón de ícono que queda presionado). */
    .siaf-button[data-activo][data-tipo='filled']::before {
      background-color: var(--sys-color-bg-states-dark-selected);
    }

    .siaf-button[data-activo][data-tipo='filled'] {
      box-shadow: var(--sys-shadow-elevation-1);
    }

    .siaf-button[data-activo][data-tipo='outline']::before,
    .siaf-button[data-activo][data-tipo='text']::before {
      background-color: var(--sys-color-bg-states-light-activated);
    }

    .siaf-button[data-activo][data-tipo='outline'],
    .siaf-button[data-activo][data-tipo='text'] {
      color: var(--sys-color-icon-states-active);
    }

    .siaf-button[data-activo][data-tipo='outline'] {
      border-color: var(--sys-color-border-states-active);
    }

    /* Deshabilitado: fondo blanco con la capa gris encima y texto gris, sin borde ni sombra. */
    .siaf-button:disabled {
      border-color: transparent;
      background-color: var(--sys-color-bg-brand-white);
      color: var(--sys-color-text-neutral-disabled);
      box-shadow: none;
    }

    /* La capa cubre también el borde transparente de 1 px (inset -1px): con inset 0 el fondo blanco asomaba
       por ese borde y dibujaba un contorno blanco alrededor de la capa gris. */
    .siaf-button:disabled::before {
      background-color: var(--sys-color-bg-states-light-disabled);
    }

    /* Modo oscuro: el blanco de marca no cambia con el tema, así que el deshabilitado vuelve al estilo
       anterior del botón (superficie deshabilitada del tema con su borde), sin capa encima. */
    :host-context([data-theme='dark']) .siaf-button:disabled {
      border-color: var(--sys-color-border-states-disabled);
      background-color: var(--sys-color-bg-surfaces-disabled);
    }

    :host-context([data-theme='dark']) .siaf-button:disabled::before {
      background-color: transparent;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'filled';
  @Input() size: ButtonSize = 'md';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() icon = '';
  @Input() iconPosition: 'start' | 'end' = 'start';
  @Input() iconOnly = false;
  @Input() ariaLabel = '';
  /** Botón de ícono presionado (interruptor): estado «Activated» del Figma. */
  @Input() activated = false;

  /** Variante del Figma a la que corresponde `variant`. */
  get tipo(): TipoFigma {
    return TIPO_POR_VARIANTE[this.variant] ?? 'filled';
  }

  get variantClass(): string {
    // En el botón de ícono, outline y standard pintan el ícono en gris (icon-states-enabled) en vez del color de
    // texto. El azul del activado y el gris del deshabilitado los ponen los estilos del componente, que ganan.
    const colorNeutro = this.iconOnly ? 'text-[var(--sys-color-icon-states-enabled)]' : 'text-[var(--sys-color-text-neutral-medium)]';
    const classes: Record<TipoFigma, string> = {
      filled: 'border-transparent bg-[var(--sys-color-bg-brand-accent)] text-[var(--sys-color-text-brand-white)]',
      outline: `border-[var(--sys-color-border-states-enabled)] bg-transparent ${colorNeutro}`,
      text: `border-transparent bg-transparent ${colorNeutro}`,
    };

    return classes[this.tipo];
  }

  get sizeClass(): string {
    if (this.iconOnly) {
      return this.size === 'sm' ? 'size-8 p-siaf-xxs' : 'size-10 p-siaf-xs';
    }
    return this.size === 'sm' ? 'min-h-8 px-siaf-md py-siaf-xxs' : 'min-h-10 px-siaf-md py-siaf-xs';
  }

  /** 24 px como en el Figma; el botón de ícono pequeño outline o standard baja a 20 (filled se queda en 24). */
  get iconSize(): number {
    return this.iconOnly && this.size === 'sm' && this.tipo !== 'filled' ? 20 : 24;
  }
}
