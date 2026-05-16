import {
  ChangeDetectionStrategy, Component, computed, input, output,
} from '@angular/core';
import {
  startOfMonth, endOfMonth, eachDayOfInterval,
  getDay, startOfWeek, isSameDay, isToday, isSameMonth,
} from 'date-fns';
import { EventOccurrence } from './utils/expand-regular-event';

interface CalendarCell {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
}

const DAYS_UK = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];

@Component({
  selector: 'app-calendar-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col h-full' },
  template: `
    <!-- Month nav -->
    <div class="flex items-center justify-between px-3 py-2 border-b border-[var(--ns-border)]">
      <button type="button" class="text-xs text-[var(--fg-muted)] hover:text-[var(--fg)] px-2 py-1"
              aria-label="Попередній місяць" (click)="monthDelta.emit(-1)">‹</button>
      <h2 class="text-xs font-semibold text-[var(--fg)]" aria-live="polite">{{ monthLabel() }}</h2>
      <button type="button" class="text-xs text-[var(--fg-muted)] hover:text-[var(--fg)] px-2 py-1"
              aria-label="Наступний місяць" (click)="monthDelta.emit(1)">›</button>
    </div>

    <!-- Day-of-week headers -->
    <div class="grid grid-cols-7 border-b border-[var(--ns-border)]">
      @for (d of days; track d) {
        <div class="text-center text-[10px] text-[var(--fg-dim)] py-1" aria-hidden="true">{{ d }}</div>
      }
    </div>

    <!-- Day cells -->
    <div class="grid grid-cols-7 flex-1">
      @for (cell of cells(); track cell.date.toISOString()) {
        <div
          class="border-r border-b border-[var(--ns-border)] p-1 min-h-[80px] cursor-pointer transition-colors duration-100 hover:bg-[var(--surface2)] [&:nth-child(7n)]:border-r-0"
          role="button"
          [attr.tabindex]="0"
          [attr.aria-label]="cell.date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' })"
          [attr.aria-pressed]="selectedDay() ? isSameDay(cell.date, selectedDay()!) : false"
          [style.border]="isSameDay(cell.date, selectedDay()!) ? '1px solid var(--accent-color)' : ''"
          [style.background]="isSameDay(cell.date, selectedDay()!)
            ? 'var(--accent-bg)'
            : cell.isToday ? 'oklch(from var(--accent-color) l c h / 0.06)' : ''"
          (click)="daySelected.emit(cell.date)"
          (keydown.enter)="daySelected.emit(cell.date)"
          (keydown.space)="daySelected.emit(cell.date)"
        >
          <span
            class="text-[10px] font-medium w-[18px] h-[18px] flex items-center justify-center rounded-full"
            [class]="cell.isCurrentMonth ? 'text-[var(--fg)]' : 'text-[var(--fg-dim)]'"
            [style.border]="cell.isToday ? '1px solid color-mix(in srgb, var(--accent-color) 40%, transparent)' : ''"
          >{{ cell.date.getDate() }}</span>

          @for (ev of eventsForDay(cell.date).slice(0, 2); track ev.id) {
            <div
              class="text-[10px] px-1 py-px rounded-[3px] truncate mt-0.5"
              [style.background]="ev.categoryColor + '22'"
              [style.color]="ev.categoryColor"
              [title]="ev.title"
            >{{ ev.startTime.substring(0,5) }} {{ ev.title }}</div>
          }
          @if (eventsForDay(cell.date).length > 2) {
            <div class="text-[10px] text-[var(--fg-dim)] mt-0.5">+{{ eventsForDay(cell.date).length - 2 }}</div>
          }
        </div>
      }
    </div>
  `,
})
export class CalendarGridComponent {
  readonly year        = input.required<number>();
  readonly month       = input.required<number>();
  readonly occurrences = input<(EventOccurrence & { categoryColor: string })[]>([]);
  readonly selectedDay = input<Date | null>(null);
  readonly monthDelta  = output<number>();
  readonly daySelected = output<Date>();

  protected readonly days = DAYS_UK;
  protected isSameDay = isSameDay;

  protected readonly monthLabel = computed(() => {
    const d = new Date(this.year(), this.month(), 1);
    return d.toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' });
  });

  protected readonly cells = computed((): CalendarCell[] => {
    const y = this.year();
    const m = this.month();
    const first = startOfMonth(new Date(y, m, 1));
    const last  = endOfMonth(first);

    const gridStart = startOfWeek(first, { weekStartsOn: 1 });
    // Always show 6 rows (42 cells)
    const gridEnd = new Date(gridStart);
    gridEnd.setDate(gridEnd.getDate() + 41);

    return eachDayOfInterval({ start: gridStart, end: gridEnd }).map(date => ({
      date,
      isCurrentMonth: isSameMonth(date, first),
      isToday: isToday(date),
    }));
  });

  protected eventsForDay(date: Date): (EventOccurrence & { categoryColor: string })[] {
    return this.occurrences().filter(ev => isSameDay(ev.date, date));
  }
}
