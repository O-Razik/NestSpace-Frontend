import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideEyeOff, lucideLayoutList, lucideNetwork } from '@ng-icons/lucide';
import { TranslocoPipe } from '@jsverse/transloco';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { DisplayMode, SubgroupFilter } from './members-panel.types';
import { SpaceAddMemberDialog } from './space-add-member-dialog';
import { SpaceService } from '../../core/space/space.service';

@Component({
  selector: 'members-panel-topbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgIcon,
    HlmIcon,
    HlmButtonImports,
    TranslocoPipe,
    SpaceAddMemberDialog
  ],
  providers: [provideIcons({ lucideEyeOff, lucideLayoutList, lucideNetwork })],
  host: {
    class: 'flex items-center gap-0.5 pl-2.5 pr-1.5 py-1.5 border-b border-[var(--border)] shrink-0',
  },
  template: `
    <span class="text-[0.625rem] font-semibold tracking-[0.08em] text-[var(--muted-foreground)] flex-1 truncate">{{ 'members.title' | transloco }}</span>

    @if (hasSubgroups()) {
      <button
        hlmBtn
        size="icon-sm"
        variant="ghost"
        class="shrink-0"
        [attr.aria-pressed]="displayMode() === 'byGroup'"
        [attr.aria-label]="
          (displayMode() === 'byGroup' ? 'members.modeList' : 'members.modeByGroup') | transloco
        "
        (click)="displayModeChange.emit(displayMode() === 'list' ? 'byGroup' : 'list')"
      >
        <ng-icon
          hlm
          size="xs"
          [name]="displayMode() === 'byGroup' ? 'lucideNetwork' : 'lucideLayoutList'"
        />
      </button>
    }

    @if (displayMode() === 'list' && hasSubgroups()) {
      <select
        class="text-[0.625rem] bg-transparent border border-[var(--border)] rounded text-[var(--muted-foreground)] px-1 py-0.5 cursor-pointer max-w-[52px] focus:outline-2 focus:outline-[var(--accent)] focus:outline-offset-1"
        (change)="subgroupFilterChange.emit($any($event.target).value)"
        [attr.aria-label]="'members.subgroupFilter' | transloco"
      >
        <option value="all" [selected]="subgroupFilter() === 'all'">{{ 'members.filterAll' | transloco }}</option>
        @for (opt of subgroupOptions(); track opt.value) {
          <option [value]="opt.value" [selected]="subgroupFilter() === opt.value">{{ opt.label }}</option>
        }
      </select>
    }

    @if (spaceService.selectedSpaceId(); as spaceId) {
      <space-add-member-dialog [spaceId]="spaceId" />
    }
    <button
      hlmBtn
      size="icon-sm"
      variant="ghost"
      class="shrink-0 ml-auto"
      [attr.aria-label]="'members.collapse' | transloco"
      (click)="collapse.emit()"
    >
      <ng-icon hlm name="lucideEyeOff" size="xs" />
    </button>
  `,
})
export class MembersPanelTopbar {
  protected readonly spaceService = inject(SpaceService);
  readonly displayMode = input.required<DisplayMode>();
  readonly hasSubgroups = input.required<boolean>();
  readonly subgroupFilter = input.required<SubgroupFilter>();
  readonly subgroupOptions = input.required<{ value: string; label: string }[]>();

  readonly displayModeChange = output<DisplayMode>();
  readonly subgroupFilterChange = output<SubgroupFilter>();
  readonly collapse = output<void>();
}
