import { Component, input, output } from '@angular/core';
import { Modal } from '../modal/modal';

@Component({
  imports: [Modal],
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.html',
  styles: [
    `
      .confirm-mensaje {
        color: var(--tinta-60);
        font-size: 15px;
        margin-bottom: 24px;
        line-height: 1.6;
      }
    `,
  ],
})
export class ConfirmDialog {
  readonly titulo = input.required<string>();
  readonly mensaje = input.required<string>();
  readonly textoConfirmar = input('Confirmar');
  readonly textoCancelar = input('Cancelar');
  readonly peligro = input(false);
  readonly procesando = input(false);

  readonly confirmar = output<void>();
  readonly cancelar = output<void>();
}
