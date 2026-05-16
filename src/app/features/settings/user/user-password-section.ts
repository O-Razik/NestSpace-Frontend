import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideEye, lucideEyeOff } from '@ng-icons/lucide';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'user-password-section',
  imports: [ReactiveFormsModule, HlmButtonImports, HlmFieldImports, HlmInputImports, HlmIcon, NgIcon, TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ lucideEye, lucideEyeOff })],
  template: `
    <form [formGroup]="passwordForm" (ngSubmit)="changePassword()" class="flex flex-col gap-3">
      @if (error()) {
        <p class="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">{{ error() }}</p>
      }
      @if (success()) {
        <p class="rounded-md bg-green-500/10 px-3 py-2 text-xs text-green-600">{{ 'user.password.changed' | transloco }}</p>
      }
      <hlm-field>
        <label hlmFieldLabel for="up-cur-pw">{{ 'user.password.current' | transloco }}</label>
        <div class="relative">
          <input hlmInput [type]="showCurrent() ? 'text' : 'password'" id="up-cur-pw" formControlName="currentPassword" class="pr-10" />
          <button type="button" class="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            [attr.aria-label]="(showCurrent() ? 'common.hidePassword' : 'common.showPassword') | transloco"
            (click)="showCurrent.set(!showCurrent())">
            <ng-icon hlm [name]="showCurrent() ? 'lucideEyeOff' : 'lucideEye'" size="sm" />
          </button>
        </div>
        <hlm-field-error class="text-xs" validator="required">{{ 'user.password.required' | transloco }}</hlm-field-error>
      </hlm-field>
      <hlm-field>
        <label hlmFieldLabel for="up-new-pw">{{ 'user.password.new' | transloco }}</label>
        <div class="relative">
          <input hlmInput [type]="showNew() ? 'text' : 'password'" id="up-new-pw" formControlName="newPassword" class="pr-10" />
          <button type="button" class="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            [attr.aria-label]="(showNew() ? 'common.hidePassword' : 'common.showPassword') | transloco"
            (click)="showNew.set(!showNew())">
            <ng-icon hlm [name]="showNew() ? 'lucideEyeOff' : 'lucideEye'" size="sm" />
          </button>
        </div>
        <hlm-field-error class="text-xs" validator="required">{{ 'user.password.required' | transloco }}</hlm-field-error>
        <hlm-field-error class="text-xs" validator="minlength">{{ 'user.password.minLength' | transloco }}</hlm-field-error>
      </hlm-field>
      <hlm-field>
        <label hlmFieldLabel for="up-conf-pw">{{ 'user.password.confirm' | transloco }}</label>
        <div class="relative">
          <input hlmInput [type]="showConfirm() ? 'text' : 'password'" id="up-conf-pw" formControlName="confirmPassword" class="pr-10" />
          <button type="button" class="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            [attr.aria-label]="(showConfirm() ? 'common.hidePassword' : 'common.showPassword') | transloco"
            (click)="showConfirm.set(!showConfirm())">
            <ng-icon hlm [name]="showConfirm() ? 'lucideEyeOff' : 'lucideEye'" size="sm" />
          </button>
        </div>
        @if (passwordForm.errors?.['mismatch'] && passwordForm.get('confirmPassword')?.touched) {
          <p class="text-xs text-destructive">{{ 'user.password.mismatch' | transloco }}</p>
        }
      </hlm-field>
      <button hlmBtn type="submit" [disabled]="passwordForm.invalid || loading()">
        {{ (loading() ? 'user.password.changing' : 'user.password.change') | transloco }}
      </button>
    </form>
  `,
})
export class UserPasswordSection {
  private readonly _auth = inject(AuthService);
  private readonly _fb = inject(FormBuilder);
  private readonly _t = inject(TranslocoService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal(false);
  readonly showCurrent = signal(false);
  readonly showNew = signal(false);
  readonly showConfirm = signal(false);

  readonly passwordForm = this._fb.group(
    {
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: confirmPasswordValidator },
  );

  changePassword(): void {
    if (this.passwordForm.invalid || this.loading()) return;
    this.loading.set(true);
    this.error.set(null);
    this.success.set(false);
    const { currentPassword, newPassword } = this.passwordForm.getRawValue();
    this._auth.changePassword({ currentPassword: currentPassword!, newPassword: newPassword! }).subscribe({
      next: () => {
        this.passwordForm.reset();
        this.loading.set(false);
        this.success.set(true);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(err.error?.message ?? this._t.translate('user.password.error'));
        this.loading.set(false);
      },
    });
  }
}

function confirmPasswordValidator(group: AbstractControl) {
  const pw = group.get('newPassword')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return pw && confirm && pw !== confirm ? { mismatch: true } : null;
}
