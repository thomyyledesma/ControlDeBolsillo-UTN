import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';
import { HttpError } from '../../../core/http/http-error';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
})
export class Login {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  protected readonly error = signal<string | null>(null);
  protected readonly enviando = signal(false);

  protected enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.error.set(null);
    this.enviando.set(true);

    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => void this.router.navigateByUrl('/'),
      error: (err: unknown) => {
        this.error.set(err instanceof HttpError ? err.message : 'No se pudo iniciar sesión');
        this.enviando.set(false);
      },
    });
  }
}
