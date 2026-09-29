import { Routes } from '@angular/router';

/** Proceso «Modificación de la APM»: la solicitud (creación y edición por id). */
export const PRESUPUESTO_ROUTES: Routes = [
  {
    // La ruta base del proceso redirige a la solicitud (no hay página de Documentos y registros).
    path: 'procesos/modificacion-apm',
    pathMatch: 'full',
    redirectTo: 'procesos/modificacion-apm/solicitud',
  },
  {
    path: 'procesos/modificacion-apm/solicitud',
    loadComponent: () =>
      import('./modificacion-apm/pages/solicitud/modificacion-apm-request.component').then(
        (m) => m.ModificacionApmRequestComponent,
      ),
  },
  {
    path: 'procesos/modificacion-apm/solicitud/:id',
    loadComponent: () =>
      import('./modificacion-apm/pages/solicitud/modificacion-apm-request.component').then(
        (m) => m.ModificacionApmRequestComponent,
      ),
  },
];
