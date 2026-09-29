import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { APP_CONFIG } from '../../../../core/config/app.config';
import { CuentaBancariaDatos, CuentaBancariaRegistro } from '../models/cuenta-bancaria.model';

/**
 * Endpoints propios del proceso de ejemplo. En el taller los responde el backend simulado
 * (`src/app/mock/mock-backend.interceptor.ts`); con un backend real serían las mismas URLs.
 */
@Injectable({ providedIn: 'root' })
export class CuentasBancariasApiService {
  private readonly http = inject(HttpClient);
  private readonly base = APP_CONFIG.api.baseUrl;

  /** Guarda (o reemplaza) la cuenta propuesta en la solicitud. */
  guardarDetalle(solicitudId: string, datos: CuentaBancariaDatos): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/solicitudes/${solicitudId}/cuenta-bancaria`, datos);
  }

  /** Cuentas bancarias aprobadas: pestaña Registros y consulta. */
  listarRegistros(): Observable<CuentaBancariaRegistro[]> {
    return this.http.get<CuentaBancariaRegistro[]>(`${this.base}/cuentas-bancarias`);
  }
}
