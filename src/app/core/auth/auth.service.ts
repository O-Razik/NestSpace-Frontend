import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { finalize, Observable, share, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, UserDto } from './auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly _http = inject(HttpClient);
  private readonly _router = inject(Router);
  private readonly _base = `${environment.apiUrl}/auth`;

  private readonly _accessToken = signal<string | null>(localStorage.getItem('accessToken'));
  private readonly _refreshToken = signal<string | null>(localStorage.getItem('refreshToken'));
  private readonly _user = signal<UserDto | null>(
    JSON.parse(localStorage.getItem('user') ?? 'null'),
  );

  private _refresh$: Observable<AuthResponse> | null = null;

  readonly isAuthenticated = computed(() => !!this._accessToken());
  readonly currentUser = this._user.asReadonly();
  readonly accessToken = this._accessToken.asReadonly();
  readonly refreshToken = this._refreshToken.asReadonly();

  login(request: LoginRequest): Observable<AuthResponse> {
    return this._http
      .post<AuthResponse>(`${this._base}/login`, request)
      .pipe(tap(r => this._store(r)));
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this._http
      .post<AuthResponse>(`${this._base}/register`, request)
      .pipe(tap(r => this._store(r)));
  }

  refresh(): Observable<AuthResponse> {
    if (this._refresh$) return this._refresh$;

    const refreshToken = this._refreshToken();
    if (!refreshToken) return throwError(() => new Error('No refresh token'));

    this._refresh$ = this._http
      .post<AuthResponse>(`${this._base}/refresh`, { refreshToken })
      .pipe(
        tap(r => this._store(r)),
        finalize(() => { this._refresh$ = null; }),
        share(),
      );

    return this._refresh$;
  }

  logout(): void {
    const refreshToken = this._refreshToken();
    if (refreshToken) {
      this._http
        .post(`${this._base}/logout`, { refreshToken })
        .subscribe({ error: () => {} });
    }
    this._clear();
    this._router.navigate(['/auth/login']);
  }

  private _store(r: AuthResponse): void {
    localStorage.setItem('accessToken', r.accessToken);
    localStorage.setItem('refreshToken', r.refreshToken);
    localStorage.setItem('user', JSON.stringify(r.user));
    this._accessToken.set(r.accessToken);
    this._refreshToken.set(r.refreshToken);
    this._user.set(r.user);
  }

  private _clear(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this._accessToken.set(null);
    this._refreshToken.set(null);
    this._user.set(null);
  }
}
