import type { PerfilItem } from '../core/api/auth-api.service';

/**
 * Usuarios de demostración del taller. Entran con su DNI y la contraseña común.
 *
 * - Ana (creador) registra y verifica solicitudes.
 * - Luis (aprobador) aprueba, observa o rechaza lo verificado.
 * - Carla tiene los dos perfiles: sirve para mostrar el cambio de perfil desde el menú del usuario.
 *
 * Son datos de ejemplo: no hay contraseñas reales ni se validan contra un servidor.
 */
export const CONTRASENA_DEMO = 'Taller2026*';

export interface UsuarioDemo {
  id: string;
  dni: string;
  email: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  /** Qué muestra en el panel de usuarios del login. */
  descripcion: string;
  perfiles: PerfilItem[];
}

const ENTIDAD = {
  entidad: 'Ministerio de Economía y Finanzas',
  entidadId: 'ent-mef',
  entidadCodigo: '0001',
  entidadSiglas: 'MEF',
  ue: null,
  ueId: null,
  ueSiglas: null,
  unidad: 'Oficina General de Administración',
  unidadSigla: 'OGA',
  unidadId: 'uo-oga',
  procedimiento: 'Registro de cuentas bancarias',
  procedimientoCodigo: 'RCB',
  nivelAmbito: 'PLIEGO' as const,
  entidadAmbitoId: 'amb-gn',
  entidadAmbitoCodigo: 'GN',
};

function perfil(id: string, rolCodigo: 'CREADOR' | 'APROBADOR', rol: string, perfilFuncional: string): PerfilItem {
  return { id, ...ENTIDAD, rol, rolCodigo, perfilFuncional };
}

export const USUARIOS_DEMO: UsuarioDemo[] = [
  {
    id: 'usr-ana',
    dni: '11111111',
    email: 'ana.torres@taller.pe',
    nombres: 'Ana',
    apellidoPaterno: 'Torres',
    apellidoMaterno: 'Díaz',
    descripcion: 'Creador: registra y verifica solicitudes',
    perfiles: [perfil('perfil-ana-creador', 'CREADOR', 'Creador', 'Operador de cuentas bancarias')],
  },
  {
    id: 'usr-luis',
    dni: '22222222',
    email: 'luis.ramirez@taller.pe',
    nombres: 'Luis',
    apellidoPaterno: 'Ramírez',
    apellidoMaterno: 'Soto',
    descripcion: 'Aprobador: aprueba, observa o rechaza',
    perfiles: [perfil('perfil-luis-aprobador', 'APROBADOR', 'Aprobador', 'Aprobador de cuentas bancarias')],
  },
  {
    id: 'usr-carla',
    dni: '33333333',
    email: 'carla.mendoza@taller.pe',
    nombres: 'Carla',
    apellidoPaterno: 'Mendoza',
    apellidoMaterno: 'Ríos',
    descripcion: 'Dos perfiles: creador y aprobador (cambia de perfil)',
    perfiles: [
      perfil('perfil-carla-creador', 'CREADOR', 'Creador', 'Operador de cuentas bancarias'),
      perfil('perfil-carla-aprobador', 'APROBADOR', 'Aprobador', 'Aprobador de cuentas bancarias'),
    ],
  },
];

export function buscarUsuarioPorPerfil(perfilId: string): { usuario: UsuarioDemo; perfil: PerfilItem } | null {
  for (const usuario of USUARIOS_DEMO) {
    const encontrado = usuario.perfiles.find((p) => p.id === perfilId);
    if (encontrado) return { usuario, perfil: encontrado };
  }
  return null;
}
