import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { IconComponent } from '../icon/icon.component';

/** Tonos semánticos del Figma: gris, azul, verde, amarillo y rojo. */
export type StatusTagTone = 'default' | 'info' | 'success' | 'warning' | 'danger';
/** `solid`: fondo oscuro y texto blanco. `soft`: fondo claro con borde. `outline`: solo borde, con el ícono del tono. */
export type StatusTagAppearance = 'solid' | 'soft' | 'outline';
/** `standard` mide 32 px de alto y `small`, 24 px. */
export type StatusTagSize = 'standard' | 'small';

/**
 * Etiqueta de estado del kit (Figma UI KIT, sección «Semántica»): cinco tonos (`default`, `info`, `success`, `warning`
 * y `danger`) en tres estilos, que son los de las familias de etiquetas del Figma: `solid` («flow tags», fondo oscuro y
 * texto blanco), `soft` («Period», «Expediente» y «Conciliación tags», fondo claro con borde) y `outline` («status items
 * tags», solo borde y el ícono del tono). Texto de 12 px, esquinas de 4 px, 32 px de alto en `standard` y 24 px en
 * `small`, y un ícono relleno de 20 px opcional antes del texto.
 *
 * Es la base de `siaf-flow-status-tag` y `siaf-record-status-tag`, que guardan el mapa de cada estado a su tono y su
 * estilo. Usarla directo para un estado que no es del flujo de un documento ni de un registro.
 *
 * El fondo de `solid` sale de `--sys-color-bg-status-solid-*`: en claro son los de feedback oscuro del Figma; en
 * oscuro, los tonos oscuros del flujo, porque en ese tema los de feedback oscuro pasan a tintes claros y el texto
 * blanco no se leería.
 *
 * @figma 19358:721 Semántica
 * @figma 2576:10069 flow tags
 * @figma 6756:221 status items tags
 * @figma 19299:105 Period tags
 * @usar
 * - Para el estado de algo que no es un documento ni un registro, con los tonos del Figma: el de un expediente (Creado,
 *   En trámite, Archivado) o una conciliación (No conciliado, Pendiente de conciliación, Conciliado), con `soft`.
 * - `outline` con `icon` para estados de ítems que se leen en una lista (Enviado `send`, Completado `check_circle`,
 *   Pendiente `pending`, Observado `warning`).
 * - Para una marca informativa con color junto a un título, como las de cada ficha de `/ui-kit` («Requiere sesión»,
 *   «Sin uso en la app»), con `soft` y un ícono si ayuda.
 * - `small` (24 px) dentro de tablas y resúmenes; `standard` (32 px) sola, junto a un título.
 * @evitar
 * - Para el estado del flujo de una solicitud: usar `siaf-flow-status-tag`, que ya sabe el tono de cada estado.
 * - Para el estado de un registro (Activo, Abierto, Cerrado…): usar `siaf-record-status-tag`.
 * - Para filtros aplicados, opciones que se eligen o valores que se pueden quitar: usar `siaf-tag`; para contadores,
 *   `siaf-badge`.
 * - Como única señal del estado: el tono es solo color, el estado tiene que ir escrito.
 * @teclado
 * - No recibe foco: no es interactiva.
 * @accesibilidad
 * - **1.4.1 Uso del color (A)**: el estado va escrito; el tono y el ícono solo lo refuerzan.
 * - **1.1.1 Contenido no textual (A)**: el ícono es decorativo (`siaf-icon` con `aria-hidden`); el estado se lee del
 *   texto.
 * - **1.3.1 Información y relaciones (A)**: es un `<span>`; el contexto lo da quien la contiene (la cabecera de la
 *   columna o la etiqueta del dato).
 * - **1.4.3 Contraste mínimo (AA)**: en claro, `solid` con texto blanco da 12.24:1 en `default`, 5.82:1 en `info`,
 *   4.71:1 en `success` y 7.13:1 en `danger`; `soft`, 11.46:1, 5.81:1, 5.31:1 y 6.21:1 en esos tonos; y `outline`,
 *   sobre la superficie, de 5.25:1 (`warning`) a 14.53:1 (`default`). En oscuro cumplen los 15: `solid` de 5.31:1
 *   (`warning`) a 7.97:1 (`default`), `soft` de 8.24:1 a 11.45:1 y `outline` de 10.59:1 a 16.53:1.
 * - **Pendiente · 1.4.3 Contraste mínimo (AA)**: en claro, `warning` no llega a 4.5:1 con texto de 12 px ni en `solid`
 *   (blanco sobre `bg-status-solid-warning`, 3.39:1) ni en `soft` (4.43:1); son los colores del Figma, a revisar con
 *   diseño.
 * - **4.1.3 Mensajes de estado (AA)**: no es región viva: un cambio de estado no se anuncia desde la etiqueta.
 */
@Component({
  selector: 'siaf-status-tag',
  standalone: true,
  imports: [IconComponent],
  template: `
    <span
      class="inline-flex w-fit max-w-full shrink-0 items-center gap-siaf-xs overflow-hidden whitespace-nowrap rounded-siaf-sm border px-siaf-xs text-xs font-normal leading-[normal]"
      [class]="clases"
      [attr.data-tono]="tone"
      [attr.data-apariencia]="appearance"
    >
      @if (icon) {
        <siaf-icon class="flex shrink-0" [class]="claseIcono" [name]="icon" [size]="20" variant="filled" />
      }
      <span><ng-content /></span>
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusTagComponent {
  @Input() tone: StatusTagTone = 'default';
  @Input() appearance: StatusTagAppearance = 'soft';
  @Input() size: StatusTagSize = 'standard';
  /** Ícono de Material Icons (relleno, 20 px) antes del texto. */
  @Input() icon = '';

  /** Figma «flow tags»: fondo oscuro del tono, texto blanco y el borde de los estados. */
  private static readonly SOLIDO: Record<StatusTagTone, string> = {
    default: 'border-[var(--sys-color-border-states-enabled)] bg-[var(--sys-color-bg-status-solid-default)] text-[var(--sys-color-text-brand-white)]',
    info: 'border-[var(--sys-color-border-states-enabled)] bg-[var(--sys-color-bg-status-solid-info)] text-[var(--sys-color-text-brand-white)]',
    success: 'border-[var(--sys-color-border-states-enabled)] bg-[var(--sys-color-bg-status-solid-success)] text-[var(--sys-color-text-brand-white)]',
    warning: 'border-[var(--sys-color-border-states-enabled)] bg-[var(--sys-color-bg-status-solid-warning)] text-[var(--sys-color-text-brand-white)]',
    danger: 'border-[var(--sys-color-border-states-enabled)] bg-[var(--sys-color-bg-status-solid-danger)] text-[var(--sys-color-text-brand-white)]',
  };

  /** Figma «Period», «Expediente» y «Conciliación tags»: fondo claro, borde y texto del tono. */
  private static readonly SUAVE: Record<StatusTagTone, string> = {
    default: 'border-[var(--sys-color-border-feedback-default)] bg-[var(--sys-color-bg-feedback-light-default)] text-[var(--sys-color-text-feedback-default)]',
    info: 'border-[var(--sys-color-border-feedback-info)] bg-[var(--sys-color-bg-feedback-light-info)] text-[var(--sys-color-text-feedback-info)]',
    success: 'border-[var(--sys-color-border-feedback-success)] bg-[var(--sys-color-bg-feedback-light-success)] text-[var(--sys-color-text-feedback-success)]',
    warning: 'border-[var(--sys-color-border-feedback-warning)] bg-[var(--sys-color-bg-feedback-light-warning)] text-[var(--sys-color-text-feedback-warning)]',
    danger: 'border-[var(--sys-color-border-feedback-danger)] bg-[var(--sys-color-bg-feedback-light-danger)] text-[var(--sys-color-text-feedback-danger)]',
  };

  /** Figma «status items tags»: solo el borde y el texto del tono, sin fondo. */
  private static readonly BORDE: Record<StatusTagTone, string> = {
    default: 'border-[var(--sys-color-border-feedback-default)] bg-transparent text-[var(--sys-color-text-feedback-default)]',
    info: 'border-[var(--sys-color-border-feedback-info)] bg-transparent text-[var(--sys-color-text-feedback-info)]',
    success: 'border-[var(--sys-color-border-feedback-success)] bg-transparent text-[var(--sys-color-text-feedback-success)]',
    warning: 'border-[var(--sys-color-border-feedback-warning)] bg-transparent text-[var(--sys-color-text-feedback-warning)]',
    danger: 'border-[var(--sys-color-border-feedback-danger)] bg-transparent text-[var(--sys-color-text-feedback-danger)]',
  };

  /** En `outline` el ícono lleva el color de ícono del tono, como en el Figma; en los otros estilos, el del texto. */
  private static readonly ICONO_BORDE: Record<StatusTagTone, string> = {
    default: 'text-[var(--sys-color-icon-feedback-light-default)]',
    info: 'text-[var(--sys-color-icon-feedback-light-info)]',
    success: 'text-[var(--sys-color-icon-feedback-light-success)]',
    warning: 'text-[var(--sys-color-icon-feedback-light-warning)]',
    danger: 'text-[var(--sys-color-icon-feedback-light-danger)]',
  };

  get clases(): string {
    const estilos =
      this.appearance === 'solid' ? StatusTagComponent.SOLIDO : this.appearance === 'outline' ? StatusTagComponent.BORDE : StatusTagComponent.SUAVE;
    // Altura fija y no relleno vertical: así el borde de 1 px queda adentro y mide 32 o 24 px, como en el Figma.
    const alto = this.size === 'small' ? 'h-6' : 'h-8';
    return `${alto} ${estilos[this.tone] ?? estilos.default}`;
  }

  get claseIcono(): string {
    return this.appearance === 'outline' ? (StatusTagComponent.ICONO_BORDE[this.tone] ?? '') : '';
  }
}
