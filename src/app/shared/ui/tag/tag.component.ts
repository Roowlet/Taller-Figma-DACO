import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { IconComponent } from '../icon/icon.component';

/**
 * `input`: texto con × opcional para quitarlo. `choice`: botón que se elige y se deselecciona. `filter`: botón que
 * abre las opciones de un filtro, con la flecha ▾. `action`: botón de una acción rápida.
 */
export type TagVariant = 'input' | 'choice' | 'filter' | 'action';
/** `standard` mide 32 px de alto y `small`, 24 px. */
export type TagSize = 'standard' | 'small';

/**
 * Tag del kit (Figma UI KIT, «Input tags», «Choice tags», «Filter tags» y «Action tags»): la misma forma (borde, esquinas
 * de 8 px, íconos de 20 px y 32 o 24 px de alto) con cuatro usos, en `variant`. `input` es un texto con una × opcional
 * que lo quita; `choice`, un botón que se elige o se deselecciona (`aria-pressed`); `filter`, el botón que abre las
 * opciones de un filtro, con la flecha ▾ y el check al tener valor; y `action`, un botón de acción rápida.
 *
 * Los estados son los del Figma: sin elegir va con borde gris y texto `text-neutral-medium`; elegido (`selected`),
 * con fondo y borde azules; hover y foco pintan su capa y su borde; `disabled` apaga el texto y quita la × y la flecha;
 * y `dragged` es el estado visual de arrastre (capa y sombra «Elevation 1»), sin lógica de arrastre.
 *
 * La × es un botón aparte del botón principal, dentro del mismo borde: nunca un control dentro de otro.
 *
 * @figma 12474:5170 Input tags
 * @figma 12482:857 Choice tags
 * @figma 12482:484 Filter tags
 * @figma 12500:328 Action tags
 * @usar
 * - `input` con `selected` para mostrar valores aplicados, como los chips de «Filtros aplicados de búsqueda»
 *   (`siaf-consultas-filtros-chips`); con `removable` cuando cada uno se quita por separado (emite `removed`).
 * - `filter` para el disparador de un filtro con opciones: lo usa `siaf-filter-pill`, que pone el menú, el valor elegido
 *   y la × para limpiarlo. `expanded` expone si el menú está abierto y gira la flecha.
 * - `choice` para elegir entre opciones que se prenden y apagan (emite `selectedChange`), con un ícono si ayuda a
 *   reconocerlas.
 * - `action` para acciones rápidas y secundarias junto a un contenido (emite `clicked`).
 * - `small` (24 px) en barras densas o dentro de tablas.
 * @evitar
 * - Para el estado de un documento, un registro u otro estado con color: usar `siaf-flow-status-tag`,
 *   `siaf-record-status-tag` o `siaf-status-tag`.
 * - Para un filtro con menú hecho a mano: usar `siaf-filter-pill`, que ya dibuja con `filter`.
 * - Para la acción principal de una pantalla o un formulario: usar `siaf-button`.
 * - Para contadores o avisos de novedades: usar `siaf-badge`.
 * @teclado
 * - **Tab**: enfoca el botón del tag (`choice`, `filter` y `action`) y, si tiene, su ×; `input` sin × no recibe foco.
 * - **Enter / Espacio**: en `choice` elige o deselecciona; en `filter` y `action` emiten `clicked`; sobre la ×, emiten
 *   `removed`.
 * @accesibilidad
 * - **4.1.2 Nombre, función y valor (A)**: `choice`, `filter` y `action` son `<button>` nombrados por su texto; `choice`
 *   publica `aria-pressed` y `filter`, con `expanded`, `aria-haspopup="menu"` y `aria-expanded`. La × es otro `<button>`
 *   con `aria-label` (`removeLabel`), al lado del principal y no dentro.
 * - **2.4.7 Foco visible (AA)**: con el foco en el botón o en la ×, el tag pinta la capa y el borde de foco del Figma y
 *   el anillo del kit, 2 px `border-states-focus` separado 2 px (5.35:1 claro / 10.15:1 oscuro).
 * - **1.4.1 Uso del color (A)**: `filter` elegido suma el check; `choice` elegido solo cambia de color en pantalla, y el
 *   lector lo sabe por `aria-pressed`.
 * - **1.4.3 Contraste mínimo (AA)**: sin elegir, `text-neutral-medium` sobre la superficie (14.53:1 claro / 12.87:1
 *   oscuro); elegido, `text-neutral-activated` sobre la capa `bg-states-light-selected` (7.69:1 / 17.15:1).
 *   Deshabilitado queda fuera del criterio.
 * - **2.4.3 Orden del foco (A)**: al quitar un tag, la × desaparece con el foco adentro: quien lo quita lleva el foco a
 *   otro control, como `siaf-filter-pill`, que lo deja en el botón de la píldora.
 * - **Pendiente · 1.4.11 Contraste no textual (AA)**: el borde sin elegir es `border-states-enabled` (2.44:1 claro /
 *   2.59:1 oscuro) y el de elegido, `border-states-active`, baja a 2.02:1 en oscuro.
 * - **Pendiente · 2.5.8 Tamaño del objetivo (AA)**: la × mide 20 × 20 px, pegada al botón principal.
 */
@Component({
  selector: 'siaf-tag',
  standalone: true,
  imports: [IconComponent, NgTemplateOutlet],
  template: `
    <ng-template #cuerpo>
      @if (iconoInicial) {
        <siaf-icon class="flex shrink-0" [class]="claseIcono" [name]="iconoInicial" [size]="20" data-tag-icono />
      }
      <span class="min-w-0 truncate"><ng-content /></span>
      @if (conFlecha) {
        <siaf-icon class="flex shrink-0" [class]="claseIcono" [name]="expanded ? 'expand_less' : 'expand_more'" [size]="20" data-tag-flecha />
      }
    </ng-template>

    <span
      class="inline-flex max-w-full shrink-0 items-center overflow-hidden whitespace-nowrap rounded-siaf-md border font-normal leading-[normal] transition-colors has-[:focus-visible]:outline-solid has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--sys-color-border-states-focus)]"
      [class]="clasesCaja"
      [attr.data-variante]="variant"
      [attr.data-elegido]="elegido"
    >
      @if (variant === 'input') {
        <span class="inline-flex h-full min-w-0 items-center gap-siaf-xs pl-siaf-xs" [class.pr-siaf-xs]="!quitable">
          <ng-container [ngTemplateOutlet]="cuerpo" />
        </span>
      } @else {
        <button
          class="inline-flex h-full min-w-0 items-center gap-siaf-xs pl-siaf-xs text-left outline-none disabled:cursor-not-allowed"
          type="button"
          [class.pr-siaf-xs]="!quitable"
          [disabled]="disabled"
          [attr.aria-pressed]="variant === 'choice' ? selected : null"
          [attr.aria-haspopup]="variant === 'filter' && expanded !== null ? 'menu' : null"
          [attr.aria-expanded]="variant === 'filter' && expanded !== null ? expanded : null"
          data-tag-boton
          (click)="pulsar($event)"
        >
          <ng-container [ngTemplateOutlet]="cuerpo" />
        </button>
      }
      @if (quitable) {
        <button
          class="mx-siaf-xs inline-flex size-5 shrink-0 items-center justify-center rounded-full outline-none"
          [class]="claseIcono"
          type="button"
          [attr.aria-label]="removeLabel"
          data-tag-quitar
          (click)="quitar($event)"
        >
          <siaf-icon name="close" [size]="20" />
        </button>
      }
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagComponent {
  @Input() variant: TagVariant = 'input';
  /** Elegido: fondo y borde azules. No aplica a `action`. */
  @Input() selected = false;
  @Input() disabled = false;
  /** Estado visual de arrastre del Figma (capa y sombra); no arrastra nada. */
  @Input() dragged = false;
  @Input() size: TagSize = 'standard';
  /** Ícono inicial de Material Icons. En `filter`, sin él, el check aparece al estar elegido. */
  @Input() icon = '';
  /** Muestra la × (en `input` y `filter`); se oculta con `disabled`. */
  @Input() removable = false;
  /** Nombre de la × para el lector de pantalla: «Quitar filtro Estado». */
  @Input() removeLabel = 'Quitar';
  /** En `filter`: si el menú que abre está abierto; con valor, publica `aria-expanded` y gira la flecha. */
  @Input() expanded: boolean | null = null;

  /** La × del tag. */
  @Output() removed = new EventEmitter<MouseEvent>();
  /** `choice`: el nuevo estado al pulsarlo. */
  @Output() selectedChange = new EventEmitter<boolean>();
  /** Pulsación del botón (`choice`, `filter` y `action`). */
  @Output() clicked = new EventEmitter<MouseEvent>();

  private static readonly SIN_ELEGIR =
    'border-[var(--sys-color-border-states-enabled)] bg-transparent text-[var(--sys-color-text-neutral-medium)] hover:border-[var(--sys-color-border-states-hover)] hover:bg-[var(--sys-color-bg-states-light-hover)] has-[:focus-visible]:border-[var(--sys-color-border-states-focus)] has-[:focus-visible]:bg-[var(--sys-color-bg-states-light-focus)]';
  private static readonly ELEGIDO =
    'border-[var(--sys-color-border-states-active)] bg-[var(--sys-color-bg-states-light-selected)] text-[var(--sys-color-text-neutral-activated)] hover:border-[var(--sys-color-border-states-hover)] hover:bg-[var(--sys-color-bg-states-light-activated)] hover:[background-image:linear-gradient(var(--sys-color-bg-states-light-hover),var(--sys-color-bg-states-light-hover))] has-[:focus-visible]:border-[var(--sys-color-border-states-focus)] has-[:focus-visible]:bg-[var(--sys-color-bg-states-light-activated)] has-[:focus-visible]:[background-image:linear-gradient(var(--sys-color-bg-states-light-focus),var(--sys-color-bg-states-light-focus))]';
  private static readonly ARRASTRADO_SIN_ELEGIR =
    'border-[var(--sys-color-border-states-enabled)] bg-[var(--sys-color-bg-states-light-focus)] [background-image:linear-gradient(var(--sys-color-bg-states-light-dragged),var(--sys-color-bg-states-light-dragged))] text-[var(--sys-color-text-neutral-medium)] shadow-siaf-elevation-1';
  private static readonly ARRASTRADO_ELEGIDO =
    'border-transparent bg-[var(--sys-color-bg-states-light-activated)] [background-image:linear-gradient(var(--sys-color-bg-states-light-dragged),var(--sys-color-bg-states-light-dragged))] text-[var(--sys-color-text-neutral-activated)] shadow-siaf-elevation-1';
  private static readonly DESHABILITADO_SIN_ELEGIR =
    'border-[var(--sys-color-border-states-disabled)] bg-transparent text-[var(--sys-color-text-neutral-disabled)]';
  private static readonly DESHABILITADO_ELEGIDO =
    'border-transparent bg-[var(--sys-color-bg-states-light-disabled)] text-[var(--sys-color-text-neutral-disabled)]';

  /** `action` no tiene estado elegido en el Figma. */
  get elegido(): boolean {
    return this.variant !== 'action' && this.selected;
  }

  get quitable(): boolean {
    return this.removable && !this.disabled && (this.variant === 'input' || this.variant === 'filter');
  }

  /** La flecha del filtro; la × la reemplaza, y deshabilitado no la muestra. */
  get conFlecha(): boolean {
    return this.variant === 'filter' && !this.quitable && !this.disabled;
  }

  get iconoInicial(): string {
    if (this.icon) return this.icon;
    return this.variant === 'filter' && this.elegido ? 'check' : '';
  }

  get clasesCaja(): string {
    const alto = this.size === 'small' ? 'h-6' : 'h-8';
    // Choice tags usan texto de 12 px en el Figma; los demás, 14 px.
    const texto = this.variant === 'choice' ? 'text-xs' : 'text-sm';
    const estado = this.disabled
      ? this.elegido ? TagComponent.DESHABILITADO_ELEGIDO : TagComponent.DESHABILITADO_SIN_ELEGIR
      : this.dragged
        ? this.elegido ? TagComponent.ARRASTRADO_ELEGIDO : TagComponent.ARRASTRADO_SIN_ELEGIR
        : this.elegido ? TagComponent.ELEGIDO : TagComponent.SIN_ELEGIR;
    return `${alto} ${texto} ${estado}`;
  }

  get claseIcono(): string {
    if (this.disabled) return 'text-[var(--sys-color-icon-states-disabled)]';
    return this.elegido ? 'text-[var(--sys-color-icon-states-active)]' : 'text-[var(--sys-color-icon-states-enabled)]';
  }

  pulsar(evento: MouseEvent): void {
    if (this.disabled) return;
    this.clicked.emit(evento);
    if (this.variant === 'choice') this.selectedChange.emit(!this.selected);
  }

  quitar(evento: MouseEvent): void {
    evento.stopPropagation();
    this.removed.emit(evento);
  }
}
