import { Rol } from '../models';

export interface JwtPayload {
  sub?: string;
  exp?: number; // segundos desde epoch
  rol?: string;
  role?: string;
}

/** Decodifica el payload de un JWT (sin verificar la firma: eso lo hace el backend). */
export function decodeJwt(token: string | null): JwtPayload | null {
  if (!token) return null;
  try {
    const parte = token.split('.')[1];
    if (!parte) return null;
    const base64 = parte.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export function isExpired(payload: JwtPayload | null): boolean {
  if (!payload?.exp) return false;
  return payload.exp * 1000 <= Date.now();
}

/** Lee el rol del claim `rol` (o `role`) del token. Null si no viene o no es válido. */
export function rolDesdeToken(token: string | null): Rol | null {
  const payload = decodeJwt(token);
  const rol = payload?.rol ?? payload?.role;
  return rol === 'FREE' || rol === 'PREMIUM' ? rol : null;
}
