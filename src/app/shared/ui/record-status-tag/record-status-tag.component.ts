import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { StatusTagAppearance, StatusTagComponent, StatusTagTone } from '../status-tag/status-tag.component';

export type RecordStatus = 'Activo' | 'Inactivo' | 'Anulado' | 'En Proceso' | 'Validado' | 'Eliminado' | 'Abierto' | 'Cerrado' | 'Procesado';
export type RecordStatusTagSize = 'standard' | 'small';

interface EstiloRegistro {
  tone: StatusTagTone;
  appearance: StatusTagAppearance;
  icon: string;
}

/**
 * Etiqueta del estado de un registro (Activo, Anulado, Abierto, Cerrado, Procesado…), dibujada con `siaf-status-tag`.
 * Los estados que están en el Figma siguen su familia: Abierto y Cerrado, las «Period tags» (fondo suave azul y gris,
 * sin ícono); En Proceso y Validado, las «status items tags» (solo borde, azul, con `change_circle` y `fact_check`).
 * Activo, Inactivo, Anulado, Eliminado y Procesado, que el Figma no tiene, van con fondo suave, su ícono y su tono de
 * siempre.
 *
 * Es la etiqueta del estado del registro, junto con `siaf-flow-status-tag` para el estado del flujo de la solicitud:
 * el mapa de estado a estilo vive aquí.
 *
 * @figma 19299:105 Period tags
 * @figma 6756:221 status items tags
 * @usar
 * - En la columna de estado de las grillas de Admin (usuarios, entidades, unidades, correlativos) y de las
 *   consultas del catálogo de tipos de asiento de ajuste.
 * - En Apertura contable, para el estado del ejercicio, de los periodos y de los pliegos (Abierto, Cerrado).
 * - En «Estado del registro» del historial (`siaf-account-history-panel`, `siaf-asiento-history-panel`) y en la
 *   columna de estado de `siaf-documents-records-table`.
 * - `small` (24 px, el valor por defecto) en tablas; `standard` (32 px) sola.
 * @evitar
 * - Para el estado del flujo de una solicitud (Elaborado, Verificado, Observado): usar `siaf-flow-status-tag`.
 * - Para otros estados con los tonos del Figma: usar `siaf-status-tag` directo.
 * - Para etiquetas libres, categorías o filtros: usar `siaf-tag`; para contadores, `siaf-badge`.
 * - Como control por sí mismo: si el estado dispara una acción, envolverlo en un `<button>` con `aria-label` que
 *   diga la acción, como los periodos abiertos en la configuración de Apertura contable.
 * @teclado
 * - No recibe foco: no es interactivo.
 * @accesibilidad
 * - **1.4.1 Uso del color (A)**: el estado va escrito; el tono y el ícono solo lo refuerzan.
 * - **1.1.1 Contenido no textual (A)**: el ícono es decorativo (`siaf-icon` con `aria-hidden`); el estado se lee del
 *   texto.
 * - **1.4.3 Contraste mínimo (AA)**, en claro: con fondo suave, 5.81:1 en azul, 11.46:1 en gris y 6.21:1 en rojo;
 *   con solo borde (En Proceso y Validado), 8.29:1 en azul sobre la superficie.
 * - **1.3.1 Información y relaciones (A)**: es un `<span>`; el contexto lo da el padre (cabecera de la columna o
 *   la etiqueta «Estado del registro»).
 * - **4.1.3 Mensajes de estado (AA)**: no es región viva: un cambio de estado no se anuncia desde la etiqueta.
 */
@Component({
  selector: 'siaf-record-status-tag',
  standalone: true,
  imports: [StatusTagComponent],
  template: `
    <siaf-status-tag [tone]="estilo.tone" [appearance]="estilo.appearance" [icon]="estilo.icon" [size]="size">{{ status }}</siaf-status-tag>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecordStatusTagComponent {
  @Input() status: RecordStatus = 'Activo';
  /** `small` (24 px) o `standard` (32 px). */
  @Input() size: RecordStatusTagSize = 'small';

  private static readonly ESTILO: Record<RecordStatus, EstiloRegistro> = {
    // Figma «Period tags».
    Abierto: { tone: 'info', appearance: 'soft', icon: '' },
    Cerrado: { tone: 'default', appearance: 'soft', icon: '' },
    // Figma «status items tags».
    'En Proceso': { tone: 'info', appearance: 'outline', icon: 'change_circle' },
    Validado: { tone: 'info', appearance: 'outline', icon: 'fact_check' },
    // Sin familia en el Figma: el estilo de siempre.
    Activo: { tone: 'info', appearance: 'soft', icon: 'check_circle' },
    Inactivo: { tone: 'default', appearance: 'soft', icon: 'info' },
    Anulado: { tone: 'danger', appearance: 'soft', icon: 'assignment_late' },
    Eliminado: { tone: 'danger', appearance: 'soft', icon: 'assignment_late' },
    Procesado: { tone: 'info', appearance: 'soft', icon: 'check_circle' },
  };

  get estilo(): EstiloRegistro {
    return RecordStatusTagComponent.ESTILO[this.status] ?? RecordStatusTagComponent.ESTILO.Activo;
  }
}
