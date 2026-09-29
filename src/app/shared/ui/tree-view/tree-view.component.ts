import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { IconComponent } from '../icon/icon.component';

export interface TreeViewNode {
  id: string;
  label: string;
  icon?: string;
  expanded?: boolean;
  children?: TreeViewNode[];
}

/**
 * Árbol genérico de solo lectura que pinta nodos anidados con ícono y estado `expanded` recursivo.
 *
 * Hoy no tiene consumidores: el árbol real de la app es `siaf-process-menu-tree` (en `layout/`, con
 * búsqueda tipo paleta de comandos), que pinta tanto el menú de procesos como el de Ajustes
 * (`ADMIN_MENU_TREE`); es una implementación propia que nunca se unificó con este genérico.
 *
 * @usar
 * - Para mostrar de solo lectura una jerarquía corta ya resuelta en los datos (p. ej. una entidad y sus unidades), con
 *   cada nodo abierto o cerrado según `expanded`.
 * - Como resumen estático de una rama (del plan de cuentas o de un clasificador) en un panel de detalle, donde no se
 *   navega ni se elige. Hoy no tiene consumidores.
 * @evitar
 * - Para el menú de Procesos o de Ajustes: `siaf-process-menu-tree`, el árbol real de la app, con búsqueda.
 * - Si el usuario debe abrir o cerrar ramas o elegir un nodo: no tiene clic, teclado ni roles de árbol; para secciones
 *   plegables, `siaf-accordion` o `siaf-expansion-panel`.
 * - Para una lista plana de ítems: `siaf-list`.
 * @teclado
 * - No recibe foco: no es interactivo. Los nodos no se abren ni se cierran: lo decide `expanded` en los datos.
 * @accesibilidad
 * - **1.3.1 Información y relaciones (A)**: la jerarquía va en listas `<ul>` y `<li>` anidadas.
 * - **Pendiente · 1.1.1 Contenido no textual (A)**: el chevron (`chevron_right` / `expand_more`) y el punto de hoja
 *   dicen si el nodo tiene hijos y si está abierto, pero son `siaf-icon` decorativos (`aria-hidden`) y no hay
 *   `aria-expanded`: un nodo cerrado no anuncia que tiene hijos ocultos.
 * - **1.4.3 Contraste mínimo (AA)**: etiquetas en `text-neutral-high` (16.29:1 / 16.53:1) sobre la superficie; los
 *   íconos, en `text-neutral-low` (5.01:1 / 8.86:1), superan el 3:1 no textual.
 */
@Component({
  selector: 'siaf-tree-view',
  standalone: true,
  imports: [IconComponent],
  template: `
    <ul class="grid gap-1 text-sm">
      @for (node of nodes; track node.id) {
        <li>
          <div class="flex h-8 items-center gap-2 rounded-siaf-md px-2 text-text hover:bg-surface-muted">
            <siaf-icon class="text-text-muted" [name]="node.children?.length ? (node.expanded ? 'expand_more' : 'chevron_right') : 'fiber_manual_record'" [size]="18" />
            @if (node.icon) {
              <siaf-icon class="text-text-muted" [name]="node.icon" [size]="18" />
            }
            <span>{{ node.label }}</span>
          </div>
          @if (node.children?.length && node.expanded) {
            <div class="ml-5 border-l border-border pl-2">
              <siaf-tree-view [nodes]="node.children || []" />
            </div>
          }
        </li>
      }
    </ul>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeViewComponent {
  @Input() nodes: TreeViewNode[] = [];
}
