import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, Service, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  CuentaResponse,
  MetaAhorroRequest,
  MetaAhorroResponse,
  MovimientoMetaRequest,
} from '../../core/models';

@Service()
export class MetasClient {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  listar(cumplida?: boolean): Observable<MetaAhorroResponse[]> {
    let params = new HttpParams();
    if (cumplida !== undefined) params = params.set('cumplida', cumplida);
    return this.http.get<MetaAhorroResponse[]>(`${this.base}/metas-ahorro`, { params });
  }

  crear(dto: MetaAhorroRequest): Observable<MetaAhorroResponse> {
    return this.http.post<MetaAhorroResponse>(`${this.base}/metas-ahorro`, dto);
  }

  actualizar(id: number, dto: MetaAhorroRequest): Observable<MetaAhorroResponse> {
    return this.http.put<MetaAhorroResponse>(`${this.base}/metas-ahorro/${id}`, dto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/metas-ahorro/${id}`);
  }

  depositar(id: number, dto: MovimientoMetaRequest): Observable<MetaAhorroResponse> {
    return this.http.post<MetaAhorroResponse>(`${this.base}/metas-ahorro/${id}/depositar`, dto);
  }

  retirar(id: number, dto: MovimientoMetaRequest): Observable<MetaAhorroResponse> {
    return this.http.post<MetaAhorroResponse>(`${this.base}/metas-ahorro/${id}/retirar`, dto);
  }

  listarCuentas(): Observable<CuentaResponse[]> {
    return this.http.get<CuentaResponse[]>(`${this.base}/cuentas`);
  }
}