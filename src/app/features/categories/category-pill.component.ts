import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { CategoryShortDto } from '../../api/event-schedule/models/category';

@Component({
  selector: 'app-category-pill',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon],
  template: `
    <button
      type="button"
      class="flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
      [style.--pill-color]="category().color"
      [class]="active()
        ? 'border-[var(--pill-color)] bg-[color-mix(in_srgb,var(--pill-color)_15%,transparent)] text-[var(--fg)]'
        : 'border-[var(--ns-border)] bg-[var(--surface)] text-[var(--fg-muted)] hover:border-[var(--pill-color)] hover:text-[var(--fg)]'"
      [attr.aria-pressed]="active()"
      (click)="select.emit(category().id)"
    >
      <ng-icon [name]="category().icon" size="14" aria-hidden="true" />
      <span>{{ category().title }}</span>
    </button>
  `,
})
export class CategoryPillComponent {
  readonly category = input.required<CategoryShortDto>();
  readonly active   = input<boolean>(false);
  readonly select   = output<string>();
}
