import { describe, expect, it } from 'vitest';

import { limpiarMarkdown, validarPeriodo } from './analisis-texto';

// Fecha fija para que los tests no dependan del día en que se corren.
const HOY = '2030-01-01';

describe('validarPeriodo', () => {
  it('pide ambas fechas', () => {
    expect(validarPeriodo('', '2026-11-01', HOY)).not.toBeNull();
    expect(validarPeriodo('2026-11-01', '', HOY)).not.toBeNull();
  });

  it('rechaza un inicio posterior al final', () => {
    expect(validarPeriodo('2026-11-10', '2026-11-01', HOY)).toContain('posterior');
  });

  it('acepta un rango válido o de un solo día', () => {
    expect(validarPeriodo('2026-11-01', '2026-11-30', HOY)).toBeNull();
    expect(validarPeriodo('2026-11-05', '2026-11-05', HOY)).toBeNull();
  });

  it('rechaza fechas futuras', () => {
    expect(validarPeriodo('2026-11-01', '2026-12-31', '2026-11-20')).toContain('futuras');
    expect(validarPeriodo('2026-11-01', '2026-11-20', '2026-11-20')).toBeNull();
  });
});

describe('limpiarMarkdown', () => {
  it('saca el énfasis y convierte viñetas', () => {
    const entrada = '**Situación**\n* Gastás mucho en **comida**\n- Ahorrá más';
    expect(limpiarMarkdown(entrada)).toBe('Situación\n• Gastás mucho en comida\n• Ahorrá más');
  });

  it('saca los títulos con #', () => {
    expect(limpiarMarkdown('## Resumen\nTodo bien')).toBe('Resumen\nTodo bien');
  });
});
