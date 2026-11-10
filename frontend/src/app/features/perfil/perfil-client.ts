import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ActualizarUsuarioRequest, UsuarioResponse } from '../../core/models';

@Service()
export class PerfilClient {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  actualizar(dto: ActualizarUsuarioRequest): Observable<UsuarioResponse> {
    return this.http.put<UsuarioResponse>(`${this.base}/usuarios/actual`, dto);
  }
}
