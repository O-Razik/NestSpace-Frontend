import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SpaceSidebar } from '../../features/sidebars/space/space-sidebar';
import { NotificationComponent } from '../../shared/notification/notification.component';

@Component({
  selector: 'layout',
  imports: [RouterOutlet, SpaceSidebar, NotificationComponent],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex h-screen' },
  template: `
    <space-sidebar />
    <div class="flex flex-1 min-w-0 h-full">
      <router-outlet />
    </div>
    <app-notification />
  `,
})
export default class MainLayoutComponent {}
