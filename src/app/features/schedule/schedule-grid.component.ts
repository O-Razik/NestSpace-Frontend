import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Day, RegularEventDto } from '../../api/event-schedule/models/regular-event';
import { CategoryShortDto } from '../../api/event-schedule/models/category';
import { shouldDimEvent, WeekTypeName } from './utils/filter-events';
import { ScheduleCellComponent } from './schedule-cell.component';

const TIME_SLOTS = ['08:30', '10:25', '12:40', '14:35', '16:20'];
const DAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];
const ALL_DAYS: Day[] = [Day.Monday, Day.Tuesday, Day.Wednesday, Day.Thursday, Day.Friday, Day.Saturday, Day.Sunday];

@Component({
  selector: 'app-schedule-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ScheduleCellComponent],
  host: { class: 'block overflow-auto' },
  template: `
    <div class="grid min-w-[500px]" [style.grid-template-columns]="gridColumns()">
      <!-- Header row: corner + day names -->
      <div class="border-b border-[var(--ns-border)]"></div>
      @for (dayInfo of visibleDays(); track dayInfo.day) {
        <div class="text-[11px] font-semibold text-[var(--fg-muted)] text-center py-1.5 border-b border-[var(--ns-border)]" [attr.aria-label]="dayInfo.label">{{ dayInfo.label }}</div>
      }

      <!-- Time-slot rows -->
      @for (slot of slots; track slot) {
        <div class="text-[10px] text-[var(--fg-dim)] text-right pr-2 flex items-center justify-end h-16" [attr.aria-label]="slot">{{ slot }}</div>
        @for (dayInfo of visibleDays(); track dayInfo.day) {
          <div class="border border-[var(--ns-border)] bg-[var(--surface2)] p-0.5 h-16 overflow-hidden flex flex-col gap-px" role="gridcell" [attr.aria-label]="slot + ' ' + dayInfo.label">
            @for (ev of eventsAt(dayInfo.day, slot); track ev.id) {
              <app-schedule-cell
                [event]="ev"
                [category]="categoryFor(ev)"
                [dimmed]="shouldDim(ev)"
                [effectiveWeekType]="effectiveWeekType()"
                [currentWeekNum]="currentWeekNum()"
              />
            }
          </div>
        }
      }
    </div>
  `,
})
export class ScheduleGridComponent {
  readonly events           = input<RegularEventDto[]>([]);
  readonly categories       = input<CategoryShortDto[]>([]);
  readonly effectiveWeekType = input<WeekTypeName>('Numerator');
  readonly currentWeekNum   = input<number>(1);
  readonly subgroup         = input<number>(0);
  readonly hideEmpty        = input<boolean>(false);

  protected readonly slots = TIME_SLOTS;

  private readonly _catMap = computed(
    () => new Map(this.categories().map(c => [c.id, c])),
  );

  protected readonly visibleDays = computed(() => {
    const days = ALL_DAYS.map((day, i) => ({ day, label: DAY_LABELS[i] }));
    if (!this.hideEmpty()) return days;
    return days.filter(({ day }) =>
      this.events().some(ev =>
        ev.day === day && !shouldDimEvent(ev, this.effectiveWeekType(), this.currentWeekNum()),
      ),
    );
  });

  protected readonly gridColumns = computed(() => {
    const n = this.visibleDays().length;
    return `52px repeat(${n}, 1fr)`;
  });

  protected eventsAt(day: Day, slot: string): RegularEventDto[] {
    return this.events().filter(ev => {
      if (ev.day !== day) return false;
      const evSlot = ev.startTime.substring(0, 5);
      return evSlot === slot;
    });
  }

  protected categoryFor(ev: RegularEventDto): CategoryShortDto {
    return this._catMap().get(ev.categoryId) ?? {
      id: ev.categoryId, spaceId: '', title: '', description: '',
      color: '#22d3ee', icon: 'ri-stack-line',
    };
  }

  protected shouldDim(ev: RegularEventDto): boolean {
    return shouldDimEvent(ev, this.effectiveWeekType(), this.currentWeekNum());
  }
}
