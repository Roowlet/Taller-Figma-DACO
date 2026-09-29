import { Routes } from '@angular/router';

export const VIRTUAL_DESK_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./virtual-desk.component').then((m) => m.VirtualDeskComponent),
  },
];
