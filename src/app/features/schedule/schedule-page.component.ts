import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { differenceInCalendarWeeks, parseISO, startOfWeek } from 'date-fns';
import { EventScheduleStoreService } from '../../core/event-schedule/event-schedule-store.service';
import { CategoryStoreService } from '../../core/event-schedule/category-store.service';
import { ScheduleStoreService } from '../../core/event-schedule/schedule-store.service';
import { SpaceService } from '../../core/space/space.service';
import { WeekTypeName } from './utils/filter-events';
import { ScheduleGridComponent } from './schedule-grid.component';
import { ScheduleFilterToolbarComponent, WeekTypeOverride } from './schedule-filter-toolbar.component';

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

@Component({
  selector: 'app-schedule-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ScheduleGridComponent, ScheduleFilterToolbarComponent],
  host: { class: 'flex flex-col h-full overflow-hidden' },
  template: `
    <app-schedule-filter-toolbar
      [hideEmpty]="hideEmpty()"
      [weekNum]="weekNum()"
      [subgroup]="subgroup()"
      [weekTypeOverride]="weekTypeOverride()"
      (hideEmptyChange)="setHideEmpty($event)"
      (weekNumChange)="setWeekNum($event)"
      (subgroupChange)="setSubgroup($event)"
      (weekTypeOverrideChange)="setWeekTypeOverride($event)"
    />

    <div class="flex-1 overflow-auto px-4 py-3">
      @if (store.isLoading()) {
        <div class="flex items-center justify-center h-full text-[var(--fg-dim)] text-[13px]" role="status" aria-live="polite">Завантаження розкладу…</div>
      } @else if (store.error()) {
        <p class="text-[var(--danger)] p-4 text-[13px]" role="alert">{{ store.error() }}</p>
      } @else {
        <app-schedule-grid
          [events]="scheduleStore.regularEvents()"
          [categories]="categoryStore.categories()"
          [effectiveWeekType]="effectiveWeekType()"
          [currentWeekNum]="weekNum()"
          [subgroup]="subgroup()"
          [hideEmpty]="hideEmpty()"
        />
      }
    </div>
  `,
})
export default class SchedulePageComponent {
  protected readonly store         = inject(EventScheduleStoreService);
  protected readonly categoryStore = inject(CategoryStoreService);
  protected readonly scheduleStore = inject(ScheduleStoreService);
  private readonly   _spaceService = inject(SpaceService);

  protected readonly weekTypeOverride = signal<WeekTypeOverride>(
    loadStorage<WeekTypeOverride>('nestspace.schedule.weekType', 'auto'),
  );
  protected readonly weekNum = signal<number>(
    loadStorage<number>('nestspace.schedule.weekNum', 1),
  );
  protected readonly subgroup = signal<number>(
    loadStorage<number>('nestspace.schedule.subgroup', 0),
  );
  protected readonly hideEmpty = signal<boolean>(
    loadStorage<boolean>('nestspace.schedule.hideEmpty', false),
  );

  private readonly autoWeekType = computed<WeekTypeName>(() => {
    const settings = this.scheduleStore.spaceSettings();
    if (!settings) return 'Numerator';
    try {
      const start = parseISO(settings.numeratorWeekStart);
      const today = new Date();
      const diff = differenceInCalendarWeeks(
        startOfWeek(today, { weekStartsOn: 1 }),
        startOfWeek(start, { weekStartsOn: 1 }),
        { weekStartsOn: 1 },
      );
      return diff % 2 === 0 ? 'Numerator' : 'Denominator';
    } catch {
      return 'Numerator';
    }
  });

  protected readonly effectiveWeekType = computed<WeekTypeName>(() => {
    const override = this.weekTypeOverride();
    return override === 'auto' ? this.autoWeekType() : override;
  });

  constructor() {
    effect(() => {
      const id = this._spaceService.selectedSpaceId();
      if (id) this.store.loadForSpace(id);
    });
  }

  protected setWeekTypeOverride(val: WeekTypeOverride): void {
    this.weekTypeOverride.set(val);
    saveStorage('nestspace.schedule.weekType', val);
  }

  protected setWeekNum(n: number): void {
    this.weekNum.set(n);
    saveStorage('nestspace.schedule.weekNum', n);
  }

  protected setSubgroup(n: number): void {
    this.subgroup.set(n);
    saveStorage('nestspace.schedule.subgroup', n);
  }

  protected setHideEmpty(value: boolean): void {
    this.hideEmpty.set(value);
    saveStorage('nestspace.schedule.hideEmpty', value);
  }
}
