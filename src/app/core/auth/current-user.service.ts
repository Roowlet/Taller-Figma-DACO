import { Injectable, signal } from '@angular/core';

export type CurrentUser = {
  /** Nombre legible del rol o del usuario, según contexto de UI. */
  name: string;
  /** Nombre legible de la entidad/UE/unidad principal. */
  office: string;

  // ── Identificadores ricos (modelo refactor v2) ──
  /** Id (uuid) de la entidad/pliego — para acotar consultas por ámbito propio. */
  entidadId?: string | null;
  /** Sigla corta de la entidad (ej. MEF, GR-LIM). */
  entidadSiglas?: string | null;
  /** Código MEF de la entidad (ej. 0001). */
  entidadCodigo?: string | null;
  /** Unidad ejecutora — nivel intermedio entre entidad y unidad orgánica. */
  ue?: string | null;
  ueId?: string | null;
  /** Unidad orgánica principal (DGCP, OGTI, etc.). */
  unidad?: string | null;
  unidadId?: string | null;

  // ── Perfil funcional (CfgPerfil) ──
  /** Procedimiento al que pertenece el perfil (ej. "Plan de Cuentas Contables"). */
  procedimiento?: string | null;
  procedimientoCodigo?: string | null;
  /** Nombre del perfil funcional (ej. "Operador de Plan de Cuentas Contables"). */
  perfilFuncional?: string | null;

  /** Nivel en la cascada de Apertura Contable: DGCP (MEF) / PLIEGO / UE. */
  nivelAmbito?: 'DGCP' | 'PLIEGO' | 'UE' | null;

  // ── Ámbito institucional (compat SRAA) ──
  entidadAmbitoId?: string | null;
  entidadAmbitoCodigo?: string | null;
};

@Injectable({ providedIn: 'root' })
export class CurrentUserService {
  // Valores mock hasta que la autenticación real provea el perfil del usuario.
  private readonly _user = signal<CurrentUser>({
    name: 'Usuario rol creador',
    office: 'ENTIDAD ESTADO',
  });

  readonly user = this._user.asReadonly();

  setUser(user: CurrentUser): void {
    this._user.set(user);
  }

  get name(): string {
    return this._user().name;
  }

  get office(): string {
    return this._user().office;
  }
}
