import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import {
  lucideCalendar,
  lucideCalendarDays,
  lucideClock,
  lucideFileText,
  lucideHome,
  lucideMegaphone,
  lucideMessageCircle,
  lucideSquareCheck,
} from '@ng-icons/lucide';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';
import { ChannelGroupComponent } from './channel-group';
import { ChannelItemComponent } from './channel-item';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';

@Component({
  selector: 'channel-sidebar',
  imports: [ChannelGroupComponent, ChannelItemComponent, HlmSeparatorImports, HlmSidebarImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    provideIcons({
      lucideCalendar,
      lucideCalendarDays,
      lucideClock,
      lucideFileText,
      lucideHome,
      lucideMegaphone,
      lucideMessageCircle,
      lucideSquareCheck,
    }),
  ],
  template: `
    <hlm-sidebar class="h-full p-4 border" collapsible="none">
      <div hlmSidebarHeader>
        <h2 class="text-sm font-semibold">Channels</h2>
      </div>
      <div hlmSidebarContent>
        <!-- study-sidebar -->
        <div hlmSidebarGroup>
          <channel-group label="Study">
            @for (study of studyChannels; track study.id) {
              <channel-item
                [name]="study.name"
                [subtitle]="study.subtitle"
                [icon]="study.icon"
                [active]="study.active"
                [badge]="study.badge"
              />
            }
          </channel-group>
        </div>

        <hlm-separator />

        <!-- chat-sidebar -->
        <div hlmSidebarGroup>
          <channel-group label="Chat">
            @for (chat of chatChannels; track chat.id) {
              <channel-item
                [name]="chat.name"
                [subtitle]="chat.subtitle"
                [icon]="chat.icon"
                [active]="chat.active"
                [badge]="chat.badge"
              />
            }
          </channel-group>
        </div>
      </div>
    </hlm-sidebar>
  `,
})
export class ChannelSidebar {
  studyChannels = [
    { id: 1, name: 'Home', subtitle: '3 new tasks', icon: 'lucideHome', active: false, badge: 0 },
    {
      id: 2,
      name: 'Calendar',
      subtitle: 'April 26',
      icon: 'lucideCalendar',
      active: true,
      badge: 0,
    },
    {
      id: 3,
      name: 'Schedule',
      subtitle: '5 classes today',
      icon: 'lucideClock',
      active: false,
      badge: 0,
    },
    {
      id: 4,
      name: 'Events',
      subtitle: '2 upcoming',
      icon: 'lucideCalendarDays',
      active: false,
      badge: 0,
    },
    {
      id: 5,
      name: 'Tasks',
      subtitle: 'deadline today!',
      icon: 'lucideSquareCheck',
      active: false,
      badge: 3,
    },
    {
      id: 6,
      name: 'Notes',
      subtitle: '3 new files',
      icon: 'lucideFileText',
      active: false,
      badge: 0,
    },
  ];

  chatChannels = [
    {
      id: 1,
      name: 'general',
      subtitle: 'Maxim: where is the task?',
      icon: 'lucideMessageCircle',
      active: false,
      badge: 5,
    },
    { id: 2, name: 'tasks', subtitle: '', icon: 'lucideMessageCircle', active: false, badge: 0 },
    {
      id: 3,
      name: 'announcements',
      subtitle: 'New slides uploaded',
      icon: 'lucideMegaphone',
      active: false,
      badge: 0,
    },
  ];
}
