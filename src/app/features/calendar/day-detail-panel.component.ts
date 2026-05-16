import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { remixTimeLine, remixRepeatLine, remixCalendarCheckLine } from '@ng-icons/remixicon';
import { EventOccurrence } from './utils/expand-regular-event';

@Component({
  selector: 'app-day-detail-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon],
  viewProviders: [provideIcons({ remixTimeLine, remixRepeatLine, remixCalendarCheckLine })],
  host: { class: 'flex flex-col' },
  template: `
    <div class="p-3 border-b border-[var(--ns-border)]">
      <h2 class="text-xs font-semibold text-[var(--fg)]">{{ formattedDate() }}</h2>
    </div>
    <div class="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
      @if (!sorted().length) {
        <p class="text-xs text-[var(--fg-dim)] p-2">Немає подій</p>
      } @else {
        @for (ev of sorted(); track ev.id) {
          <div
            class="flex items-start gap-2 rounded p-2 text-xs"
            [style.background]="'var(--surface2)'"
          >
            <span
              class="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[var(--accent-color)]"
              [style.background]="'var(--accent-bg)'"
              aria-hidden="true"
            >
              <ng-icon [name]="ev.type === 'regular' ? 'remixRepeatLine' : 'remixCalendarCheckLine'" size="12" />
            </span>
            <div class="flex-1 min-w-0">
              <p class="text-[var(--fg)] truncate font-medium">{{ ev.title }}</p>
              <p class="text-[var(--fg-muted)] flex items-center gap-1 mt-0.5">
                <ng-icon name="remixTimeLine" size="10" aria-hidden="true" />
                {{ ev.startTime.substring(0, 5) }}
              </p>
            </div>
            <span class="text-[10px] text-[var(--fg-dim)] border border-[var(--ns-border)] rounded px-1">
              {{ ev.type === 'regular' ? 'Розклад' : 'Календар' }}
            </span>
          </div>
        }
      }
    </div>
    <div class="p-2 border-t border-[var(--ns-border)] flex gap-3 text-[10px] text-[var(--fg-dim)]">
      <span class="flex items-center gap-1">
        <ng-icon name="remixRepeatLine" size="10" aria-hidden="true" /> Розклад
      </span>
      <span class="flex items-center gap-1">
        <ng-icon name="remixCalendarCheckLine" size="10" aria-hidden="true" /> Календар
      </span>
    </div>
  `,
})
export class DayDetailPanelComponent {
  readonly date        = input.required<Date>();
  readonly occurrences = input<EventOccurrence[]>([]);

  protected readonly sorted = computed(() =>
    [...this.occurrences()].sort((a, b) => a.startTime.localeCompare(b.startTime)),
  );

  protected readonly formattedDate = computed(() =>
    this.date().toLocaleDateString('uk-UA', { weekday: 'long', day: 'numeric', month: 'long' }),
  );
}
