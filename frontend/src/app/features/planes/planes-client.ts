import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UsuarioResponse } from '../../core/models';

export interface PagoResponse {
  url: string;
}

@Service()
export class PlanesClient {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/pagos`;

  crearPagoPremium(): Observable<PagoResponse> {
    return this.http.post<PagoResponse>(`${this.base}/premium`, {});
  }

  confirmarPago(paymentId: string): Observable<UsuarioResponse> {
    const params = new HttpParams().set('payment_id', paymentId);
    return this.http.post<UsuarioResponse>(`${this.base}/confirmar`, {}, { params });
  }
}
