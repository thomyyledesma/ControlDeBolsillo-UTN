import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';
import { HttpError } from '../../core/http/http-error';
import { PlanesClient } from './planes-client';
import { interpretarRetorno } from './planes-pago';

@Component({
  imports: [],
  selector: 'app-planes',
  styleUrl: './planes.css',
  templateUrl: './planes.html',
})
export class Planes {
  protected readonly auth = inject(AuthService);
  private readonly client = inject(PlanesClient);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly procesando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly aviso = signal<string | null>(null);
  protected readonly exito = signal(false);

  constructor() {
    this.procesarRetorno();
  }

  /** Redirige al checkout de Mercado Pago. */
  protected pagar(): void {
    this.procesando.set(true);
    this.error.set(null);
    this.aviso.set(null);
    this.exito.set(false);

    this.client.crearPagoPremium().subscribe({
      next: (pago) => window.location.assign(pago.url),
      error: (err: unknown) => {
        this.error.set(err instanceof HttpError ? err.message : 'No se pudo iniciar el pago');
        this.procesando.set(false);
      },
    });
  }

  private procesarRetorno(): void {
    const resultado = interpretarRetorno(this.route.snapshot.queryParamMap);
    if (resultado.tipo === 'ninguno') return;

    void this.router.navigate([], { queryParams: {}, replaceUrl: true });

    switch (resultado.tipo) {
      case 'pendiente':
        this.aviso.set(
          'Tu pago está pendiente de acreditación. Cuando se apruebe, tu plan se actualiza.',
        );
        break;
      case 'rechazado':
        this.error.set('El pago no se completó. Podés intentarlo de nuevo cuando quieras.');
        break;
      case 'aprobado':
        this.confirmar(resultado.paymentId);
        break;
    }
  }

  private confirmar(paymentId: string): void {
    this.procesando.set(true);
    this.client.confirmarPago(paymentId).subscribe({
      next: (usuario) => {
        this.auth.usuario.set(usuario);
        this.procesando.set(false);
        this.exito.set(true);
      },
      error: (err: unknown) => {
        this.error.set(err instanceof HttpError ? err.message : 'No se pudo confirmar el pago');
        this.procesando.set(false);
      },
    });
  }
}
