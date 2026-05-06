import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
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
  selector: 'signup-form',
  imports: [ReactiveFormsModule, RouterLink, HlmFieldImports, HlmInputImports, HlmButtonImports, NgIcon],
  providers: [provideIcons({ remixGithubFill })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
		<form [formGroup]="form" (ngSubmit)="signup()">
			<hlm-field-group class="gap-5">
				<div class="flex flex-col items-center gap-1 text-center">
					<h1 class="text-xl font-bold">Create your account</h1>
					<p class="text-muted-foreground text-xs text-balance">Fill in the form below to create your account</p>
				</div>

				@if (serverError()) {
					<p class="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">{{ serverError() }}</p>
				}

				<hlm-field>
					<label hlmFieldLabel for="username">Username</label>
					<input hlmInput type="text" id="username" placeholder="johndoe" formControlName="username" />
					<hlm-field-error class="text-xs" validator="required">Username is required.</hlm-field-error>
					@if (form.controls.username.hasError('serverError')) {
						<hlm-field-error class="text-xs" forceShow>{{ form.controls.username.getError('serverError') }}</hlm-field-error>
					}
				</hlm-field>
				<hlm-field>
					<label hlmFieldLabel for="email">Email</label>
					<input hlmInput type="email" id="email" placeholder="you@example.com" formControlName="email" />
					@if (!(form.controls.email.touched && form.controls.email.invalid)) {
						<hlm-field-description class="text-xs">Provide an email to use for logging in.</hlm-field-description>
					}
					<hlm-field-error class="text-xs" validator="required">Email is required.</hlm-field-error>
					<hlm-field-error class="text-xs" validator="email">Enter a valid email address.</hlm-field-error>
					@if (form.controls.email.hasError('serverError')) {
						<hlm-field-error class="text-xs" forceShow>{{ form.controls.email.getError('serverError') }}</hlm-field-error>
					}
				</hlm-field>
				<hlm-field>
					<label hlmFieldLabel for="password">Password</label>
					<input hlmInput type="password" id="password" formControlName="password" />
					@if (!(form.controls.password.touched && form.controls.password.invalid)) {
						<hlm-field-description class="text-xs">At least 8 characters.</hlm-field-description>
					}
					<hlm-field-error class="text-xs" validator="required">Password is required.</hlm-field-error>
					<hlm-field-error class="text-xs" validator="minlength">Password must be at least 8 characters long.</hlm-field-error>
					@if (form.controls.password.hasError('serverError')) {
						<hlm-field-error class="text-xs" forceShow>{{ form.controls.password.getError('serverError') }}</hlm-field-error>
					}
				</hlm-field>
				<hlm-field>
					<label hlmFieldLabel for="confirmPassword">Confirm Password</label>
					<input hlmInput type="password" id="confirmPassword" formControlName="confirmPassword" />
					@if (
						!(
							form.controls.confirmPassword.touched &&
							(form.controls.confirmPassword.invalid || form.errors?.['passwordMismatch'])
						)
					) {
						<hlm-field-description class="text-xs">Please confirm your password.</hlm-field-description>
					}
					<hlm-field-error class="text-xs" validator="required">Confirming your password is required.</hlm-field-error>
					@if (form.errors?.['passwordMismatch'] && !form.controls.confirmPassword.errors?.['required']) {
						<hlm-field-error class="text-xs" forceShow>Passwords must match.</hlm-field-error>
					}
				</hlm-field>
				<hlm-field>
					<button hlmBtn type="submit" [disabled]="form.invalid || loading()">
						{{ loading() ? 'Creating account…' : 'Create Account' }}
					</button>
				</hlm-field>
				<hlm-field-separator>Or continue with</hlm-field-separator>
				<hlm-field>
					<button hlmBtn variant="outline" type="button">
						<ng-icon name="remixGithubFill" class="text-xl" />
						Login with GitHub
					</button>
					<p hlmFieldDescription class="text-center">
						Already have an account?
						<a routerLink="/auth/login">Sign in</a>
					</p>
				</hlm-field>
			</hlm-field-group>
		</form>
	`,
})
export class SignupForm {
  private readonly _fb = inject(FormBuilder);
  private readonly _auth = inject(AuthService);
  private readonly _router = inject(Router);

  readonly loading = signal(false);
  readonly serverError = signal<string | null>(null);

  readonly form = this._fb.group(
    {
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordMatch() },
  );

  signup(): void {
    if (this.form.invalid || this.loading()) return;

    this.loading.set(true);
    this.serverError.set(null);

    const { username, email, password } = this.form.getRawValue();
    this._auth.register({ username: username!, email: email!, password: password! }).subscribe({
      next: () => this._router.navigate(['/']),
      error: (err: HttpErrorResponse) => {
        if (err.status === 409) {
          this.serverError.set('Email or username is already in use.');
        } else if (err.status === 400 && err.error?.errors) {
          this._applyServerErrors(err.error.errors);
        } else {
          this.serverError.set(err.error?.title ?? err.error?.message ?? 'Registration failed. Please try again.');
        }
        this.loading.set(false);
      },
    });
  }

  private _applyServerErrors(errors: Record<string, string[]>): void {
    const map: Record<string, string> = { Username: 'username', Email: 'email', Password: 'password' };
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

function passwordMatch(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  };
}
