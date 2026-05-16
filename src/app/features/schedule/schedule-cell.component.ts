import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RegularEventDto } from '../../api/event-schedule/models/regular-event';
import { CategoryShortDto } from '../../api/event-schedule/models/category';
import { WeekDotsComponent } from './week-dots.component';
import { WeekTypeName } from './utils/filter-events';

@Component({
  selector: 'app-schedule-cell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WeekDotsComponent],
  host: { class: 'block h-full' },
  template: `
    <div
      class="h-full rounded-[2px] px-1.5 py-1 flex flex-col gap-0.5 overflow-hidden transition-opacity"
      [style.border-left]="'3px solid ' + (dimmed() ? 'var(--ns-border)' : category().color)"
      [style.background]="dimmed() ? 'transparent' : category().color + '18'"
      [style.opacity]="dimmed() ? '0.28' : '1'"
      [style.filter]="dimmed() ? 'grayscale(0.6)' : ''"
    >
      <p class="text-[10px] font-medium text-[var(--fg)] leading-tight truncate">{{ event().title }}</p>
      <p class="text-[9px] text-[var(--fg-muted)] truncate">{{ event().description || event().startTime.substring(0,5) }}</p>
      <div class="flex items-center gap-1 flex-wrap mt-auto">
        <app-week-dots
          [frequency]="event().frequency"
          [effectiveWeekType]="effectiveWeekType()"
          [currentWeekNum]="currentWeekNum()"
        />
        @if (event().subgroupId) {
          <span class="text-[8px] text-[var(--fg-dim)] border border-[var(--ns-border)] rounded px-1">пгр</span>
        }
      </div>
    </div>
  `,
})
export class ScheduleCellComponent {
  readonly event            = input.required<RegularEventDto>();
  readonly category         = input.required<CategoryShortDto>();
  readonly dimmed           = input<boolean>(false);
  readonly effectiveWeekType = input<WeekTypeName>('Numerator');
  readonly currentWeekNum   = input<number>(1);
}
