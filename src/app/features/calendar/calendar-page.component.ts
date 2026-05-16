import {
  ChangeDetectionStrategy, Component, computed, effect, inject, signal,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { remixCalendar2Line, remixAddLine } from '@ng-icons/remixicon';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { startOfMonth, endOfMonth, startOfWeek, startOfYear, parseISO } from 'date-fns';
import { EventScheduleStoreService } from '../../core/event-schedule/event-schedule-store.service';
import { CategoryStoreService } from '../../core/event-schedule/category-store.service';
import { ScheduleStoreService } from '../../core/event-schedule/schedule-store.service';
import { SpaceService } from '../../core/space/space.service';
import { expandRegularEvent, EventOccurrence } from './utils/expand-regular-event';
import { CalendarGridComponent } from './calendar-grid.component';
import { DayDetailPanelComponent } from './day-detail-panel.component';

type ColoredOccurrence = EventOccurrence & { categoryColor: string };

@Component({
  selector: 'app-calendar-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon, HlmButtonImports, HlmSkeletonImports, CalendarGridComponent, DayDetailPanelComponent],
  viewProviders: [provideIcons({ remixCalendar2Line, remixAddLine })],
  host: { class: 'flex flex-col h-full bg-[var(--bg)]' },
  template: `
    <header class="flex items-center gap-2 px-4 py-3 border-b border-[var(--ns-border)] shrink-0">
      <ng-icon name="remixCalendar2Line" size="18" class="text-[var(--accent-color)]" aria-hidden="true" />
      <h1 class="text-sm font-semibold text-[var(--fg)]">Календар</h1>
      <button hlmBtn size="sm"
              class="ml-auto bg-[var(--accent-color)] text-black hover:opacity-90 text-xs">
        <ng-icon name="remixAddLine" size="14" aria-hidden="true" /> Подія
      </button>
    </header>

    <div class="flex flex-1 overflow-hidden">
      <div class="flex-1 overflow-hidden flex flex-col">
        @if (store.isLoading()) {
          <div class="p-4 grid grid-cols-7 gap-2">
            @for (_ of sk; track $index) { <div hlmSkeleton class="h-20 rounded" aria-hidden="true"></div> }
          </div>
        } @else {
          <app-calendar-grid
            [year]="currentYear()"
            [month]="currentMonth()"
            [occurrences]="coloredOccurrences()"
            [selectedDay]="selectedDay()"
            (monthDelta)="applyMonthDelta($event)"
            (daySelected)="selectedDay.set($event)"
            class="flex-1"
          />
        }
      </div>

      <aside class="w-[200px] border-l border-[var(--ns-border)] flex flex-col" aria-label="події обраного дня">
        @if (selectedDay()) {
          <app-day-detail-panel
            [date]="selectedDay()!"
            [occurrences]="selectedDayOccurrences()"
          />
        } @else {
          <p class="text-xs text-[var(--fg-dim)] p-4">Оберіть день</p>
        }
      </aside>
    </div>
  `,
})
export default class CalendarPageComponent {
  protected readonly store         = inject(EventScheduleStoreService);
  protected readonly categoryStore = inject(CategoryStoreService);
  protected readonly scheduleStore = inject(ScheduleStoreService);
  private readonly   _spaceService = inject(SpaceService);

  private readonly _now = new Date();
  protected readonly currentYear  = signal(this._now.getFullYear());
  protected readonly currentMonth = signal(this._now.getMonth());
  protected readonly selectedDay  = signal<Date | null>(null);
  protected readonly sk = Array(42);

  constructor() {
    effect(() => {
      const id = this._spaceService.selectedSpaceId();
      if (id) this.store.loadForSpace(id);
    });
  }

  protected applyMonthDelta(delta: number): void {
    let m = this.currentMonth() + delta;
    let y = this.currentYear();
    if (m > 11) { m = 0; y++; }
    if (m < 0)  { m = 11; y--; }
    this.currentMonth.set(m);
    this.currentYear.set(y);
  }

  protected readonly coloredOccurrences = computed((): ColoredOccurrence[] => {
    const y = this.currentYear();
    const m = this.currentMonth();
    const monthStart = startOfMonth(new Date(y, m, 1));
    const monthEnd   = endOfMonth(monthStart);

    const settings = this.scheduleStore.spaceSettings();
    const ref = settings
      ? startOfWeek(parseISO(settings.numeratorWeekStart), { weekStartsOn: 1 })
      : startOfWeek(startOfYear(monthStart), { weekStartsOn: 1 });

    const categories = this.categoryStore.categories();
    const catMap = new Map(categories.map(c => [c.id, c.color]));

    const regularOccs: ColoredOccurrence[] = this.scheduleStore.regularEvents().flatMap(ev => {
      const color = catMap.get(ev.categoryId) ?? '#22d3ee';
      return expandRegularEvent(ev, monthStart, monthEnd, ref).map(o => ({
        ...o,
        categoryColor: color,
      }));
    });

    const soloOccs: ColoredOccurrence[] = this.scheduleStore.soloEvents()
      .filter(ev => {
        const start = new Date(ev.startDate);
        return start >= monthStart && start <= monthEnd;
      })
      .map(ev => ({
        id:            `solo-${ev.id}`,
        sourceId:      ev.id,
        title:         ev.title,
        date:          new Date(ev.startDate),
        startTime:     new Date(ev.startDate).toTimeString().substring(0, 8),
        duration:      '00:00:00',
        type:          'regular' as const,
        categoryId:    ev.categoryId,
        tags:          ev.tags,
        categoryColor: catMap.get(ev.categoryId) ?? '#22d3ee',
      }));

    return [...regularOccs, ...soloOccs];
  });

  protected readonly selectedDayOccurrences = computed(() => {
    const day = this.selectedDay();
    if (!day) return [];
    return this.coloredOccurrences().filter(
      ev => ev.date.toDateString() === day.toDateString(),
    );
  });
}
