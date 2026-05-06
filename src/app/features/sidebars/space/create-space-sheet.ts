import { ChangeDetectionStrategy, Component, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { of, switchMap } from 'rxjs';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCamera, lucideImagePlus, lucidePlus } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSheet, HlmSheetImports } from '@spartan-ng/helm/sheet';
import { AuthService } from '../../../core/auth/auth.service';
import { SpaceService } from '../../../core/space/space.service';

@Component({
  selector: 'create-space-sheet',
  imports: [ReactiveFormsModule, HlmButtonImports, HlmFieldImports, HlmInputImports, HlmSheetImports, HlmIcon, NgIcon],
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
          <h2 hlmSheetTitle>Create a Space</h2>
          <p hlmSheetDescription>Give your new space a name to get started.</p>
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
                aria-label="Upload space avatar"
                (change)="onAvatarChange($event)" />
              <div class="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-muted-foreground/40">
                @if (avatarPreview()) {
                  <img [src]="avatarPreview()" alt="Space avatar preview" class="h-full w-full object-cover" />
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
            <label hlmFieldLabel for="space-name">Space name</label>
            <input hlmInput id="space-name" type="text" placeholder="e.g. Study Group" formControlName="name" />
            <hlm-field-error class="text-xs" validator="required">Space name is required.</hlm-field-error>
            <hlm-field-error class="text-xs" validator="maxlength">Name must be 100 characters or fewer.</hlm-field-error>
          </hlm-field>
        </form>

        <div hlmSheetFooter>
          <button hlmBtn variant="outline" type="button" hlmSheetClose>Cancel</button>
          <button hlmBtn type="submit" form="create-space-form" [disabled]="form.invalid || loading()">
            {{ loading() ? 'Creating…' : 'Create Space' }}
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

  readonly loading = signal(false);
  readonly serverError = signal<string | null>(null);
  readonly avatarPreview = signal<string | null>(null);

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

    this._spaceService
      .createSpace({ creatorId: userId, name: this.form.getRawValue().name!, memberIds: [] })
      .pipe(
        switchMap(space =>
          this._avatarFile
            ? this._spaceService.uploadSpaceAvatar(space.id, this._avatarFile)
            : of(space),
        ),
      )
      .subscribe({
        next: () => {
          this.form.reset();
          this.avatarPreview.set(null);
          this._avatarFile = null;
          this.loading.set(false);
          this._sheetRef().close();
        },
        error: (err: HttpErrorResponse) => {
          this.serverError.set(err.error?.title ?? err.error?.message ?? 'Failed to create space.');
          this.loading.set(false);
        },
      });
  }
}