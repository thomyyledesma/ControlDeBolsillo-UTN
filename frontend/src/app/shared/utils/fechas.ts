import { AbstractControl, ValidationErrors } from '@angular/forms';

export function hoyISO(): string {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

export function fechaNoPasada(control: AbstractControl): ValidationErrors | null {
  const valor = control.value as string | null;
  return valor && valor < hoyISO() ? { fechaPasada: true } : null;
}
