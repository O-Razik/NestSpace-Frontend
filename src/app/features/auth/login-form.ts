import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { take } from 'rxjs';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { remixGithubFill } from '@ng-icons/remixicon';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'login-form',
  imports: [ReactiveFormsModule, RouterLink, HlmFieldImports, HlmInputImports, HlmButtonImports, NgIcon],
  providers: [provideIcons({ remixGithubFill })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
		<form [formGroup]="form" (ngSubmit)="login()">
			<hlm-field-group class="gap-5">
				<div class="flex flex-col items-center gap-1 text-center">
					<h1 class="text-xl font-bold">Login to your account</h1>
					<p class="text-muted-foreground text-sm text-balance">Enter your email below to login to your account</p>
				</div>

				@if (serverError()) {
					<p class="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">{{ serverError() }}</p>
				}

				<hlm-field>
					<label hlmFieldLabel for="email">Email</label>
					<input hlmInput type="email" id="email" placeholder="m@example.com" formControlName="email" />
					<hlm-field-error class="text-sm" validator="required">Email is required.</hlm-field-error>
					<hlm-field-error class="text-sm" validator="email">Enter a valid email address.</hlm-field-error>
					@if (form.controls.email.hasError('serverError')) {
						<hlm-field-error class="text-sm" forceShow>{{ form.controls.email.getError('serverError') }}</hlm-field-error>
					}
				</hlm-field>
				<hlm-field>
					<div class="flex items-center">
						<label hlmFieldLabel for="password">Password</label>
						<a hlmFieldDescription class="ml-auto text-sm underline-offset-4 hover:underline" routerLink="/auth/forgot-password">
							Forgot password?
						</a>
					</div>
					<input hlmInput type="password" id="password" formControlName="password" />
					<hlm-field-error class="text-sm" validator="required">Password is required.</hlm-field-error>
					<hlm-field-error class="text-sm" validator="minlength">Password must be at least 8 characters long.</hlm-field-error>
					@if (form.controls.password.hasError('serverError')) {
						<hlm-field-error class="text-sm" forceShow>{{ form.controls.password.getError('serverError') }}</hlm-field-error>
					}
				</hlm-field>
				<hlm-field>
					<button hlmBtn type="submit" [disabled]="form.invalid || loading()">
						{{ loading() ? 'Logging in…' : 'Login' }}
					</button>
				</hlm-field>
				<hlm-field-separator>Or continue with</hlm-field-separator>
				<hlm-field>
					<button hlmBtn variant="outline" type="button">
						<ng-icon name="remixGithubFill" class="text-xl" />
						Login with GitHub
					</button>
					<p hlmFieldDescription class="text-center">
						Don't have an account?
						<a routerLink="/auth/register">Sign up</a>
					</p>
				</hlm-field>
			</hlm-field-group>
		</form>
	`,
})
export class LoginForm {
  private readonly _fb = inject(FormBuilder);
  private readonly _auth = inject(AuthService);
  private readonly _router = inject(Router);

  readonly loading = signal(false);
  readonly serverError = signal<string | null>(null);

  readonly form = this._fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  login(): void {
    if (this.form.invalid || this.loading()) return;

    this.loading.set(true);
    this.serverError.set(null);

    const { email, password } = this.form.getRawValue();
    this._auth.login({ email: email!, password: password! }).subscribe({
      next: () => this._router.navigate(['/']),
      error: (err: HttpErrorResponse) => {
        if (err.status === 400 && err.error?.errors) {
          this._applyServerErrors(err.error.errors);
        } else {
          this.serverError.set(err.error?.title ?? err.error?.message ?? 'Invalid email or password.');
        }
        this.loading.set(false);
      },
    });
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
