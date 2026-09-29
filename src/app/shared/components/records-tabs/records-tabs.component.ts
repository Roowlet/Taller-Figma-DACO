import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { TabsComponent } from '../../ui/tabs/tabs.component';

export interface RecordsTabItem {
  /** Identificador estable (p.ej. 'documents', 'records'). */
  id: string;
  /** Etiqueta visible. */
  label: string;
  /** Contador opcional a la derecha de la etiqueta. */
  count?: number;
}

/**
 * Pestañas de la franja debajo del header de la página de bandeja: `Documentos | Registros`.
 *
 * Dibuja con `siaf-tabs` subrayado (Figma «Tabs», Border=False): un cambio de diseño de las pestañas se
 * hace en `siaf-tabs`. Queda disponible para cualquier futura bandeja que necesite más pestañas
 * (ej. "Documentos | Registros | Histórico").
 *
 * @usar
 * - Franja «Documentos | Registros» bajo el encabezado de la bandeja (`siaf-documents-records-page`), igual en todos
 *   los procesos que la usan.
 * - Pestañas de primer nivel de una pantalla de gestión, como «Situación de apertura general | Pliegos» (o Unidades
 *   ejecutoras) en la configuración de Apertura contable.
 * - Bandejas futuras con más vistas del mismo conjunto de datos (por ejemplo, «Documentos | Registros | Histórico»).
 * @evitar
 * - Cuando hace falta la pestaña de carpeta (`border=true`), `fullWidth` o `idBase` para enlazar el panel: usar
 *   `siaf-tabs`, que los expone.
 * - Para «Detalle | Historial» de un registro: usar `siaf-detail-history-tabs`.
 * - Para sub-vistas dentro de una pestaña: usar `siaf-buttons-group`, como en Registros de la bandeja del catálogo de
 *   ajuste.
 * @teclado
 * - No agrega teclas propias: la fila es `siaf-tabs`.
 * - **Tab**: entra en la pestaña activa y el siguiente Tab sale de la fila.
 * - **Flecha izquierda / derecha** e **Inicio / Fin**: cambian de pestaña y la activan, lo que emite `activeIdChange`.
 * @accesibilidad
 * - **4.1.2 Nombre, función y valor (A)**: dibuja `siaf-tabs` (`role="tablist"` y pestañas `role="tab"` con
 *   `aria-selected`) y le pasa `ariaLabel`, que por defecto dice «Pestañas»: el padre debe dar uno propio, como
 *   «Documentos y registros» en la bandeja (la configuración de Apertura contable deja el genérico).
 * - **Pendiente · 1.3.1 Información y relaciones (A)**: no expone `idBase` de `siaf-tabs`, así que el contenido no
 *   puede enlazarse a su pestaña con `role="tabpanel"` y `aria-labelledby`; hoy ni la bandeja ni Apertura contable
 *   marcan el panel.
 * - **2.1.1 Teclado (A)**: flechas e Inicio / Fin de `siaf-tabs`; solo la activa entra en el orden de tabulación.
 * - **2.4.7 Foco visible (AA)**: heredado de `siaf-tabs`: contorno interior azul de 2 px (`border-states-focus`),
 *   también en la pestaña activa, que es la que recibe el foco.
 * - **1.4.3 Contraste mínimo (AA)**: activa `text-neutral-activated` (8.79:1 claro / 17.76:1 oscuro) e inactivas
 *   `text-neutral-low` (5.01:1 / 8.86:1) sobre `bg-surface`, el fondo de la cabecera de la bandeja.
 * - **1.4.1 Uso del color (A)**: la activa va en negrita además del subrayado azul de 2 px.
 * - **2.5.8 Tamaño del objetivo (AA)**: pestañas de 40 px de alto.
 */
@Component({
  selector: 'siaf-records-tabs',
  standalone: true,
  imports: [TabsComponent],
  template: `
    <siaf-tabs [tabs]="tabs" [activeId]="activeId" [border]="false" [ariaLabel]="ariaLabel" (activeIdChange)="select($event)" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecordsTabsComponent {
  /** Pestañas a renderizar. */
  @Input({ required: true }) tabs: RecordsTabItem[] = [];
  /** Pestaña activa. Si no matchea ningún `tab.id`, no se marca ninguna. */
  @Input() activeId = '';
  /** Nombre accesible de la fila de pestañas. */
  @Input() ariaLabel = 'Pestañas';

  /** Emite el `id` de la pestaña recién activada. */
  @Output() activeIdChange = new EventEmitter<string>();

  select(id: string): void {
    if (id === this.activeId) return;
    this.activeIdChange.emit(id);
  }
}
