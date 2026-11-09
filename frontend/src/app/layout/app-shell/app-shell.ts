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

  // Se van sumando a medida que se construye cada pantalla.
  protected readonly navItems: NavItem[] = [
    { to: '/', label: 'Resumen', exact: true },
    { to: '/movimientos', label: 'Movimientos' },
  ];

  protected salir(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/login');
  }
}
