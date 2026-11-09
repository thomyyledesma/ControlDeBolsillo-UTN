import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, switchMap, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  Rol,
  UsuarioResponse,
} from '../models';
import { decodeJwt, isExpired, rolDesdeToken } from './jwt';
import { TokenStorage } from './token-storage';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  private readonly _token = signal<string | null>(TokenStorage.get());

  /** Usuario logueado (se carga desde /usuarios/actual). */
  readonly usuario = signal<UsuarioResponse | null>(null);

  readonly isAuthenticated = computed(() => {
    const token = this._token();
    return !!token && !isExpired(decodeJwt(token));
  });

  /** Rol actual: del claim del JWT, o del usuario cargado como respaldo. */
  readonly rol = computed<Rol | null>(
    () => rolDesdeToken(this._token()) ?? this.usuario()?.rol ?? null,
  );

  login(data: LoginRequest): Observable<UsuarioResponse> {
    return this.http.post<AuthResponse>(`${this.base}/auth/login`, data).pipe(
      tap((res) => this.guardarToken(res.token)),
      switchMap(() => this.cargarUsuario()),
    );
  }

  register(data: RegisterRequest): Observable<UsuarioResponse> {
    return this.http.post<AuthResponse>(`${this.base}/auth/register`, data).pipe(
      tap((res) => this.guardarToken(res.token)),
      switchMap(() => this.cargarUsuario()),
    );
  }

  /** Trae el usuario actual del backend y lo deja en memoria. */
  cargarUsuario(): Observable<UsuarioResponse> {
    return this.http
      .get<UsuarioResponse>(`${this.base}/usuarios/actual`)
      .pipe(tap((u) => this.usuario.set(u)));
  }

  logout(): void {
    TokenStorage.clear();
    this._token.set(null);
    this.usuario.set(null);
  }

  private guardarToken(token: string): void {
    TokenStorage.set(token);
    this._token.set(token);
  }
}
