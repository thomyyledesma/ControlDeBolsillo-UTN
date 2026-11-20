import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { AuthService } from './core/auth/auth.service';
import { TokenStorage } from './core/auth/token-storage';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  host: { '(window:pageshow)': 'revisarSesion()' },
  template: '<router-outlet />',
})
export class App {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected revisarSesion(): void {
    if (!TokenStorage.get() && this.auth.isAuthenticated()) {
      this.auth.logout();
      void this.router.navigateByUrl('/login', { replaceUrl: true });
    }
  }
}
