import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';


import { MovimientosClient } from './movimientos-client';
import { TipoMovimiento } from '../../core/models';
import { HttpError } from '../../core/http/http-error';
import { formatearMoneda, formatearFecha } from '../../shared/utils/format';


@Component({
  selector: 'app-movimientos',
  imports: [ReactiveFormsModule],
  templateUrl: './movimientos.html',
})
export class Movimientos {
  
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly api = inject(MovimientosClient);


  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);


  protected readonly movimientos = signal<any[]>([]);
  protected readonly cuentas = signal<any[]>([]);
  protected readonly categorias = signal<any[]>([]);


  protected readonly filtros = this.fb.group({
    desde: [''],
    hasta: [''],
    cuentaId: [''],
    categoriaId: [''],
    tipo: ['' as '' | TipoMovimiento],
  });




  private readonly filtrosValor = signal(this.filtros.getRawValue());


  protected readonly filtrados = computed(() => {
    const { desde, hasta, cuentaId, categoriaId, tipo } = this.filtrosValor();
    const cuentaIdNum = cuentaId ? Number(cuentaId) : null;
    const categoriaIdNum = categoriaId ? Number(categoriaId) : null;

    return this.movimientos()
      .filter((m) => {
        if (desde && m.fecha < desde) return false;
        if (hasta && m.fecha > hasta) return false;
        if (tipo && m.tipo !== tipo) return false;
        if (cuentaIdNum !== null && m.cuentaId !== cuentaIdNum) return false;
        if (categoriaIdNum !== null && m.categoriaId !== categoriaIdNum) return false;
        return true;
      })
      .sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id - a.id);
  });


  protected readonly formatearMoneda = formatearMoneda;
  protected readonly formatearFecha = formatearFecha;


  constructor() {
    this.filtros.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.filtrosValor.set(this.filtros.getRawValue()));

    forkJoin({
      movimientos: this.api.listarMovimientos(),
      cuentas: this.api.listarCuentas(),
      categorias: this.api.listarCategorias(),
    }).subscribe({
      next: ({ movimientos, cuentas, categorias }) => {
        this.movimientos.set(movimientos);
        this.cuentas.set(cuentas);
        this.categorias.set(categorias);
        this.cargando.set(false);
      },
      error: (err: unknown) => {
        this.error.set(err instanceof HttpError ? err.message : 'No se pudieron cargar los movimientos');
        this.cargando.set(false);
      },
    });
  }


  protected limpiarFiltros(): void {
    this.filtros.reset({
      desde: '',
      hasta: '',
      cuentaId: '',
      categoriaId: '',
      tipo: '',
    });
  }
}