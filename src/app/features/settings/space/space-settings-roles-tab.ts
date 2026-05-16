import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { SpaceService } from '../../../core/space/space.service';
import { SpaceRoleDto } from '../../../core/space/space.models';
import { RoleCardComponent } from './role-card.component';
import { RolePermissionsFormComponent, RolePermissionsValue } from './role-permissions-form.component';

@Component({
  selector: 'space-settings-roles-tab',
  imports: [HlmButtonImports, TranslocoPipe, RoleCardComponent, RolePermissionsFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (error()) {
      <p class="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">{{ error() }}</p>
    }

    @if (!creatingRole()) {
      <button hlmBtn size="sm" variant="outline" type="button" class="self-start" (click)="startCreating()">
        {{ 'space.roles.new' | transloco }}
      </button>
    }

    @if (creatingRole()) {
      <div class="rounded-lg border p-4 flex flex-col gap-3 bg-muted/30">
        <space-settings-role-permissions-form
          [title]="'space.roles.newTitle' | transloco"
          [nameAriaLabel]="'space.roles.newNameAriaLabel' | transloco"
          saveLabel="space.roles.create"
          [saving]="saving()"
          (save)="saveNew($event)"
          (cancel)="creatingRole.set(false)" />
      </div>
    }

    @for (role of roles(); track role.id) {
      <space-settings-role-card
        [role]="role"
        [editing]="editingId() === role.id"
        [deleting]="deletingId() === role.id"
        [saving]="saving()"
        (edit)="editingId.set(role.id); creatingRole.set(false)"
        (delete)="deleteRole(role)"
        (save)="saveEdited(role, $event)"
        (cancelEdit)="editingId.set(null)" />
    }
  `,
})
export class SpaceSettingsRolesTab {
  private readonly _spaceService = inject(SpaceService);
  private readonly _t = inject(TranslocoService);

  readonly spaceId = input.required<string>();
  readonly roles = input.required<SpaceRoleDto[]>();
  readonly rolesChange = output<SpaceRoleDto[]>();

  readonly error = signal<string | null>(null);
  readonly saving = signal(false);
  readonly deletingId = signal<string | null>(null);
  readonly creatingRole = signal(false);
  readonly editingId = signal<string | null>(null);

  startCreating(): void {
    this.editingId.set(null);
    this.creatingRole.set(true);
  }

  saveNew({ name, permissions }: RolePermissionsValue): void {
    if (this.saving()) return;
    this.saving.set(true);
    this.error.set(null);
    this._spaceService.createSpaceRole(this.spaceId(), { name, rolePermissions: permissions }).subscribe({
      next: role => {
        this.rolesChange.emit([...this.roles(), role]);
        this.creatingRole.set(false);
        this.saving.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(err.error?.message ?? this._t.translate('space.roles.errorCreate'));
        this.saving.set(false);
      },
    });
  }

  saveEdited(role: SpaceRoleDto, { name, permissions }: RolePermissionsValue): void {
    if (this.saving()) return;
    this.saving.set(true);
    this.error.set(null);
    this._spaceService.updateSpaceRole(this.spaceId(), { ...role, name, rolePermissions: permissions }).subscribe({
      next: updated => {
        this.rolesChange.emit(this.roles().map(r => r.id === updated.id ? updated : r));
        this.editingId.set(null);
        this.saving.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(err.error?.message ?? this._t.translate('space.roles.errorSave'));
        this.saving.set(false);
      },
    });
  }

  deleteRole(role: SpaceRoleDto): void {
    if (this.deletingId()) return;
    this.deletingId.set(role.id);
    this.error.set(null);
    this._spaceService.deleteSpaceRole(this.spaceId(), role.id).subscribe({
      next: () => {
        this.rolesChange.emit(this.roles().filter(r => r.id !== role.id));
        this.deletingId.set(null);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(err.error?.message ?? this._t.translate('space.roles.errorDelete'));
        this.deletingId.set(null);
      },
    });
  }
}
