import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { UserCard } from './user-card';

@Component({
  selector: 'dashboard-sidebar',
  imports: [HlmSidebarImports, UserCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="h-full border" hlmSidebarWrapper>
      <hlm-sidebar class="p-2" collapsible="none">
        <div hlmSidebarHeader>
          <user-card />
        </div>
        <div hlmSidebarContent>
        </div>
      </hlm-sidebar>
    </div>
  `,
})
export class DashboardSidebar {}
