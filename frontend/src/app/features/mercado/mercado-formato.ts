const formateadorDolar = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formateadorDecimal = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 });

const formateadorPorcentaje = new Intl.NumberFormat('es-AR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: 'exceptZero',
});

export function formatearUsd(monto: number): string {
  return formateadorDolar.format(monto);
}

export function formatearUsdCompacto(monto: number | null): string {
  if (monto === null) return '—';
  if (monto >= 1e12) return `US$ ${formateadorDecimal.format(monto / 1e12)} billones`;
  if (monto >= 1e9) return `US$ ${formateadorDecimal.format(monto / 1e9)} mil millones`;
  return `US$ ${formateadorDecimal.format(monto / 1e6)} millones`;
}

export function formatearVariacion(porcentaje: number | null): string {
  return porcentaje === null ? '—' : `${formateadorPorcentaje.format(porcentaje)}%`;
}

export function formatearActualizacion(iso: string | null | undefined): string {
  if (!iso) return '—';
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return '—';
  return fecha.toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });
}
