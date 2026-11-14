import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ReglaRecurrenteResponse, ReglaRecurrenteRequest, CuentaResponse, CategoriaResponse } from '../../core/models';

@Service()
export class ReglasRecurrentesClient {
    private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  listarReglas(): Observable<ReglaRecurrenteResponse[]> {
    return this.http.get<ReglaRecurrenteResponse[]>(`${this.base}/reglas-recurrentes`);
  }

  crearRegla(dto: ReglaRecurrenteRequest): Observable<ReglaRecurrenteResponse> {
    return this.http.post<ReglaRecurrenteResponse>(`${this.base}/reglas-recurrentes`, dto);
  }

  desactivarRegla(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/reglas-recurrentes/${id}`);
  }

  listarCuentas(): Observable<CuentaResponse[]> {
    return this.http.get<CuentaResponse[]>(`${this.base}/cuentas`);
  }

  listarCategorias(): Observable<CategoriaResponse[]> {
    return this.http.get<CategoriaResponse[]>(`${this.base}/categorias`);
  }
}