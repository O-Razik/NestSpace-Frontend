import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { Badge } from '../../../shared/badge';

@Component({
  selector: 'channel-item',
  imports: [NgIcon, Badge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 transition-colors duration-150 hover:bg-[var(--accent-bg)]"
      [style.background]="active() ? 'var(--accent-bg)' : null">
      <ng-icon
        [name]="icon()"
        class="shrink-0 text-lg"
        [style.color]="active() ? 'var(--accent-color)' : null"
        [class.text-muted-foreground]="!active()" />
      <div class="flex min-w-0 flex-1 flex-col">
        <span
          class="truncate text-sm text-foreground"
          [class.font-semibold]="active()">
          {{ name() }}
        </span>
        @if (subtitle()) {
          <span class="truncate text-xs text-muted-foreground">{{ subtitle() }}</span>
        }
      </div>
      <badge [badge]="badge()" />
    </div>
  `,
})
export class ChannelItemComponent {
  name = input.required<string>();
  subtitle = input<string>('');
  icon = input<string>('lucideHash');
  badge = input<number>(0);
  active = input<boolean>(false);
}
