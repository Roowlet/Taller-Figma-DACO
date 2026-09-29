import { buildProcessBreadcrumbs, buildProcessPath } from './breadcrumbs.util';

// Hoja real del árbol de procesos, con dos ancestros agrupadores.
const PROCESS_ID = 'registro-cuentas-bancarias-documentos';
const PROCESS_ROUTE = '/procesos/registro-cuentas-bancarias';

describe('breadcrumbs.util', () => {
  describe('buildProcessBreadcrumbs', () => {
    it('arranca en Inicio y agrega el path del proceso', () => {
      const crumbs = buildProcessBreadcrumbs(PROCESS_ID, PROCESS_ROUTE);

      expect(crumbs[0]).toEqual({ label: 'Inicio', href: '/panel' });
      expect(crumbs.length).toBeGreaterThan(1);
    });

    it('enlaza la hoja del proceso a su ruta y los ancestros al panel', () => {
      const crumbs = buildProcessBreadcrumbs(PROCESS_ID, PROCESS_ROUTE);
      const hojaDelArbol = crumbs[crumbs.length - 1];

      expect(hojaDelArbol.href).toBe(PROCESS_ROUTE);
      expect(crumbs.slice(1, -1).every((c) => c.href === '/panel')).toBe(true);
    });

    it('agrega el item final sin enlace cuando se pasa una hoja', () => {
      const crumbs = buildProcessBreadcrumbs(PROCESS_ID, PROCESS_ROUTE, 'Solicitud de Registro de Cuenta Bancaria');

      expect(crumbs[crumbs.length - 1]).toEqual({ label: 'Solicitud de Registro de Cuenta Bancaria' });
    });

    it('avisa por consola cuando el processId no existe en el árbol', () => {
      const warn = spyOn(console, 'warn');

      const crumbs = buildProcessBreadcrumbs('proceso-inexistente', '/procesos/nada');

      expect(warn).toHaveBeenCalled();
      expect(crumbs).toEqual([{ label: 'Inicio', href: '/panel' }]);
    });
  });

  describe('buildProcessPath', () => {
    it('devuelve el mismo path pero sin el Inicio', () => {
      const conInicio = buildProcessBreadcrumbs(PROCESS_ID, PROCESS_ROUTE);
      const sinInicio = buildProcessPath(PROCESS_ID, PROCESS_ROUTE);

      expect(sinInicio).toEqual(conInicio.slice(1));
      expect(sinInicio.some((c) => c.label === 'Inicio')).toBe(false);
    });
  });
});
