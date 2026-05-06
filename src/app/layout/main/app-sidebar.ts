import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { ChannelSidebar } from '../../features/sidebars/channel/channel-sidebar';
import { SpaceSidebar } from '../../features/sidebars/space/space-sidebar';

@Component({
  selector: 'app-layout-sidebar',
  imports: [SpaceSidebar, ChannelSidebar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'flex h-full shrink-0' },
  template: `
    <space-sidebar />
    <channel-sidebar />
  `,
})
export class AppSidebar {}
