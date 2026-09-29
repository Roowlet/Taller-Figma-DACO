import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../config/app.config';

// ─────────────────────────────────────────────────────────────
// Apertura Contable (MFD CEL-007.03.01.01) — respuestas del backend
// ─────────────────────────────────────────────────────────────

export type EstadoPeriodoApi = 'ABIERTO' | 'CERRADO';
export type AmbitoApi = 'PLIEGO' | 'UE';

export interface PeriodoContableResponse {
  id: string;
  numero: number;
  etiqueta: string;
  fechaInicio: string;
  fechaFin: string;
  fechaVigenciaAdicional: string;
  usuarioResponsable: string;
  estado: EstadoPeriodoApi;
}

export interface ConfiguracionAmbitoResponse {
  ejercicioId: string;
  anio: number;
  ambito: AmbitoApi;
  /** MaeEntidad.id (PLIEGO) o MaeUnidadEjecutora.id (UE). */
  ambitoId: string | null;
  /** codMef del Pliego o codUe de la UE — para ubicar el ámbito propio. */
  codigo?: string | null;
  nombre: string | null;
  estado: EstadoPeriodoApi;
  periodosActivos: string[];
  fechaInicio: string;
  fechaFin: string;
  periodos: PeriodoContableResponse[];
}

export interface PeriodoHistorialResponse {
  id: string;
  tipoAccion: 'CREACION' | 'MODIFICACION';
  estaAbierto: boolean;
  fechaInicio: string;
  fechaFin: string;
  fechaVigenciaAdicional: string;
  usuario: string;
  createdAt: string;
}

export interface AsientoAperturaResponse {
  id: string;
  ejercicio: number;
  numero: string;
  tipoAccion: 'CREACION' | 'REVERSION';
  estado: 'REGISTRADO' | 'PROCESADO' | 'ANULADO';
  numeroDocContable: string;
  numeroDocCierre: string;
  aperturaAnteriorId: string | null;
  fechaContabilizacion: string;
  glosa: string;
  totalDebe: string;
  totalHaber: string;
  registradoPor: string;
  fechaRegistrado: string;
  procesadoPor: string | null;
  fechaProcesado: string | null;
  entidad: { codMef: string; nombre: string };
  aperturaAnterior?: { id: string; numeroDocContable: string } | null;
  reemplazadaPor?: { id?: string; numeroDocContable: string }[];
  cuentas?: { codigo: string; nombre: string; debe: string; haber: string; orden: number }[];
}

export interface GuardarConfiguracionMensualDto {
  periodoContableId: string;
  /** yyyy-MM-dd */
  fechaVigenciaAdicionalPropuesta: string;
  /** Intención "¿Está abierto?": false cierra el período al aprobar. */
  estaAbierto: boolean;
}

@Injectable({ providedIn: 'root' })
export class AperturaContableApiService {
  private readonly http = inject(HttpClient);
  private readonly base = APP_CONFIG.api.baseUrl;

  /** Situación de apertura por ámbito con estado calculado por fechas. */
  listarConfiguracion(anio: number, ambito: AmbitoApi, entidadId?: string): Observable<ConfiguracionAmbitoResponse[]> {
    let params = new HttpParams().set('anio', anio).set('ambito', ambito);
    if (entidadId) params = params.set('entidadId', entidadId);
    return this.http.get<ConfiguracionAmbitoResponse[]>(`${this.base}/apertura-contable/configuracion`, { params });
  }

  historialPeriodo(periodoId: string): Observable<PeriodoHistorialResponse[]> {
    return this.http.get<PeriodoHistorialResponse[]>(`${this.base}/apertura-contable/periodos/${periodoId}/historial`);
  }

  generarEjercicio(anio: number): Observable<{ anio: number; pliegos: number; ues: number; creados: number }> {
    return this.http.post<{ anio: number; pliegos: number; ues: number; creados: number }>(
      `${this.base}/apertura-contable/ejercicios/generar`,
      { anio },
    );
  }

  /** Detalle del documento CAM: período + Vigencia Adicional propuesta. */
  guardarConfiguracionMensual(documentoId: string, dto: GuardarConfiguracionMensualDto): Observable<unknown> {
    return this.http.post(`${this.base}/solicitudes/${documentoId}/configuracion-mensual`, dto);
  }

  listarAsientosApertura(ejercicio?: number): Observable<AsientoAperturaResponse[]> {
    const params = ejercicio ? new HttpParams().set('ejercicio', ejercicio) : undefined;
    return this.http.get<AsientoAperturaResponse[]>(`${this.base}/apertura-contable/asientos-apertura`, { params });
  }

  obtenerAsientoApertura(id: string): Observable<AsientoAperturaResponse> {
    return this.http.get<AsientoAperturaResponse>(`${this.base}/apertura-contable/asientos-apertura/${id}`);
  }
}
