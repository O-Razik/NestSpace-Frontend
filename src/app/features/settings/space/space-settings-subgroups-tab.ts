import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideTrash2 } from '@ng-icons/lucide';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { SpaceService } from '../../../core/space/space.service';
import { SubgroupDto } from '../../../core/space/space.models';

@Component({
  selector: 'space-settings-subgroups-tab',
  imports: [HlmButtonImports, HlmIcon, HlmInputImports, NgIcon, TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ lucideTrash2, lucidePlus })],
  template: `
    @if (error()) {
      <p class="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive mb-3">{{ error() }}</p>
    }

    @if (subgroups().length === 0) {
      <p class="text-sm text-muted-foreground text-center py-4">{{ 'space.subgroups.empty' | transloco }}</p>
    } @else {
      <ul role="list" class="flex flex-col gap-1 mb-4">
        @for (subgroup of subgroups(); track subgroup.id) {
          <li class="flex items-center justify-between gap-3 rounded-md border px-3 py-2">
            <span class="text-sm truncate">{{ subgroup.name }}</span>
            <button hlmBtn size="icon-sm" variant="ghost" class="shrink-0 text-destructive"
              [disabled]="deletingId() === subgroup.id"
              [attr.aria-label]="'space.subgroups.deleteAriaLabel' | transloco: { name: subgroup.name }"
              (click)="deleteSubgroup(subgroup)">
              <ng-icon hlm name="lucideTrash2" size="xs" />
            </button>
          </li>
        }
      </ul>
    }

    <div class="flex gap-2">
      <input hlmInput type="text"
        class="flex-1"
        [placeholder]="'space.subgroups.namePlaceholder' | transloco"
        [value]="newName()"
        (input)="newName.set($any($event.target).value)"
        (keydown.enter)="createSubgroup()"
        [attr.aria-label]="'space.subgroups.nameAriaLabel' | transloco" />
      <button hlmBtn size="sm" type="button"
        [disabled]="!newName().trim() || creating()"
        (click)="createSubgroup()">
        <ng-icon hlm name="lucidePlus" size="xs" class="mr-1" />
        {{ (creating() ? 'space.subgroups.creating' : 'space.subgroups.create') | transloco }}
      </button>
    </div>
  `,
})
export class SpaceSettingsSubgroupsTab {
  private readonly _spaceService = inject(SpaceService);
  private readonly _t = inject(TranslocoService);

  readonly spaceId = input.required<string>();
  readonly subgroups = input.required<SubgroupDto[]>();
  readonly subgroupsChange = output<SubgroupDto[]>();

  readonly newName = signal('');
  readonly creating = signal(false);
  readonly deletingId = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  createSubgroup(): void {
    const name = this.newName().trim();
    if (!name || this.creating()) return;
    this.creating.set(true);
    this.error.set(null);
    this._spaceService.createSubgroup(this.spaceId(), { name }).subscribe({
      next: created => {
        this.subgroupsChange.emit([...this.subgroups(), created]);
        this.newName.set('');
        this.creating.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(err.error?.message ?? this._t.translate('space.subgroups.errorCreate'));
        this.creating.set(false);
      },
    });
  }

  deleteSubgroup(subgroup: SubgroupDto): void {
    if (this.deletingId()) return;
    this.deletingId.set(subgroup.id);
    this.error.set(null);
    this._spaceService.deleteSubgroup(this.spaceId(), subgroup.id).subscribe({
      next: () => {
        this.subgroupsChange.emit(this.subgroups().filter(sg => sg.id !== subgroup.id));
        this.deletingId.set(null);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(err.error?.message ?? this._t.translate('space.subgroups.errorDelete'));
        this.deletingId.set(null);
      },
    });
  }
}
