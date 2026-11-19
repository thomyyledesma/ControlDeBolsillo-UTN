import { FormControl } from '@angular/forms';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { fechaNoFutura, hoyIso } from './movimientos-fecha';

function sumarDias(iso: string, dias: number): string {
  const [anio, mes, dia] = iso.split('-').map(Number);
  const fecha = new Date(anio, mes - 1, dia + dias);
  const m = String(fecha.getMonth() + 1).padStart(2, '0');
  const d = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${m}-${d}`;
}

describe('fechaNoFutura', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('acepta una fecha vacía', () => {
    expect(fechaNoFutura(new FormControl(''))).toBeNull();
    expect(fechaNoFutura(new FormControl(null))).toBeNull();
  });

  it('acepta la fecha de hoy y fechas pasadas', () => {
    expect(fechaNoFutura(new FormControl(hoyIso()))).toBeNull();
    expect(fechaNoFutura(new FormControl(sumarDias(hoyIso(), -5)))).toBeNull();
  });

  it('rechaza una fecha futura', () => {
    expect(fechaNoFutura(new FormControl(sumarDias(hoyIso(), 1)))).toEqual({ fechaFutura: true });
  });

  it('rechaza valores que no son fechas ISO', () => {
    expect(fechaNoFutura(new FormControl('31/12/2030'))).toEqual({ fechaInvalida: true });
    expect(fechaNoFutura(new FormControl('no-es-fecha'))).toEqual({ fechaInvalida: true });
  });

  it('toma la fecha actual en cada validación, incluso al cambiar el día', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 19, 23, 59));
    expect(fechaNoFutura(new FormControl('2026-11-20'))).toEqual({ fechaFutura: true });

    vi.setSystemTime(new Date(2026, 10, 20, 0, 1));
    expect(fechaNoFutura(new FormControl('2026-11-20'))).toBeNull();
  });
});
