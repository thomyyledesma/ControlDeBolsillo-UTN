import { Component, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { HttpError } from '../../core/http/http-error';
import {
  CuentaResponse,
  MetaAhorroRequest,
  MetaAhorroResponse,
  MovimientoMetaRequest,
} from '../../core/models';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';
import { Modal } from '../../shared/components/modal/modal';
import { formatearFecha, formatearMoneda } from '../../shared/utils/format';
import { MetasClient } from './metas-client';
import { fechaNoPasada, hoyISO } from '../../shared/utils/fechas';

type EstadoFiltro = 'TODAS' | 'CUMPLIDAS' | 'EN_PROGRESO';
type AccionMeta = 'DEPOSITAR' | 'RETIRAR';

@Component({
  selector: 'app-metas',
  imports: [ReactiveFormsModule, Modal, ConfirmDialog],
  templateUrl: './metas.html',
  styleUrl: './metas.css',
})
export class Metas {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly client = inject(MetasClient);
  protected readonly hoy = hoyISO();

  protected readonly metas = signal<MetaAhorroResponse[]>([]);
  protected readonly cuentas = signal<CuentaResponse[]>([]);

  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly exito = signal<string | null>(null);

  protected readonly estadoFiltro = signal<EstadoFiltro>('TODAS');

  protected readonly mostrandoFormMeta = signal(false);
  protected readonly guardandoMeta = signal(false);
  protected readonly editandoId = signal<number | null>(null);

  protected readonly metaAEliminar = signal<MetaAhorroResponse | null>(null);
  protected readonly eliminando = signal(false);

  protected readonly metaOperando = signal<MetaAhorroResponse | null>(null);
  protected readonly accionMovimiento = signal<AccionMeta | null>(null);
  protected readonly guardandoMovimiento = signal(false);

  protected readonly cuentasActivas = computed(() => this.cuentas().filter((c) => c.activa));

  protected readonly tituloMovimiento = computed(() =>
    this.accionMovimiento() === 'DEPOSITAR' ? 'Depositar en meta' : 'Retirar de meta',
  );

  protected readonly cuentaAsignadaNombre = computed(() => {
    const meta = this.metaOperando();
    if (!meta || meta.cuentaId === null) return null;
    return this.nombreCuenta(meta.cuentaId);
  });

  protected readonly formMeta = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    montoObjetivo: [0, [Validators.required, Validators.min(0.01)]],
    fechaLimite: ['', [fechaNoPasada]],
    cuentaId: [''],
  });

  protected readonly formMovimiento = this.fb.group({
    monto: [0, [Validators.required, Validators.min(0.01)]],
    cuentaId: [''],
  });

  protected readonly moneda = formatearMoneda;
  protected readonly fecha = formatearFecha;

  constructor() {
    this.cargarTodo();
  }

  protected cambiarFiltro(valor: string): void {
    this.estadoFiltro.set(valor as EstadoFiltro);
    this.cargarTodo();
  }

  protected abrirFormCrear(): void {
    this.editandoId.set(null);
    this.formMeta.reset({
      nombre: '',
      montoObjetivo: 0,
      fechaLimite: '',
      cuentaId: '',
    });
    this.error.set(null);
    this.exito.set(null);
    this.mostrandoFormMeta.set(true);
  }

  protected abrirFormEditar(meta: MetaAhorroResponse): void {
    this.editandoId.set(meta.id);
    this.formMeta.reset({
      nombre: meta.nombre,
      montoObjetivo: Number(meta.montoObjetivo),
      fechaLimite: meta.fechaLimite ?? '',
      cuentaId: meta.cuentaId !== null ? String(meta.cuentaId) : '',
    });
    this.error.set(null);
    this.exito.set(null);
    this.mostrandoFormMeta.set(true);
  }

  protected cerrarFormMeta(): void {
    if (this.guardandoMeta()) return;
    this.mostrandoFormMeta.set(false);
  }

  protected guardarMeta(): void {
    if (this.formMeta.invalid) {
      this.formMeta.markAllAsTouched();
      return;
    }

    const raw = this.formMeta.getRawValue();
    const dto: MetaAhorroRequest = {
      nombre: raw.nombre.trim(),
      montoObjetivo: Number(raw.montoObjetivo),
      fechaLimite: raw.fechaLimite || undefined,
      cuentaId: raw.cuentaId ? Number(raw.cuentaId) : undefined,
    };

    this.guardandoMeta.set(true);
    this.error.set(null);
    this.exito.set(null);

    const id = this.editandoId();
    const req$ = id === null ? this.client.crear(dto) : this.client.actualizar(id, dto);

    req$.subscribe({
      next: () => {
        this.guardandoMeta.set(false);
        this.mostrandoFormMeta.set(false);
        this.exito.set(
          id === null ? 'Meta creada correctamente.' : 'Meta actualizada correctamente.',
        );
        this.cargarTodo();
      },
      error: (err: unknown) => {
        this.error.set(err instanceof HttpError ? err.message : 'No se pudo guardar la meta');
        this.guardandoMeta.set(false);
      },
    });
  }

  protected pedirEliminar(meta: MetaAhorroResponse): void {
    this.error.set(null);
    this.metaAEliminar.set(meta);
  }

  protected cancelarEliminar(): void {
    if (this.eliminando()) return;
    this.metaAEliminar.set(null);
  }

  protected confirmarEliminar(): void {
    const meta = this.metaAEliminar();
    if (!meta) return;

    this.eliminando.set(true);
    this.error.set(null);
    this.exito.set(null);

    this.client.eliminar(meta.id).subscribe({
      next: () => {
        this.eliminando.set(false);
        this.metaAEliminar.set(null);
        this.exito.set('Meta eliminada correctamente.');
        this.cargarTodo();
      },
      error: (err: unknown) => {
        this.error.set(err instanceof HttpError ? err.message : 'No se pudo eliminar la meta');
        this.eliminando.set(false);
        this.metaAEliminar.set(null);
      },
    });
  }

  protected abrirDepositar(meta: MetaAhorroResponse): void {
    this.abrirMovimiento(meta, 'DEPOSITAR');
  }

  protected abrirRetirar(meta: MetaAhorroResponse): void {
    this.abrirMovimiento(meta, 'RETIRAR');
  }

  protected cerrarMovimiento(): void {
    if (this.guardandoMovimiento()) return;
    this.metaOperando.set(null);
    this.accionMovimiento.set(null);
    this.formMovimiento.reset({ monto: 0, cuentaId: '' });
  }

  protected guardarMovimiento(): void {
    if (this.formMovimiento.invalid) {
      this.formMovimiento.markAllAsTouched();
      return;
    }

    const meta = this.metaOperando();
    const accion = this.accionMovimiento();
    if (!meta || !accion) return;

    const raw = this.formMovimiento.getRawValue();
    const dto: MovimientoMetaRequest = {
      monto: Number(raw.monto),
      cuentaId: raw.cuentaId ? Number(raw.cuentaId) : undefined,
    };

    this.guardandoMovimiento.set(true);
    this.error.set(null);
    this.exito.set(null);

    const req$ =
      accion === 'DEPOSITAR'
        ? this.client.depositar(meta.id, dto)
        : this.client.retirar(meta.id, dto);

    req$.subscribe({
      next: () => {
        this.guardandoMovimiento.set(false);
        this.cerrarMovimiento();
        this.exito.set(
          accion === 'DEPOSITAR'
            ? 'Depósito registrado correctamente.'
            : 'Retiro registrado correctamente.',
        );
        this.cargarTodo();
      },
      error: (err: unknown) => {
        this.error.set(
          err instanceof HttpError ? err.message : 'No se pudo registrar la operación',
        );
        this.guardandoMovimiento.set(false);
      },
    });
  }

  protected porcentaje(meta: MetaAhorroResponse): number {
    return Math.max(0, Math.min(100, Math.round(Number(meta.porcentajeProgreso ?? 0))));
  }

  protected pendiente(meta: MetaAhorroResponse): number {
    return Math.max(0, Number(meta.montoObjetivo) - Number(meta.montoActual));
  }

  protected nombreCuenta(cuentaId: number | null): string {
    if (cuentaId === null) return 'Sin cuenta fija';
    const cuenta = this.cuentas().find((c) => c.id === cuentaId);
    return cuenta?.nombre ?? `Cuenta #${cuentaId}`;
  }

  private abrirMovimiento(meta: MetaAhorroResponse, accion: AccionMeta): void {
    this.metaOperando.set(meta);
    this.accionMovimiento.set(accion);

    const cuentaCtrl = this.formMovimiento.controls.cuentaId;

    if (meta.cuentaId === null) {
      cuentaCtrl.setValidators([Validators.required]);
      cuentaCtrl.setValue('');
    } else {
      cuentaCtrl.clearValidators();
      cuentaCtrl.setValue(String(meta.cuentaId));
    }

    cuentaCtrl.updateValueAndValidity();
    this.formMovimiento.controls.monto.setValue(0);

    this.error.set(null);
    this.exito.set(null);
  }

  private cargarTodo(): void {
    this.cargando.set(true);
    this.error.set(null);

    forkJoin({
      metas: this.client.listar(this.mapearCumplidaParam()),
      cuentas: this.client.listarCuentas(),
    }).subscribe({
      next: ({ metas, cuentas }) => {
        this.metas.set(metas);
        this.cuentas.set(cuentas);
        this.cargando.set(false);
      },
      error: (err: unknown) => {
        this.error.set(err instanceof HttpError ? err.message : 'No se pudieron cargar las metas');
        this.cargando.set(false);
      },
    });
  }

  private mapearCumplidaParam(): boolean | undefined {
    const estado = this.estadoFiltro();
    if (estado === 'CUMPLIDAS') return true;
    if (estado === 'EN_PROGRESO') return false;
    return undefined;
  }
}
