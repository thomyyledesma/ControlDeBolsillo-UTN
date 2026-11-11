import { Component, inject, signal } from '@angular/core';

import { AuthService } from '../../core/auth/auth.service';
import { HttpError } from '../../core/http/http-error';
import { PlanesClient } from './planes-client';

@Component({
  imports: [],
  selector: 'app-planes',
  styleUrl: './planes.css',
  templateUrl: './planes.html',
})
export class Planes {
  protected readonly auth = inject(AuthService);
  private readonly client = inject(PlanesClient);

  protected readonly procesando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly exito = signal(false);

  protected pasarAPremium(): void {
    this.procesando.set(true);
    this.error.set(null);
    this.exito.set(false);

    this.client.pasarAPremium().subscribe({
      next: (usuario) => {
        this.auth.usuario.set(usuario);
        this.procesando.set(false);
        this.exito.set(true);
      },
      error: (err: unknown) => {
        this.error.set(err instanceof HttpError ? err.message : 'No se pudo cambiar de plan');
        this.procesando.set(false);
      },
    });
  }
}
