import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { AuthService } from '../../core/auth/auth.service';
import { HttpError } from '../../core/http/http-error';
import { CuentaResponse, MovimientoResponse } from '../../core/models';
import { formatearFecha, formatearMoneda, formatearTipoCuenta } from '../../shared/utils/format';
import { DashboardClient } from './dashboard-client';
import { movimientosDelPeriodo, resumirPeriodo } from './dashboard-resumen';

const MOVIMIENTOS_RECIENTES = 5;

function periodoActual(): string {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;
}

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard {
  protected readonly auth = inject(AuthService);
  private readonly client = inject(DashboardClient);

  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly cuentas = signal<CuentaResponse[]>([]);
  protected readonly movimientos = signal<MovimientoResponse[]>([]);
  protected readonly periodo = signal(periodoActual());

  protected readonly cuentasActivas = computed(() =>
    this.cuentas()
      .filter((c) => c.activa)
      .sort((a, b) => Number(b.saldo) - Number(a.saldo)),
  );

  protected readonly patrimonio = computed(() =>
    this.cuentasActivas().reduce((acc, c) => acc + Number(c.saldo), 0),
  );

  protected readonly resumen = computed(() => resumirPeriodo(this.movimientos(), this.periodo()));

  protected readonly recientes = computed(() =>
    movimientosDelPeriodo(this.movimientos(), this.periodo())
      .sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id - a.id)
      .slice(0, MOVIMIENTOS_RECIENTES),
  );

  protected readonly etiquetaPeriodo = computed(() => {
    const [anio, mes] = this.periodo().split('-').map(Number);
    return new Date(anio, mes - 1, 1).toLocaleDateString('es-AR', {
      month: 'long',
      year: 'numeric',
    });
  });

  protected readonly moneda = formatearMoneda;
  protected readonly fecha = formatearFecha;
  protected readonly tipo = formatearTipoCuenta;

  constructor() {
    this.cargar();
  }

  protected cambiarPeriodo(valor: string): void {
    if (valor) this.periodo.set(valor);
  }

  private cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    forkJoin({
      cuentas: this.client.listarCuentas(),
      movimientos: this.client.listarMovimientos(),
    }).subscribe({
      next: ({ cuentas, movimientos }) => {
        this.cuentas.set(cuentas);
        this.movimientos.set(movimientos);
        this.cargando.set(false);
      },
      error: (err: unknown) => {
        this.error.set(err instanceof HttpError ? err.message : 'No se pudo cargar el resumen');
        this.cargando.set(false);
      },
    });
  }
}
