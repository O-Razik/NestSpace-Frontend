import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { finalize, Observable, share, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, ChangePasswordRequest, LoginRequest, RegisterRequest, UpdateProfileDto, UserDto, UserDtoShort } from './auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly _http = inject(HttpClient);
  private readonly _router = inject(Router);
  private readonly _base = `${environment.apiUrl}/auth`;
  private readonly _usersBase = `${environment.apiUrl}/users`;

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

  updateProfile(dto: UpdateProfileDto, avatar?: File): Observable<UserDto> {
    const userId = this._user()?.id;
    const formData = new FormData();
    formData.append('username', dto.username);
    formData.append('email', dto.email);
    if (avatar) formData.append('avatar', avatar);
    return this._http
      .put<UserDto>(`${this._usersBase}/${userId}/update`, formData)
      .pipe(tap(user => this._updateUser(user)));
  }

  changePassword(dto: ChangePasswordRequest): Observable<void> {
    return this._http.put<void>(`${this._usersBase}/me/change-password`, dto);
  }

  deleteAvatar(): Observable<void> {
    return this._http
      .delete<void>(`${this._usersBase}/me/avatar`)
      .pipe(tap(() => {
        const user = this.currentUser();
        if (!user) return;
        this._updateUser({ ...user, avatarUrl: null });
      }));
  }

  fetchCurrentUser(): Observable<UserDto> {
    return this._http.get<UserDto>(`${this._usersBase}/me`)
      .pipe(tap(user => this._updateUser(user)));
  }

  linkExternalLogin(provider: string, token: string): Observable<UserDto> {
    return this._http
      .post<UserDto>(`${this._usersBase}/me/external-login/link`, { provider, providerKey: token })
      .pipe(tap(user => this._updateUser(user)));
  }

  removeExternalLogin(loginId: string): Observable<void> {
    return this._http.delete<void>(`${this._usersBase}/me/external-login/${loginId}`)
      .pipe(tap(() => {
        const user = this.currentUser();
        if (!user) return;
        this._updateUser({ ...user, externalLogins: user.externalLogins.filter(l => l.id !== loginId) });
      }));
  }

  searchByUsername(username: string): Observable<UserDtoShort> {
    return this._http
      .get<UserDtoShort>(`${this._usersBase}/search/by-username/${encodeURIComponent(username)}`)
      .pipe(tap(u => { u.avatarUrl = this._normalizeAvatarUrl(u.avatarUrl); }));
  }

  searchByEmail(email: string): Observable<UserDtoShort> {
    return this._http
      .get<UserDtoShort>(`${this._usersBase}/search/by-email/${encodeURIComponent(email)}`)
      .pipe(tap(u => { u.avatarUrl = this._normalizeAvatarUrl(u.avatarUrl); }));
  }

  private _normalizeAvatarUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    return url.startsWith('/') ? `${environment.apiUrl}${url}` : url;
  }

  deleteAccount(): Observable<void> {
    const userId = this._user()?.id;
    return this._http
      .delete<void>(`${this._usersBase}/${userId}/delete`)
      .pipe(tap(() => {
        this._clear();
        this._router.navigate(['/auth/login']);
      }));
  }

  storeAuthResponse(r: AuthResponse): void {
    this._store(r);
  }

  updateCurrentUser(user: UserDto): void {
    this._updateUser(user);
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

  private _updateUser(user: UserDto): void {
    const normalized = {
      ...user,
      avatarUrl: user.avatarUrl?.startsWith('/')
        ? `${environment.apiUrl}${user.avatarUrl}`
        : user.avatarUrl ?? null,
    };
    localStorage.setItem('user', JSON.stringify(normalized));
    this._user.set(normalized);
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
