import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppSidebar } from './app-sidebar';

@Component({
  selector: 'layout',
  imports: [RouterOutlet, AppSidebar],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block',
  },
  template: `
    <div class="flex h-screen">
      <app-layout-sidebar></app-layout-sidebar>
      <div class="flex-1 p-4">
        <router-outlet />
      </div>
    </div>
  `,
  providers: [],
})
export default class MainLayoutComponent {}
