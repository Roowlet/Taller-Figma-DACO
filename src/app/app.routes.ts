import { Routes } from '@angular/router';

import { roleChildGuard } from './core/auth';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'login/recuperar-contrasena',
    loadComponent: () =>
      import('./features/otp-verification/otp-verification.component').then((m) => m.OtpVerificationComponent)
  },
  // ── Catálogo de componentes (sin sesión) ──
  {
    path: 'ui-kit',
    loadComponent: () =>
      import('./features/ui-kit/ui-kit.component').then((m) => m.UiKitComponent)
  },
  // Un ejemplo del catálogo a pantalla completa: lo cargan los marcos de escritorio y móvil.
  {
    path: 'ui-kit/vista/:selector',
    loadComponent: () =>
      import('./features/ui-kit/ui-kit-vista.component').then((m) => m.UiKitVistaComponent)
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/shell/app-shell.component').then((m) => m.AppShellComponent),
    canActivateChild: [roleChildGuard],
    children: [
      // ── Escritorio virtual ──
      {
        path: 'panel',
        loadChildren: () =>
          import('./layout/virtual-desk/virtual-desk.routes').then((m) => m.VIRTUAL_DESK_ROUTES),
        data: { permissions: ['document.read'] }
      },
      // ── Proceso de ejemplo: Registro de cuentas bancarias ──
      {
        path: '',
        loadChildren: () =>
          import('./modules/tesoreria/tesoreria.routes').then((m) => m.TESORERIA_ROUTES),
        data: { permissions: ['document.read'] }
      },
      // ── Proceso: Modificación de la APM (presupuesto) ──
      {
        path: '',
        loadChildren: () =>
          import('./modules/presupuesto/presupuesto.routes').then((m) => m.PRESUPUESTO_ROUTES),
        data: { permissions: ['document.read'] }
      },
    ]
  },
  // Sin sesión, el guard del armazón lleva al login.
  { path: '**', redirectTo: 'panel' }
];
