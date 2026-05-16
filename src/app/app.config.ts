import { APP_INITIALIZER, ApplicationConfig, inject, isDevMode, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { Translation, TranslocoLoader, provideTransloco } from '@jsverse/transloco';
import { HttpClient } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { languageInterceptor } from './core/interceptors/language.interceptor';
import { OAuthService } from './core/auth/oauth.service';
import { routes } from './app.routes';

class I18nLoader implements TranslocoLoader {
  private readonly _http = inject(HttpClient);
  getTranslation(lang: string) {
    return this._http.get<Translation>(`/i18n/${lang}.json`);
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    {
      provide: APP_INITIALIZER,
      useFactory: (oauth: OAuthService) => () => oauth.initialize(),
      deps: [OAuthService],
      multi: true,
    },
    provideHttpClient(withInterceptors([authInterceptor, languageInterceptor])),
    provideTransloco({
      config: {
        availableLangs: ['en', 'uk'],
        defaultLang: 'uk',
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: I18nLoader,
    }),
  ],
};
