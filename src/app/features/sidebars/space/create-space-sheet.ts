import { ChangeDetectionStrategy, Component, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { of, switchMap } from 'rxjs';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCamera, lucideImagePlus, lucidePlus } from '@ng-icons/lucide';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSheet, HlmSheetImports } from '@spartan-ng/helm/sheet';
import { AuthService } from '../../../core/auth/auth.service';
import { SpaceService } from '../../../core/space/space.service';
import { UserDtoShort } from '../../../core/auth/auth.models';
import { UserSearchInline } from '../../../shared/user-search/user-search-inline';

@Component({
  selector: 'create-space-sheet',
  imports: [ReactiveFormsModule, HlmButtonImports, HlmFieldImports, HlmInputImports, HlmSheetImports, HlmIcon, NgIcon, UserSearchInline, TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ lucidePlus, lucideImagePlus, lucideCamera })],
  host: { class: 'flex justify-center' },
  template: `
    <hlm-sheet #sheet>
      <button
        hlmBtn variant="ghost" size="icon-lg"
        hlmSheetTrigger [side]="'left'"
        class="relative shadow-sm p-4 rounded-xl"
        aria-label="Create Space">
        <ng-icon hlm name="lucidePlus" size="lg" />
      </button>

      <hlm-sheet-content *hlmSheetPortal>
        <div hlmSheetHeader>
          <h2 hlmSheetTitle>{{ 'space.create.title' | transloco }}</h2>
          <p hlmSheetDescription>{{ 'space.create.subtitle' | transloco }}</p>
        </div>

        <form id="create-space-form" [formGroup]="form" (ngSubmit)="submit()"
              class="flex flex-col gap-5 px-4">
          @if (serverError()) {
            <p class="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">{{ serverError() }}</p>
          }

          <div class="flex justify-center">
            <label class="group relative cursor-pointer">
              <input
                #fileInput
                type="file" accept="image/*" class="sr-only"
                [attr.aria-label]="'space.create.uploadAvatar' | transloco"
                (change)="onAvatarChange($event)" />
              <div class="relative flex h-30 w-30 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-muted-foreground/40">
                @if (avatarPreview()) {
                  <img [src]="avatarPreview()!" [alt]="'space.create.avatarPreview' | transloco" class="h-full w-full object-cover" />
                } @else {
                  <ng-icon hlm name="lucideImagePlus" class="text-muted-foreground" size="lg" />
                }
                <div class="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <ng-icon hlm name="lucideCamera" class="text-white" size="sm" />
                </div>
              </div>
            </label>
          </div>

          <hlm-field>
            <label hlmFieldLabel for="space-name">{{ 'space.create.name' | transloco }}</label>
            <input hlmInput id="space-name" type="text"
              [placeholder]="'space.create.namePlaceholder' | transloco"
              formControlName="name" />
            <hlm-field-error class="text-xs" validator="required">{{ 'space.create.nameRequired' | transloco }}</hlm-field-error>
            <hlm-field-error class="text-xs" validator="maxlength">{{ 'space.create.nameMaxLength' | transloco }}</hlm-field-error>
          </hlm-field>

        </form>

        <div class="flex flex-col gap-1.5 px-4 pb-2">
          <label class="text-sm font-medium">{{ 'space.create.members' | transloco }}</label>
          <user-search-inline (selectionChange)="selectedMembers.set($event)" />
        </div>

        <div hlmSheetFooter>
          <button hlmBtn variant="outline" type="button" hlmSheetClose>{{ 'common.cancel' | transloco }}</button>
          <button hlmBtn type="submit" form="create-space-form" [disabled]="form.invalid || loading()">
            {{ (loading() ? 'space.create.creating' : 'space.create.create') | transloco }}
          </button>
        </div>
      </hlm-sheet-content>
    </hlm-sheet>
  `,
})
export class CreateSpaceSheet {
  private readonly _sheetRef = viewChild.required<HlmSheet>('sheet');
  private readonly _fb = inject(FormBuilder);
  private readonly _spaceService = inject(SpaceService);
  private readonly _auth = inject(AuthService);
  private readonly _t = inject(TranslocoService);

  readonly loading = signal(false);
  readonly serverError = signal<string | null>(null);
  readonly avatarPreview = signal<string | null>(null);
  readonly selectedMembers = signal<UserDtoShort[]>([]);

  private _avatarFile: File | null = null;

  readonly form = this._fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
  });

  onAvatarChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this._avatarFile = file;
    if (!file) {
      this.avatarPreview.set(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = e => this.avatarPreview.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  submit(): void {
    if (this.form.invalid || this.loading()) return;

    const userId = this._auth.currentUser()?.id;
    if (!userId) return;

    this.loading.set(true);
    this.serverError.set(null);

    const memberIds = this.selectedMembers().map(m => m.id);

    this._spaceService
      .createSpace({ creatorId: userId, name: this.form.getRawValue().name!, memberIds })
      .pipe(
        switchMap(space =>
          this._avatarFile
            ? this._spaceService.updateSpace(space.id, space.name, this._avatarFile!)
            : of(space),
        ),
      )
      .subscribe({
        next: () => {
          this.form.reset();
          this.avatarPreview.set(null);
          this._avatarFile = null;
          this.selectedMembers.set([]);
          this.loading.set(false);
          this._sheetRef().close();
        },
        error: (err: HttpErrorResponse) => {
          this.serverError.set(err.error?.title ?? err.error?.message ?? this._t.translate('space.create.error'));
          this.loading.set(false);
        },
      });
  }
}
