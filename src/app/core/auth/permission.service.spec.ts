import { TestBed } from '@angular/core/testing';

import { PermissionService } from './permission.service';

describe('PermissionService', () => {
  let service: PermissionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PermissionService);
  });

  it('un rol sin_permisos no pasa ningún chequeo de permiso', () => {
    service.setRole('sin_permisos');
    expect(service.can('document.create')).toBeFalse();
    expect(service.can('document.read')).toBeFalse();
    expect(service.canAny(['document.read', 'user.read'])).toBeFalse();
  });

  it('el aprobador puede aprobar pero no crear documentos', () => {
    service.setRole('approver');
    expect(service.can('document.approve')).toBeTrue();
    expect(service.can('document.create')).toBeFalse();
  });

  it('hasRole con lista vacía permite a cualquiera (sin restricción)', () => {
    service.setRole('creator');
    expect(service.hasRole([])).toBeTrue();
    expect(service.hasRole(['approver'])).toBeFalse();
    expect(service.hasRole(['creator', 'approver'])).toBeTrue();
  });

  it('canAny exige al menos un permiso de la lista', () => {
    service.setRole('reviewer');
    expect(service.canAny(['document.review', 'document.create'])).toBeTrue();
    expect(service.canAny(['document.create', 'document.delete'])).toBeFalse();
  });

  describe('permisos del backend (fase 2)', () => {
    it('cuando hay permisos del backend, mandan sobre la matriz por rol', () => {
      // El rol seguiría diciendo que un creador no aprueba, pero el backend
      // es la fuente de verdad: si envía document.approve, can() lo respeta.
      service.setRole('creator');
      service.setPermissions(['document.approve', 'audit.read']);

      expect(service.can('document.approve')).toBeTrue();
      expect(service.can('audit.read')).toBeTrue();
      // Lo que el backend NO envió, no se concede aunque el rol lo tuviera.
      expect(service.can('document.create')).toBeFalse();
    });

    it('un conjunto de permisos vacío del backend no concede nada', () => {
      service.setRole('admin_sistema');
      service.setPermissions([]);
      expect(service.can('user.read')).toBeFalse();
      expect(service.can('document.read')).toBeFalse();
    });

    it('setPermissions(null) revierte al fallback de la matriz por rol', () => {
      service.setRole('approver');
      service.setPermissions(['document.read']);
      expect(service.can('document.approve')).toBeFalse(); // backend manda

      service.setPermissions(null);
      expect(service.can('document.approve')).toBeTrue(); // vuelve la matriz
    });
  });
});
