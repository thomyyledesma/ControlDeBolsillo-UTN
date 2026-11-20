import { Component, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { HttpError } from '../../core/http/http-error';
import { CategoriaResponse, PresupuestoRequest, PresupuestoResponse } from '../../core/models';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';
import { Modal } from '../../shared/components/modal/modal';
import { formatearMoneda } from '../../shared/utils/format';
import { PresupuestosClient } from './presupuestos-client';

@Component({
  selector: 'app-presupuestos',
  imports: [ReactiveFormsModule, Modal, ConfirmDialog],
  templateUrl: './presupuestos.html',
  styleUrl: './presupuestos.css',
})
export class Presupuestos {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly client = inject(PresupuestosClient);
  private readonly hoy = new Date();

  protected readonly presupuestos = signal<PresupuestoResponse[]>([]);
  protected readonly categorias = signal<CategoriaResponse[]>([]);

  protected readonly cargando = signal(true);
  protected readonly guardando = signal(false);
  protected readonly eliminando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly exito = signal<string | null>(null);

  protected readonly mostrandoForm = signal(false);
  protected readonly editandoId = signal<number | null>(null);
  protected readonly presupuestoAEliminar = signal<PresupuestoResponse | null>(null);

  protected readonly form = this.fb.group({
    categoriaId: ['', [Validators.required]],
    montoLimite: [0, [Validators.required, Validators.min(0.01)]],
    mes: [this.hoy.getMonth() + 1, [Validators.required, Validators.min(1), Validators.max(12)]],
    anio: [this.hoy.getFullYear(), [Validators.required, Validators.min(2000)]],
  });

  protected readonly presupuestosOrdenados = computed(() =>
    [...this.presupuestos()].sort(
      (a, b) =>
        b.anio - a.anio || b.mes - a.mes || a.categoriaNombre.localeCompare(b.categoriaNombre),
    ),
  );

  protected readonly moneda = formatearMoneda;

  protected readonly meses = [
    { valor: 1, nombre: 'Enero' },
    { valor: 2, nombre: 'Febrero' },
    { valor: 3, nombre: 'Marzo' },
    { valor: 4, nombre: 'Abril' },
    { valor: 5, nombre: 'Mayo' },
    { valor: 6, nombre: 'Junio' },
    { valor: 7, nombre: 'Julio' },
    { valor: 8, nombre: 'Agosto' },
    { valor: 9, nombre: 'Septiembre' },
    { valor: 10, nombre: 'Octubre' },
    { valor: 11, nombre: 'Noviembre' },
    { valor: 12, nombre: 'Diciembre' },
  ];

  protected anios(): number[] {
    const actual = this.hoy.getFullYear();
    const lista = [actual, actual + 1, actual + 2, actual + 3];
    const elegido = Number(this.form.controls.anio.value);
    return lista.includes(elegido) ? lista : [elegido, ...lista].sort((a, b) => a - b);
  }

  protected mesPasado(mes: number): boolean {
    return (
      this.editandoId() === null &&
      Number(this.form.controls.anio.value) === this.hoy.getFullYear() &&
      mes < this.hoy.getMonth() + 1
    );
  }

  private periodoPasado(mes: number, anio: number): boolean {
    return anio * 12 + mes < this.hoy.getFullYear() * 12 + (this.hoy.getMonth() + 1);
  }

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
        this.error.set(
          err instanceof HttpError ? err.message : 'No se pudieron cargar los presupuestos',
        );
        this.cargando.set(false);
      },
    });
  }

  protected abrirForm(): void {
    this.editandoId.set(null);
    this.form.reset({
      categoriaId: '',
      montoLimite: 0,
      mes: this.hoy.getMonth() + 1,
      anio: this.hoy.getFullYear(),
    });
    this.mostrandoForm.set(true);
    this.error.set(null);
    this.exito.set(null);
  }

  protected abrirEditar(p: PresupuestoResponse): void {
    this.editandoId.set(p.id);
    this.form.reset({
      categoriaId: String(p.categoriaId),
      montoLimite: Number(p.montoLimite),
      mes: Number(p.mes),
      anio: Number(p.anio),
    });
    this.mostrandoForm.set(true);
    this.error.set(null);
    this.exito.set(null);
  }

  protected cerrarForm(): void {
    if (this.guardando()) return;
    this.mostrandoForm.set(false);
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

    const id = this.editandoId();
    const original = this.presupuestos().find((p) => p.id === id);
    const cambioPeriodo = !original || original.mes !== dto.mes || original.anio !== dto.anio;
    if (cambioPeriodo && this.periodoPasado(dto.mes, dto.anio)) {
      this.error.set('No se puede definir un presupuesto para un mes que ya pasó.');
      return;
    }

    this.guardando.set(true);
    this.error.set(null);
    this.exito.set(null);
    const req$ = id === null ? this.client.crear(dto) : this.client.actualizar(id, dto);

    req$.subscribe({
      next: () => {
        this.guardando.set(false);
        this.mostrandoForm.set(false);
        this.exito.set(
          id === null
            ? 'Presupuesto creado correctamente.'
            : 'Presupuesto actualizado correctamente.',
        );
        this.cargarTodo();
      },
      error: (err: unknown) => {
        this.error.set(
          err instanceof HttpError ? err.message : 'No se pudo guardar el presupuesto',
        );
        this.guardando.set(false);
      },
    });
  }

  protected pedirEliminar(p: PresupuestoResponse): void {
    this.error.set(null);
    this.presupuestoAEliminar.set(p);
  }

  protected cancelarEliminar(): void {
    if (this.eliminando()) return;
    this.presupuestoAEliminar.set(null);
  }

  protected confirmarEliminar(): void {
    const p = this.presupuestoAEliminar();
    if (!p) return;

    this.eliminando.set(true);
    this.client.eliminar(p.id).subscribe({
      next: () => {
        this.eliminando.set(false);
        this.presupuestoAEliminar.set(null);
        if (this.editandoId() === p.id) this.mostrandoForm.set(false);
        this.exito.set('Presupuesto eliminado correctamente.');
        this.cargarTodo();
      },
      error: (err: unknown) => {
        this.error.set(
          err instanceof HttpError ? err.message : 'No se pudo eliminar el presupuesto',
        );
        this.eliminando.set(false);
        this.presupuestoAEliminar.set(null);
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
