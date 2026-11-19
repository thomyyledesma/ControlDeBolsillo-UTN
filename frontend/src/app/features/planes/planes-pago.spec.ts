import { describe, expect, it } from 'vitest';

import { interpretarRetorno } from './planes-pago';

const params = (datos: Record<string, string>) => new Map(Object.entries(datos));

describe('interpretarRetorno', () => {
  it('sin parámetros no hace nada', () => {
    expect(interpretarRetorno(params({}))).toEqual({ tipo: 'ninguno' });
  });

  it('pago aprobado devuelve el id del pago', () => {
    expect(interpretarRetorno(params({ status: 'approved', payment_id: '123' }))).toEqual({
      tipo: 'aprobado',
      paymentId: '123',
    });
  });

  it('acepta collection_status y collection_id', () => {
    expect(
      interpretarRetorno(params({ collection_status: 'approved', collection_id: '456' })),
    ).toEqual({ tipo: 'aprobado', paymentId: '456' });
  });

  it('aprobado sin id de pago se ignora', () => {
    expect(interpretarRetorno(params({ status: 'approved' }))).toEqual({ tipo: 'ninguno' });
  });

  it('pendiente y en proceso', () => {
    expect(interpretarRetorno(params({ status: 'pending' }))).toEqual({ tipo: 'pendiente' });
    expect(interpretarRetorno(params({ status: 'in_process' }))).toEqual({ tipo: 'pendiente' });
  });

  it('rechazado o cancelado', () => {
    expect(interpretarRetorno(params({ status: 'rejected' }))).toEqual({ tipo: 'rechazado' });
    expect(interpretarRetorno(params({ status: 'failure' }))).toEqual({ tipo: 'rechazado' });
  });
});
