import { Routes } from '@angular/router';

import { authGuard, guestGuard } from './core/auth/auth.guard';
import { AppShell } from './layout/app-shell/app-shell';

export const routes: Routes = [
  // --- Rutas públicas (si ya hay sesión, redirigen al resumen) ---
  {
    path: 'login',
    canActivate: [guestGuard],
    title: 'Iniciar sesión · Plata clara',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    title: 'Crear cuenta · Plata clara',
    loadComponent: () => import('./features/auth/register/register').then((m) => m.Register),
  },

  // --- Rutas protegidas: requieren sesión y se muestran dentro del layout ---
  {
    path: '',
    component: AppShell,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        title: 'Resumen · Plata clara',
        loadComponent: () =>
          import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
      // Próximas fases: cuentas, movimientos, categorías, presupuestos, metas...
      // Las rutas Premium se protegen con roleGuard('PREMIUM').
    ],
  },

  { path: '**', redirectTo: '' },
];
