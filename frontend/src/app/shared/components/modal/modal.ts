import { Component, input, output } from '@angular/core';

@Component({
  host: { '(document:keydown.escape)': 'cerrar.emit' },
  selector: 'app-modal',
  templateUrl: './modal.html',
})
export class Modal {
  readonly titulo = input.required<string>();
  readonly subtitulo = input<string>();
  readonly cerrar = output<void>();
}
