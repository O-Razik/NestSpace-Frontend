import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { DashboardSidebar } from '../../features/sidebars/dashboard/dashboard-sidebar';

@Component({
  selector: 'dashboard-layout',
  imports: [DashboardSidebar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'flex flex-1 min-w-0 h-full' },
  template: `
    <dashboard-sidebar />

    <main class="flex-1 min-w-0 overflow-auto p-4" aria-label="Dashboard content">
    </main>
  `,
})
export class DashboardLayout {}
