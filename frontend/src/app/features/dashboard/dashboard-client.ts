import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CuentaResponse, MovimientoResponse } from '../../core/models';

@Service()
export class DashboardClient {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  listarCuentas(): Observable<CuentaResponse[]> {
    return this.http.get<CuentaResponse[]>(`${this.base}/cuentas`);
  }

  listarMovimientos(): Observable<MovimientoResponse[]> {
    return this.http.get<MovimientoResponse[]>(`${this.base}/movimientos`);
  }
}
