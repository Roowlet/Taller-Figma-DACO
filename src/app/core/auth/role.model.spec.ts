import { ROLE_PERMISSIONS, ROL_MAP, mapRolCodigo } from './role.model';

describe('role.model', () => {
  describe('mapRolCodigo', () => {
    it('mapea los códigos de rol conocidos del backend', () => {
      expect(mapRolCodigo('CREADOR')).toBe('creator');
      expect(mapRolCodigo('APROBADOR')).toBe('approver');
      expect(mapRolCodigo('REVISOR')).toBe('reviewer');
      expect(mapRolCodigo('ADMIN_SISTEMA')).toBe('admin_sistema');
      expect(mapRolCodigo('ADMIN_ENTIDAD')).toBe('admin_entidad');
    });

    it('degrada un rol desconocido a sin_permisos (nunca a creator)', () => {
      expect(mapRolCodigo('CONSULTA')).toBe('sin_permisos');
      expect(mapRolCodigo('ROL_INVENTADO')).toBe('sin_permisos');
      expect(mapRolCodigo('')).toBe('sin_permisos');
    });
  });

  describe('ROLE_PERMISSIONS', () => {
    it('sin_permisos no tiene ningún permiso', () => {
      expect(ROLE_PERMISSIONS['sin_permisos']).toEqual([]);
    });

    it('todo rol del ROL_MAP tiene matriz de permisos definida', () => {
      for (const role of Object.values(ROL_MAP)) {
        expect(ROLE_PERMISSIONS[role]).toBeDefined();
      }
    });

    it('solo el aprobador puede aprobar documentos', () => {
      const rolesQueAprueban = (Object.keys(ROLE_PERMISSIONS) as Array<keyof typeof ROLE_PERMISSIONS>)
        .filter(role => ROLE_PERMISSIONS[role].includes('document.approve'));
      expect(rolesQueAprueban).toEqual(['approver']);
    });

    it('el creador no puede aprobar ni rechazar', () => {
      expect(ROLE_PERMISSIONS['creator']).not.toContain('document.approve');
      expect(ROLE_PERMISSIONS['creator']).not.toContain('document.reject');
    });
  });
});
