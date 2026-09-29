import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { APP_CONFIG } from '../config/app.config';

export interface SustentoResponse {
  id: string;
  tipoSustento: string;
  createdAt: string;
  archivo: {
    id: string;
    nombreOriginal: string;
    extension: string;
    mimeType: string;
    sizeBytes: string;
    storagePath: string;
  };
}

@Injectable({ providedIn: 'root' })
export class SustentosApiService {
  private readonly http = inject(HttpClient);
  private readonly base = APP_CONFIG.api.baseUrl;

  subir(solicitudId: string, archivo: File, tipoSustento = 'OFICIO'): Observable<SustentoResponse> {
    const form = new FormData();
    form.append('archivo', archivo);
    form.append('tipoSustento', tipoSustento);
    return this.http.post<SustentoResponse>(`${this.base}/solicitudes/${solicitudId}/sustentos`, form);
  }

  listar(solicitudId: string): Observable<SustentoResponse[]> {
    return this.http.get<SustentoResponse[]>(`${this.base}/solicitudes/${solicitudId}/sustentos`);
  }

  eliminar(solicitudId: string, sustentoId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/solicitudes/${solicitudId}/sustentos/${sustentoId}`);
  }
}
