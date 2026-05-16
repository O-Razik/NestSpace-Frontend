import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { SpaceMember } from './members-panel.types';
import { AvatarComponent } from '../../shared/ui/avatar';

@Component({
  selector: 'members-panel-row',
  imports: [AvatarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  template: `
    <button
      class="flex items-center gap-[7px] w-[calc(100%-4px)] px-2 py-1 bg-transparent border-0 cursor-pointer text-left min-w-0 font-[inherit] text-[var(--foreground)] rounded mx-0.5 my-px hover:bg-[var(--accent)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-[-2px]"
      [style.opacity]="_opacity()"
      [attr.aria-label]="_ariaLabel()"
      (click)="memberClick.emit(member())">

      <app-avatar
        class="w-6 h-6 shrink-0 rounded-full text-[0.5rem] font-semibold text-primary-foreground"
        aria-hidden="true"
        [src]="member().avatarUrl"
        [alt]="member().name"
        [fallback]="_initials()"
        [bgColor]="member().avatarColor" />

      <span class="flex-1 flex flex-col min-w-0">
        <span class="text-[0.7rem] font-medium truncate">{{ member().name }}</span>
        @if (member().name !== member().username) {
          <span class="text-[0.575rem] text-[var(--muted-foreground)] truncate leading-[1.2]">@{{ member().username }}</span>
        }
      </span>

      @if (member().role && member().hasAccess !== false) {
        <span class="text-[0.55rem] font-medium text-[var(--accent)] whitespace-nowrap shrink-0">{{ member().role }}</span>
      }

      @if (member().hasAccess === false) {
        <span class="text-[0.55rem] bg-[var(--destructive)] text-[var(--primary-foreground)] rounded-[3px] px-1 shrink-0 ml-auto">{{ _noAccessLabel() }}</span>
      } @else {
        <span class="inline-block w-[7px] h-[7px] rounded-full shrink-0"
          [style.backgroundColor]="member().online ? 'var(--ok)' : 'var(--muted-foreground)'"
          [style.opacity]="member().online ? null : 0.5"
          [attr.aria-label]="_statusLabel()">
        </span>
      }
    </button>
  `,
})
export class MembersPanelRow {
  private readonly _t = inject(TranslocoService);

  readonly member = input.required<SpaceMember>();
  readonly memberClick = output<SpaceMember>();

  protected readonly _initials = computed(() =>
    this.member().name.slice(0, 2).toUpperCase(),
  );

  protected readonly _ariaLabel = computed(() => {
    const m = this.member();
    const status = m.online
      ? this._t.translate('members.onlineStatus')
      : this._t.translate('members.offlineStatus');
    return `${m.name} ${status}`;
  });

  protected readonly _statusLabel = computed(() =>
    this.member().online
      ? this._t.translate('members.onlineAriaLabel')
      : this._t.translate('members.offlineAriaLabel'),
  );

  protected readonly _noAccessLabel = computed(() =>
    this._t.translate('members.noAccessBadge'),
  );

  protected readonly _opacity = computed(() => {
    const m = this.member();
    if (m.hasAccess === false) return 0.35;
    if (!m.online) return 0.5;
    return null;
  });
}
