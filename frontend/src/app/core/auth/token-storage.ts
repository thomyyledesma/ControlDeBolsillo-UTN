const TOKEN_KEY = 'finanzas_token';

/** Acceso al JWT guardado en localStorage (tolerante a que no esté disponible). */
export const TokenStorage = {
  get(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token: string): void {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* sin storage disponible: la sesión vive solo en memoria */
    }
  },
  clear(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* nada que limpiar */
    }
  },
};
