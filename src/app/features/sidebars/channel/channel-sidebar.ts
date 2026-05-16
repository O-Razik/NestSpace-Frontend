import { ChangeDetectionStrategy, Component, inject, ViewEncapsulation } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { provideIcons } from '@ng-icons/core';
import {
  lucideCalendar,
  lucideCalendarDays,
  lucideClock,
  lucideFileText,
  lucideHome,
  lucideLayoutGrid,
  lucideMegaphone,
  lucideMessageCircle,
  lucideSquareCheck,
} from '@ng-icons/lucide';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';
import { ChannelGroupComponent } from './channel-group';
import { ChannelItemComponent } from './channel-item';
import { ChannelSidebarHeader } from './channel-sidebar-header';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { SpaceService } from '../../../core/space/space.service';

const STUDY_CHANNELS: Array<{ id: number; name: string; subtitle: string; icon: string; badge: number; route?: string }> = [
  { id: 1, name: 'Home',      subtitle: '3 new tasks',     icon: 'lucideHome',        badge: 0 },
  { id: 2, name: 'Категорії', subtitle: '',                icon: 'lucideLayoutGrid',  badge: 0, route: 'categories' },
  { id: 3, name: 'Calendar',  subtitle: 'April 26',        icon: 'lucideCalendar',    badge: 0, route: 'calendar' },
  { id: 4, name: 'Schedule',  subtitle: '5 classes today', icon: 'lucideClock',       badge: 0, route: 'schedule' },
  { id: 5, name: 'Events',    subtitle: '2 upcoming',      icon: 'lucideCalendarDays', badge: 0 },
  { id: 6, name: 'Tasks',     subtitle: 'deadline today!', icon: 'lucideSquareCheck', badge: 3 },
  { id: 7, name: 'Notes',     subtitle: '3 new files',     icon: 'lucideFileText',    badge: 0 },
];

const CHAT_CHANNELS = [
  { id: 1, name: 'general',       subtitle: 'Maxim: where is the task?', icon: 'lucideMessageCircle', badge: 5 },
  { id: 2, name: 'tasks',         subtitle: '',                          icon: 'lucideMessageCircle', badge: 0 },
  { id: 3, name: 'announcements', subtitle: 'New slides uploaded',       icon: 'lucideMegaphone',     badge: 0 },
];

@Component({
  selector: 'channel-sidebar',
  imports: [
    ChannelGroupComponent, ChannelItemComponent, ChannelSidebarHeader,
    HlmSeparatorImports, HlmSidebarImports, RouterLink,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    provideIcons({
      lucideCalendar, lucideCalendarDays, lucideClock, lucideFileText,
      lucideHome, lucideLayoutGrid, lucideMegaphone, lucideMessageCircle, lucideSquareCheck,
    }),
  ],
  template: `
    <div class="h-full border" hlmSidebarWrapper>
      <hlm-sidebar class="p-2" collapsible="none">
        <div hlmSidebarHeader>
          <channel-sidebar-header />
        </div>
        <div hlmSidebarContent>
          <div hlmSidebarGroup>
            <channel-group label="Study">
              @for (ch of studyChannels; track ch.id) {
                <channel-item
                  [name]="ch.name"
                  [subtitle]="ch.subtitle"
                  [icon]="ch.icon"
                  [active]="isActive(ch.route)"
                  [badge]="ch.badge"
                  [routerLink]="ch.route ? ['/space', spaceService.selectedSpaceId(), ch.route] : null"
                />
              }
            </channel-group>
          </div>

          <hlm-separator />

          <div hlmSidebarGroup>
            <channel-group label="Chat">
              @for (ch of chatChannels; track ch.id) {
                <channel-item
                  [name]="ch.name"
                  [subtitle]="ch.subtitle"
                  [icon]="ch.icon"
                  [active]="false"
                  [badge]="ch.badge"
                />
              }
            </channel-group>
          </div>
        </div>
      </hlm-sidebar>
    </div>
  `,
})
export class ChannelSidebar {
  protected readonly spaceService = inject(SpaceService);
  private readonly _router = inject(Router);

  protected readonly studyChannels = STUDY_CHANNELS;
  protected readonly chatChannels = CHAT_CHANNELS;

  private readonly _currentUrl = toSignal(
    this._router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(() => this._router.url),
      startWith(this._router.url),
    ),
    { initialValue: this._router.url },
  );

  protected isActive(route?: string): boolean {
    if (!route) return false;
    return this._currentUrl().endsWith('/' + route);
  }
}
