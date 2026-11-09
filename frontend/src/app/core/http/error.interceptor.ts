import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';
import { HttpError } from './http-error';

/**
 * Convierte cualquier HttpErrorResponse en un HttpError con un mensaje
 * legible. Si el backend responde 401 (token vencido o ausente) en un
 * endpoint protegido, cierra la sesión y manda al login.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: unknown) => {
      if (!(err instanceof HttpErrorResponse)) {
        return throwError(() => err);
      }

      if (err.status === 0) {
        return throwError(() => new HttpError(0, 'No se pudo conectar con el servidor'));
      }

      const esAuth = req.url.startsWith(`${environment.apiUrl}/auth/`);
      if (err.status === 401 && !esAuth) {
        auth.logout();
        void router.navigateByUrl('/login');
        return throwError(
          () => new HttpError(401, 'Sesión expirada. Iniciá sesión de nuevo.'),
        );
      }

      const cuerpo = err.error as { error?: unknown } | null;
      const mensaje =
        cuerpo && typeof cuerpo.error === 'string' ? cuerpo.error : `Error ${err.status}`;
      return throwError(() => new HttpError(err.status, mensaje));
    }),
  );
};
