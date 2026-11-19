import { AbstractControl, ValidationErrors } from '@angular/forms';

const FORMATO_FECHA_ISO = /^\d{4}-\d{2}-\d{2}$/;

export function hoyIso(): string {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return `${hoy.getFullYear()}-${mes}-${dia}`;
}

export function fechaNoFutura(control: AbstractControl): ValidationErrors | null {
  const valor = String(control.value ?? '').trim();
  if (!valor) return null;
  if (!FORMATO_FECHA_ISO.test(valor)) return { fechaInvalida: true };
  return valor > hoyIso() ? { fechaFutura: true } : null;
}
