import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { StatusTagComponent, StatusTagTone } from '../status-tag/status-tag.component';

export type FlowStatus =
  | 'Elaborado'
  | 'Registrado'
  | 'Verificado'
  | 'Validado'
  | 'Revisado'
  | 'Generado'
  | 'En proceso'
  | 'Autorizado'
  | 'Firmado'
  | 'Aprobado'
  | 'Aceptado'
  | 'Publicado'
  | 'Procesado'
  | 'Observado'
  | 'Pendiente'
  | 'Fallido'
  | 'Eliminado'
  | 'Rechazado'
  | 'Anulado';

export type FlowStatusTagSize = 'standard' | 'small';

/**
 * Etiqueta del estado de flujo de un documento (Elaborado, Verificado, Observado, Anulado…), con el estilo `solid` de
 * `siaf-status-tag`: fondo oscuro del tono y texto blanco. El tono de cada estado es el del Figma «flow tags»: gris para
 * Elaborado y Registrado; azul para Verificado, Validado, Revisado, Generado y En proceso; verde para Autorizado,
 * Firmado, Aprobado, Aceptado, Publicado y Procesado; amarillo para Observado, Pendiente y Fallido; y rojo para
 * Eliminado, Rechazado y Anulado.
 *
 * Junto con `siaf-record-status-tag` son las etiquetas de estado del proyecto: el mapa de estado a tono vive aquí.
 *
 * @figma 2576:10069 flow tags
 * @usar
 * - En la columna de estado de la bandeja (`siaf-tray-documents-view`) y de `siaf-documents-records-table`.
 * - En el resumen de una solicitud (`siaf-document-summary-card`) y en cada fila del historial del documento
 *   (`siaf-document-history-panel`).
 * - `small` (24 px, el valor por defecto) en tablas y resúmenes, que es lo que usan todas las pantallas; `standard`
 *   (32 px) sola, junto a un título.
 * @evitar
 * - Para el estado de un registro (Activo, Inactivo, Abierto, Cerrado): usar `siaf-record-status-tag`.
 * - Para otros estados con los tonos del Figma: usar `siaf-status-tag` directo.
 * - Para categorías, filtros o marcas libres: usar `siaf-tag`; para contadores, `siaf-badge`.
 * - Pintar a mano un `<span>` con el color del estado: el mapa de estado a tono vive aquí.
 * @teclado
 * - No recibe foco: no es interactivo.
 * @accesibilidad
 * - **1.4.1 Uso del color (A)**: el estado va escrito; el color solo lo refuerza y varios estados comparten tono.
 * - **1.4.3 Contraste mínimo (AA)**: texto blanco de 12 px sobre el fondo del tono, en claro: 12.24:1 en gris, 5.82:1
 *   en azul, 4.71:1 en verde y 7.13:1 en rojo. En oscuro, con los tonos oscuros de `--sys-color-bg-status-solid-*`,
 *   cumplen los cinco (de 5.31:1 en amarillo a 7.97:1 en gris).
 * - **Pendiente · 1.4.3 Contraste mínimo (AA)**: en claro, en amarillo (Observado, Pendiente y Fallido) el blanco sobre
 *   `bg-status-solid-warning` da 3.39:1; es el color del Figma, a revisar con diseño.
 * - **1.3.1 Información y relaciones (A)**: es un `<span>` con el nombre del estado; el contexto lo da el padre
 *   (cabecera de la columna o etiqueta del resumen).
 * - **4.1.3 Mensajes de estado (AA)**: no es región viva: el cambio de estado tras verificar o aprobar no lo
 *   anuncia la etiqueta, sino el `siaf-snackbar` de confirmación.
 */
@Component({
  selector: 'siaf-flow-status-tag',
  standalone: true,
  imports: [StatusTagComponent],
  template: `<siaf-status-tag appearance="solid" [tone]="tono" [size]="size">{{ status }}</siaf-status-tag>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlowStatusTagComponent {
  @Input() status: FlowStatus = 'Elaborado';
  /** `small` (24 px) o `standard` (32 px). */
  @Input() size: FlowStatusTagSize = 'small';

  /** Tono de cada estado en el Figma «flow tags». */
  private static readonly TONO: Record<FlowStatus, StatusTagTone> = {
    Elaborado: 'default',
    Registrado: 'default',
    Verificado: 'info',
    Validado: 'info',
    Revisado: 'info',
    Generado: 'info',
    'En proceso': 'info',
    Autorizado: 'success',
    Firmado: 'success',
    Aprobado: 'success',
    Aceptado: 'success',
    Publicado: 'success',
    Procesado: 'success',
    Observado: 'warning',
    Pendiente: 'warning',
    Fallido: 'warning',
    Eliminado: 'danger',
    Rechazado: 'danger',
    Anulado: 'danger',
  };

  get tono(): StatusTagTone {
    return FlowStatusTagComponent.TONO[this.status] ?? 'default';
  }
}
