import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PresupuestoResponse, PresupuestoRequest, CategoriaResponse } from '../../core/models';

@Service()
export class PresupuestosClient {
    private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  listar(): Observable<PresupuestoResponse[]> {
    return this.http.get<PresupuestoResponse[]>(`${this.base}/presupuestos`);
  }

  crear(dto: PresupuestoRequest): Observable<PresupuestoResponse> {
    return this.http.post<PresupuestoResponse>(`${this.base}/presupuestos`, dto);
  }

  actualizar(id: number, dto: PresupuestoRequest): Observable<PresupuestoResponse> {
    return this.http.put<PresupuestoResponse>(`${this.base}/presupuestos/${id}`, dto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/presupuestos/${id}`);
  }

  listarCategoriasEgreso(): Observable<CategoriaResponse[]> {
    const params = new HttpParams().set('tipo', 'EGRESO');
    return this.http.get<CategoriaResponse[]>(`${this.base}/categorias`, { params });
  }
}
