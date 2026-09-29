import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';

import { roleChildGuard, roleGuard } from './role.guard';
import { PermissionService } from './permission.service';
import { TokenService } from './token.service';
import { RoleRouteData } from './role.model';

/**
 * Guard de autorización de rutas: es la única barrera entre un usuario y una
 * pantalla que no le corresponde, así que sus dos redirecciones (a /login sin
 * sesión, a /panel sin permiso) importan tanto como el camino feliz.
 */
describe('roleGuard', () => {
  let permissions: PermissionService;
  let tokenService: TokenService;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    permissions = TestBed.inject(PermissionService);
    tokenService = TestBed.inject(TokenService);
    router = TestBed.inject(Router);
  });

  afterEach(() => localStorage.clear());

  /** Ruta mínima: al guard solo le interesa `data`. */
  function ruta(data: RoleRouteData = {}): ActivatedRouteSnapshot {
    return { data } as ActivatedRouteSnapshot;
  }

  function ejecutar(data?: RoleRouteData): boolean | UrlTree {
    return TestBed.runInInjectionContext(
      () => roleGuard(ruta(data), {} as never) as boolean | UrlTree,
    );
  }

  /** Sesión válida: el guard solo mira que haya token. */
  function autenticar(): void {
    spyOn(tokenService, 'isAuthenticated').and.returnValue(true);
  }

  describe('sin sesión', () => {
    it('manda a /login aunque la ruta no pida roles', () => {
      spyOn(tokenService, 'isAuthenticated').and.returnValue(false);

      const resultado = ejecutar();

      expect(resultado).toEqual(router.parseUrl('/login'));
    });

    it('manda a /login antes de siquiera evaluar los permisos', () => {
      spyOn(tokenService, 'isAuthenticated').and.returnValue(false);
      const hasRole = spyOn(permissions, 'hasRole');

      ejecutar({ roles: ['admin_sistema'] });

      // Sin sesión no tiene sentido preguntar por permisos.
      expect(hasRole).not.toHaveBeenCalled();
    });
  });

  describe('con sesión', () => {
    beforeEach(autenticar);

    it('deja pasar una ruta sin restricciones', () => {
      expect(ejecutar()).toBeTrue();
    });

    it('deja pasar cuando el rol y el permiso coinciden', () => {
      permissions.setRole('admin_sistema');

      expect(ejecutar({ roles: ['admin_sistema'] })).toBeTrue();
    });

    it('manda a /panel cuando el rol no corresponde', () => {
      permissions.setRole('creator');

      const resultado = ejecutar({ roles: ['admin_sistema'] });

      expect(resultado).toEqual(router.parseUrl('/panel'));
    });

    it('manda a /panel cuando el rol coincide pero falta el permiso', () => {
      permissions.setRole('creator');
      permissions.setPermissions([]);

      const resultado = ejecutar({
        roles: ['creator'],
        permissions: ['document.approve'],
      });

      expect(resultado).toEqual(router.parseUrl('/panel'));
    });

    it('exige rol Y permiso, no cualquiera de los dos', () => {
      permissions.setRole('admin_sistema');
      permissions.setPermissions([]);

      // Rol correcto, permiso ausente → no pasa.
      expect(
        ejecutar({ roles: ['admin_sistema'], permissions: ['document.approve'] }),
      ).toEqual(router.parseUrl('/panel'));
    });

    it('un rol recién iniciado (fail-closed) no entra a rutas con rol declarado', () => {
      // Estado por defecto de PermissionService hasta que carga el perfil real.
      expect(permissions.currentRole()).toBe('sin_permisos');

      expect(ejecutar({ roles: ['creator'] })).toEqual(router.parseUrl('/panel'));
    });
  });

  it('roleChildGuard aplica exactamente el mismo criterio', () => {
    autenticar();
    permissions.setRole('creator');

    const hijo = TestBed.runInInjectionContext(
      () => roleChildGuard(ruta({ roles: ['admin_sistema'] }), {} as never) as boolean | UrlTree,
    );

    expect(hijo).toEqual(router.parseUrl('/panel'));
  });
});
