import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

import { HttpError } from '../../core/http/http-error';
import { AnalisisResponse } from '../../core/models';
import { AnalisisClient } from './analisis-client';
import { limpiarMarkdown, validarPeriodo } from './analisis-texto';

type Alcance = 'TODO' | 'PERIODO';

@Component({
  selector: 'app-analisis',
  imports: [FormsModule],
  styleUrl: './analisis.css',
  templateUrl: './analisis.html',
})
export class Analisis {
  private readonly client = inject(AnalisisClient);

  protected readonly alcance = signal<Alcance>('TODO');
  protected readonly desde = signal('');
  protected readonly hasta = signal('');

  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly resultado = signal<string | null>(null);

  protected readonly errorPeriodo = computed(() =>
    this.alcance() === 'PERIODO' && (this.desde() || this.hasta())
      ? validarPeriodo(this.desde(), this.hasta())
      : null,
  );

  protected readonly puedeGenerar = computed(
    () =>
      !this.cargando() &&
      (this.alcance() === 'TODO' || validarPeriodo(this.desde(), this.hasta()) === null),
  );

  protected generar(): void {
    if (!this.puedeGenerar()) return;

    const origen: Observable<AnalisisResponse> =
      this.alcance() === 'TODO'
        ? this.client.analizarTodo()
        : this.client.analizarPeriodo(this.desde(), this.hasta());

    this.cargando.set(true);
    this.error.set(null);
    this.resultado.set(null);

    origen.subscribe({
      next: (resp) => {
        this.resultado.set(limpiarMarkdown(resp.analisis));
        this.cargando.set(false);
      },
      error: (err: unknown) => {
        this.error.set(
          err instanceof HttpError
            ? err.message
            : 'No se pudo generar el análisis. Probá de nuevo.',
        );
        this.cargando.set(false);
      },
    });
  }
}
