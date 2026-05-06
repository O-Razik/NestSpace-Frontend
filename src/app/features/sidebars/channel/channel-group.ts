import { Component, signal, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronDown } from '@ng-icons/lucide';

@Component({
  selector: 'channel-group',
  standalone: true,
  imports: [NgIcon],
  template: `
    <div class="flex flex-col gap-1">
      <button (click)="collapsed.set(!collapsed())" class="section-header flex justify-between items-center w-full">
        <span>{{ label() }}</span>
        <ng-icon
          name="lucideChevronDown"
          class="transition-transform duration-200"
          [class.rotate-90]="collapsed()"
        />
      </button>
      <div class="collapsible" [class.collapsed]="collapsed()">
        <div>
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
