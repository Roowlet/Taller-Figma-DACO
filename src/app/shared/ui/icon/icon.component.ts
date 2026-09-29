import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type IconVariant = 'filled' | 'outlined' | 'round' | 'sharp' | 'two-tone';

/**
 * Icono de Material Icons por nombre, con tamaño en px, variante de familia y alias para
 * nombres que no existen en la fuente; decorativo por defecto (`aria-hidden`).
 *
 * Es la única forma de pintar iconos en el design system: úsalo en vez de escribir a mano
 * un `<span class="material-icons">` o de incrustar SVG sueltos.
 *
 * @usar
 * - Para todo ícono de la app: dentro de `siaf-button` (`icon`), en las opciones de `siaf-menu`, la casa y las flechas
 *   de `siaf-breadcrumb` o el `info` de ayuda de las consultas.
 * - Decorativo (por defecto) cuando acompaña un texto que ya dice lo mismo, como el `add` de «Crear documento».
 * - Con `label` y `[decorative]="false"` solo si el ícono comunica algo que no dice ningún texto cercano, como el ícono
 *   de un campo de `siaf-summary-card` (`iconLabel`).
 * - `size` en px para igualar el Figma (24 en botones, 20 en menús compactos) y `variant` de la familia
 *   (`outlined` por defecto).
 * @evitar
 * - Un `<span class="material-icons">` escrito a mano o un SVG suelto: usar siempre `siaf-icon`.
 * - Nombres que no existen en `material-icons` (inventados o solo de Material Symbols): se pintan como texto;
 *   `npm run icons:check` los detecta en CI.
 * - Como botón con clic propio: no recibe foco ni responde al teclado; usar `siaf-button` con `iconOnly` y `ariaLabel`.
 * - Para checkbox o radio: van con el `<input>` nativo del kit, no con íconos.
 * @teclado
 * - No recibe foco: no es interactivo.
 * @accesibilidad
 * - **Pendiente · 1.1.1 Contenido no textual (A)**: es decorativo por defecto (`aria-hidden="true"`), lo correcto
 *   junto a un texto. Con `[decorative]="false"` el `<span>` recibe `aria-label` con `label`, pero no `role="img"`, y
 *   ARIA no admite nombrar un elemento genérico: un lector puede ignorarlo y leer el nombre de la ligadura (p. ej.
 *   «close»). Sin `label`, ese nombre es lo único que hay.
 * - **1.4.1 Uso del color (A)**: toma el color del texto del padre; si marca un estado, el padre debe acompañarlo de
 *   texto o de otra forma, no solo del color.
 * - **1.4.11 Contraste no textual (AA)**: depende del color del padre; con `icon-states-enabled` (8.70:1 claro /
 *   12.87:1 oscuro) o `icon-states-active` (8.79:1 / 10.15:1) sobre la superficie cumple 3:1.
 */
@Component({
  selector: 'siaf-icon',
  standalone: true,
  template: `
    <span
      class="notranslate inline-block select-none align-middle leading-none"
      [class]="iconClass"
      [style.fontSize.px]="size"
      [style.width.px]="size"
      [style.height.px]="size"
      [attr.aria-hidden]="decorative"
      [attr.aria-label]="decorative ? null : label"
    >
      {{ resolvedName }}
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconComponent {
  @Input({ required: true }) name = '';
  @Input() size = 20;
  @Input() variant: IconVariant = 'outlined';
  @Input() label = '';
  @Input() decorative = true;

  get iconClass(): string {
    const classes: Record<IconVariant, string> = {
      filled: 'material-icons',
      outlined: 'material-icons-outlined',
      round: 'material-icons-round',
      sharp: 'material-icons-sharp',
      'two-tone': 'material-icons-two-tone'
    };

    return `${classes[this.variant]} notranslate inline-block select-none align-middle leading-none`;
  }

  get resolvedName(): string {
    const aliases: Record<string, string> = {
      right_panel_open: 'view_sidebar',
      dock_to_right: 'view_sidebar',
      left_panel_open: 'view_sidebar',
      picture_in_picture: 'picture_in_picture_alt',
      task_alt: 'check_circle'
    };

    return aliases[this.name] || this.name;
  }
}
