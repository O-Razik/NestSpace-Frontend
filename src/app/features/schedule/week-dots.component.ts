import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Frequency } from '../../api/event-schedule/models/regular-event';
import { WeekTypeName } from './utils/filter-events';

@Component({
  selector: 'app-week-dots',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @switch (frequency()) {
      @case (Freq.Weekly) { }
      @case (Freq.BiWeekly) {
        <span class="text-[9px] px-1 py-0.5 rounded bg-[var(--surface3)] text-[var(--fg-dim)]"
              aria-label="кожні 2 тижні">2т</span>
      }
      @case (Freq.Numerator) {
        <span
          class="text-[9px] px-1.5 py-0.5 rounded font-bold"
          [class]="effectiveWeekType() === 'Numerator'
            ? 'bg-[var(--accent-color)] text-black'
            : 'bg-[var(--surface3)] text-[var(--fg-dim)]'"
          aria-label="чисельник"
        >Ч</span>
      }
      @case (Freq.Denominator) {
        <span
          class="text-[9px] px-1.5 py-0.5 rounded font-bold"
          [class]="effectiveWeekType() === 'Denominator'
            ? 'bg-[var(--warn)] text-black'
            : 'bg-[var(--surface3)] text-[var(--fg-dim)]'"
          aria-label="знаменник"
        >З</span>
      }
      @case (Freq.TriWeekly) {
        <span class="flex gap-0.5" aria-label="кожні 3 тижні">
          @for (i of three; track i) {
            <span
              class="inline-block w-1.5 h-1.5 rounded-full transition-transform"
              [style.background]="isActiveDot(i, 3) ? 'var(--accent-color)' : 'var(--fg-dim)'"
              [style.transform]="isActiveDot(i, 3) ? 'scale(1.3)' : ''"
              [attr.aria-hidden]="true"
            ></span>
          }
        </span>
      }
      @case (Freq.Monthly) {
        <span class="flex gap-0.5" aria-label="раз на 4 тижні">
          @for (i of four; track i) {
            <span
              class="inline-block w-1.5 h-1.5 rounded-full transition-transform"
              [style.background]="isActiveDot(i, 4) ? 'var(--accent-color)' : 'var(--fg-dim)'"
              [style.transform]="isActiveDot(i, 4) ? 'scale(1.3)' : ''"
              [attr.aria-hidden]="true"
            ></span>
          }
        </span>
      }
    }
  `,
})
export class WeekDotsComponent {
  readonly frequency       = input.required<Frequency>();
  readonly effectiveWeekType = input<WeekTypeName>('Numerator');
  readonly currentWeekNum  = input<number>(1);

  protected readonly Freq = Frequency;
  protected readonly three = [0, 1, 2];
  protected readonly four  = [0, 1, 2, 3];

  protected isActiveDot(idx: number, period: number): boolean {
    return (this.currentWeekNum() - 1) % period === idx;
  }
}
