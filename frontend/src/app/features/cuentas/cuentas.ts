import { Component, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { HttpError } from '../../core/http/http-error';
import { CuentaResponse, TipoCuenta } from '../../core/models';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';
import { Modal } from '../../shared/components/modal/modal';
import { formatearMoneda, formatearTipoCuenta } from '../../shared/utils/format';
import { CuentasClient } from './cuentas-client';

@Component({
  imports: [ReactiveFormsModule, Modal, ConfirmDialog],
  selector: 'app-cuentas',
  styleUrl: './cuentas.css',
  templateUrl: './cuentas.html',
})
export class Cuentas {
  private readonly client = inject(CuentasClient);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly cuentas = signal<CuentaResponse[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);

  // Estado del modal "Nueva cuenta"
  protected readonly mostrandoForm = signal(false);
  protected readonly guardando = signal(false);
  protected readonly errorForm = signal<string | null>(null);
  protected readonly editandoId = signal<number | null>(null);
  protected readonly cuentaAEliminar = signal<CuentaResponse | null>(null);
  protected readonly eliminando = signal(false);
  protected readonly mostrandoTransferencia = signal(false);
  protected readonly transfiriendo = signal(false);
  protected readonly errorTransferencia = signal<string | null>(null);
  protected readonly exito = signal<string | null>(null);

  protected readonly cuentasActivas = computed(() => this.cuentas().filter((c) => c.activa));

  protected readonly tipos: TipoCuenta[] = ['EFECTIVO', 'BANCO', 'BILLETERA_VIRTUAL', 'INVERSION'];

  // Mismas reglas que valida el backend en CuentaRequestDTO.
  protected readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    saldo: [0, [Validators.required, Validators.min(0)]],
    tipoCuenta: ['EFECTIVO' as TipoCuenta, [Validators.required]],
  });

  protected readonly transferForm = this.fb.group({
    cuentaOrigenId: [0, [Validators.min(1)]],
    cuentaDestinoId: [0, [Validators.min(1)]],
    monto: [0, [Validators.required, Validators.min(0.01)]],
  });

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
        this.error.set(
          err instanceof HttpError ? err.message : 'No se pudieron cargar las cuentas',
        );
        this.cargando.set(false);
      },
    });
  }

  protected abrirForm(): void {
    this.editandoId.set(null);
    this.form.reset({ nombre: '', saldo: 0, tipoCuenta: 'EFECTIVO' });
    this.errorForm.set(null);
    this.mostrandoForm.set(true);
  }

  protected abrirEditar(cuenta: CuentaResponse): void {
    this.editandoId.set(cuenta.id);
    this.form.reset({ nombre: cuenta.nombre, saldo: cuenta.saldo, tipoCuenta: cuenta.tipoCuenta });
    this.errorForm.set(null);
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

    this.guardando.set(true);
    this.errorForm.set(null);

    const { nombre, saldo, tipoCuenta } = this.form.getRawValue();
    const id = this.editandoId();

    const peticion =
      id === null
        ? this.client.crear({ nombre, saldo, tipoCuenta })
        : this.client.actualizar(id, { nombre, tipoCuenta });

    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.mostrandoForm.set(false);
        this.cargar();
      },
      error: (err: unknown) => {
        this.errorForm.set(err instanceof HttpError ? err.message : 'No se pudo guardar la cuenta');
        this.guardando.set(false);
      },
    });
  }

  protected pedirEliminar(cuenta: CuentaResponse): void {
    this.error.set(null);
    this.cuentaAEliminar.set(cuenta);
  }

  protected cancelarEliminar(): void {
    if (this.eliminando()) return;
    this.cuentaAEliminar.set(null);
  }

  protected confirmarEliminar(): void {
    const cuenta = this.cuentaAEliminar();
    if (!cuenta) return;

    this.eliminando.set(true);

    this.client.eliminar(cuenta.id).subscribe({
      next: () => {
        this.eliminando.set(false);
        this.cuentaAEliminar.set(null);
        this.cargar();
      },
      error: (err: unknown) => {
        this.error.set(err instanceof HttpError ? err.message : 'No se pudo eliminar la cuenta');
        this.eliminando.set(false);
        this.cuentaAEliminar.set(null);
      },
    });
  }

  protected abrirTransferencia(): void {
    this.transferForm.reset({ cuentaOrigenId: 0, cuentaDestinoId: 0, monto: 0 });
    this.errorTransferencia.set(null);
    this.exito.set(null);
    this.mostrandoTransferencia.set(true);
  }

  protected cerrarTransferencia(): void {
    if (this.transfiriendo()) return;
    this.mostrandoTransferencia.set(false);
  }

  protected transferir(): void {
    if (this.transferForm.invalid) {
      this.transferForm.markAllAsTouched();
      return;
    }

    const dto = this.transferForm.getRawValue();

    if (dto.cuentaOrigenId === dto.cuentaDestinoId) {
      this.errorTransferencia.set('La cuenta de origen y la de destino deben ser distintas');
      return;
    }

    this.transfiriendo.set(true);
    this.errorTransferencia.set(null);

    this.client.transferir(dto).subscribe({
      next: () => {
        this.transfiriendo.set(false);
        this.mostrandoTransferencia.set(false);
        this.exito.set('Transferencia realizada correctamente.');
        this.cargar();
      },
      error: (err: unknown) => {
        this.errorTransferencia.set(
          err instanceof HttpError ? err.message : 'No se pudo realizar la transferencia',
        );
        this.transfiriendo.set(false);
      },
    });
  }
}
