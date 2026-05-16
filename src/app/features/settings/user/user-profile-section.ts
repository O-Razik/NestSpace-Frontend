import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCamera, lucideImagePlus, lucideTrash2 } from '@ng-icons/lucide';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'user-profile-section',
  imports: [ReactiveFormsModule, HlmButtonImports, HlmFieldImports, HlmInputImports, HlmIcon, NgIcon, TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ lucideCamera, lucideImagePlus, lucideTrash2 })],
  template: `
    <div class="flex justify-between gap-4">
      <div class="flex flex-col items-center gap-2 shrink-0 pt-4.5">
        <label class="group relative cursor-pointer">
          <input type="file" accept="image/*" class="sr-only"
            [attr.aria-label]="'user.profile.uploadAvatar' | transloco"
            [disabled]="removingAvatar()"
            (change)="onAvatarChange($event)" />
          <div class="relative flex h-40 w-40 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-muted-foreground/40">
            @if (avatarPreview()) {
              <img [src]="avatarPreview()" [alt]="'user.profile.avatarPreview' | transloco" class="h-full w-full object-cover" />
            } @else if (user()?.avatarUrl) {
              <img [src]="user()!.avatarUrl!" [alt]="user()!.username" class="h-full w-full object-cover" />
            } @else {
              <span class="text-lg font-bold">{{ initials() }}</span>
            }
            @if (!removingAvatar()) {
              <div class="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 rounded-full" aria-hidden="true">
                <ng-icon hlm name="lucideCamera" class="text-white" size="sm" />
              </div>
            }
          </div>
        </label>

        @if (canRemoveAvatar()) {
          <button hlmBtn variant="ghost" size="sm" type="button"
            class="h-7 gap-1.5 px-2 text-xs text-destructive hover:text-destructive"
            [disabled]="removingAvatar() || loading()"
            (click)="removeAvatar()">
            @if (removingAvatar()) {
              {{ 'user.profile.removingAvatar' | transloco }}
            } @else if (avatarPreview()) {
              {{ 'user.profile.clearAvatar' | transloco }}
            } @else {
              <ng-icon hlm name="lucideTrash2" size="xs" />
              {{ 'user.profile.removeAvatar' | transloco }}
            }
          </button>
        }
      </div>

      <form [formGroup]="profileForm" (ngSubmit)="save()" class="flex flex-col gap-3 flex-1 min-w-0">
        @if (error()) {
          <p class="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">{{ error() }}</p>
        }
        @if (success()) {
          <p class="rounded-md bg-green-500/10 px-3 py-2 text-xs text-green-600">{{ success() }}</p>
        }
        <hlm-field>
          <label hlmFieldLabel for="up-username">{{ 'common.username' | transloco }}</label>
          <input hlmInput id="up-username" type="text" formControlName="username" />
          <hlm-field-error class="text-xs" validator="required">{{ 'user.profile.usernameRequired' | transloco }}</hlm-field-error>
          <hlm-field-error class="text-xs" validator="maxlength">{{ 'user.profile.usernameMaxLength' | transloco }}</hlm-field-error>
        </hlm-field>
        <hlm-field>
          <label hlmFieldLabel for="up-email">{{ 'common.email' | transloco }}</label>
          <input hlmInput id="up-email" type="email" formControlName="email" />
          <hlm-field-error class="text-xs" validator="required">{{ 'user.profile.emailRequired' | transloco }}</hlm-field-error>
          <hlm-field-error class="text-xs" validator="email">{{ 'user.profile.emailInvalid' | transloco }}</hlm-field-error>
        </hlm-field>
        <button hlmBtn type="submit" [disabled]="profileForm.invalid || loading() || removingAvatar()">
          {{ (loading() ? 'user.profile.saving' : 'user.profile.save') | transloco }}
        </button>
      </form>
    </div>
  `,
})
export class UserProfileSection {
  private readonly _auth = inject(AuthService);
  private readonly _fb = inject(FormBuilder);
  private readonly _t = inject(TranslocoService);

  protected readonly user = this._auth.currentUser;
  protected readonly initials = computed(() =>
    (this._auth.currentUser()?.username ?? '').slice(0, 2).toUpperCase(),
  );

  readonly loading = signal(false);
  readonly removingAvatar = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly avatarPreview = signal<string | null>(null);
  private _avatarFile: File | null = null;

  readonly canRemoveAvatar = computed(() => !!(this.avatarPreview() || this.user()?.avatarUrl));

  readonly profileForm = this._fb.group({
    username: [this._auth.currentUser()?.username ?? '', [Validators.required, Validators.maxLength(100)]],
    email: [this._auth.currentUser()?.email ?? '', [Validators.required, Validators.email]],
  });

  onAvatarChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this._avatarFile = file;
    if (!file) { this.avatarPreview.set(null); return; }
    const reader = new FileReader();
    reader.onload = e => this.avatarPreview.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  removeAvatar(): void {
    // If there's only a pending file selection — just clear it, no API call
    if (this.avatarPreview()) {
      this._avatarFile = null;
      this.avatarPreview.set(null);
      return;
    }
    this.removingAvatar.set(true);
    this.error.set(null);
    this._auth.deleteAvatar().subscribe({
      next: () => {
        this.removingAvatar.set(false);
        this.success.set(this._t.translate('user.profile.avatarRemoved'));
        setTimeout(() => this.success.set(null), 3000);
      },
      error: () => {
        this.error.set(this._t.translate('user.profile.error'));
        this.removingAvatar.set(false);
      },
    });
  }

  save(): void {
    if (this.profileForm.invalid || this.loading()) return;
    this.loading.set(true);
    this.error.set(null);
    const { username, email } = this.profileForm.getRawValue();
    this._auth.updateProfile(
      { username: username!, email: email! },
      this._avatarFile ?? undefined,
    ).subscribe({
      next: () => {
        this._avatarFile = null;
        this.avatarPreview.set(null);
        this.loading.set(false);
        this.success.set(this._t.translate('user.profile.saved'));
        setTimeout(() => this.success.set(null), 3000);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(err.error?.message ?? this._t.translate('user.profile.error'));
        this.loading.set(false);
      },
    });
  }
}
