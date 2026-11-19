import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin, timer } from 'rxjs';

import { MovimientosClient } from './movimientos-client';
import { fechaNoFutura, hoyIso } from './movimientos-fecha';
import { CategoriaResponse, CuentaResponse, MovimientoRequest, MovimientoResponse, TipoMovimiento } from '../../core/models';
import { HttpError } from '../../core/http/http-error';
import { formatearMoneda, formatearFecha } from '../../shared/utils/format';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';
import { Modal } from '../../shared/components/modal/modal';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-movimientos',
  imports: [ReactiveFormsModule, Modal, ConfirmDialog],
  templateUrl: './movimientos.html',
})
export class Movimientos {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly api = inject(MovimientosClient);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly cargando = signal(true);
  protected readonly guardando = signal(false);
  protected readonly eliminando = signal(false);
  protected readonly error = signal<string | null>(null);
 
  protected readonly mostrandoForm = signal(false);
  protected readonly editandoId = signal<number | null>(null);
  protected readonly movimientoAEliminar = signal<MovimientoResponse | null>(null);

  protected readonly movimientos = signal<MovimientoResponse[]>([]);
  protected readonly cuentas = signal<CuentaResponse[]>([]);
  protected readonly categorias = signal<CategoriaResponse[]>([]);

  protected readonly filtros = this.fb.group({
    desde: [''],
    hasta: [''],
    cuentaId: [''],
    categoriaId: [''],
    tipo: ['' as '' | TipoMovimiento],
  });

  protected readonly formMovimiento = this.fb.group({
    cuentaId: ['', [Validators.required]],
    tipo: ['EGRESO' as TipoMovimiento, [Validators.required]],
    categoriaId: ['', [Validators.required]],
    monto: [0, [Validators.required, Validators.min(0.01)]],
    descripcion: ['', [Validators.maxLength(200)]],
    fecha: ['', [fechaNoFutura]],
  });

  private readonly fechaHoy = signal(hoyIso());
  protected readonly fechaMaxima = this.fechaHoy.asReadonly();

  private readonly filtrosValor = signal(this.filtros.getRawValue());
  private readonly tipoRegistro = signal<TipoMovimiento>('EGRESO');

  protected readonly categoriasRegistro = computed(() =>
    this.categorias().filter((c) => c.tipo === this.tipoRegistro()),
  );

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

  protected readonly totalAcumulado = computed(() =>
    this.filtrados().reduce((acc, m) => acc + Number(m.monto), 0),
  );

  protected readonly formatearMoneda = formatearMoneda;
  protected readonly formatearFecha = formatearFecha;

  constructor() {
    this.filtros.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.filtrosValor.set(this.filtros.getRawValue()));

    this.formMovimiento.controls.tipo.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((tipo) => {
        const t = (tipo ?? 'EGRESO') as TipoMovimiento;
        this.tipoRegistro.set(t);
        this.formMovimiento.controls.categoriaId.setValue('');
      });

    const queryParams = this.route.snapshot.queryParamMap;
    const cuentaIdDesdeQuery = queryParams.get('cuentaId');
    const categoriaIdDesdeQuery = queryParams.get('categoriaId');

    const patch: { cuentaId?: string; categoriaId?: string } = {};
    if (cuentaIdDesdeQuery && !Number.isNaN(Number(cuentaIdDesdeQuery))) {
      patch.cuentaId = cuentaIdDesdeQuery;
    }
    if (categoriaIdDesdeQuery && !Number.isNaN(Number(categoriaIdDesdeQuery))) {
      patch.categoriaId = categoriaIdDesdeQuery;
    }
    if (Object.keys(patch).length > 0) {
      this.filtros.patchValue(patch);
      this.filtrosValor.set(this.filtros.getRawValue());
    }

    this.cargarDatos();
    this.programarCambioDeDia();
  }

  protected abrirForm(): void {
    this.cancelarEdicion();
    this.mostrandoForm.set(true);
  }

  protected cerrarForm(): void {
    if (this.guardando()) return;
    this.mostrandoForm.set(false);
  }

  protected registrarMovimiento(): void {
    if (this.formMovimiento.invalid) {
      this.formMovimiento.markAllAsTouched();
      return;
    }

    this.error.set(null);
    this.guardando.set(true);

    const raw = this.formMovimiento.getRawValue();
    const dto: MovimientoRequest = {
      cuentaId: Number(raw.cuentaId),
      categoriaId: Number(raw.categoriaId),
      tipo: raw.tipo,
      monto: Number(raw.monto),
      descripcion: raw.descripcion?.trim() || undefined,
      fecha: raw.fecha || undefined,
    };

    const id = this.editandoId();
    const req$ = id === null ? this.api.crearMovimiento(dto) : this.api.actualizarMovimiento(id, dto);

    req$.subscribe({
      next: () => {
        this.cancelarEdicion();
        this.mostrandoForm.set(false);
        this.guardando.set(false);
        this.cargarDatos();
      },
      error: (err: unknown) => {
        this.error.set(err instanceof HttpError ? err.message : 'No se pudo guardar el movimiento');
        this.guardando.set(false);
      },
    });
  }

  protected empezarEdicion(m: MovimientoResponse): void {
    this.editandoId.set(m.id);
    this.formMovimiento.setValue({
      cuentaId: String(m.cuentaId),
      tipo: m.tipo,
      categoriaId: m.categoriaId ? String(m.categoriaId) : '',
      monto: Number(m.monto),
      descripcion: m.descripcion ?? '',
      fecha: m.fecha ?? '',
    });
    this.tipoRegistro.set(m.tipo);
    this.mostrandoForm.set(true);
  }

  protected cancelarEdicion(): void {
    this.editandoId.set(null);
    this.tipoRegistro.set('EGRESO');
    this.formMovimiento.reset({
      cuentaId: '',
      tipo: 'EGRESO',
      categoriaId: '',
      monto: 0,
      descripcion: '',
      fecha: '',
    });
  }

  protected pedirEliminar(m: MovimientoResponse): void {
    this.error.set(null);
    this.movimientoAEliminar.set(m);
  }

  protected cancelarEliminar(): void {
    if (this.eliminando()) return;
    this.movimientoAEliminar.set(null);
  }

  protected confirmarEliminar(): void {
    const m = this.movimientoAEliminar();
    if (!m) return;

    this.eliminando.set(true);

    this.api.eliminarMovimiento(m.id).subscribe({
      next: () => {
        if (this.editandoId() === m.id) this.cancelarEdicion();
        this.movimientoAEliminar.set(null);
        this.eliminando.set(false);
        this.cargarDatos();
      },
      error: (err: unknown) => {
        this.error.set(err instanceof HttpError ? err.message : 'No se pudo eliminar el movimiento');
        this.movimientoAEliminar.set(null);
        this.eliminando.set(false);
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

  private programarCambioDeDia(): void {
    const ahora = new Date();
    const proximaMedianoche = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + 1);

    timer(proximaMedianoche.getTime() - ahora.getTime())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.fechaHoy.set(hoyIso());
        this.formMovimiento.controls.fecha.updateValueAndValidity();
        this.programarCambioDeDia();
      });
  }

  private cargarDatos(): void {
    this.cargando.set(true);
    this.error.set(null);

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
}
