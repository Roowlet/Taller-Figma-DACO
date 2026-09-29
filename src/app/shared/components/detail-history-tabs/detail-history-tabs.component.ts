import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';

import { TabItem, TabsComponent } from '../../ui/tabs/tabs.component';

export interface DetailHistoryComment {
  /** Etiqueta del bloque, ej. "Comentario de observación". */
  label: string;
  /** Texto a mostrar. */
  texto: string;
}

export interface DetailHistoryEntry {
  /** Iteración del flujo (1, 2, 3, ...). */
  iteracion: number;
  /** Acción ejecutada (ej. "Observar Solicitud"). */
  proceso: string;
  /** Encabezado del comentario (ej. "Comentario de Observación"). */
  comentario: string;
  /** Texto libre escrito por el usuario al ejecutar la acción. */
  descripcion: string;
  /** Fecha formateada (ej. "30/08/2023"). */
  fecha: string;
  /** Hora formateada (ej. "08:00:59"). */
  hora: string;
  /** Rol + entidad apilados (multilínea con \n). */
  rol: string;
  /** Usuario que ejecutó la acción. */
  usuario: string;
}

/**
 * Tabs reutilizables "Detalle | Historial" para vistas de solicitudes.
 * - Detalle: muestra un único comentario contextual (observación, rechazo, etc.)
 * - Historial: tabla completa con todas las iteraciones del flujo.
 *
 * Diseño basado en Figma nodes 6591:3280 (tabs) y 30:6121 (historial). La franja de pestañas es
 * `siaf-tabs` subrayado (Figma «Tabs», Border=False).
 *
 * @usar
 * - En la solicitud abierta, para el comentario vigente (observación o motivo de rechazo) y la tabla de iteraciones:
 *   plan de cuentas (individual y carga masiva), clase y tipo de asiento de ajuste, asiento de ajuste y solicitud de
 *   apertura contable.
 * - Encima de `siaf-action-tracker`, que completa la trazabilidad con los responsables.
 * - Con `buildHistoryEntries` y `buildCurrentComment` de `detail-history-tabs.utils.ts` para armar los datos desde el
 *   historial de la solicitud.
 * @evitar
 * - Para ver el historial desde la bandeja sin abrir la solicitud: usar `siaf-document-history-panel`.
 * - Para quién elaboró, verificó y aprobó: usar `siaf-action-tracker`.
 * - Para otras pestañas: usar `siaf-tabs` directamente; este componente fija Detalle / Historial y sus columnas.
 * - Rehacer a mano la tabla de iteraciones en otra solicitud: reusar este componente.
 * @teclado
 * - **Tab**: entra a la fila de pestañas en la activa y sale al contenido.
 * - **Flecha izquierda / derecha**: pasan de Detalle a Historial y viceversa, como en `siaf-tabs`.
 * - **Inicio / Fin**: van a Detalle o a Historial.
 * @accesibilidad
 * - **Pendiente · 4.1.2 Nombre, función y valor (A)**: las pestañas son `siaf-tabs` (`role="tab"` con
 *   `aria-selected`), pero la fila no recibe `ariaLabel` y el contenido no es `role="tabpanel"` con `aria-labelledby`.
 * - **1.3.1 Información y relaciones (A)**: el historial es una `table` con `thead` y `th` bajo un `h3`; el comentario
 *   va como rótulo y párrafo.
 * - **1.4.1 Uso del color (A)**: la pestaña activa va en negrita con subrayado; proceso, comentario y fecha de cada
 *   iteración están en texto.
 * - **1.4.3 Contraste mínimo (AA)**: pestañas inactivas `text-neutral-low` 4.64:1 (oscuro 8.32:1) sobre
 *   `surface-low`; rótulo `text-neutral-low` 5.01:1 (8.86:1), celdas `text-neutral-medium` 14.53:1 (12.87:1) y título
 *   `text-neutral-high` 16.29:1 (16.53:1) sobre la superficie.
 * - **2.1.1 Teclado (A)**: se cambia de pestaña con flechas, Inicio y Fin; solo la activa entra en el orden de
 *   tabulación.
 * - **2.4.7 Foco visible (AA)**: sigue `siaf-tabs`: borde interior de 2 px `border-states-focus` y capa de foco.
 */
@Component({
  selector: 'siaf-detail-history-tabs',
  standalone: true,
  imports: [TabsComponent],
  template: `
    <section class="siaf-dht">
      <siaf-tabs [tabs]="pestanas" [activeId]="activeTab()" [border]="false" (activeIdChange)="activeTab.set($any($event))" />

      <!-- Detalle tab -->
      @if (activeTab() === 'detalle') {
        <div class="siaf-dht__content siaf-dht__content--padded">
          @if (comentario) {
            <div class="siaf-dht__field">
              <span class="siaf-dht__overline">{{ comentario.label }}</span>
              <p class="siaf-dht__body">{{ comentario.texto || emptyText }}</p>
            </div>
          } @else {
            <p class="siaf-dht__body">{{ emptyDetalle }}</p>
          }
        </div>
      }

      <!-- Historial tab -->
      @if (activeTab() === 'historial') {
        <div class="siaf-dht__content">
          <div class="siaf-dht__title-wrap">
            <h3 class="siaf-dht__title">{{ historialTitle }}</h3>
          </div>

          <div class="siaf-dht__table-wrap">
            @if (entries.length > 0) {
              <div class="siaf-dht__scroll">
                <table class="siaf-dht__table">
                  <thead>
                    <tr>
                      <th class="siaf-dht__th siaf-dht__th--first" style="width:130px">Iteración</th>
                      <th class="siaf-dht__th" style="width:140px">Proceso</th>
                      <th class="siaf-dht__th" style="width:220px">Comentario / Motivo</th>
                      <th class="siaf-dht__th" style="min-width:200px">Descripción</th>
                      <th class="siaf-dht__th" style="width:130px">Fecha</th>
                      <th class="siaf-dht__th" style="width:130px">Rol</th>
                      <th class="siaf-dht__th siaf-dht__th--last" style="width:160px">Usuario</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (entry of entries; track $index) {
                      <tr>
                        <td class="siaf-dht__td">{{ entry.iteracion }}</td>
                        <td class="siaf-dht__td siaf-dht__td--wrap">{{ entry.proceso }}</td>
                        <td class="siaf-dht__td siaf-dht__td--wrap">{{ entry.comentario }}</td>
                        <td class="siaf-dht__td">{{ entry.descripcion || '—' }}</td>
                        <td class="siaf-dht__td">
                          <div>{{ entry.fecha }}</div>
                          <div>{{ entry.hora }}</div>
                        </td>
                        <td class="siaf-dht__td siaf-dht__td--wrap">{{ entry.rol }}</td>
                        <td class="siaf-dht__td">{{ entry.usuario }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            } @else {
              <p class="siaf-dht__body siaf-dht__body--centered">{{ emptyHistorial }}</p>
            }
          </div>
        </div>
      }
    </section>
  `,
  styles: [`
    /* Contenedor exterior: tabs strip arriba con fondo gris, panel blanco abajo */
    .siaf-dht {
      overflow: clip;
      border-radius: var(--spacing-card-borderradiuscard, 8px);
      background: var(--sys-color-bg-surfaces-surface-low);
    }

    /* Panel de contenido */
    .siaf-dht__content {
      display: flex;
      flex-direction: column;
      background: var(--sys-color-bg-surfaces-surface, white);
      border-bottom-left-radius: var(--sys-border-radius-medium, 8px);
      border-bottom-right-radius: var(--sys-border-radius-medium, 8px);
    }
    .siaf-dht__content--padded {
      padding: var(--sys-padding-base-md, 16px) var(--sys-padding-base-xl, 32px);
      gap: var(--sys-padding-base-xxs, 4px);
    }

    /* Detalle */
    .siaf-dht__field {
      display: flex;
      flex-direction: column;
      gap: var(--sys-gap-base-xxs, 4px);
    }
    .siaf-dht__overline {
      font-size: var(--sys-typography-size-overline-1, 11px);
      font-weight: var(--sys-typography-weight-medium, 500);
      color: var(--sys-color-text-neutral-low);
      text-transform: uppercase;
      letter-spacing: 0.66px;
      line-height: normal;
    }
    .siaf-dht__body {
      margin: 0;
      font-size: var(--sys-typography-size-body-2, 14px);
      font-weight: var(--sys-typography-weight-regular, 400);
      color: var(--sys-color-text-neutral-medium);
      letter-spacing: 0.0249px;
      line-height: normal;
    }
    .siaf-dht__body--centered {
      text-align: center;
      padding: var(--sys-padding-base-xl, 32px);
    }

    /* Título del historial */
    .siaf-dht__title-wrap {
      padding: var(--sys-padding-base-md, 16px) var(--sys-padding-base-xl, 32px) 0;
    }
    .siaf-dht__title {
      margin: 0;
      font-size: var(--sys-typography-size-heading-6, 16px);
      font-weight: var(--sys-typography-weight-bold, 700);
      color: var(--sys-color-text-neutral-high, #202020);
      text-transform: uppercase;
      letter-spacing: 0.02px;
      line-height: normal;
    }

    /* Tabla historial */
    .siaf-dht__table-wrap {
      padding: var(--sys-padding-base-md, 16px) var(--sys-padding-base-xl, 32px);
    }
    .siaf-dht__scroll {
      overflow-x: auto;
      width: 100%;
    }
    .siaf-dht__table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      table-layout: fixed;
    }
    .siaf-dht__th {
      height: 40px;
      padding: var(--sys-padding-base-sm, 12px) var(--sys-padding-base-md, 16px);
      background: var(--sys-color-bg-surfaces-surface-high);
      border-bottom: 1px solid var(--sys-color-divider-strong);
      font-size: var(--sys-typography-size-caption-1, 12px);
      font-weight: var(--sys-typography-weight-bold, 700);
      color: var(--sys-color-text-neutral-high, #202020);
      text-transform: uppercase;
      text-align: left;
      letter-spacing: 0;
      white-space: nowrap;
    }
    .siaf-dht__th--first {
      border-top-left-radius: var(--sys-radius-sm);
      border-bottom-left-radius: var(--sys-radius-sm);
    }
    .siaf-dht__th--last {
      border-top-right-radius: var(--sys-radius-sm);
      border-bottom-right-radius: var(--sys-radius-sm);
    }
    .siaf-dht__td {
      min-height: 48px;
      padding: var(--sys-padding-base-sm, 12px) var(--sys-padding-base-md, 16px);
      border-bottom: 1px solid var(--sys-color-divider-default);
      font-size: var(--sys-typography-size-body-2, 14px);
      font-weight: var(--sys-typography-weight-regular, 400);
      color: var(--sys-color-text-neutral-medium);
      letter-spacing: 0.0249px;
      vertical-align: top;
      line-height: 1.4;
    }
    .siaf-dht__td--wrap {
      white-space: pre-wrap;
      word-break: break-word;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailHistoryTabsComponent {
  /** Comentario del estado actual (opcional). Si está vacío se muestra `emptyDetalle`. */
  @Input() comentario: DetailHistoryComment | null = null;

  /** Entradas a renderizar en la tabla del historial. */
  @Input() entries: DetailHistoryEntry[] = [];

  /** Etiquetas configurables. */
  @Input() detalleLabel = 'Detalle';
  @Input() historialLabel = 'Historial';
  @Input() historialTitle = 'Historial de comentarios y detalles';
  @Input() emptyDetalle = 'Sin comentarios para mostrar.';
  @Input() emptyHistorial = 'Sin registros en el historial.';
  @Input() emptyText = '—';

  readonly activeTab = signal<'detalle' | 'historial'>('detalle');

  /** Pestañas en el formato de `siaf-tabs`. */
  get pestanas(): TabItem[] {
    return [
      { id: 'detalle', label: this.detalleLabel },
      { id: 'historial', label: this.historialLabel },
    ];
  }
}
