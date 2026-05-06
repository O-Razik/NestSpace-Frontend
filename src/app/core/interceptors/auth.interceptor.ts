import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  const token = auth.accessToken();
  const outgoing = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(outgoing).pipe(
    catchError((error: HttpErrorResponse) => {
      // Skip refresh for non-401 errors and for auth endpoints themselves
      if (error.status !== 401 || req.url.includes('/auth/')) {
        return throwError(() => error);
      }

      return auth.refresh().pipe(
        switchMap(() => {
          const newToken = auth.accessToken();
          const retry = newToken
            ? req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } })
            : req;
          return next(retry);
        }),
        catchError(refreshError => {
          auth.logout();
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};