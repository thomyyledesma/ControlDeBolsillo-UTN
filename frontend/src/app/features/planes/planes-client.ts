import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UsuarioResponse } from '../../core/models';

@Service()
export class PlanesClient {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  pasarAPremium(): Observable<UsuarioResponse> {
    return this.http.post<UsuarioResponse>(`${this.base}/usuarios/actual/premium`, {});
  }
}
