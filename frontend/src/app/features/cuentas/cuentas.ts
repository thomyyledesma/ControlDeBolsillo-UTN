import { Component, inject, signal } from '@angular/core';

import { HttpError } from '../../core/http/http-error';
import { CuentaResponse } from '../../core/models';
import { formatearMoneda, formatearTipoCuenta } from '../../shared/utils/format';
import { CuentasClient } from './cuentas-client';

@Component({
  selector: 'app-cuentas',
  styleUrl: './cuentas.css',
  templateUrl: './cuentas.html',
})
export class Cuentas {
  private readonly client = inject(CuentasClient);

  protected readonly cuentas = signal<CuentaResponse[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly moneda = formatearMoneda;
  protected readonly tipo = formatearTipoCuenta;

  constructor() {
    this.cargar();
  }

  private cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.client.listar().subscribe({
      next: (data) => {
        this.cuentas.set(data);
        this.cargando.set(false);
      },
      error: (err: unknown) => {
        this.error.set(err instanceof HttpError ? err.message : 'No se pudieron cargar las cuentas');
        this.cargando.set(false);
      },
    });
  }
}
