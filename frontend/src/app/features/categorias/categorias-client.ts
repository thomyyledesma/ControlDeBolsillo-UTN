import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CategoriaResponse, CategoriaRequest } from '../../core/models';

@Service()
export class CategoriasClient {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  listar(): Observable<CategoriaResponse[]> {
    return this.http.get<CategoriaResponse[]>(`${this.base}/categorias`);
  }

  crear(dto: CategoriaRequest): Observable<CategoriaResponse> {
    return this.http.post<CategoriaResponse>(`${this.base}/categorias`, dto);
  }

  actualizar(id: number, dto: CategoriaRequest): Observable<CategoriaResponse> {
    return this.http.put<CategoriaResponse>(`${this.base}/categorias/${id}`, dto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/categorias/${id}`);
  }
}
