import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AnalisisResponse } from '../../core/models';

@Service()
export class AnalisisClient {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/analisis`;

  analizarTodo(): Observable<AnalisisResponse> {
    return this.http.get<AnalisisResponse>(this.base);
  }

  analizarPeriodo(desde: string, hasta: string): Observable<AnalisisResponse> {
    const params = new HttpParams().set('desde', desde).set('hasta', hasta);
    return this.http.get<AnalisisResponse>(`${this.base}/periodo`, { params });
  }
}
