export type ResultadoPago =
  | { tipo: 'aprobado'; paymentId: string }
  | { tipo: 'pendiente' }
  | { tipo: 'rechazado' }
  | { tipo: 'ninguno' };

interface Parametros {
  get(nombre: string): string | null | undefined;
}

export function interpretarRetorno(params: Parametros): ResultadoPago {
  const estado = params.get('status') ?? params.get('collection_status');
  if (!estado) return { tipo: 'ninguno' };

  if (estado === 'approved') {
    const paymentId = params.get('payment_id') ?? params.get('collection_id');
    return paymentId ? { tipo: 'aprobado', paymentId } : { tipo: 'ninguno' };
  }
  if (estado === 'pending' || estado === 'in_process') return { tipo: 'pendiente' };
  if (estado === 'rejected' || estado === 'failure' || estado === 'cancelled') {
    return { tipo: 'rechazado' };
  }
  return { tipo: 'ninguno' };
}
