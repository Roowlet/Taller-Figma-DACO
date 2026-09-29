import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

import { IconComponent } from '../../shared/ui/icon/icon.component';
import { DEFAULT_PROCESS_TREE, ProcessMenuNode } from '../../shared/utils/process-tree.util';
import { TextFieldComponent } from '../../shared/ui/text-field/text-field.component';

// El árbol/tipo/utilidad de búsqueda viven en shared/utils/process-tree.util
// (shared no puede depender de layout). Se re-exportan acá para no romper a
// los consumidores existentes que ya importan desde este archivo.
export type { ProcessMenuNode };
export { DEFAULT_PROCESS_TREE, findProcessPathById } from '../../shared/utils/process-tree.util';

/**
 * Árbol canónico de procesos del shell: el menú jerárquico que abre la opción "Procesos" del sidebar.
 *
 * Sus datos por defecto son `DEFAULT_PROCESS_TREE` de `shared/utils/process-tree.util` (este archivo solo
 * re-exporta el tipo y las utilidades). Es el único menú en árbol: el shell también lo usa para "Ajustes" con
 * `ADMIN_MENU_TREE` y otros textos, así que un árbol nuevo es solo otro arreglo de nodos. El campo de búsqueda
 * funciona como paleta de comandos: filtra la navegación en vivo, sin ir al servidor, y expande las ramas
 * con coincidencias. Los nodos `comingSoon` solo expanden — nunca emiten `nodeSelected`.
 *
 * @usar
 * - Para el panel Procesos del armazón: `siaf-app-shell` lo abre desde el rail y navega a la `moduleRoute` o
 *   `createRoute` del nodo emitido (plan de cuentas contables, catálogo de eventos, asientos de ajuste, apertura
 *   contable…).
 * - Para el menú Ajustes: el mismo componente con `ADMIN_MENU_TREE` y sus textos (`title`, `subtitle`, `placeholder`,
 *   `searchLabel`), con gestión de usuarios, entidades y auditoría.
 * - Para cualquier menú jerárquico nuevo del armazón: basta otro arreglo de `ProcessMenuNode`.
 * @evitar
 * - Para envolverlo o copiarlo en otro componente de menú: por eso se retiró `siaf-admin-menu`; basta pasarle otros
 *   `nodes` y textos.
 * - Para mostrar datos jerárquicos de solo lectura dentro de una pantalla: usar `siaf-tree-view`.
 * - Para buscar registros en el servidor: usar `siaf-form-table-search` (en Documentos y registros y la bandeja, su
 *   variante `siaf-records-search-toolbar`); este buscador solo filtra la navegación en memoria.
 * @teclado
 * - **Tab**: pasa por el buscador y su lupa, y luego por los nodos visibles en orden. La lupa no hace nada: el filtro
 *   se aplica al escribir.
 * - **Escribir en el buscador**: filtra el árbol en vivo, sin distinguir tildes ni mayúsculas, y abre las ramas con
 *   coincidencias.
 * - **Enter / Espacio** en un nodo: lo marca y emite `nodeSelected`; si tiene hijos, además los muestra u oculta. Los
 *   nodos `comingSoon` solo expanden.
 * @accesibilidad
 * - **Pendiente · 1.3.1 Información y relaciones (A)**: es un `<aside>` con `h2` y `h3`, pero la jerarquía solo se ve
 *   (sangría y línea a la izquierda): los nodos son botones en `div` anidados, sin `ul`/`li` ni `role="tree"`, y el
 *   lector no anuncia nivel ni cantidad. Además, el `aria-label` del `aside` es fijo («Menu de procesos») y también se
 *   lee en Ajustes.
 * - **Pendiente · 1.4.1 Uso del color (A)**: el nodo elegido (y su ancestro de primer nivel) se distingue solo por el
 *   fondo `bg-states-light-selected` y el color del texto; el peso de la fuente no cambia.
 * - **1.4.3 Contraste mínimo (AA)**: en claro, título `text-neutral-high` 16.29:1 y nodos `text-neutral-medium` 14.53:1
 *   sobre blanco; en oscuro el panel usa `bg-surfaces-field` y falta medirlo.
 * - **1.4.11 Contraste no textual (AA)**: el contorno de foco es el azul del kit (`border-states-focus`, 5.35:1 claro
 *   / 10.15:1 oscuro sobre la superficie).
 * - **Pendiente · 2.4.3 Orden del foco (A)**: no toma el foco al abrirse ni cierra con Escape. El armazón lo pinta
 *   después del rail: desde Procesos el Tab pasa antes por Ayuda y Ajustes, y si lo pide una página
 *   (`ShellNavigationService`) queda antes que el botón que lo abrió.
 * - **2.4.7 Foco visible (AA)**: cada nodo muestra un contorno azul de 2 px con `focus-visible`.
 * - **Pendiente · 4.1.2 Nombre, función y valor (A)**: los nodos con hijos publican `aria-expanded`, pero el elegido no
 *   publica `aria-current`.
 * - **Pendiente · 4.1.3 Mensajes de estado (AA)**: al filtrar no se anuncia cuántos nodos quedan y, sin coincidencias,
 *   el árbol queda vacío y sin mensaje.
 */
@Component({
  selector: 'siaf-process-menu-tree',
  standalone: true,
  imports: [TextFieldComponent, IconComponent, NgTemplateOutlet],
  template: `
    <aside
      class="flex h-[calc(100vh-56px)] w-screen flex-col bg-[var(--sys-color-bg-surfaces-field,var(--sys-color-bg-surfaces-surface))] text-text shadow-siaf-elevation-1 lg:max-w-[370px]"
      aria-label="Menu de procesos"
    >
      <header class="sticky top-0 z-[2] flex min-h-14 w-full items-center bg-[var(--sys-color-bg-surfaces-field,var(--sys-color-bg-surfaces-surface))] p-siaf-md">
        <h2 class="m-0 min-h-6 text-base font-bold uppercase leading-none tracking-[0.02px] text-[var(--sys-color-text-neutral-high)]">
          {{ title }}
        </h2>
      </header>

      <div class="min-h-0 flex-1 overflow-y-auto bg-[var(--sys-color-bg-surfaces-field,var(--sys-color-bg-surfaces-surface-highest))] px-siaf-md pt-siaf-xs">
        <!-- Campo del design system: etiqueta flotante y borde de éxito, igual
             que el resto de inputs. A diferencia de los buscadores de datos,
             este filtra la NAVEGACIÓN al teclear (paleta de comandos): el
             tecleo filtra en vivo y no hay viaje al servidor que ahorrar. -->
        <siaf-input
          class="block w-full"
          [label]="placeholder"
          [value]="query"
          trailingIcon="search"
          [trailingButtonLabel]="searchLabel"
          (valueChange)="onQuery($any($event))"
        />

        <section class="flex w-full flex-col gap-siaf-md overflow-hidden pt-siaf-lg">
          <h3 class="m-0 px-siaf-md text-sm font-bold leading-normal text-[var(--sys-color-text-neutral-medium)]">
            {{ subtitle }}
          </h3>

          <div class="flex w-full flex-col gap-1">
            <ng-container *ngTemplateOutlet="treeTemplate; context: { $implicit: visibleNodes(filteredNodes), level: 0 }" />
          </div>
        </section>
      </div>
    </aside>

    <ng-template #treeTemplate let-items let-level="level">
      @for (node of items; track node.id) {
        <div class="w-full" [class.pl-[27px]]="level > 0">
          <div class="w-full" [class.border-l]="level > 0" [style.borderColor]="level > 0 ? 'var(--sys-color-divider-strong)' : null" [class.pl-3]="level > 0">
            @if (node.sectionHeader) {
              <!-- Encabezado de sección (no clickeable): subtítulo gris en
                   mayúsculas con ícono cuadrado. Sus hijos se muestran siempre. -->
              <div class="flex w-full items-center gap-siaf-sm px-siaf-md py-siaf-xs" role="presentation">
                <siaf-icon
                  class="shrink-0 text-[var(--sys-color-icon-states-disabled)]"
                  name="crop_square"
                  [size]="16"
                />
                <span class="min-w-0 flex-1 text-[11px] font-medium uppercase leading-none tracking-[0.66px] text-[var(--sys-color-text-neutral-low)]">
                  {{ node.label }}
                </span>
              </div>

              @if (hasChildren(node)) {
                <ng-container *ngTemplateOutlet="treeTemplate; context: { $implicit: visibleNodes(node.children || []), level: level + 1 }" />
              }
            } @else {
              <button
                class="group flex w-full items-center rounded-siaf-sm text-left transition duration-150 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sys-color-border-states-focus)] active:scale-[0.995]"
                type="button"
                [class.min-h-12]="level === 0"
                [class.min-h-8]="level > 0"
                [class.bg-[var(--sys-color-bg-states-light-selected)]]="isNodeHighlighted(node, level)"
                [class.hover:bg-[var(--sys-color-bg-states-light-hover)]]="!isNodeHighlighted(node, level)"
                [class.active:bg-[var(--sys-color-bg-states-light-pressed)]]="!isNodeHighlighted(node, level)"
                [class.px-siaf-md]="true"
                [class.py-siaf-sm]="level === 0"
                [class.py-siaf-xxs]="level > 0"
                [attr.aria-expanded]="showCaret(node) ? isExpanded(node) : null"
                (click)="activate(node)"
              >
                @if (showCaret(node)) {
                  <siaf-icon
                    class="mr-siaf-md shrink-0 text-[var(--sys-color-text-neutral-activated)] transition-transform duration-150"
                    name="arrow_drop_down"
                    [size]="level === 0 ? 24 : 20"
                    [class.-rotate-90]="!isExpanded(node)"
                  />
                }

                <span
                  class="min-w-0 flex-1 text-sm leading-normal"
                  [class.font-bold]="level === 0"
                  [class.font-normal]="level > 0"
                  [class.tracking-[-0.02px]]="level === 0"
                  [class.tracking-[0.0249px]]="level > 0"
                  [class.text-[var(--sys-color-text-neutral-activated)]]="isNodeHighlighted(node, level)"
                  [class.text-[var(--sys-color-text-neutral-medium)]]="!isNodeHighlighted(node, level)"
                >
                  {{ node.label }}
                </span>
              </button>

              @if (hasChildren(node) && isExpanded(node)) {
                <ng-container *ngTemplateOutlet="treeTemplate; context: { $implicit: visibleNodes(node.children || []), level: level + 1 }" />
              }
            }
          </div>
        </div>
      }
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProcessMenuTreeComponent implements OnChanges, OnInit {
  @Input() title = 'Procesos';
  @Input() subtitle = 'Seleccionar proceso o procedimiento';
  @Input() placeholder = 'Buscar proceso o procedimiento';
  @Input() searchLabel = 'Buscar proceso o procedimiento';
  @Input() nodes: ProcessMenuNode[] = DEFAULT_PROCESS_TREE;

  @Output() nodeSelected = new EventEmitter<ProcessMenuNode>();

  query = '';
  selectedId = '';
  private readonly expandedIds = new Set<string>();
  private readonly parentById = new Map<string, string>();
  private readonly activeAncestorIds = new Set<string>();

  ngOnInit(): void {
    this.initializeState();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['nodes']) {
      this.initializeState();
    }
  }

  get filteredNodes(): ProcessMenuNode[] {
    const search = this.normalize(this.query);

    if (!search) {
      return this.nodes;
    }

    return this.filterNodes(this.nodes, search);
  }

  activate(node: ProcessMenuNode): void {
    // Los nodos marcados como pendientes solo expanden/colapsan si
    // tienen hijos. No se selecciona ni se emite navegacion para evitar
    // que el shell intente abrir una ruta inexistente.
    if (node.comingSoon) {
      if (this.hasChildren(node)) {
        this.toggle(node);
      }
      return;
    }

    this.selectedId = node.id;
    this.updateActivePath(node.id);

    if (this.hasChildren(node)) {
      this.toggle(node);
    }

    this.nodeSelected.emit(node);
  }

  hasChildren(node: ProcessMenuNode): boolean {
    return Boolean(node.children?.length);
  }

  // Muestra la flecha de desplegable si el nodo tiene hijos o está marcado como
  // expandible (maqueta de una rama del diseño cuyo contenido aún no se define).
  showCaret(node: ProcessMenuNode): boolean {
    return this.hasChildren(node) || Boolean(node.expandable);
  }

  // Filtra los nodos marcados como ocultos (hiddenInMenu). El nodo sigue en el
  // árbol para las migas de pan, pero no se pinta en el menú.
  visibleNodes(nodes: ProcessMenuNode[]): ProcessMenuNode[] {
    return nodes.filter((node) => !node.hiddenInMenu);
  }

  isExpanded(node: ProcessMenuNode): boolean {
    return Boolean(this.query) || this.expandedIds.has(node.id);
  }

  isNodeHighlighted(node: ProcessMenuNode, level: number): boolean {
    return this.selectedId === node.id || (level === 0 && this.activeAncestorIds.has(node.id));
  }

  onQuery(value: string): void {
    this.query = String(value ?? '');
  }

  onSearch(event: Event): void {
    this.query = (event.target as HTMLInputElement).value;
  }

  private toggle(node: ProcessMenuNode): void {
    if (this.expandedIds.has(node.id)) {
      this.expandedIds.delete(node.id);
      return;
    }

    this.expandedIds.add(node.id);
  }

  private initializeState(): void {
    this.expandedIds.clear();
    this.parentById.clear();
    this.activeAncestorIds.clear();
    this.selectedId = '';
    this.collectState(this.nodes);

    if (this.selectedId) {
      this.updateActivePath(this.selectedId);
    }
  }

  private collectState(nodes: ProcessMenuNode[], parentId = ''): void {
    for (const node of nodes) {
      if (parentId) {
        this.parentById.set(node.id, parentId);
      }

      // Evita que hijos profundos arranquen abiertos aunque alguien agregue expanded por error.
      if (node.expanded && !parentId) {
        this.expandedIds.add(node.id);
      }

      if (node.selected) {
        this.selectedId = node.id;
      }

      if (node.children?.length) {
        this.collectState(node.children, node.id);
      }
    }
  }

  private updateActivePath(nodeId: string): void {
    this.activeAncestorIds.clear();

    let parentId = this.parentById.get(nodeId);
    while (parentId) {
      this.activeAncestorIds.add(parentId);
      parentId = this.parentById.get(parentId);
    }
  }

  private filterNodes(nodes: ProcessMenuNode[], search: string): ProcessMenuNode[] {
    const result: ProcessMenuNode[] = [];

    for (const node of nodes) {
      const children = node.children ? this.filterNodes(node.children, search) : [];
      const matches = this.normalize(node.label).includes(search);

      if (!matches && children.length === 0) {
        continue;
      }

      result.push({
        ...node,
        // Durante la busqueda se abren las ramas que contienen coincidencias para mostrar contexto.
        expanded: true,
        children: children.length > 0 ? children : node.children
      });
    }

    return result;
  }

  private normalize(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }
}
