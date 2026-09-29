export type UserRole =
  | 'creator'
  | 'reviewer'
  | 'approver'
  | 'admin_sistema'
  | 'admin_entidad'
  | 'sin_permisos';

/** Mapeo único backend → frontend de códigos de rol. */
export const ROL_MAP: Record<string, UserRole> = {
  CREADOR: 'creator',
  APROBADOR: 'approver',
  REVISOR: 'reviewer',
  ADMIN_SISTEMA: 'admin_sistema',
  ADMIN_ENTIDAD: 'admin_entidad',
};

/**
 * Un código de rol que el frontend no conoce no debe heredar permisos de
 * creador: se degrada a 'sin_permisos' y la UI no muestra acciones.
 */
export function mapRolCodigo(rolCodigo: string): UserRole {
  return ROL_MAP[rolCodigo] ?? 'sin_permisos';
}

export type Permission =
  // Documentos / Solicitudes
  | 'document.create'
  | 'document.edit'
  | 'document.delete'
  | 'document.verify'
  | 'document.review'
  | 'document.approve'
  | 'document.observe'
  | 'document.reject'
  | 'document.annul'
  | 'document.read'
  // Cuentas contables
  | 'chart_account.read'
  | 'chart_account.create'
  | 'chart_account.approve'
  // Usuarios
  | 'user.read'
  | 'user.create'
  | 'user.update'
  | 'user.disable'
  | 'role.assign'
  // Entidades
  | 'entity.create'
  | 'entity.update'
  | 'entity.manage'
  // Auditoría
  | 'audit.read'
  | 'audit.export'
  // Catálogo
  | 'doc_type.manage'
  | 'catalog.manage';

export type RoleRouteData = {
  roles?: UserRole[];
  permissions?: Permission[];
};

export const ROLE_LABELS: Record<UserRole, string> = {
  creator: 'Creador',
  reviewer: 'Revisor',
  approver: 'Aprobador',
  admin_sistema: 'Administrador del Sistema',
  admin_entidad: 'Administrador de Entidad',
  sin_permisos: 'Sin permisos asignados'
};

/**
 * Matriz de permisos por rol — desde la fase 2, es solo un FALLBACK:
 * la fuente única son los permisos efectivos que el backend envía en el perfil
 * (SegRolPermiso). PermissionService usa esta matriz únicamente cuando la
 * sesión no trae permisos (p. ej. una sesión vieja). Mantener sincronizada
 * con el seed del backend mientras siga existiendo.
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  sin_permisos: [],
  creator: [
    'document.create', 'document.edit', 'document.delete',
    'document.verify', 'document.read',
    'chart_account.read', 'chart_account.create',
  ],
  reviewer: [
    'document.review', 'document.observe', 'document.read',
    'chart_account.read',
  ],
  approver: [
    'document.approve', 'document.observe', 'document.reject',
    'document.read', 'chart_account.read', 'chart_account.approve',
  ],
  admin_entidad: [
    'document.read', 'chart_account.read',
    'user.read', 'user.create', 'user.update', 'user.disable',
    'role.assign', 'entity.update',
    'audit.read',
  ],
  admin_sistema: [
    'document.read', 'chart_account.read', 'chart_account.approve',
    'user.read', 'user.create', 'user.update', 'user.disable',
    'role.assign',
    'entity.create', 'entity.update', 'entity.manage',
    'audit.read', 'audit.export',
    'doc_type.manage', 'catalog.manage',
  ],
};
