import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { Rol } from '../models';
import { AuthService } from './auth.service';

/** Deja pasar solo a usuarios con sesión válida; si no, redirige al login. */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    auth.logout();
    return router.createUrlTree(['/login']);
  }
  if (auth.usuario()) return true;

  // Hay token pero todavía no tenemos el usuario (ej: recarga de página).
  return auth.cargarUsuario().pipe(
    map(() => true),
    catchError(() => of(router.createUrlTree(['/login']))),
  );
};

/** Para /login y /register: si ya hay sesión, va directo al resumen. */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isAuthenticated() ? router.createUrlTree(['/']) : true;
};

/**
 * Protege rutas según el rol: `canActivate: [roleGuard('PREMIUM')]`.
 * Sin sesión va al login; con sesión pero sin el rol requerido, al resumen.
 */
export const roleGuard = (...roles: Rol[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    const evaluar = () => {
      const rol = auth.rol();
      return rol !== null && roles.includes(rol) ? true : router.createUrlTree(['/']);
    };

    if (!auth.isAuthenticated()) return router.createUrlTree(['/login']);
    if (auth.usuario()) return evaluar();

    return auth.cargarUsuario().pipe(
      map(evaluar),
      catchError(() => of(router.createUrlTree(['/login']))),
    );
  };
};
