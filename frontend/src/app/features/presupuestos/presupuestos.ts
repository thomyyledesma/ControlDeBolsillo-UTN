import { Component, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { HttpError } from '../../core/http/http-error';
import { PresupuestoResponse, CategoriaResponse, PresupuestoRequest } from '../../core/models';
import { formatearMoneda } from '../../shared/utils/format';
import { PresupuestosClient } from './presupuestos-client';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-presupuestos',
  styleUrl: './presupuestos.css',
  templateUrl: './presupuestos.html',
})
export class Presupuestos {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly client = inject(PresupuestosClient);
  private readonly hoy = new Date();

  protected readonly presupuestos = signal<PresupuestoResponse[]>([]);
  protected readonly categorias = signal<CategoriaResponse[]>([]);

  protected readonly cargando = signal(true);
  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly exito = signal<string | null>(null);

  protected readonly editandoId = signal<number | null>(null);

  protected readonly form = this.fb.group({
    categoriaId: ['', [Validators.required]],
    montoLimite: [0, [Validators.required, Validators.min(0.01)]],
    mes: [this.hoy.getMonth() + 1, [Validators.required, Validators.min(1), Validators.max(12)]],
    anio: [this.hoy.getFullYear(), [Validators.required, Validators.min(2000)]],
  });

  protected readonly presupuestosOrdenados = computed(() =>
    [...this.presupuestos()].sort(
      (a, b) =>
        b.anio - a.anio ||
        b.mes - a.mes ||
        a.categoriaNombre.localeCompare(b.categoriaNombre),
    ),
  );

  protected readonly moneda = formatearMoneda;

  constructor() {
    this.cargarTodo();
  }

  private cargarTodo(): void {
    this.cargando.set(true);
    this.error.set(null);

    forkJoin({
      presupuestos: this.client.listar(),
      categorias: this.client.listarCategoriasEgreso(),
    }).subscribe({
      next: ({ presupuestos, categorias }) => {
        this.presupuestos.set(presupuestos);
        this.categorias.set(categorias);
        this.cargando.set(false);
      },
      error: (err: unknown) => {
        this.error.set(err instanceof HttpError ? err.message : 'No se pudieron cargar los presupuestos');
        this.cargando.set(false);
      },
    });
  }

  protected guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const dto: PresupuestoRequest = {
      categoriaId: Number(raw.categoriaId),
      montoLimite: Number(raw.montoLimite),
      mes: Number(raw.mes),
      anio: Number(raw.anio),
    };

    this.guardando.set(true);
    this.error.set(null);
    this.exito.set(null);

    const id = this.editandoId();
    const req$ = id === null ? this.client.crear(dto) : this.client.actualizar(id, dto);

    req$.subscribe({
      next: () => {
        this.guardando.set(false);
        this.exito.set(id === null ? 'Presupuesto creado correctamente.' : 'Presupuesto actualizado correctamente.');
        this.cancelarEdicion();
        this.cargarTodo();
      },
      error: (err: unknown) => {
        this.error.set(err instanceof HttpError ? err.message : 'No se pudo guardar el presupuesto');
        this.guardando.set(false);
      },
    });
  }

  protected empezarEdicion(p: PresupuestoResponse): void {
    this.editandoId.set(p.id);
    this.exito.set(null);
    this.error.set(null);

    this.form.reset({
      categoriaId: String(p.categoriaId),
      montoLimite: Number(p.montoLimite),
      mes: Number(p.mes),
      anio: Number(p.anio),
    });
  }

  protected cancelarEdicion(): void {
    this.editandoId.set(null);
    this.form.reset({
      categoriaId: '',
      montoLimite: 0,
      mes: this.hoy.getMonth() + 1,
      anio: this.hoy.getFullYear(),
    });
  }

  protected eliminar(p: PresupuestoResponse): void {
    const ok = confirm(`¿Eliminar el presupuesto de "${p.categoriaNombre}" (${this.periodo(p)})?`);
    if (!ok) return;

    this.error.set(null);
    this.exito.set(null);

    this.client.eliminar(p.id).subscribe({
      next: () => {
        if (this.editandoId() === p.id) this.cancelarEdicion();
        this.exito.set('Presupuesto eliminado correctamente.');
        this.cargarTodo();
      },
      error: (err: unknown) => {
        this.error.set(err instanceof HttpError ? err.message : 'No se pudo eliminar el presupuesto');
      },
    });
  }

  protected periodo(p: PresupuestoResponse): string {
    return `${String(p.mes).padStart(2, '0')}/${p.anio}`;
  }

  private limite(p: PresupuestoResponse): number {
    return Number(p.montoLimite ?? 0);
  }

  private consumido(p: PresupuestoResponse): number {
    return Number(p.montoConsumido ?? 0);
  }

  protected porcentajeReal(p: PresupuestoResponse): number {
    const limite = this.limite(p);
    if (limite <= 0) return 0;
    return (this.consumido(p) / limite) * 100;
  }

  protected barraPorcentaje(p: PresupuestoResponse): number {
    return Math.max(0, Math.min(100, this.porcentajeReal(p)));
  }

  protected porcentajeTexto(p: PresupuestoResponse): string {
    return `${Math.round(this.porcentajeReal(p))}%`;
  }

  protected restante(p: PresupuestoResponse): number {
    return Math.max(0, this.limite(p) - this.consumido(p));
  }

  protected excedido(p: PresupuestoResponse): number {
    return Math.max(0, this.consumido(p) - this.limite(p));
  }

  protected estaExcedido(p: PresupuestoResponse): boolean {
    return this.consumido(p) > this.limite(p);
  }
}
