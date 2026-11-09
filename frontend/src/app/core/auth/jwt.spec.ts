import { describe, expect, it } from 'vitest';

import { decodeJwt, isExpired, rolDesdeToken } from './jwt';

function crearToken(payload: object): string {
  const b64 = (o: object) => btoa(JSON.stringify(o));
  return `${b64({ alg: 'HS256' })}.${b64(payload)}.firma`;
}

describe('jwt', () => {
  it('decodifica el payload', () => {
    const token = crearToken({ sub: 'a@b.com', rol: 'PREMIUM' });
    expect(decodeJwt(token)?.sub).toBe('a@b.com');
  });

  it('devuelve null con un token inválido o vacío', () => {
    expect(decodeJwt('basura')).toBeNull();
    expect(decodeJwt(null)).toBeNull();
  });

  it('detecta tokens vencidos', () => {
    const vencido = decodeJwt(crearToken({ exp: 1 }));
    const vigente = decodeJwt(crearToken({ exp: Math.floor(Date.now() / 1000) + 3600 }));
    expect(isExpired(vencido)).toBe(true);
    expect(isExpired(vigente)).toBe(false);
  });

  it('lee el rol del claim y rechaza valores desconocidos', () => {
    expect(rolDesdeToken(crearToken({ rol: 'FREE' }))).toBe('FREE');
    expect(rolDesdeToken(crearToken({ rol: 'ADMIN' }))).toBeNull();
    expect(rolDesdeToken(crearToken({}))).toBeNull();
  });
});
