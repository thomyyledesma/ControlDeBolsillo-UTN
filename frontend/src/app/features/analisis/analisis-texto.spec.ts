import { describe, expect, it } from 'vitest';

import { limpiarMarkdown, validarPeriodo } from './analisis-texto';

describe('validarPeriodo', () => {
  it('pide ambas fechas', () => {
    expect(validarPeriodo('', '2026-11-01')).not.toBeNull();
    expect(validarPeriodo('2026-11-01', '')).not.toBeNull();
  });

  it('rechaza un inicio posterior al final', () => {
    expect(validarPeriodo('2026-11-10', '2026-11-01')).toContain('posterior');
  });

  it('acepta un rango válido o de un solo día', () => {
    expect(validarPeriodo('2026-11-01', '2026-11-30')).toBeNull();
    expect(validarPeriodo('2026-11-05', '2026-11-05')).toBeNull();
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
