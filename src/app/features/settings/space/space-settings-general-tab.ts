import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCamera, lucideImagePlus, lucideTrash2 } from '@ng-icons/lucide';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { SpaceService } from '../../../core/space/space.service';

@Component({
  selector: 'space-settings-general-tab',
  imports: [ReactiveFormsModule, HlmButtonImports, HlmFieldImports, HlmInputImports, HlmIcon, NgIcon, TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ lucideCamera, lucideImagePlus, lucideTrash2 })],
  template: `
    @if (error()) {
      <p class="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">{{ error() }}</p>
    }
    @if (success()) {
      <p class="rounded-md bg-green-500/10 px-3 py-2 text-xs text-green-600">{{ success() }}</p>
    }

    <div class="flex flex-col items-center gap-2">
      <label class="group relative cursor-pointer" [class.pointer-events-none]="removingAvatar()">
        <input type="file" accept="image/*" class="sr-only"
          [attr.aria-label]="'space.general.uploadAvatar' | transloco"
          [disabled]="removingAvatar()"
          (change)="onAvatarChange($event)" />
        <div class="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-muted-foreground/40">
          @if (avatarPreview()) {
            <img [src]="avatarPreview()!" [alt]="'space.general.avatarPreview' | transloco" class="h-full w-full object-cover" />
          } @else if (currentAvatarUrl()) {
            <img [src]="currentAvatarUrl()!" [alt]="'space.general.avatar' | transloco" class="h-full w-full object-cover" />
          } @else {
            <ng-icon hlm name="lucideImagePlus" class="text-muted-foreground" size="lg" />
          }
          @if (!removingAvatar()) {
            <div class="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 rounded-xl" aria-hidden="true">
              <ng-icon hlm name="lucideCamera" class="text-white" size="sm" />
            </div>
          }
        </div>
      </label>

      @if (canRemoveAvatar()) {
        <button hlmBtn variant="ghost" size="sm" type="button"
          class="h-7 gap-1.5 px-2 text-xs text-destructive hover:text-destructive"
          [disabled]="removingAvatar() || saving()"
          (click)="removeAvatar()">
          @if (removingAvatar()) {
            {{ 'space.general.removingAvatar' | transloco }}
          } @else if (avatarPreview()) {
            {{ 'user.profile.clearAvatar' | transloco }}
          } @else {
            <ng-icon hlm name="lucideTrash2" size="xs" />
            {{ 'space.general.removeAvatar' | transloco }}
          }
        </button>
      }
    </div>

    <form [formGroup]="nameForm" (ngSubmit)="save()" class="flex flex-col gap-3 mt-2">
      <hlm-field>
        <label hlmFieldLabel for="ss-name">{{ 'space.general.name' | transloco }}</label>
        <input hlmInput id="ss-name" type="text" formControlName="name"
          [placeholder]="'space.general.namePlaceholder' | transloco" />
        <hlm-field-error class="text-xs" validator="required">{{ 'space.general.nameRequired' | transloco }}</hlm-field-error>
        <hlm-field-error class="text-xs" validator="maxlength">{{ 'space.general.nameMaxLength' | transloco }}</hlm-field-error>
      </hlm-field>
      <div class="flex justify-end">
        <button hlmBtn size="sm" type="submit" [disabled]="nameForm.invalid || saving() || removingAvatar()">
          {{ (saving() ? 'space.general.saving' : 'space.general.save') | transloco }}
        </button>
      </div>
    </form>
  `,
})
export class SpaceSettingsGeneralTab {
  private readonly _spaceService = inject(SpaceService);
  private readonly _fb = inject(FormBuilder);
  private readonly _t = inject(TranslocoService);

  readonly spaceId = input.required<string>();
  readonly spaceName = input('');
  readonly currentAvatarUrl = input<string | null>(null);

  readonly avatarRemoved = output<void>();

  readonly saving = signal(false);
  readonly removingAvatar = signal(false);
  readonly avatarPreview = signal<string | null>(null);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  private _avatarFile: File | null = null;

  readonly canRemoveAvatar = computed(() => !!(this.avatarPreview() || this.currentAvatarUrl()));

  readonly nameForm = this._fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
  });

  constructor() {
    effect(() => {
      this.nameForm.patchValue({ name: this.spaceName() }, { emitEvent: false });
    });
  }

  onAvatarChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this._avatarFile = file;
    if (!file) { this.avatarPreview.set(null); return; }
    const reader = new FileReader();
    reader.onload = e => this.avatarPreview.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  removeAvatar(): void {
    if (this.avatarPreview()) {
      this._avatarFile = null;
      this.avatarPreview.set(null);
      return;
    }
    this.removingAvatar.set(true);
    this.error.set(null);
    this._spaceService.deleteSpaceAvatar(this.spaceId()).subscribe({
      next: () => {
        this.removingAvatar.set(false);
        this.avatarRemoved.emit();
        this.success.set(this._t.translate('space.general.avatarRemoved'));
        setTimeout(() => this.success.set(null), 3000);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(err.error?.message ?? this._t.translate('space.general.error'));
        this.removingAvatar.set(false);
      },
    });
  }

  save(): void {
    if (this.nameForm.invalid || this.saving()) return;
    this.saving.set(true);
    this.error.set(null);
    const name = this.nameForm.getRawValue().name!;
    this._spaceService.updateSpace(this.spaceId(), name, this._avatarFile ?? undefined).subscribe({
      next: () => {
        this._avatarFile = null;
        this.avatarPreview.set(null);
        this.saving.set(false);
        this.success.set(this._t.translate('space.general.saved'));
        setTimeout(() => this.success.set(null), 3000);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(err.error?.message ?? this._t.translate('space.general.error'));
        this.saving.set(false);
      },
    });
  }
}
