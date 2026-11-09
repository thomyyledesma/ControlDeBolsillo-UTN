import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';
import { HttpError } from '../../../core/http/http-error';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
})
export class Register {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly form = this.fb.group({
    nombre: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    // Refleja la validación del backend (mínimo 6 caracteres).
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  protected readonly error = signal<string | null>(null);
  protected readonly enviando = signal(false);

  protected enviar(): void {
    if (this.form.controls.password.hasError('minlength')) {
      this.error.set('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.error.set(null);
    this.enviando.set(true);

    this.auth.register(this.form.getRawValue()).subscribe({
      // Al registrarse queda logueado y va al resumen.
      next: () => void this.router.navigateByUrl('/'),
      error: (err: unknown) => {
        this.error.set(err instanceof HttpError ? err.message : 'No se pudo crear la cuenta');
        this.enviando.set(false);
      },
    });
  }
}
