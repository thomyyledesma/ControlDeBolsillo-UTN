import { describe, expect, it } from 'vitest';

import { MovimientoResponse } from '../../core/models';
import { esTransferencia, resumirPeriodo } from './dashboard-resumen';

let seq = 0;
function mov(parcial: Partial<MovimientoResponse>): MovimientoResponse {
  return {
    id: ++seq,
    tipo: 'EGRESO',
    descripcion: null,
    monto: 0,
    fecha: '2026-11-10',
    cuentaId: 1,
    cuentaNombre: 'Efectivo',
    categoriaId: 1,
    categoriaNombre: 'Comida',
    ...parcial,
  };
}

describe('resumirPeriodo', () => {
  it('suma ingresos y gastos solo del período pedido', () => {
    const movs = [
      mov({ tipo: 'INGRESO', monto: 1000, categoriaNombre: 'Sueldo' }),
      mov({ tipo: 'EGRESO', monto: 300 }),
      mov({ tipo: 'EGRESO', monto: 999, fecha: '2026-10-30' }),
    ];
    const r = resumirPeriodo(movs, '2026-11');
    expect(r.ingresos).toBe(1000);
    expect(r.gastos).toBe(300);
    expect(r.balance).toBe(700);
  });

  it('no cuenta las transferencias entre cuentas', () => {
    const movs = [
      mov({
        tipo: 'EGRESO',
        monto: 500,
        descripcion: 'Transferencia enviada a Banco',
        categoriaNombre: null,
      }),
      mov({
        tipo: 'INGRESO',
        monto: 500,
        descripcion: 'Transferencia recibida de Efectivo',
        categoriaNombre: 'Transferencia Recibida',
      }),
    ];
    const r = resumirPeriodo(movs, '2026-11');
    expect(r.ingresos).toBe(0);
    expect(r.gastos).toBe(0);
  });

  it('agrupa gastos por categoría y junta el resto en "Otras"', () => {
    const categorias = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const movs = categorias.map((c, i) => mov({ monto: (i + 1) * 10, categoriaNombre: c }));
    const r = resumirPeriodo(movs, '2026-11');
    expect(r.gastosPorCategoria.length).toBe(6);
    expect(r.gastosPorCategoria[0].nombre).toBe('G');
    expect(r.gastosPorCategoria[5].nombre).toBe('Otras');
    expect(r.gastosPorCategoria[5].monto).toBe(30); // A (10) + B (20)
  });

  it('no falla sin gastos', () => {
    const r = resumirPeriodo([], '2026-11');
    expect(r.gastosPorCategoria).toEqual([]);
    expect(r.balance).toBe(0);
  });
});

describe('esTransferencia', () => {
  it('reconoce transferencias por categoría o descripción', () => {
    expect(esTransferencia(mov({ categoriaNombre: 'Transferencia enviada' }))).toBe(true);
    expect(
      esTransferencia(
        mov({ descripcion: 'Transferencia recibida de Banco', categoriaNombre: null }),
      ),
    ).toBe(true);
    expect(esTransferencia(mov({ descripcion: 'Super', categoriaNombre: 'Comida' }))).toBe(false);
  });
});
