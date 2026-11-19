import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { HttpError } from '../../core/http/http-error';
import {
  CategoriaResponse,
  CuentaResponse,
  ReglaRecurrenteRequest,
  ReglaRecurrenteResponse,
  TipoMovimiento,
} from '../../core/models';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';
import { Modal } from '../../shared/components/modal/modal';
import { formatearFecha, formatearMoneda } from '../../shared/utils/format';
import { ReglasRecurrentesClient } from './reglas-recurrentes-client';

@Component({
  selector: 'app-reglas-recurrentes',
  imports: [ReactiveFormsModule, Modal, ConfirmDialog],
  templateUrl: './reglas-recurrentes.html',
  styleUrl: './reglas-recurrentes.css',
})
export class ReglasRecurrentes {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly client = inject(ReglasRecurrentesClient);

  protected readonly reglas = signal<ReglaRecurrenteResponse[]>([]);
  protected readonly cuentas = signal<CuentaResponse[]>([]);
  protected readonly categorias = signal<CategoriaResponse[]>([]);

  protected readonly cargando = signal(true);
  protected readonly guardando = signal(false);
  protected readonly desactivando = signal(false);
  protected readonly ejecutandoId = signal<number | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly exito = signal<string | null>(null);

  protected readonly mostrandoForm = signal(false);
  protected readonly reglaADesactivar = signal<ReglaRecurrenteResponse | null>(null);

  private readonly tipoSeleccionado = signal<TipoMovimiento>('EGRESO');

  protected readonly frecuencias = [
    { dias: 7, label: 'Semanal (cada 7 días)' },
    { dias: 15, label: 'Quincenal (cada 15 días)' },
    { dias: 30, label: 'Mensual (cada 30 días)' },
  ];

  protected readonly reglasOrdenadas = computed(() =>
    [...this.reglas()].sort((a, b) => Number(b.activa) - Number(a.activa) || b.id - a.id),
  );

  protected readonly cuentasActivas = computed(() => this.cuentas().filter((c) => c.activa));

  protected readonly categoriasDelTipo = computed(() =>
    this.categorias().filter((c) => c.tipo === this.tipoSeleccionado()),
  );

  protected readonly form = this.fb.group({
    cuentaId: ['', [Validators.required]],
    tipo: ['EGRESO' as TipoMovimiento, [Validators.required]],
    categoriaId: ['', [Validators.required]],
    descripcion: ['', [Validators.required, Validators.maxLength(120)]],
    monto: [0, [Validators.required, Validators.min(0.01)]],
    esFamiliar: [false],
    frecuenciaDias: [30, [Validators.required, Validators.min(1)]],
    proximaEjecucion: [this.hoyIso(), [Validators.required]],
  });

  protected readonly moneda = formatearMoneda;
  protected readonly fecha = formatearFecha;

  constructor() {
    this.form.controls.tipo.valueChanges.pipe(takeUntilDestroyed()).subscribe((tipo) => {
      const t = (tipo ?? 'EGRESO') as TipoMovimiento;
      this.tipoSeleccionado.set(t);
      this.form.controls.categoriaId.setValue('');
    });

    this.cargarDatos();
  }

  protected abrirForm(): void {
    this.form.reset({
      cuentaId: '',
      tipo: 'EGRESO',
      categoriaId: '',
      descripcion: '',
      monto: 0,
      esFamiliar: false,
      frecuenciaDias: 30,
      proximaEjecucion: this.hoyIso(),
    });
    this.tipoSeleccionado.set('EGRESO');
    this.error.set(null);
    this.exito.set(null);
    this.mostrandoForm.set(true);
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
    const dto: ReglaRecurrenteRequest = {
      cuentaId: Number(raw.cuentaId),
      categoriaId: Number(raw.categoriaId),
      tipo: raw.tipo,
      descripcion: raw.descripcion.trim(),
      monto: Number(raw.monto),
      esFamiliar: raw.esFamiliar,
      frecuenciaDias: Number(raw.frecuenciaDias),
      proximaEjecucion: raw.proximaEjecucion,
    };

    this.guardando.set(true);
    this.error.set(null);
    this.exito.set(null);

    this.client.crearRegla(dto).subscribe({
      next: () => {
        this.guardando.set(false);
        this.mostrandoForm.set(false);
        this.exito.set('Regla creada correctamente.');
        this.cargarDatos();
      },
      error: (err: unknown) => {
        this.error.set(err instanceof HttpError ? err.message : 'No se pudo crear la regla');
        this.guardando.set(false);
      },
    });
  }

  protected pedirDesactivar(regla: ReglaRecurrenteResponse): void {
    this.error.set(null);
    this.reglaADesactivar.set(regla);
  }

  protected cancelarDesactivar(): void {
    if (this.desactivando()) return;
    this.reglaADesactivar.set(null);
  }

  protected confirmarDesactivar(): void {
    const regla = this.reglaADesactivar();
    if (!regla) return;

    this.desactivando.set(true);
    this.error.set(null);
    this.exito.set(null);

    this.client.desactivarRegla(regla.id).subscribe({
      next: () => {
        this.desactivando.set(false);
        this.reglaADesactivar.set(null);
        this.exito.set('Regla desactivada correctamente.');
        this.cargarDatos();
      },
      error: (err: unknown) => {
        this.error.set(err instanceof HttpError ? err.message : 'No se pudo desactivar la regla');
        this.desactivando.set(false);
        this.reglaADesactivar.set(null);
      },
    });
  }

  protected ejecutarAhora(regla: ReglaRecurrenteResponse): void {
    if (this.ejecutandoId() !== null) return;

    this.ejecutandoId.set(regla.id);
    this.error.set(null);
    this.exito.set(null);

    this.client.ejecutarAhora(regla.id).subscribe({
      next: () => {
        this.ejecutandoId.set(null);
        this.exito.set(
          `Se ejecutó «${regla.descripcion}»: el movimiento quedó registrado y el aviso por mail está en camino.`,
        );
        this.cargarDatos();
      },
      error: (err: unknown) => {
        this.error.set(err instanceof HttpError ? err.message : 'No se pudo ejecutar la regla');
        this.ejecutandoId.set(null);
      },
    });
  }

  protected frecuenciaTexto(dias: number): string {
    if (dias === 7) return 'Semanal';
    if (dias === 15) return 'Quincenal';
    if (dias === 30) return 'Mensual';
    return `Cada ${dias} días`;
  }

  private cargarDatos(): void {
    this.cargando.set(true);
    this.error.set(null);

    forkJoin({
      reglas: this.client.listarReglas(),
      cuentas: this.client.listarCuentas(),
      categorias: this.client.listarCategorias(),
    }).subscribe({
      next: ({ reglas, cuentas, categorias }) => {
        this.reglas.set(reglas);
        this.cuentas.set(cuentas);
        this.categorias.set(categorias);
        this.cargando.set(false);
      },
      error: (err: unknown) => {
        this.error.set(err instanceof HttpError ? err.message : 'No se pudieron cargar las reglas');
        this.cargando.set(false);
      },
    });
  }

  private hoyIso(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
