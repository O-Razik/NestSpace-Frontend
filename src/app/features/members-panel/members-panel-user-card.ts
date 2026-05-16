import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck, lucidePencil, lucideX } from '@ng-icons/lucide';
import { TranslocoPipe } from '@jsverse/transloco';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { SpaceService } from '../../core/space/space.service';
import { SpaceMemberDto } from '../../core/space/space.models';
import { AvatarComponent } from '../../shared/ui/avatar';

const PALETTE = [
  '#4f46e5', '#0891b2', '#059669', '#d97706',
  '#dc2626', '#7c3aed', '#db2777', '#65a30d',
];

function colorFromId(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = Math.imul(31, h) + id.charCodeAt(i) | 0;
  return PALETTE[Math.abs(h) % PALETTE.length];
}

@Component({
  selector: 'members-panel-user-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon, HlmIcon, HlmButtonImports, HlmInputImports, AvatarComponent, TranslocoPipe],
  providers: [provideIcons({ lucidePencil, lucideCheck, lucideX })],
  host: {
    class: 'flex items-center gap-1.5 px-2 py-1.5 border-t border-[var(--border)] shrink-0 font-mono',
  },
  template: `
    <app-avatar
      class="w-6 h-6 shrink-0 rounded-full text-[0.5rem] font-semibold text-primary-foreground"
      [src]="memberDto().user.avatarUrl"
      [alt]="displayName()"
      [bgColor]="avatarColor()" />

    @if (editing()) {
      <input
        class="flex-1 text-[0.7rem] font-mono h-[22px] px-1 py-0"
        hlmInput
        type="text"
        [attr.aria-label]="'members.nicknamePlaceholder' | transloco"
        [attr.placeholder]="'members.nicknamePlaceholder' | transloco"
        [value]="draftName()"
        [disabled]="saving()"
        (input)="draftName.set($any($event.target).value)"
        (keydown.enter)="save()"
        (keydown.escape)="cancel()" />

      <div class="flex gap-0.5">
        <button
          hlmBtn
          variant="ghost"
          size="icon"
          class="h-5 w-5"
          [attr.aria-label]="'members.nicknameSave' | transloco"
          [disabled]="saving()"
          (click)="save()">
          <ng-icon hlm size="xs" name="lucideCheck" />
        </button>
        <button
          hlmBtn
          variant="ghost"
          size="icon"
          class="h-5 w-5"
          [attr.aria-label]="'members.nicknameCancel' | transloco"
          [disabled]="saving()"
          (click)="cancel()">
          <ng-icon hlm size="xs" name="lucideX" />
        </button>
      </div>
    } @else {
      <span class="text-[0.7rem] font-medium flex-1 truncate text-[var(--foreground)]">{{ displayName() }}</span>
      <button
        hlmBtn
        variant="ghost"
        size="icon"
        class="h-5 w-5"
        [attr.aria-label]="'members.nicknameEdit' | transloco"
        (click)="startEdit()">
        <ng-icon hlm size="xs" name="lucidePencil" />
      </button>
    }
  `,
})
export class MembersPanelUserCard {
  private readonly _spaceService = inject(SpaceService);

  readonly memberDto = input.required<SpaceMemberDto>();
  readonly spaceId = input.required<string>();

  readonly editing = signal(false);
  readonly saving = signal(false);
  readonly draftName = signal('');

  readonly displayName = computed(() =>
    this.memberDto().spaceUsername ?? this.memberDto().user.username,
  );

  readonly avatarColor = computed(() => colorFromId(this.memberDto().userId));

  startEdit(): void {
    this.draftName.set(this.memberDto().spaceUsername ?? '');
    this.editing.set(true);
  }

  cancel(): void {
    this.editing.set(false);
    this.saving.set(false);
  }

  save(): void {
    if (this.saving()) return;
    this.saving.set(true);
    const dto = this.memberDto();
    this._spaceService
      .updateSpaceMember(this.spaceId(), {
        spaceId: dto.spaceId,
        userId: dto.userId,
        roleId: dto.roleId,
        spaceUsername: this.draftName().trim() || null,
        subgroupId: dto.subgroupId,
        joinedAt: dto.joinedAt,
      })
      .subscribe({
        next: () => {
          this.editing.set(false);
          this.saving.set(false);
        },
        error: () => {
          this.saving.set(false);
        },
      });
  }
}
