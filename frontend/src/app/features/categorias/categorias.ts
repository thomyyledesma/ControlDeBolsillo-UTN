import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpError } from '../../core/http/http-error';
import { CategoriaResponse, TipoMovimiento, CategoriaRequest } from '../../core/models';
import { CategoriasClient } from './categorias-client';
import { ThisReceiver } from '@angular/compiler';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-categorias',
  styleUrl: './categorias.css',
  templateUrl: './categorias.html',
})
export class Categorias {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly client = inject(CategoriasClient);

  protected readonly categorias = signal<CategoriaResponse[]>([]);
  protected readonly cargando = signal(true);
  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly editandoId = signal<number | null>(null);
  protected readonly filtroTipo = signal<'' | TipoMovimiento>('');

  protected readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    tipo: ['EGRESO' as TipoMovimiento, [Validators.required]],
    icono: [''],
  });

  constructor() {
    this.cargar();
  }

  private cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    const tipo = this.filtroTipo();

    this.client.listar(tipo ? tipo : undefined).subscribe({
      next: (data) => {
        this.categorias.set(data);
        this.cargando.set(false);
      },
      error: (err: unknown) => {
        this.error.set(
          err instanceof HttpError ? err.message : 'No se pudieron cargar las categorías',
        );
        this.cargando.set(false);
      },
    });
  }

  protected guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const dto: CategoriaRequest = {
      nombre: this.form.controls.nombre.value.trim(),
      tipo: this.form.controls.tipo.value,
      icono: this.form.controls.icono.value.trim() || undefined,
    };

    this.guardando.set(true);
    this.error.set(null);

    const id = this.editandoId();
    const req$ = id === null ? this.client.crear(dto) : this.client.actualizar(id, dto);

    req$.subscribe({
      next: () => {
        this.resetForm();
        this.cargar();
        this.guardando.set(false);
      },
      error: (err: unknown) => {
        this.error.set(err instanceof HttpError ? err.message : 'No se pudo guardar la categoría');
        this.guardando.set(false);
      },
    });
  }

  protected empezarEdicion(c: CategoriaResponse): void {
    this.editandoId.set(c.id);
    this.form.setValue({
      nombre: c.nombre,
      tipo: c.tipo,
      icono: c.icono ?? '',
    });
  }

  protected cancelarEdicion(): void {
    this.resetForm();
  }

  protected eliminar(c: CategoriaResponse): void {
    const ok = confirm(`¿Eliminar la categoría "${c.nombre}"?`);
    if (!ok) return;

    this.error.set(null);
    this.client.eliminar(c.id).subscribe({
      next: () => this.cargar(),
      error: (err: unknown) => {
        this.error.set(err instanceof HttpError ? err.message : 'No se pudo eliminar la categoría');
      },
    });
  }

  protected cambiarFiltroTipo(valor: string): void {
    this.filtroTipo.set(valor as '' | TipoMovimiento);
    this.cargar();
  }

  private resetForm(): void {
    this.editandoId.set(null);
    this.form.reset({
      nombre: '',
      tipo: 'EGRESO',
      icono: '',
    });
  }
}
