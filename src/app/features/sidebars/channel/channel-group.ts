import { Component, signal, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronDown } from '@ng-icons/lucide';

@Component({
  selector: 'channel-group',
  standalone: true,
  imports: [NgIcon],
  template: `
    <div class="flex flex-col gap-1.5">
      <button
        (click)="collapsed.set(!collapsed())"
        class="flex w-full items-center justify-between rounded-md px-1 py-2 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-fg-dim transition-colors hover:text-fg-muted">
        <span>{{ label() }}</span>
        <ng-icon
          name="lucideChevronDown"
          class="text-[0.7rem] transition-transform duration-200"
          [class.rotate-90]="collapsed()"
        />
      </button>
      <div class="collapsible" [class.collapsed]="collapsed()">
        <div class="space-y-1">
          <ng-content />
        </div>
      </div>
    </div>
  `,
  styles: `
    .collapsible {
      display: grid;
      grid-template-rows: 1fr;
      transition: grid-template-rows 200ms ease;
    }
    .collapsible.collapsed {
      grid-template-rows: 0fr;
    }
    .collapsible > div {
      overflow: hidden;
    }
  `,
  providers: [
    provideIcons({
      lucideChevronDown,
    }),
  ],
})
export class ChannelGroupComponent {
  label = input.required<string>();
  collapsed = signal(false);
}
