import { Component, inject } from '@angular/core';

import { AuthService } from '../../core/auth/auth.service';

/** Pantalla de resumen. Por ahora es provisoria: se completa con patrimonio y gráficos. */
@Component({
  selector: 'app-dashboard',
  template: `
    <header class="contenido-header">
      <h1>Resumen</h1>
      <p>Hola, {{ auth.usuario()?.nombre }}. Acá va a ir tu patrimonio, tus gastos y tus metas.</p>
    </header>
  `,
})
export class Dashboard {
  protected readonly auth = inject(AuthService);
}
