import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { APP_CONFIG } from '../config/app.config';

export interface PlanResponse {
  id: string;
  numeroPlanContable: string;
  descripcion: string;
  tipoPlan: string;
  fecha: string;
  vigenciaPlanContable: string;
  fechaInicio: string;
  fechaFin: string | null;
  esVigente: boolean;
  esVisible: boolean;
  esEditable: boolean;
}

export interface CuentaContableResponse {
  id: string;
  planContableId: string;
  parentId: string | null;
  codigoCompleto: string;
  elemento: string;
  grupo: string | null;
  cuenta: string | null;
  subcuenta1: string | null;
  subcuenta2: string | null;
  subcuenta3: string | null;
  nivel: number;
  nombre: string;
  esImputable: boolean;
  naturaleza: string;
  tipoElemento: string;
  esMonetaria: boolean;
  aplicaExtraPresupuestaria: boolean;
  esReciproca: boolean;
  tieneDinamicaContable: boolean;
  dinamicaDebita: string | null;
  dinamicaAcredita: string | null;
  dinamicaObjeto?: string | null;
  dinamicaSaldos?: string | null;
  acActivo?: string | null;
  pcPasivo?: string | null;
  ancActivo?: string | null;
  pncPasivo?: string | null;
  esParaEntidadEstado?: boolean;
  esVigente: boolean;
  esVisible: boolean;
  fechaFin?: string | null;
  createdAt?: string;
  codigoAnterior?: string | null;
  nombreAnterior?: string | null;
  /** True si la cuenta ya está referenciada en otros procesos (STAA/SRAA):
   *  en ese caso su código no se puede editar en una modificación. */
  estaEnUso?: boolean;
  ambitos: { ambitoInstitucionalId: string; ambitoInstitucional: { codigo: string; descripcion: string } }[];
  entidades?: { entidadId: string; entidad?: { codMef: string; siglas: string; nombre: string } | null }[];
  /** Plan contable dueño de la cuenta — el detalle lo incluye para el historial. */
  plan?: { descripcion?: string | null; numeroPlanContable?: string | null } | null;
}

export interface CuentaHistorialEntry {
  documentoId: string;
  tipoDocumento: { codigo: string; nombre: string } | null;
  tipoAccion: string;
  /** Número formal del documento (ej. PCC-SCC-00001-2026-MEF-DGCP). */
  numeroDocumento: string | null;
  fechaRequerimiento: string;
  /** Asunto/motivo del documento — formato "[organo] justificación". */
  justificacion: string | null;
  sustento: { nombreOriginal: string } | null;
  esModificacion: boolean;
  historialEstados: {
    id: string;
    estadoNuevo: string;
    comentario: string | null;
    createdAt: string;
    creador: { nombres: string; apellidoPaterno: string; apellidoMaterno: string | null } | null;
    perfil: { cfgPerfil?: { rol: { nombre: string } | null } | null } | null;
  }[];
}

export interface ValidarCodigoResponse {
  valido: boolean;
  mensaje?: string;
}

/** Respuesta de cuentas cuando se pide paginada (con page/limit). */
export interface CuentasPaginadas {
  data: CuentaContableResponse[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({ providedIn: 'root' })
export class PlanesApiService {
  private readonly http = inject(HttpClient);
  private readonly base = APP_CONFIG.api.baseUrl;

  listar(): Observable<PlanResponse[]> {
    return this.http.get<PlanResponse[]>(`${this.base}/planes`);
  }

  obtener(id: string): Observable<PlanResponse> {
    return this.http.get<PlanResponse>(`${this.base}/planes/${id}`);
  }

  listarCuentas(planId: string, includeAll = false): Observable<CuentaContableResponse[]> {
    const url = includeAll
      ? `${this.base}/planes/${planId}/cuentas?includeAll=true`
      : `${this.base}/planes/${planId}/cuentas`;
    return this.http.get<CuentaContableResponse[]>(url);
  }

  /**
   * Variante paginada con búsqueda para la pestaña Registros. Método aparte
   * para no tocar el contrato de los consumidores del array plano (paneles de
   * selección, carga masiva, consultas).
   */
  listarCuentasPaginadas(
    planId: string,
    query: { search?: string; page: number; limit: number },
  ): Observable<CuentasPaginadas> {
    const params = new URLSearchParams();
    if (query.search?.trim()) params.set('search', query.search.trim());
    params.set('page', String(query.page));
    params.set('limit', String(query.limit));
    return this.http.get<CuentasPaginadas>(`${this.base}/planes/${planId}/cuentas?${params}`);
  }

  obtenerCuenta(id: string): Observable<CuentaContableResponse> {
    return this.http.get<CuentaContableResponse>(`${this.base}/cuentas/${id}`);
  }

  obtenerHistorialCuenta(id: string): Observable<CuentaHistorialEntry[]> {
    return this.http.get<CuentaHistorialEntry[]>(`${this.base}/cuentas/${id}/historial`);
  }

  validarCodigo(codigo: string, planId: string): Observable<ValidarCodigoResponse> {
    return this.http.get<ValidarCodigoResponse>(`${this.base}/cuentas/validar/codigo`, {
      params: { codigo, planId }
    });
  }
}
