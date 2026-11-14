import { MovimientoResponse } from '../../core/models';

export interface GastoCategoria {
  nombre: string;
  monto: number;
  porcentaje: number;
}

export interface ResumenPeriodo {
  ingresos: number;
  gastos: number;
  balance: number;
  gastosPorCategoria: GastoCategoria[];
}

const MAX_CATEGORIAS = 5;

export function esTransferencia(m: MovimientoResponse): boolean {
  const categoria = m.categoriaNombre?.toLowerCase() ?? '';
  const descripcion = m.descripcion?.toLowerCase() ?? '';
  return (
    categoria.startsWith('transferencia') ||
    descripcion.startsWith('transferencia enviada a ') ||
    descripcion.startsWith('transferencia recibida de ')
  );
}

export function movimientosDelPeriodo(
  movimientos: MovimientoResponse[],
  periodo: string,
): MovimientoResponse[] {
  return movimientos.filter((m) => m.fecha.startsWith(periodo));
}

export function resumirPeriodo(movimientos: MovimientoResponse[], periodo: string): ResumenPeriodo {
  const propios = movimientosDelPeriodo(movimientos, periodo).filter((m) => !esTransferencia(m));

  let ingresos = 0;
  let gastos = 0;
  const porCategoria = new Map<string, number>();

  for (const m of propios) {
    const monto = Number(m.monto);
    if (m.tipo === 'INGRESO') {
      ingresos += monto;
    } else {
      gastos += monto;
      const nombre = m.categoriaNombre ?? 'Sin categoría';
      porCategoria.set(nombre, (porCategoria.get(nombre) ?? 0) + monto);
    }
  }

  const ordenadas = [...porCategoria.entries()].sort((a, b) => b[1] - a[1]);
  const principales = ordenadas.slice(0, MAX_CATEGORIAS);
  const resto = ordenadas.slice(MAX_CATEGORIAS).reduce((acc, [, monto]) => acc + monto, 0);
  if (resto > 0) principales.push(['Otras', resto]);

  return {
    ingresos,
    gastos,
    balance: ingresos - gastos,
    gastosPorCategoria: principales.map(([nombre, monto]) => ({
      nombre,
      monto,
      porcentaje: gastos > 0 ? Math.round((monto / gastos) * 100) : 0,
    })),
  };
}
