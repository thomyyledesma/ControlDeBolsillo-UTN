import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';

interface NavItem {
  to: string;
  label: string;
  exact?: boolean;
}

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app-shell.html',
})
export class AppShell {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly navItems: NavItem[] = [
    { to: '/', label: 'Resumen', exact: true },
    { to: '/cuentas', label: 'Cuentas' },
    { to: '/movimientos', label: 'Movimientos' },
    { to: '/categorias', label: 'Categorías' },
    { to: '/mercado', label: 'Mercado' },
    { to: '/planes', label: 'Planes' },
  ];

  protected salir(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/login');
  }
}
