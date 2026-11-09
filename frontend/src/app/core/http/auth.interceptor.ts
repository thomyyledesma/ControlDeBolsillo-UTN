import { HttpInterceptorFn } from '@angular/common/http';

import { environment } from '../../../environments/environment';
import { TokenStorage } from '../auth/token-storage';

/**
 * Agrega `Authorization: Bearer <jwt>` a las peticiones dirigidas al backend,
 * salvo a los endpoints públicos de /auth.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const esBackend = req.url.startsWith(environment.apiUrl);
  const esAuth = req.url.startsWith(`${environment.apiUrl}/auth/`);
  const token = TokenStorage.get();

  if (esBackend && !esAuth && token) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(req);
};
