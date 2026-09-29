import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

import { CREATE_DOCUMENT_OPTIONS, REQUEST_ROUTE } from '../../modules/tesoreria/cuentas-bancarias/config/cuentas-bancarias.rutas';
import { CREATE_DOCUMENT_OPTIONS as CREATE_DOCUMENT_OPTIONS_APM, REQUEST_ROUTE as REQUEST_ROUTE_APM } from '../../modules/presupuesto/modificacion-apm/config/modificacion-apm.rutas';
import { CreateDocumentAccepted, CreateDocumentComponent, CreateDocumentProcessOption } from '../../shared/components/create-document/create-document.component';
import { CatalogosApiService, TipoDocumentoResponse } from '../../core/api/catalogos-api.service';
import { MobileNavigationMenuComponent } from '../mobile-navigation-menu/mobile-navigation-menu.component';
import { ProcessMenuNode, ProcessMenuTreeComponent } from '../process-menu-tree/process-menu-tree.component';
import { TrayDocumentsViewComponent } from '../tray-documents-view/tray-documents-view.component';
import { TrayNotificationsViewComponent } from '../tray-notifications-view/tray-notifications-view.component';
import { TrayMenuComponent } from '../tray-menu/tray-menu.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { SidebarComponent, SidebarNavigation } from '../sidebar/sidebar.component';
import { CurrentUserService } from '../../core/auth/current-user.service';
import { PermissionService } from '../../core/auth/permission.service';
import { ShellNavigationService } from './shell-navigation.service';
import { ADMIN_MENU_TREE } from '../../shared/utils/process-tree.util';

/**
 * Armazón de la app autenticada: navbar, sidebar y los paneles flotantes sobre los que vive el router-outlet.
 *
 * Centraliza qué panel está abierto (procesos, bandeja, ajustes, crear documento, navegación móvil) —
 * son mutuamente excluyentes y todos se cierran en cada `NavigationEnd` — y sincroniza la sección activa
 * con la URL. Escucha a `ShellNavigationService` para que cualquier página pida abrir el menú de procesos
 * o el diálogo de creación. Las opciones de "Crear documento" se arman desde los tipos de documento del
 * API y caen a una config estática si la llamada falla; el botón depende del permiso `document.create`.
 */
@Component({
  selector: 'siaf-app-shell',
  standalone: true,
  imports: [
    CreateDocumentComponent,
    MobileNavigationMenuComponent,
    NavbarComponent,
    ProcessMenuTreeComponent,
    RouterOutlet,
    SidebarComponent,
    TrayDocumentsViewComponent,
    TrayNotificationsViewComponent,
    TrayMenuComponent
  ],
  template: `
    <main class="min-h-screen bg-[var(--sys-color-bg-surfaces-surface-lowest)] text-text">
      <siaf-navbar class="sticky top-0 z-30 block" [initials]="iniciales()" [userName]="currentUser.name" [officeName]="currentUser.office" (menuClicked)="onNavbarMenuClicked()" />

      <aside class="fixed bottom-0 left-0 top-14 z-20 hidden lg:block">
        <siaf-sidebar
          [navigation]="activeNavigation"
          [buttonHelp]="true"
          [ctaAdd]="puedeCrear"
          (created)="openCreateDocument()"
          (navigationChanged)="onNavigationChange($event)"
        />
      </aside>

      @if (mobileNavigationOpen) {
        <div class="fixed inset-x-0 bottom-0 top-14 z-20 lg:hidden">
          <siaf-mobile-navigation-menu
            [navigation]="activeNavigation"
            [ctaAdd]="puedeCrear"
            (created)="openCreateDocumentFromMobileMenu()"
            (navigationChanged)="onMobileNavigationChange($event)"
          />
        </div>
      }

      @if (processMenuOpen) {
        <div class="fixed inset-x-0 bottom-0 top-14 z-20 lg:left-16 lg:right-auto" (click)="$event.stopPropagation()">
          <siaf-process-menu-tree (nodeSelected)="onProcessNodeSelected($event)" />
        </div>
      }

      @if (trayMenuOpen) {
        <div class="fixed inset-x-0 bottom-0 top-14 z-20 lg:left-16 lg:right-auto" (click)="$event.stopPropagation()">
          <siaf-tray-menu [selectedItem]="selectedTrayItem" (selected)="onTrayItemSelected($event)" />
        </div>
      }

      @if (adminMenuOpen) {
        <div class="fixed inset-x-0 bottom-0 top-14 z-20 lg:left-16 lg:right-auto" (click)="$event.stopPropagation()">
          <siaf-process-menu-tree
            title="Ajustes"
            subtitle="Seleccionar configuracion"
            placeholder="Buscar configuracion"
            searchLabel="Buscar configuracion"
            [nodes]="adminMenuTree"
            (nodeSelected)="onAdminNodeSelected($event)"
          />
        </div>
      }

      @if (createDocumentOpen) {
        <div class="fixed inset-x-0 bottom-0 top-14 z-20 lg:left-16 lg:right-auto" (click)="$event.stopPropagation()">
          <siaf-create-document
            [processOptions]="createDocumentOptions()"
            (accepted)="onCreateDocumentAccepted($event)"
            (canceled)="closeFloatingPanels()"
          />
        </div>
      }

      <section
        class="min-w-0 transition-[padding] duration-200 lg:pl-16"
        [class.lg:pl-[364px]]="trayMenuOpen"
        [class.lg:pl-[434px]]="processMenuOpen || createDocumentOpen || adminMenuOpen"
      >
        @if (trayContentOpen) {
          @if (selectedTrayItem === 'Notificaciones') {
            <siaf-tray-notifications-view />
          } @else {
            <siaf-tray-documents-view [title]="selectedTrayItem" />
          }
        } @else {
          <router-outlet />
        }
      </section>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppShellComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly shellNavigation = inject(ShellNavigationService);
  private readonly permissionService = inject(PermissionService);
  private readonly catalogosApi = inject(CatalogosApiService);
  readonly currentUser = inject(CurrentUserService);

  /** Iniciales del avatar: las del rol activo («CR», «AP»), así cambian al cambiar de perfil. */
  readonly iniciales = computed(() => {
    const palabras = this.currentUser.user().name.trim().split(/\s+/).filter(Boolean);
    const letras = palabras.length > 1 ? palabras.slice(0, 2).map((p) => p[0]).join('') : (palabras[0] ?? '').slice(0, 2);
    return letras.toUpperCase();
  });

  // El botón Crear solo está habilitado si el rol puede crear documentos
  get puedeCrear(): boolean {
    return this.permissionService.can('document.create');
  }

  activeNavigation: SidebarNavigation = 'Panel';
  processMenuOpen = false;
  trayMenuOpen = false;
  trayContentOpen = false;
  mobileNavigationOpen = false;
  selectedTrayItem = 'Borradores';
  createDocumentOpen = false;
  adminMenuOpen = false;

  // Fallback en caso de que el API tarde o falle — la maqueta sigue funcional
  private readonly fallbackOptions: CreateDocumentProcessOption[] = [...CREATE_DOCUMENT_OPTIONS, ...CREATE_DOCUMENT_OPTIONS_APM];

  readonly createDocumentOptions = signal<CreateDocumentProcessOption[]>(this.fallbackOptions);

  ngOnInit(): void {
    this.catalogosApi.listarTiposDocumento().subscribe({
      next: tipos => {
        const opciones = this.mapTiposToProcessOptions(tipos);
        if (opciones.length > 0) this.createDocumentOptions.set(opciones);
      },
      error: () => {
        // Mantener fallback si el API falla
      },
    });
  }

  private mapTiposToProcessOptions(tipos: TipoDocumentoResponse[]): CreateDocumentProcessOption[] {
    // Agrupar por proceso (procesoId / proceso.codigo)
    const grupos = new Map<string, { label: string; tipos: TipoDocumentoResponse[] }>();
    for (const t of tipos) {
      const procesoCodigo = t.proceso?.codigo ?? t.modulo ?? 'otros';
      const procesoLabel = t.proceso?.nombre ?? t.modulo ?? 'Otros';
      if (!grupos.has(procesoCodigo)) {
        grupos.set(procesoCodigo, { label: procesoLabel, tipos: [] });
      }
      grupos.get(procesoCodigo)!.tipos.push(t);
    }

    const ROUTE_BY_PROCESO: Record<string, { processRoute: string; tipoRoutes: Record<string, string> }> = {
      'registro-cuentas-bancarias': {
        processRoute: REQUEST_ROUTE,
        tipoRoutes: { SRCB: REQUEST_ROUTE },
      },
      'modificacion-apm': {
        processRoute: REQUEST_ROUTE_APM,
        tipoRoutes: { SMAPM: REQUEST_ROUTE_APM },
      },
    };

    const result: CreateDocumentProcessOption[] = [];
    for (const [procesoCodigo, grupo] of grupos) {
      const routeConfig = ROUTE_BY_PROCESO[procesoCodigo];
      if (!routeConfig) continue; // Procesos no implementados todavía se ignoran

      const documentOptions = grupo.tipos.map(t => ({
        label: t.nombre,
        route: routeConfig.tipoRoutes[t.codigo] ?? routeConfig.processRoute,
        actionTypes: (t.accionesPermitidas ?? []).map(a => this.formatAccion(a.tipoAccion)),
      }));

      const documents = documentOptions.map(d => d.label);
      const allActionTypes = Array.from(new Set(documentOptions.flatMap(d => d.actionTypes)));

      result.push({
        id: procesoCodigo,
        label: grupo.label,
        route: routeConfig.processRoute,
        documents,
        documentOptions,
        actionTypes: allActionTypes,
      });
    }

    return result;
  }

  private formatAccion(accion: string): string {
    // Backend devuelve en minúscula sin tildes: 'creacion', 'modificacion'. UI usa formato con acentos.
    const map: Record<string, string> = {
      creacion: 'Creación',
      modificacion: 'Modificación',
      reversion: 'Reversión',
      anulacion: 'Anulación',
      aprobacion: 'Aprobación',
      verificacion: 'Verificación',
    };
    return map[accion.toLowerCase()] ?? (accion.charAt(0).toUpperCase() + accion.slice(1));
  }

  constructor() {
    this.syncNavigationWithUrl(this.router.url);

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((event) => {
        this.trayContentOpen = false;
        this.closeFloatingPanels();
        this.syncNavigationWithUrl(event.urlAfterRedirects);
      });

    this.shellNavigation.processMenuRequested$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.openProcessMenu());

    this.shellNavigation.createDocumentRequested$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.openCreateDocument());
  }

  onNavigationChange(navigation: SidebarNavigation): void {
    if (navigation === 'Panel') {
      this.activeNavigation = 'Panel';
      this.trayContentOpen = false;
      this.closeFloatingPanels();
      void this.router.navigate(['/panel']);
      return;
    }

    if (navigation === 'Ajustes') {
      this.activeNavigation = 'Ajustes';
      this.adminMenuOpen = !this.adminMenuOpen;
      this.processMenuOpen = false;
      this.trayMenuOpen = false;
      this.createDocumentOpen = false;
      return;
    }

    this.activeNavigation = navigation;
    this.processMenuOpen = navigation === 'Proceso';
    this.trayMenuOpen = navigation === 'Bandeja';
    this.createDocumentOpen = false;
    this.adminMenuOpen = false;
  }

  onMobileNavigationChange(navigation: SidebarNavigation): void {
    this.mobileNavigationOpen = false;
    this.onNavigationChange(navigation);
  }

  onNavbarMenuClicked(): void {
    if (this.hasFloatingPanel) {
      this.closeFloatingPanels();
      return;
    }

    this.mobileNavigationOpen = !this.mobileNavigationOpen;
  }

  openProcessMenu(): void {
    this.activeNavigation = 'Proceso';
    this.processMenuOpen = true;
    this.trayMenuOpen = false;
    this.trayContentOpen = false;
    this.createDocumentOpen = false;
  }

  openCreateDocument(): void {
    if (!this.puedeCrear) {
      this.closeFloatingPanels();
      return;
    }

    this.mobileNavigationOpen = false;
    this.processMenuOpen = false;
    this.trayMenuOpen = false;
    this.trayContentOpen = false;
    this.createDocumentOpen = true;
  }

  openCreateDocumentFromMobileMenu(): void {
    this.mobileNavigationOpen = false;
    this.openCreateDocument();
  }

  onCreateDocumentAccepted(selection: CreateDocumentAccepted): void {
    this.closeFloatingPanels();

    if (selection.route) {
      const actionType = selection.actionType?.toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, ''); // "Modificación" → "modificacion"
      void this.router.navigate([selection.route], {
        queryParams: actionType ? { actionType } : undefined,
      });
    }
  }

  onTrayItemSelected(item: string): void {
    this.selectedTrayItem = item;
    this.activeNavigation = 'Bandeja';
    this.trayMenuOpen = this.isDesktopViewport();
    this.trayContentOpen = true;
  }

  onProcessNodeSelected(node: ProcessMenuNode): void {
    // moduleRoute → página principal del módulo (documentos y registros)
    // createRoute → fallback si no hay moduleRoute
    const targetRoute = node.moduleRoute ?? node.createRoute;
    if (targetRoute) {
      this.closeFloatingPanels();
      void this.router.navigateByUrl(targetRoute);
      return;
    }

    if (!node.children?.length) {
      this.activeNavigation = 'Proceso';
    }
  }

  /** Árbol del menú "Ajustes": lo pinta el mismo `siaf-process-menu-tree` que el de procesos. */
  readonly adminMenuTree = ADMIN_MENU_TREE;

  onAdminNodeSelected(node: ProcessMenuNode): void {
    if (node.createRoute) {
      this.closeFloatingPanels();
      void this.router.navigateByUrl(node.createRoute);
      return;
    }

    // Nodo padre — no navegar, mantener menú abierto
    if (!node.children?.length) {
      this.activeNavigation = 'Ajustes';
    }
  }

  closeFloatingPanels(): void {
    this.mobileNavigationOpen = false;
    this.processMenuOpen = false;
    this.trayMenuOpen = false;
    this.createDocumentOpen = false;
    this.adminMenuOpen = false;
  }

  get hasFloatingPanel(): boolean {
    return this.mobileNavigationOpen || this.processMenuOpen || this.trayMenuOpen || this.createDocumentOpen || this.adminMenuOpen;
  }

  private syncNavigationWithUrl(url: string): void {
    if (url.startsWith('/admin')) {
      this.activeNavigation = 'Ajustes';
    } else if (url.startsWith('/procesos')) {
      this.activeNavigation = 'Proceso';
    } else {
      this.activeNavigation = 'Panel';
    }
  }

  private isDesktopViewport(): boolean {
    return typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches;
  }
}
