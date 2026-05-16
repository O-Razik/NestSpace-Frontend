import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { take } from 'rxjs';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { AuthService } from '../../core/auth/auth.service';
import { OAuthService } from '../../core/auth/oauth.service';
import { AuthOauthButtons, OAuthProvider } from './auth-oauth-buttons';
import { AuthPasswordField } from './auth-password-field';

@Component({
  selector: 'login-form',
  imports: [ReactiveFormsModule, RouterLink, HlmFieldImports, HlmInputImports, HlmButtonImports, TranslocoPipe, AuthOauthButtons, AuthPasswordField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="form" (ngSubmit)="login()">
      <hlm-field-group class="gap-5">
        <div class="flex flex-col items-center gap-1 text-center">
          <h1 class="text-xl font-bold">{{ 'auth.login.title' | transloco }}</h1>
          <p class="text-muted-foreground text-sm text-balance">{{ 'auth.login.subtitle' | transloco }}</p>
        </div>

        @if (serverError()) {
          <p class="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">{{ serverError() }}</p>
        }

        <hlm-field>
          <label hlmFieldLabel for="email">{{ 'common.email' | transloco }}</label>
          <input hlmInput type="email" id="email" placeholder="m@example.com" formControlName="email" />
          <hlm-field-error class="text-sm" validator="required">{{ 'auth.email.required' | transloco }}</hlm-field-error>
          <hlm-field-error class="text-sm" validator="email">{{ 'auth.email.invalid' | transloco }}</hlm-field-error>
          @if (form.controls.email.hasError('serverError')) {
            <hlm-field-error class="text-sm" forceShow>{{ form.controls.email.getError('serverError') }}</hlm-field-error>
          }
        </hlm-field>
        <hlm-field>
          <div class="flex items-center">
            <label hlmFieldLabel for="password">{{ 'common.password' | transloco }}</label>
            <a hlmFieldDescription class="ml-auto text-sm underline-offset-4 hover:underline" routerLink="/auth/forgot-password">
              {{ 'auth.login.forgotPassword' | transloco }}
            </a>
          </div>
          <auth-password-field [control]="form.controls.password" fieldId="password" />
          <hlm-field-error class="text-sm" validator="required">{{ 'auth.password.required' | transloco }}</hlm-field-error>
          <hlm-field-error class="text-sm" validator="minlength">{{ 'auth.password.minLength' | transloco }}</hlm-field-error>
          @if (form.controls.password.hasError('serverError')) {
            <hlm-field-error class="text-sm" forceShow>{{ form.controls.password.getError('serverError') }}</hlm-field-error>
          }
        </hlm-field>
        <hlm-field>
          <button hlmBtn type="submit" [disabled]="form.invalid || loading()">
            {{ (loading() ? 'auth.login.submitting' : 'auth.login.submit') | transloco }}
          </button>
        </hlm-field>

        <auth-oauth-buttons
          [googleLoading]="googleLoading()"
          [microsoftLoading]="microsoftLoading()"
          [error]="oauthError()"
          (provider)="onOauth($event)" />

        <hlm-field>
          <p hlmFieldDescription class="text-center">
            {{ 'auth.login.noAccount' | transloco }}
            <a routerLink="/auth/register">{{ 'auth.login.signUp' | transloco }}</a>
          </p>
        </hlm-field>
      </hlm-field-group>
    </form>
  `,
})
export class LoginForm {
  private readonly _fb = inject(FormBuilder);
  private readonly _auth = inject(AuthService);
  private readonly _oauth = inject(OAuthService);
  private readonly _router = inject(Router);
  private readonly _t = inject(TranslocoService);

  readonly loading = signal(false);
  readonly serverError = signal<string | null>(null);
  readonly googleLoading = signal(false);
  readonly microsoftLoading = signal(false);
  readonly oauthError = signal<string | null>(null);

  readonly form = this._fb.group({
    email: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8)] }),
  });

  login(): void {
    if (this.form.invalid || this.loading()) return;

    this.loading.set(true);
    this.serverError.set(null);

    const { email, password } = this.form.getRawValue();
    this._auth.login({ email, password }).subscribe({
      next: () => this._router.navigate(['/']),
      error: (err: HttpErrorResponse) => {
        if (err.status === 400 && err.error?.errors) {
          this._applyServerErrors(err.error.errors);
        } else {
          this.serverError.set(err.error?.title ?? err.error?.message ?? this._t.translate('auth.login.error'));
        }
        this.loading.set(false);
      },
    });
  }

  onOauth(provider: OAuthProvider): void {
    if (provider === 'google') this._loginWithGoogle();
    else this._loginWithMicrosoft();
  }

  private _loginWithGoogle(): void {
    this.googleLoading.set(true);
    this.oauthError.set(null);
    this._oauth.loginWithGoogle().then(
      () => this._router.navigate(['/']),
    ).catch(() => {
      this.oauthError.set(this._t.translate('auth.oauth.error'));
      this.googleLoading.set(false);
    });
  }

  private _loginWithMicrosoft(): void {
    this.microsoftLoading.set(true);
    this.oauthError.set(null);
    this._oauth.loginWithMicrosoft();
  }

  private _applyServerErrors(errors: Record<string, string[]>): void {
    const map: Record<string, string> = { Email: 'email', Password: 'password' };
    Object.entries(errors).forEach(([field, messages]) => {
      const controlName = map[field] ?? field.toLowerCase();
      const control = this.form.get(controlName);
      if (!control || !messages.length) return;
      control.setErrors({ ...(control.errors ?? {}), serverError: messages[0] });
      control.markAsTouched();
      control.valueChanges.pipe(take(1)).subscribe(() => {
        const errs = { ...control.errors };
        delete errs['serverError'];
        control.setErrors(Object.keys(errs).length ? errs : null);
      });
    });
  }
}
