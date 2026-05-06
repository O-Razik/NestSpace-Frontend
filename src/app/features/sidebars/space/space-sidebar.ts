import { ChangeDetectionStrategy, Component, inject, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { provideIcons } from '@ng-icons/core';
import { lucideOrbit } from '@ng-icons/lucide';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';
import { SpaceService } from '../../../core/space/space.service';
import { CreateSpaceSheet } from './create-space-sheet';
import { SpaceIconComponent } from './space-icon';

@Component({
  selector: 'space-sidebar',
  imports: [SpaceIconComponent, CreateSpaceSheet, HlmSidebarImports, HlmSeparatorImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [provideIcons({ lucideOrbit })],
  template: `
    <div hlmSidebarWrapper [sidebarWidth]="'64px'">
      <hlm-sidebar collapsible="none">
        <div hlmSidebarHeader>
          <space-icon
            [icon]="'lucideOrbit'"
            [label]="'Dashboard'"
            [active]="true"
            [shape]="'rounded'"
          />
          <hlm-separator />
        </div>
        <div hlmSidebarContent>
          @for (space of spaces(); track space.id) {
            <space-icon
              [label]="space.name"
              [avatarUrl]="space.avatarUrl"
              [active]="space.id === selectedSpaceId()"
              (click)="spaceService.selectSpace(space.id)"
            />
          }
        </div>
        <div hlmSidebarFooter>
          <hlm-separator />
          <create-space-sheet />
        </div>
      </hlm-sidebar>
    </div>
  `,
})
export class SpaceSidebar {
  protected readonly spaceService = inject(SpaceService);
  readonly spaces = this.spaceService.spaces;
  readonly selectedSpaceId = this.spaceService.selectedSpaceId;

  constructor() {
    this.spaceService.loadMySpaces().pipe(takeUntilDestroyed()).subscribe();
  }
}