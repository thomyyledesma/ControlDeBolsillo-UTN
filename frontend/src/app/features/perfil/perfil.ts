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

  protected readonly guardandoPassword = signal(false);
  protected readonly errorPassword = signal<string | null>(null);
  protected readonly exitoPassword = signal(false);

  protected readonly passwordForm = this.fb.group({
    passwordActual: ['', [Validators.required]],
    passwordNueva: ['', [Validators.required, Validators.minLength(6)]],
    passwordConfirmacion: ['', [Validators.required]],
  });

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

  protected cambiarPassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { passwordActual, passwordNueva, passwordConfirmacion } = this.passwordForm.getRawValue();

    if (passwordNueva !== passwordConfirmacion) {
      this.errorPassword.set('La contraseña nueva y su confirmación no coinciden');
      this.exitoPassword.set(false);
      return;
    }

    this.guardandoPassword.set(true);
    this.errorPassword.set(null);
    this.exitoPassword.set(false);

    this.client.cambiarPassword({ passwordActual, passwordNueva }).subscribe({
      next: () => {
        this.guardandoPassword.set(false);
        this.exitoPassword.set(true);
        this.passwordForm.reset();
      },
      error: (err: unknown) => {
        this.errorPassword.set(
          err instanceof HttpError ? err.message : 'No se pudo cambiar la contraseña',
        );
        this.guardandoPassword.set(false);
      },
    });
  }
}
