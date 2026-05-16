import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom, Observable, of, switchMap, tap } from 'rxjs';
import { PublicClientApplication, type IPublicClientApplication } from '@azure/msal-browser';
import { environment } from '../../../environments/environment';
import { AuthResponse } from './auth.models';
import { AuthService } from './auth.service';

interface GoogleTokenResponse {
  access_token?: string;
  error?: string;
  error_description?: string;
}

declare const google: {
  accounts: {
    oauth2: {
      initTokenClient(config: {
        client_id: string;
        scope: string;
        callback: (response: GoogleTokenResponse) => void;
        error_callback?: (error: { type: string; message?: string }) => void;
      }): { requestAccessToken(): void };
    };
  };
};

@Injectable({ providedIn: 'root' })
export class OAuthService {
  private readonly _auth = inject(AuthService);
  private readonly _http = inject(HttpClient);
  private readonly _router = inject(Router);
  private readonly _base = `${environment.apiUrl}/auth`;

  private readonly _msal: IPublicClientApplication = new PublicClientApplication({
    auth: {
      clientId: environment.oauth.microsoftClientId,
      authority: 'https://login.microsoftonline.com/consumers',
      redirectUri: window.location.origin,
    },
  });

  // Зберігаємо promise ініціалізації щоб loginRedirect() ніколи не викликався до готовності
  private _msalReady: Promise<void> = Promise.resolve();

  // Викликається через APP_INITIALIZER — до будь-якого routing
  initialize(): Promise<void> {
    this._msalReady = this._msal.initialize().then(async () => {
      const result = await this._msal.handleRedirectPromise();
      if (result?.accessToken) {
        await firstValueFrom(this._loginOrRegisterExternal('Microsoft', result.accessToken));
        this._router.navigate(['/']);
      }
    }).catch(() => {});
    return this._msalReady;
  }

  async loginWithGoogle(): Promise<void> {
    await this._loadGisScript();
    return new Promise<void>((resolve, reject) => {
      const client = google.accounts.oauth2.initTokenClient({
        client_id: environment.oauth.googleClientId,
        scope: 'openid email profile',
        callback: (response: GoogleTokenResponse) => {
          if (response.error || !response.access_token) {
            reject(new Error(response.error ?? 'no_token'));
            return;
          }
          firstValueFrom(this._loginOrRegisterExternal('Google', response.access_token))
            .then(resolve)
            .catch(reject);
        },
        error_callback: (error) => reject(new Error(error.type)),
      });
      client.requestAccessToken();
    });
  }

  // Redirect замість popup — не потребує user gesture, немає блокування
  loginWithMicrosoft(): void {
    this._msalReady.then(() => {
      this._msal.loginRedirect({ scopes: ['User.Read'] });
    }).catch(() => {});
  }

  // Для прив'язки до наявного акаунту — popup (user gesture вже є, MSAL ініціалізовано)
  async linkWithMicrosoft(): Promise<void> {
    await this._msalReady;
    const result = await this._msal.loginPopup({ scopes: ['User.Read'] });
    await firstValueFrom(this._auth.linkExternalLogin('Microsoft', result.accessToken));
  }

  async linkWithGoogle(): Promise<void> {
    await this._loadGisScript();
    return new Promise<void>((resolve, reject) => {
      const client = google.accounts.oauth2.initTokenClient({
        client_id: environment.oauth.googleClientId,
        scope: 'openid email profile',
        callback: (response: GoogleTokenResponse) => {
          if (response.error || !response.access_token) {
            reject(new Error(response.error ?? 'no_token'));
            return;
          }
          firstValueFrom(this._auth.linkExternalLogin('Google', response.access_token))
            .then(() => resolve())
            .catch(reject);
        },
        error_callback: (error) => reject(new Error(error.type)),
      });
      client.requestAccessToken();
    });
  }

  private _loginOrRegisterExternal(provider: string, token: string): Observable<void> {
    return this._http
      .post<AuthResponse | null>(`${this._base}/login/external`, { provider, providerKey: token })
      .pipe(
        switchMap(res =>
          res
            ? of(res)
            : this._http.post<AuthResponse>(`${this._base}/register/external`, { provider, providerKey: token }),
        ),
        tap(r => this._auth.storeAuthResponse(r as AuthResponse)),
        // Refresh щоб отримати актуальний список externalLogins
        switchMap(() => this._auth.fetchCurrentUser()),
        switchMap(() => of(undefined as void)),
      );
  }

  private _loadGisScript(): Promise<void> {
    return new Promise<void>(resolve => {
      if (typeof google !== 'undefined' && google?.accounts?.oauth2) {
        resolve();
        return;
      }
      const existing = document.querySelector<HTMLScriptElement>('script[src*="accounts.google.com/gsi/client"]');
      if (existing) {
        existing.addEventListener('load', () => resolve());
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.onload = () => resolve();
      document.head.appendChild(script);
    });
  }
}
