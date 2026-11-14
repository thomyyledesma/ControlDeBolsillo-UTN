import { Routes } from '@angular/router';

import { authGuard, guestGuard, roleGuard } from './core/auth/auth.guard';
import { AppShell } from './layout/app-shell/app-shell';

export const routes: Routes = [
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

  {
    path: '',
    component: AppShell,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        title: 'Resumen · Plata clara',
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'movimientos',
        title: 'Movimientos · Plata clara',
        loadComponent: () =>
          import('./features/movimientos/movimientos').then((m) => m.Movimientos),
      },
      {
        path: 'categorias',
        title: 'Categorías · Plata clara',
        loadComponent: () => import('./features/categorias/categorias').then((m) => m.Categorias),
      },
      {
        path: 'cuentas',
        title: 'Cuentas · Plata clara',
        loadComponent: () => import('./features/cuentas/cuentas').then((m) => m.Cuentas),
      },
      {
        path: 'mercado',
        title: 'Mercado · Plata clara',
        loadComponent: () => import('./features/mercado/mercado').then((m) => m.Mercado),
      },
      {
        path: 'planes',
        title: 'Planes · Plata clara',
        loadComponent: () => import('./features/planes/planes').then((m) => m.Planes),
      },
      {
        path: 'analisis',
        canActivate: [roleGuard('PREMIUM')],
        title: 'Análisis IA · Plata clara',
        loadComponent: () => import('./features/analisis/analisis').then((m) => m.Analisis),
      },
      {
        path: 'perfil',
        title: 'Perfil · Plata clara',
        loadComponent: () => import('./features/perfil/perfil').then((m) => m.Perfil),
      },
    ],
  },

  { path: '**', redirectTo: '' },
];
