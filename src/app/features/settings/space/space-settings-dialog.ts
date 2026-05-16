import { ChangeDetectionStrategy, Component, inject, input, output, signal, ViewEncapsulation } from '@angular/core';
import { BrnDialogState } from '@spartan-ng/brain/dialog';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideTrash2 } from '@ng-icons/lucide';
import { TranslocoPipe } from '@jsverse/transloco';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { SpaceService } from '../../../core/space/space.service';
import { SpaceMemberDto, SpaceRoleDto, SubgroupDto } from '../../../core/space/space.models';
import { UniversalSettingsDialog } from '../../../shared/settings/universal-settings-dialog';
import { SettingsTabDirective } from '../../../shared/settings/settings-tab.directive';
import { SpaceSettingsGeneralTab } from './space-settings-general-tab';
import { SpaceSettingsRolesTab } from './space-settings-roles-tab';
import { SpaceSettingsMembersTab } from './space-settings-members-tab';

@Component({
  selector: 'space-settings-dialog',
  imports: [
    HlmButtonImports,
    HlmIcon,
    HlmInputImports,
    NgIcon,
    TranslocoPipe,
    UniversalSettingsDialog,
    SettingsTabDirective,
    SpaceSettingsGeneralTab,
    SpaceSettingsRolesTab,
    SpaceSettingsMembersTab,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'contents' },
  providers: [provideIcons({ lucideTrash2 })],
  template: `
    <universal-settings-dialog
      [triggerLabel]="'space.settings.trigger' | transloco"
      [allLabel]="'space.settings.all' | transloco"
      [loading]="loading()"
      [externalState]="externalState()"
      [initialTab]="initialTab()"
      [hideTrigger]="hideTrigger()"
      (opened)="_load()"
      (closed)="closed.emit()">

      <!-- Deletion confirmation overlay -->
      @if (confirmDelete()) {
        <div dialogOverlay class="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/95 backdrop-blur-sm p-6">
          <div class="flex flex-col items-center gap-4 text-center max-w-xs">
            <p class="font-semibold text-base text-destructive">{{ 'space.danger.title' | transloco }}</p>
            <p class="text-sm text-muted-foreground">
              {{ 'space.danger.body' | transloco }}
              <code class="rounded bg-muted px-1 py-0.5 font-mono text-xs">{{ loadedName() }}</code>
              {{ 'space.danger.bodySuffix' | transloco }}
            </p>
            <input hlmInput type="text"
              [placeholder]="loadedName()"
              [value]="deleteConfirmInput()"
              (input)="deleteConfirmInput.set($any($event.target).value)"
              class="w-full"
              [attr.aria-label]="'space.danger.title' | transloco" />
            <div class="flex gap-2 w-full">
              <button hlmBtn variant="outline" class="flex-1"
                (click)="confirmDelete.set(false); deleteConfirmInput.set('')">
                {{ 'common.cancel' | transloco }}
              </button>
              <button hlmBtn variant="destructive" class="flex-1"
                [disabled]="deleteConfirmInput() !== loadedName() || deleteLoading()"
                (click)="doDelete()">
                {{ (deleteLoading() ? 'space.danger.deleting' : 'space.danger.delete') | transloco }}
              </button>
            </div>
          </div>
        </div>
      }

      <span headerActions class="text-xs text-muted-foreground truncate max-w-40 select-none">{{ loadedName() }}</span>

      <ng-template settingsTab key="general" [label]="'space.settings.general' | transloco">
        <space-settings-general-tab
          [spaceId]="spaceId()"
          [spaceName]="loadedName()"
          [currentAvatarUrl]="loadedAvatarUrl()"
          (avatarRemoved)="loadedAvatarUrl.set(null)" />
      </ng-template>

      <ng-template settingsTab key="roles" [label]="'space.settings.roles' | transloco">
        <space-settings-roles-tab
          [spaceId]="spaceId()"
          [roles]="roles()"
          (rolesChange)="roles.set($event)" />
      </ng-template>

      <ng-template settingsTab key="members" [label]="'space.settings.members' | transloco">
        <space-settings-members-tab
          [spaceId]="spaceId()"
          [members]="members()"
          [roles]="roles()"
          [subgroups]="subgroups()"
          (membersChange)="members.set($event)"
          (subgroupsChange)="subgroups.set($event)" />
      </ng-template>

      <!-- Danger zone -->
      <ng-template settingsTab key="danger" [label]="'space.settings.danger' | transloco" [showInAllOnly]="true" [skipHeading]="true">
        <h3 class="mb-4 text-sm font-semibold text-destructive">{{ 'space.danger.dangerZone' | transloco }}</h3>
        <button hlmBtn variant="destructive" type="button" class="w-full"
          (click)="confirmDelete.set(true)">
          <ng-icon hlm name="lucideTrash2" size="sm" class="mr-2" />
          {{ 'space.danger.delete' | transloco }}
        </button>
      </ng-template>

    </universal-settings-dialog>
  `,
})
export class SpaceSettingsDialog {
  private readonly _spaceService = inject(SpaceService);

  readonly spaceId = input.required<string>();
  readonly spaceName = input('');
  readonly currentAvatarUrl = input<string | null>(null);
  readonly externalState = input<BrnDialogState | null>(null);
  readonly initialTab = input('all');
  readonly hideTrigger = input(false);
  readonly closed = output<void>();

  readonly loading = signal(false);
  readonly members = signal<SpaceMemberDto[]>([]);
  readonly roles = signal<SpaceRoleDto[]>([]);
  readonly subgroups = signal<SubgroupDto[]>([]);
  readonly loadedName = signal('');
  readonly loadedAvatarUrl = signal<string | null>(null);

  readonly confirmDelete = signal(false);
  readonly deleteConfirmInput = signal('');
  readonly deleteLoading = signal(false);

  _load(): void {
    this.loading.set(true);
    this.confirmDelete.set(false);
    this.deleteConfirmInput.set('');
    this._spaceService.getSpaceById(this.spaceId()).subscribe({
      next: dto => {
        this.members.set(dto.members);
        this.roles.set(dto.roles);
        this.subgroups.set(dto.subgroups ?? []);
        this.loadedName.set(dto.name);
        this.loadedAvatarUrl.set(dto.avatarUrl ?? null);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  doDelete(): void {
    if (this.deleteLoading()) return;
    this.deleteLoading.set(true);
    this._spaceService.deleteSpace(this.spaceId()).subscribe({
      error: () => this.deleteLoading.set(false),
    });
  }
}
