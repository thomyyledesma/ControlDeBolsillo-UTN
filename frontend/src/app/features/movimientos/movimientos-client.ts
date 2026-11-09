import { Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { CategoriaResponse, CuentaResponse, MovimientoResponse } from '../../core/models';

@Service()
export class MovimientosClient {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  listarMovimientos(): Observable<MovimientoResponse[]> {
    return this.http.get<MovimientoResponse[]>(`${this.base}/movimientos`);
  }

  listarCuentas(): Observable<CuentaResponse[]> {
    return this.http.get<CuentaResponse[]>(`${this.base}/cuentas`);
  }

  listarCategorias(): Observable<CategoriaResponse[]> {
    return this.http.get<CategoriaResponse[]>(`${this.base}/categorias`);
  }
}
