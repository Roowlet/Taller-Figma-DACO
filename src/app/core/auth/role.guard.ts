import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateChildFn, CanActivateFn, Router } from '@angular/router';

import { PermissionService } from './permission.service';
import { TokenService } from './token.service';
import { RoleRouteData } from './role.model';

const canAccessRoute = (route: ActivatedRouteSnapshot): boolean | ReturnType<Router['parseUrl']> => {
  const permissions = inject(PermissionService);
  const tokenService = inject(TokenService);
  const router = inject(Router);

  if (!tokenService.isAuthenticated()) {
    return router.parseUrl('/login');
  }

  const data = route.data as RoleRouteData;
  if (permissions.hasRole(data.roles) && permissions.canAny(data.permissions)) {
    return true;
  }

  return router.parseUrl('/panel');
};

export const roleGuard: CanActivateFn = (route) => canAccessRoute(route);

export const roleChildGuard: CanActivateChildFn = (route) => canAccessRoute(route);
