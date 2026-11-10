import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { CuentaRequest, CuentaResponse, CuentaUpdateRequest } from '../../core/models';

@Service()
export class CuentasClient {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  listar(): Observable<CuentaResponse[]> {
    return this.http.get<CuentaResponse[]>(`${this.base}/cuentas`);
  }

  crear(dto: CuentaRequest): Observable<CuentaResponse> {
    return this.http.post<CuentaResponse>(`${this.base}/cuentas`, dto);
  }

  actualizar(id: number, dto: CuentaUpdateRequest): Observable<CuentaResponse> {
    return this.http.put<CuentaResponse>(`${this.base}/cuentas/${id}`, dto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/cuentas/${id}`);
  }
}
