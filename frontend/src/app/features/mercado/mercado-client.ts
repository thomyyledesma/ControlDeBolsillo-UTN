import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CotizacionResponse, CriptoResponse } from '../../core/models';

/** El backend devuelve las criptos con los nombres de CoinGecko (snake_case). */
interface CriptoApi {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number | null;
  market_cap: number | null;
}

@Service()
export class MercadoClient {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  listarDolares(): Observable<CotizacionResponse[]> {
    return this.http.get<CotizacionResponse[]>(`${this.base}/cotizaciones/dolares`);
  }

  listarDivisas(): Observable<CotizacionResponse[]> {
    return this.http.get<CotizacionResponse[]>(`${this.base}/cotizaciones/divisas`);
  }

  listarCriptos(): Observable<CriptoResponse[]> {
    return this.http.get<CriptoApi[]>(`${this.base}/criptos`).pipe(
      map((criptos) =>
        criptos.map((c) => ({
          id: c.id,
          symbol: c.symbol,
          name: c.name,
          precioUsd: c.current_price,
          cambio24h: c.price_change_percentage_24h,
          capitalizacion: c.market_cap,
        })),
      ),
    );
  }
}
