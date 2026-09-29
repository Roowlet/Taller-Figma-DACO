import { Injectable, signal } from '@angular/core';

import { Permission, ROLE_PERMISSIONS, UserRole } from './role.model';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  // Default fail-closed hasta que la autenticación cargue el perfil real
  // desde el backend: sin acciones visibles en vez de heredar permisos de
  // Creador (SEC-001, auditoría frontend 2026-08).
  private readonly role = signal<UserRole>('sin_permisos');

  /**
   * Permisos efectivos del perfil activo, provistos por el backend
   * (SegRolPermiso). `null` = aún no cargados → se usa la matriz local como
   * fallback, garantizando que una sesión vieja sin permisos no quede sin UI.
   */
  private readonly permissions = signal<ReadonlySet<string> | null>(null);

  readonly currentRole = this.role.asReadonly();

  setRole(role: UserRole): void {
    this.role.set(role);
  }

  /** Fija los permisos efectivos que envió el backend para el perfil activo. */
  setPermissions(permisos: readonly string[] | null | undefined): void {
    this.permissions.set(permisos ? new Set(permisos) : null);
  }

  hasRole(roles: UserRole[] = []): boolean {
    return roles.length === 0 || roles.includes(this.currentRole());
  }

  can(permission: Permission): boolean {
    const fromBackend = this.permissions();
    if (fromBackend) {
      return fromBackend.has(permission);
    }
    // Fallback: sesión sin permisos del backend → matriz local por rol.
    return ROLE_PERMISSIONS[this.currentRole()].includes(permission);
  }

  canAny(permissions: Permission[] = []): boolean {
    return permissions.length === 0 || permissions.some((permission) => this.can(permission));
  }
}
