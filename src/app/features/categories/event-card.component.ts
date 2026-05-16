import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { remixTimeLine, remixMapPinLine, remixRepeatLine, remixCalendarCheckLine } from '@ng-icons/remixicon';
import { RegularEventDto } from '../../api/event-schedule/models/regular-event';
import { SoloEventDto } from '../../api/event-schedule/models/solo-event';
import { CategoryShortDto } from '../../api/event-schedule/models/category';

@Component({
  selector: 'app-event-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon],
  viewProviders: [provideIcons({ remixTimeLine, remixMapPinLine, remixRepeatLine, remixCalendarCheckLine })],
  host: { class: 'block' },
  template: `
    <div
      class="flex flex-col gap-1 rounded-[var(--ns-radius)] p-2 text-xs"
      [style.border-left]="'3px solid ' + category().color"
      [style.background]="category().color + '14'"
    >
      <div class="flex items-start gap-2">
        <span
          class="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
          [style.background]="category().color + '22'"
          [style.border]="'1px solid ' + category().color"
          aria-hidden="true"
        >
          <ng-icon [name]="isRegular() ? 'remixRepeatLine' : 'remixCalendarCheckLine'" size="12" />
        </span>
        <div class="flex-1 min-w-0">
          <p class="font-medium text-[var(--fg)] truncate">{{ event().title }}</p>
          @if (tags().length) {
            <div class="flex flex-wrap gap-1 mt-1">
              @for (tag of tags(); track tag.id) {
                <span class="rounded-[3px] px-1.5 py-px text-[10px] bg-[var(--surface3)] text-[var(--fg-muted)]">{{ tag.title }}</span>
              }
            </div>
          }
        </div>
      </div>
      <div class="flex items-center gap-3 text-[var(--fg-muted)] pl-9">
        @if (startTime()) {
          <span class="flex items-center gap-1">
            <ng-icon name="remixTimeLine" size="11" aria-hidden="true" />
            {{ startTime() }}
          </span>
        }
        @if (description()) {
          <span class="flex items-center gap-1">
            <ng-icon name="remixMapPinLine" size="11" aria-hidden="true" />
            {{ description() }}
          </span>
        }
      </div>
    </div>
  `,
})
export class EventCardComponent {
  readonly event    = input.required<RegularEventDto | SoloEventDto>();
  readonly category = input.required<CategoryShortDto>();

  protected readonly isRegular = computed(() => 'day' in this.event());
  protected readonly tags      = computed(() => this.event().tags);
  protected readonly description = computed(() => this.event().description);
  protected readonly startTime = computed(() => {
    const ev = this.event();
    if ('startTime' in ev) return ev.startTime.substring(0, 5);
    if ('startDate' in ev) return new Date(ev.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return '';
  });
}
