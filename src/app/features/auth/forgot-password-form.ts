import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { remixGithubFill } from '@ng-icons/remixicon';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';

@Component({
  selector: 'forgot-password-form',
  imports: [ReactiveFormsModule, RouterLink, HlmFieldImports, HlmInputImports, HlmButtonImports],
  providers: [provideIcons({ remixGithubFill })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
 		<form [formGroup]="form" (ngSubmit)="submit()">
 			<hlm-field-group class="gap-5">
 				<div class="flex flex-col items-center gap-1 text-center">
 					<h1 class="text-2xl font-bold">Forgot your password?</h1>
 					<p class="text-muted-foreground text-sm text-balance">Enter your email below to receive password reset instructions</p>
 				</div>
 				<hlm-field>
 					<label hlmFieldLabel for="email">Email</label>
 					<input hlmInput type="email" id="email" placeholder="m@example.com" formControlName="email" />
 					<hlm-field-error validator="required">Email is required.</hlm-field-error>
 					<hlm-field-error validator="email">Enter a valid email address.</hlm-field-error>
 				</hlm-field>
 				<hlm-field>
 					<button hlmBtn type="submit" [disabled]="form.invalid">Send reset instructions</button>
 				</hlm-field>
 				<hlm-field>
 					<p hlmFieldDescription class="text-center">
 						Remember your password?
 						<a routerLink="/auth/login">Login</a>
 					</p>
 				</hlm-field>
 			</hlm-field-group>
 		</form>
 	`,
})
export class ForgotPasswordForm {
  private readonly _fb = inject(FormBuilder);

  public form = this._fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  public submit() {
    if (this.form.valid) {
      const email = this.form.value.email;
      // Handle password reset logic here, e.g., call an API to send reset instructions
      console.log('Password reset instructions sent to:', email);
    }
  }
}
