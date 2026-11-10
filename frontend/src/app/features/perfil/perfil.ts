import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { HttpError } from '../../core/http/http-error';
import { PerfilClient } from './perfil-client';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-perfil',
  styleUrl: './perfil.css',
  templateUrl: './perfil.html',
})
export class Perfil {
  protected readonly auth = inject(AuthService);
  private readonly client = inject(PerfilClient);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly exito = signal(false);

  protected readonly form = this.fb.group({
    nombre: [
      this.auth.usuario()?.nombre ?? '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(100)],
    ],
  });

  protected guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.error.set(null);
    this.exito.set(false);

    this.client.actualizar(this.form.getRawValue()).subscribe({
      next: (actualizado) => {
        this.auth.usuario.update((u) => (u ? { ...u, ...actualizado } : actualizado));
        this.guardando.set(false);
        this.exito.set(true);
      },
      error: (err: unknown) => {
        this.error.set(err instanceof HttpError ? err.message : 'No se pudo guardar el perfil');
        this.guardando.set(false);
      },
    });
  }
}
