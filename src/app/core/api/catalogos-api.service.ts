import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { APP_CONFIG } from '../config/app.config';

// ── Catálogos heredados (legacy) ──

export interface AmbitoResponse {
  id: string;
  codigo: string;
  descripcion: string;
  esActivo: boolean;
}

export interface TipoDocumentoResponse {
  id: string;
  codigo: string;
  nombre: string;
  modulo?: string;
  esActivo: boolean;
  accionesPermitidas?: { tipoAccion: string }[];
  proceso?: { codigo: string; nombre: string; modulo: string } | null;
}

export interface RolResponse {
  id: string;
  codigo: string;
  nombre: string;
  esActivo?: boolean;
}

// ── Catálogos refactor v2 ──

export interface TipoDocIdentidadResponse {
  id: string;
  codigo: string; // DNI | CE | PAS
  nombre: string;
}

export interface TipoUsuarioResponse {
  id: string;
  codigo: string;
  nombre: string;
}

export interface ModalidadContratoResponse {
  id: string;
  codigo: string;
  nombre: string;
}

export interface CargoResponse {
  id: string;
  nombre: string;
}

export interface SistemaFuncionalResponse {
  id: string;
  nombre: string;
  nombreCorto: string;
  aplicacion: string;
  enteRector: { id: string; codMef: string; siglas: string; nombre: string };
}

/** CatDocumento con el procedimiento (padre) al que pertenece. */
export interface CatDocumentoResponse {
  id: string;
  codigo: string;
  nombre: string;
  procedimientoId: string | null;
  procedimiento?: { sigla: string | null; nombre: string } | null;
}

export interface ProcedimientoResponse {
  id: string;
  codigo: string;
  nombre: string;
  sigla: string | null;
  nivel: number;
  categoria: string;
  padreId: string | null;
  sistemaId: string;
}

export interface CfgPerfilResponse {
  id: string;
  tieneEspecialidades: boolean;
  procedimiento: { id: string; codigo: string; nombre: string; sigla: string | null };
  rol: { id: string; codigo: string; nombre: string };
  perfil: { id: string; nombre: string };
}

export interface EspecialidadResponse {
  id: string;
  nombre: string;
  descripcion: string | null;
}

export interface PerfilCatalogoResponse {
  id: string;
  nombre: string;
  procedimientoId: string;
}

@Injectable({ providedIn: 'root' })
export class CatalogosApiService {
  private readonly http = inject(HttpClient);
  private readonly base = APP_CONFIG.api.baseUrl;

  // ── Heredados ──
  listarAmbitos(): Observable<AmbitoResponse[]> {
    return this.http.get<AmbitoResponse[]>(`${this.base}/ambitos`);
  }

  listarTiposDocumento(): Observable<TipoDocumentoResponse[]> {
    return this.http.get<TipoDocumentoResponse[]>(`${this.base}/tipos-documento`);
  }

  listarRoles(): Observable<RolResponse[]> {
    return this.http.get<RolResponse[]>(`${this.base}/roles`);
  }

  // ── Refactor v2 — soporte del usuario ──
  listarTiposDocIdentidad(): Observable<TipoDocIdentidadResponse[]> {
    return this.http.get<TipoDocIdentidadResponse[]>(`${this.base}/catalogos/tipos-doc-identidad`);
  }

  listarTiposUsuario(): Observable<TipoUsuarioResponse[]> {
    return this.http.get<TipoUsuarioResponse[]>(`${this.base}/catalogos/tipos-usuario`);
  }

  listarModalidadesContrato(): Observable<ModalidadContratoResponse[]> {
    return this.http.get<ModalidadContratoResponse[]>(`${this.base}/catalogos/modalidades-contrato`);
  }

  listarCargos(): Observable<CargoResponse[]> {
    return this.http.get<CargoResponse[]>(`${this.base}/catalogos/cargos`);
  }

  // ── Refactor v2 — sistemas funcionales y procedimientos ──
  listarSistemasFuncionales(): Observable<SistemaFuncionalResponse[]> {
    return this.http.get<SistemaFuncionalResponse[]>(`${this.base}/catalogos/sistemas-funcionales`);
  }

  listarProcedimientos(sistemaId?: string): Observable<ProcedimientoResponse[]> {
    let params = new HttpParams();
    if (sistemaId) params = params.set('sistemaId', sistemaId);
    return this.http.get<ProcedimientoResponse[]>(`${this.base}/catalogos/procedimientos`, { params });
  }

  // ── Refactor v2 — CfgPerfil y especialidades ──
  listarCfgPerfiles(filtros?: { procedimientoId?: string; rolId?: string }): Observable<CfgPerfilResponse[]> {
    let params = new HttpParams();
    if (filtros?.procedimientoId) params = params.set('procedimientoId', filtros.procedimientoId);
    if (filtros?.rolId) params = params.set('rolId', filtros.rolId);
    return this.http.get<CfgPerfilResponse[]>(`${this.base}/catalogos/cfg-perfiles`, { params });
  }

  listarEspecialidades(procedimientoId: string): Observable<EspecialidadResponse[]> {
    const params = new HttpParams().set('procedimientoId', procedimientoId);
    return this.http.get<EspecialidadResponse[]>(`${this.base}/catalogos/especialidades`, { params });
  }

  listarPerfilesCatalogo(procedimientoId?: string): Observable<PerfilCatalogoResponse[]> {
    let params = new HttpParams();
    if (procedimientoId) params = params.set('procedimientoId', procedimientoId);
    return this.http.get<PerfilCatalogoResponse[]>(`${this.base}/catalogos/perfiles`, { params });
  }

  // ── Catálogos del correlativo (CfgEstructura) ──
  listarProcesos(): Observable<{ id: string; codigo: string; nombre: string }[]> {
    return this.http.get<{ id: string; codigo: string; nombre: string }[]>(
      `${this.base}/catalogos/procesos`,
    );
  }

  /** CatDocumento (SCC, SCMPC, STAA, SCA, SRAA…) con su procedimiento padre. */
  listarCatDocumentos(): Observable<CatDocumentoResponse[]> {
    return this.http.get<CatDocumentoResponse[]>(`${this.base}/catalogos/cat-documentos`);
  }

  // ═══════════════════════════════════════════════════════════
  //  ADMIN — CRUD CatSistemaFuncional
  // ═══════════════════════════════════════════════════════════
  crearSistemaFuncional(dto: CreateSistemaFuncionalDto): Observable<SistemaFuncionalAdminResponse> {
    return this.http.post<SistemaFuncionalAdminResponse>(`${this.base}/catalogos/sistemas-funcionales`, dto);
  }

  editarSistemaFuncional(id: string, dto: UpdateSistemaFuncionalDto): Observable<SistemaFuncionalAdminResponse> {
    return this.http.patch<SistemaFuncionalAdminResponse>(`${this.base}/catalogos/sistemas-funcionales/${id}`, dto);
  }

  eliminarSistemaFuncional(id: string): Observable<{ id: string; deleted?: boolean; esActivo?: boolean }> {
    return this.http.delete<{ id: string; deleted?: boolean; esActivo?: boolean }>(`${this.base}/catalogos/sistemas-funcionales/${id}`);
  }

  // ═══════════════════════════════════════════════════════════
  //  ADMIN — CRUD CatProcedimiento
  // ═══════════════════════════════════════════════════════════
  crearProcedimiento(dto: CreateProcedimientoDto): Observable<ProcedimientoAdminResponse> {
    return this.http.post<ProcedimientoAdminResponse>(`${this.base}/catalogos/procedimientos`, dto);
  }

  editarProcedimiento(id: string, dto: UpdateProcedimientoDto): Observable<ProcedimientoAdminResponse> {
    return this.http.patch<ProcedimientoAdminResponse>(`${this.base}/catalogos/procedimientos/${id}`, dto);
  }

  eliminarProcedimiento(id: string): Observable<{ id: string; deleted?: boolean; esActivo?: boolean }> {
    return this.http.delete<{ id: string; deleted?: boolean; esActivo?: boolean }>(`${this.base}/catalogos/procedimientos/${id}`);
  }

  // ═══════════════════════════════════════════════════════════
  //  ADMIN — CRUD CfgPerfil
  // ═══════════════════════════════════════════════════════════
  crearCfgPerfil(dto: CreateCfgPerfilDto): Observable<CfgPerfilAdminResponse> {
    return this.http.post<CfgPerfilAdminResponse>(`${this.base}/catalogos/cfg-perfiles`, dto);
  }

  editarCfgPerfil(id: string, dto: UpdateCfgPerfilDto): Observable<CfgPerfilAdminResponse> {
    return this.http.patch<CfgPerfilAdminResponse>(`${this.base}/catalogos/cfg-perfiles/${id}`, dto);
  }

  eliminarCfgPerfil(id: string): Observable<{ id: string; deleted?: boolean; esActivo?: boolean }> {
    return this.http.delete<{ id: string; deleted?: boolean; esActivo?: boolean }>(`${this.base}/catalogos/cfg-perfiles/${id}`);
  }
}

// ═══════════════════════════════════════════════════════════
//  DTOs y respuestas de administración
// ═══════════════════════════════════════════════════════════

export interface CreateSistemaFuncionalDto {
  nombre: string;
  nombreCorto: string;
  aplicacion: string;
  enteRectorId: string;
  descripcion?: string;
  esActivo?: boolean;
  orden?: number;
}

export type UpdateSistemaFuncionalDto = Partial<CreateSistemaFuncionalDto>;

export interface SistemaFuncionalAdminResponse {
  id: string;
  nombre: string;
  nombreCorto: string;
  aplicacion: string;
  enteRectorId: string;
  esActivo: boolean;
  orden: number;
}

export type CategoriaProcedimiento = 'catalogo' | 'clasificador' | 'proceso';

export interface CreateProcedimientoDto {
  sistemaId: string;
  padreId?: string;
  codigo: string;
  nombre: string;
  sigla?: string;
  nivel?: number;
  categoria: CategoriaProcedimiento;
  descripcion?: string;
  esActivo?: boolean;
  orden?: number;
}

export type UpdateProcedimientoDto = Partial<Omit<CreateProcedimientoDto, 'sistemaId'>>;

export interface ProcedimientoAdminResponse {
  id: string;
  codigo: string;
  nombre: string;
  sigla: string | null;
  nivel: number;
  categoria: CategoriaProcedimiento;
  padreId: string | null;
  sistemaId: string;
  esActivo: boolean;
  orden: number;
}

export interface CreateCfgPerfilDto {
  procedimientoId: string;
  rolId: string;
  perfilId: string;
  tieneEspecialidades?: boolean;
  comentarios?: string;
  esActivo?: boolean;
}

export type UpdateCfgPerfilDto = Partial<Pick<CreateCfgPerfilDto, 'tieneEspecialidades' | 'comentarios' | 'esActivo'>>;

export interface CfgPerfilAdminResponse {
  id: string;
  tieneEspecialidades: boolean;
  esActivo: boolean;
  comentarios: string | null;
  procedimiento: { id: string; codigo: string; nombre: string; sigla: string | null };
  rol: { id: string; codigo: string; nombre: string };
  perfil: { id: string; nombre: string };
}
