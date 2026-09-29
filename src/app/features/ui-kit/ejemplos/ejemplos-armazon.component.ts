import { ChangeDetectionStrategy, Component, Input, inject, signal } from '@angular/core';

import { CurrentUserService } from '../../../core/auth/current-user.service';
import { PermissionService } from '../../../core/auth/permission.service';
import { SolicitudesStateService } from '../../../core/state/solicitudes-state.service';
import { MobileNavigationMenuComponent } from '../../../layout/mobile-navigation-menu/mobile-navigation-menu.component';
import { NavbarComponent } from '../../../layout/navbar/navbar.component';
import { NotificationsPanelComponent } from '../../../layout/notifications-panel/notifications-panel.component';
import { ProcessMenuNode, ProcessMenuTreeComponent } from '../../../layout/process-menu-tree/process-menu-tree.component';
import { SidebarComponent, SidebarItem, SidebarNavigation } from '../../../layout/sidebar/sidebar.component';
import { TrayDocumentsViewComponent } from '../../../layout/tray-documents-view/tray-documents-view.component';
import { TrayMenuComponent } from '../../../layout/tray-menu/tray-menu.component';
import { TrayNotificationsViewComponent } from '../../../layout/tray-notifications-view/tray-notifications-view.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { ADMIN_MENU_TREE } from '../../../shared/utils/process-tree.util';
import { PROVEEDORES_SHELL_DE_MUESTRA, sembrarSesionDeMuestra } from './datos-de-muestra';

type NavegacionShell = 'Default' | 'Panel' | 'Bandeja' | 'Proceso' | 'Ajustes';

/** Panel flotante abierto en el armazón de muestra (en la app son mutuamente excluyentes). */
type PanelArmazon = 'movil' | 'Proceso' | 'Bandeja' | 'Ajustes' | null;

/**
 * Ejemplos en vivo del armazón que no piden datos: sidebar, navegación móvil y el menú en árbol
 * (con el árbol de procesos y con el de Ajustes). Ninguno navega por sí mismo: solo emiten eventos.
 */
@Component({
  selector: 'ui-kit-ejemplos-armazon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MobileNavigationMenuComponent, ProcessMenuTreeComponent, SidebarComponent],
  template: `
    @switch (selector) {
      @case ('siaf-sidebar') {
        <div class="flex h-[360px] gap-6 overflow-hidden">
          <siaf-sidebar variant="rail" [navigation]="navegacion()" (navigationChanged)="navegacion.set($event)" />
          <siaf-sidebar variant="expanded" title="Gestión contable" [items]="items" [navigation]="navegacion()" (navigationChanged)="navegacion.set($event)" />
        </div>
      }
      @case ('siaf-mobile-navigation-menu') {
        <div class="max-w-[360px] overflow-hidden rounded-siaf-md border border-border">
          <siaf-mobile-navigation-menu [navigation]="navegacion()" (navigationChanged)="navegacion.set($event)" />
        </div>
      }
      @case ('siaf-process-menu-tree') {
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="min-w-0">
            <p class="mb-2 text-[11px] font-bold uppercase tracking-widest text-text-muted">Procesos (árbol por defecto)</p>
            <div class="overflow-hidden rounded-siaf-md border border-border">
              <siaf-process-menu-tree />
            </div>
          </div>
          <div class="min-w-0">
            <p class="mb-2 text-[11px] font-bold uppercase tracking-widest text-text-muted">Ajustes (ADMIN_MENU_TREE)</p>
            <div class="overflow-hidden rounded-siaf-md border border-border">
              <siaf-process-menu-tree
                title="Ajustes"
                subtitle="Seleccionar configuracion"
                placeholder="Buscar configuracion"
                searchLabel="Buscar configuracion"
                [nodes]="arbolAjustes"
              />
            </div>
          </div>
        </div>
        <p class="mt-3 text-xs text-text-muted">El mismo componente con otro arreglo de nodos y otros textos. Solo emite nodeSelected: la navegación la decide quien lo usa.</p>
      }
    }
  `,
})
export class EjemplosArmazonComponent {
  static readonly selectores = ['siaf-sidebar', 'siaf-mobile-navigation-menu', 'siaf-process-menu-tree'];

  readonly arbolAjustes = ADMIN_MENU_TREE;
  @Input({ required: true }) selector!: string;

  readonly navegacion = signal<NavegacionShell>('Panel');

  readonly items: SidebarItem[] = [
    { label: 'Plan de cuentas', icon: 'account_tree', active: true },
    { label: 'Asientos de ajuste', icon: 'receipt_long' },
    { label: 'Catálogo de eventos', icon: 'event_note' },
  ];
}

/**
 * Ejemplos en vivo del shell autenticado: navbar, notificaciones y bandeja. En la app leen la
 * sesión, el socket y la API; aquí reciben `datos-de-muestra.ts`. El navbar usa `routerLink`,
 * así que este grupo conserva el router real y su enlace de inicio apunta al propio catálogo.
 *
 * El navbar se muestra dentro de un armazón de muestra con el mismo reparto que `siaf-app-shell`
 * (barra lateral, menú móvil y paneles flotantes de Proceso, Bandeja y Ajustes), pero sin router
 * ni API: elegir una opción no navega, solo dice a dónde iría.
 */
@Component({
  selector: 'ui-kit-ejemplos-armazon-sesion',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: PROVEEDORES_SHELL_DE_MUESTRA,
  imports: [
    ButtonComponent,
    MobileNavigationMenuComponent,
    NavbarComponent,
    NotificationsPanelComponent,
    ProcessMenuTreeComponent,
    SidebarComponent,
    TrayDocumentsViewComponent,
    TrayMenuComponent,
    TrayNotificationsViewComponent,
  ],
  template: `
    @switch (selector) {
      @case ('siaf-navbar') {
        <!-- Se muestra en marcos de escritorio y móvil (EJEMPLOS_RESPONSIVE). Mismas clases de posición que siaf-app-shell. -->
        <div class="min-h-screen bg-[var(--sys-color-bg-surfaces-surface-lowest)] text-text">
          <siaf-navbar
            class="sticky top-0 z-30 block"
            homeHref="/ui-kit"
            initials="JP"
            userName="Juan Carlos Pérez"
            officeName="Dirección General de Contabilidad Pública"
            (menuClicked)="alternarMenuMovil()"
          />

          <aside class="fixed bottom-0 left-0 top-14 z-20 hidden lg:block">
            <siaf-sidebar
              [navigation]="navegacion()"
              [buttonHelp]="true"
              (created)="destino.set({ label: 'Crear documento' })"
              (navigationChanged)="navegar($event)"
            />
          </aside>

          @switch (panel()) {
            @case ('movil') {
              <div class="fixed inset-x-0 bottom-0 top-14 z-20 lg:hidden">
                <siaf-mobile-navigation-menu
                  [navigation]="navegacion()"
                  [ctaAdd]="true"
                  (created)="panel.set(null); destino.set({ label: 'Crear documento' })"
                  (navigationChanged)="navegarDesdeMovil($event)"
                />
              </div>
            }
            @case ('Proceso') {
              <div class="fixed inset-x-0 bottom-0 top-14 z-20 lg:left-16 lg:right-auto">
                <siaf-process-menu-tree (nodeSelected)="elegirNodo($event)" />
              </div>
            }
            @case ('Bandeja') {
              <div class="fixed inset-x-0 bottom-0 top-14 z-20 lg:left-16 lg:right-auto">
                <siaf-tray-menu [selectedItem]="seccion()" (selected)="elegirBandeja($event)" />
              </div>
            }
            @case ('Ajustes') {
              <div class="fixed inset-x-0 bottom-0 top-14 z-20 lg:left-16 lg:right-auto">
                <siaf-process-menu-tree
                  title="Ajustes"
                  subtitle="Seleccionar configuracion"
                  placeholder="Buscar configuracion"
                  searchLabel="Buscar configuracion"
                  [nodes]="arbolAjustes"
                  (nodeSelected)="elegirNodo($event)"
                />
              </div>
            }
          }

          <section
            class="px-4 py-6 transition-[padding] duration-200"
            [class.lg:pl-[88px]]="panel() === null || panel() === 'movil'"
            [class.lg:pl-[388px]]="panel() === 'Bandeja'"
            [class.lg:pl-[458px]]="panel() === 'Proceso' || panel() === 'Ajustes'"
          >
            <p class="text-[11px] font-bold uppercase tracking-widest text-text-muted">Armazón de muestra</p>
            <p class="mt-2 max-w-[520px] text-sm">
              <span class="hidden lg:inline">En la barra lateral, </span>
              <span class="lg:hidden">Con el botón de menú del navbar, </span>
              <strong>Procesos</strong> y <strong>Ajustes</strong> abren su menú en árbol y <strong>Bandeja</strong> sus
              secciones. Nada navega: la opción elegida aparece aquí.
            </p>
            @if (destino(); as d) {
              <p class="mt-4 text-sm [overflow-wrap:anywhere]" role="status">
                Elegiste <strong>{{ d.label }}</strong>
                @if (d.ruta) {
                  · en la app iría a
                  <code class="rounded-siaf-sm bg-surface-muted px-1 py-0.5 font-mono text-[12px]">{{ d.ruta }}</code>
                }
              </p>
            }
          </section>
        </div>
      }
      @case ('siaf-notifications-panel') {
        <!-- En la app el navbar decide si se pinta (el panel no se oculta solo): aquí lo hace el @if. -->
        <div class="flex justify-end p-2">
          <div class="relative">
            <siaf-button data-ui-kit-abrir variant="secondary" icon="notifications" (click)="notificaciones.set(!notificaciones())">Notificaciones</siaf-button>
            @if (notificaciones()) {
              <siaf-notifications-panel [open]="true" (closed)="notificaciones.set(false)" />
            }
          </div>
        </div>
      }
      @case ('siaf-tray-menu') {
        <div class="h-[460px] max-w-[320px] overflow-hidden rounded-siaf-md border border-border [&_aside]:h-full!">
          <siaf-tray-menu [selectedItem]="seccion()" (selected)="seccion.set($event)" />
        </div>
      }
      @case ('siaf-tray-documents-view') {
        <div class="overflow-hidden rounded-siaf-md border border-border">
          <siaf-tray-documents-view title="Borradores" />
        </div>
      }
      @case ('siaf-tray-notifications-view') {
        <div class="overflow-hidden rounded-siaf-md border border-border">
          <siaf-tray-notifications-view />
        </div>
      }
    }
  `,
})
export class EjemplosArmazonSesionComponent {
  static readonly selectores = ['siaf-navbar', 'siaf-notifications-panel', 'siaf-tray-menu', 'siaf-tray-documents-view', 'siaf-tray-notifications-view'];
  @Input({ required: true }) selector!: string;

  constructor() {
    sembrarSesionDeMuestra(inject(CurrentUserService), inject(PermissionService), inject(SolicitudesStateService));
  }

  readonly notificaciones = signal(false);
  readonly seccion = signal('Borradores');

  // ── Armazón de muestra del navbar ──
  readonly arbolAjustes = ADMIN_MENU_TREE;
  readonly navegacion = signal<SidebarNavigation>('Panel');
  readonly panel = signal<PanelArmazon>(null);
  readonly destino = signal<{ label: string; ruta?: string } | null>(null);

  /** Como el shell: Panel cierra los paneles; Proceso, Bandeja y Ajustes abren (o cierran) el suyo. */
  navegar(navegacion: SidebarNavigation): void {
    this.navegacion.set(navegacion);
    if (navegacion === 'Proceso' || navegacion === 'Bandeja' || navegacion === 'Ajustes') {
      this.panel.update((abierto) => (abierto === navegacion ? null : navegacion));
      return;
    }
    this.panel.set(null);
    this.destino.set({ label: navegacion });
  }

  navegarDesdeMovil(navegacion: SidebarNavigation): void {
    this.panel.set(null);
    this.navegar(navegacion);
  }

  /** El botón de menú del navbar cierra el panel abierto o, si no hay ninguno, abre la navegación móvil. */
  alternarMenuMovil(): void {
    this.panel.update((abierto) => (abierto ? null : 'movil'));
  }

  /** Solo las hojas con ruta cierran el menú; en la app el shell navegaría a esa ruta. */
  elegirNodo(nodo: ProcessMenuNode): void {
    const ruta = nodo.moduleRoute ?? nodo.createRoute;
    if (!ruta) return;
    this.panel.set(null);
    this.destino.set({ label: nodo.label, ruta });
  }

  elegirBandeja(seccion: string): void {
    this.seccion.set(seccion);
    this.panel.set(null);
    this.destino.set({ label: `Bandeja › ${seccion}` });
  }
}
