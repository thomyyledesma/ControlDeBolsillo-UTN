import { Component, computed, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpError } from '../../core/http/http-error';
import { CotizacionResponse, CriptoResponse } from '../../core/models';
import { formatearMoneda } from '../../shared/utils/format';
import { MercadoClient } from './mercado-client';
import {
  formatearActualizacion,
  formatearUsd,
  formatearUsdCompacto,
  formatearVariacion,
} from './mercado-formato';

interface Bloque<T> {
  cargando: boolean;
  error: string | null;
  datos: T[];
}

function bloqueInicial<T>(): Bloque<T> {
  return { cargando: true, error: null, datos: [] };
}

@Component({
  selector: 'app-mercado',
  styleUrl: './mercado.css',
  templateUrl: './mercado.html',
})
export class Mercado {
  private readonly client = inject(MercadoClient);

  protected readonly dolares = signal<Bloque<CotizacionResponse>>(bloqueInicial());
  protected readonly divisas = signal<Bloque<CotizacionResponse>>(bloqueInicial());
  protected readonly criptos = signal<Bloque<CriptoResponse>>(bloqueInicial());

  protected readonly cargandoAlgo = computed(
    () => this.dolares().cargando || this.divisas().cargando || this.criptos().cargando,
  );

  protected readonly ultimaActualizacion = computed(() => {
    const fechas = this.dolares()
      .datos.map((d) => d.fechaActualizacion)
      .filter((f) => !!f)
      .sort();
    return formatearActualizacion(fechas.at(-1));
  });

  protected readonly pesos = formatearMoneda;
  protected readonly usd = formatearUsd;
  protected readonly usdCompacto = formatearUsdCompacto;
  protected readonly variacion = formatearVariacion;

  constructor() {
    this.actualizar();
  }

  protected actualizar(): void {
    this.cargar(this.client.listarDolares(), this.dolares, 'No se pudo cargar el dólar');
    this.cargar(this.client.listarDivisas(), this.divisas, 'No se pudieron cargar las divisas');
    this.cargar(
      this.client.listarCriptos(),
      this.criptos,
      'No se pudieron cargar las criptomonedas',
    );
  }

  private cargar<T>(
    origen: Observable<T[]>,
    destino: { set(valor: Bloque<T>): void },
    mensajeError: string,
  ): void {
    destino.set(bloqueInicial<T>());
    origen.subscribe({
      next: (datos) => destino.set({ cargando: false, error: null, datos }),
      error: (err: unknown) =>
        destino.set({
          cargando: false,
          error: err instanceof HttpError ? err.message : mensajeError,
          datos: [],
        }),
    });
  }
}
