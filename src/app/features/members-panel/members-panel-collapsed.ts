import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideEye } from '@ng-icons/lucide';
import { TranslocoPipe } from '@jsverse/transloco';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { SpaceMember } from './members-panel.types';
import { AvatarComponent } from '../../shared/ui/avatar';

@Component({
  selector: 'members-panel-collapsed',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon, HlmIcon, HlmButtonImports, TranslocoPipe, AvatarComponent],
  providers: [provideIcons({ lucideEye })],
  host: {
    class: 'flex flex-col items-center gap-1.5 py-1.5 overflow-y-auto h-full scrollbar-none',
  },
  template: `
    <button hlmBtn size="icon-sm" variant="ghost"
      [attr.aria-label]="'members.expand' | transloco"
      (click)="expand.emit()">
      <ng-icon hlm name="lucideEye" size="xs" />
    </button>

    <div class="flex flex-col items-center gap-0.5 text-[0.65rem] font-semibold text-[var(--ok)]"
      [attr.aria-label]="'members.onlineCount' | transloco: { count: onlineCount() }">
      <span class="inline-block w-[7px] h-[7px] rounded-full bg-[var(--ok)]" aria-hidden="true"></span>
      <span>{{ onlineCount() }}</span>
    </div>

    @for (m of members(); track m.id) {
      <button class="relative bg-transparent border-0 p-0 cursor-pointer rounded-full shrink-0 focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
        [style.opacity]="m.online ? null : 0.4"
        [style.filter]="m.online ? null : 'grayscale(0.6)'"
        [attr.title]="m.name"
        [attr.aria-label]="m.name + (m.online ? ' (онлайн)' : ' (офлайн)')"
        (click)="memberClick.emit(m)">
        <app-avatar
          class="w-6 h-6 rounded-full text-[0.5rem] font-semibold text-primary-foreground"
          aria-hidden="true"
          [src]="m.avatarUrl"
          [alt]="m.name"
          [fallback]="m.name.slice(0, 2).toUpperCase()"
          [bgColor]="m.avatarColor" />
        @if (m.online) {
          <span class="absolute bottom-0 right-0 w-[7px] h-[7px] rounded-full bg-[var(--ok)] border-[1.5px] border-[var(--surface)]" aria-hidden="true"></span>
        }
      </button>
    }
  `,
})
export class MembersPanelCollapsed {
  readonly members = input.required<SpaceMember[]>();
  readonly onlineCount = input.required<number>();

  readonly expand = output<void>();
  readonly memberClick = output<SpaceMember>();
}
