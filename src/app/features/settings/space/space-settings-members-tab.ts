import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, forkJoin, of } from 'rxjs';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';
import { SpaceService } from '../../../core/space/space.service';
import { SpaceMemberDto, SpaceRoleDto, SubgroupDto } from '../../../core/space/space.models';
import { UserSearchInline } from '../../../shared/user-search/user-search-inline';
import { SpaceSettingsSubgroupsTab } from './space-settings-subgroups-tab';
import { SpaceSettingsMemberRow } from './space-settings-member-row';

@Component({
  selector: 'space-settings-members-tab',
  imports: [HlmButtonImports, HlmSeparatorImports, UserSearchInline, TranslocoPipe, SpaceSettingsSubgroupsTab, SpaceSettingsMemberRow],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (error()) {
      <p class="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">{{ error() }}</p>
    }
    @if (success()) {
      <p class="rounded-md bg-green-500/10 px-3 py-2 text-xs text-green-600">{{ success() }}</p>
    }

    @if (members().length === 0) {
      <p class="text-sm text-muted-foreground text-center py-6">{{ 'space.members.empty' | transloco }}</p>
    } @else {
      <ul role="list" class="flex flex-col">
        @for (member of members(); track member.userId; let last = $last) {
          <li [class.border-b]="!last">
            <space-settings-member-row
              [member]="member"
              [roles]="roles()"
              [subgroups]="subgroups()"
              [effectiveRoleId]="effectiveRoleId(member)"
              [effectiveSubgroupId]="effectiveSubgroupId(member)"
              [hasPendingChange]="hasPendingChange(member.userId)"
              [saving]="savingUserId() === member.userId"
              [removing]="removingUserId() === member.userId"
              (roleChange)="onRoleChange(member, $event)"
              (subgroupChange)="onSubgroupChange(member, $event)"
              (save)="saveMember(member)"
              (remove)="removeMember(member)" />
          </li>
        }
      </ul>
    }

    <hlm-separator />

    <div class="flex flex-col gap-2">
      <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{{ 'space.members.addTitle' | transloco }}</p>
      @if (showAddSection()) {
        <user-search-inline (selectionChange)="_selectedNew.set($event)" />
        @if (_selectedNew().length > 0) {
          <div class="flex justify-end">
            <button hlmBtn size="sm" type="button"
              [disabled]="adding()"
              (click)="addSelected()">
              {{ adding()
                ? ('space.members.adding' | transloco)
                : ('space.members.addCount' | transloco: { count: _selectedNew().length }) }}
            </button>
          </div>
        }
      }
    </div>

    <hlm-separator />

    <div class="flex flex-col gap-2">
      <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{{ 'space.subgroups.title' | transloco }}</p>
      <space-settings-subgroups-tab
        [spaceId]="spaceId()"
        [subgroups]="subgroups()"
        (subgroupsChange)="subgroupsChange.emit($event)" />
    </div>
  `,
})
export class SpaceSettingsMembersTab {
  private readonly _spaceService = inject(SpaceService);
  private readonly _t = inject(TranslocoService);

  readonly spaceId = input.required<string>();
  readonly members = input.required<SpaceMemberDto[]>();
  readonly roles = input.required<SpaceRoleDto[]>();
  readonly subgroups = input.required<SubgroupDto[]>();
  readonly membersChange = output<SpaceMemberDto[]>();
  readonly subgroupsChange = output<SubgroupDto[]>();

  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly savingUserId = signal<string | null>(null);
  readonly removingUserId = signal<string | null>(null);
  readonly adding = signal(false);
  readonly showAddSection = signal(true);
  readonly _selectedNew = signal<{ id: string; username: string; email: string; avatarUrl: string | null }[]>([]);
  // undefined = not changed; null = explicitly set to "no subgroup"; string = set to specific subgroup
  private readonly _pendingRoles = signal<Partial<Record<string, string>>>({});
  private readonly _pendingSubgroups = signal<Partial<Record<string, string | null>>>({});

  /** Effective role id for display — pending takes priority. */
  effectiveRoleId(member: SpaceMemberDto): string {
    return this._pendingRoles()[member.userId] ?? member.roleId;
  }

  /** Effective subgroup id for display — pending takes priority. */
  effectiveSubgroupId(member: SpaceMemberDto): string | null {
    const pending = this._pendingSubgroups()[member.userId];
    return pending !== undefined ? pending : member.subgroupId;
  }

  hasPendingChange(userId: string): boolean {
    const member = this.members().find(m => m.userId === userId);
    if (!member) return false;
    const role = this._pendingRoles()[userId];
    if (role !== undefined && role !== member.roleId) return true;
    const sub = this._pendingSubgroups()[userId];
    if (sub !== undefined && sub !== member.subgroupId) return true;
    return false;
  }

  onRoleChange(member: SpaceMemberDto, roleId: string): void {
    this._pendingRoles.update(p => ({ ...p, [member.userId]: roleId }));
  }

  onSubgroupChange(member: SpaceMemberDto, subgroupId: string | null): void {
    this._pendingSubgroups.update(p => ({ ...p, [member.userId]: subgroupId }));
  }

  saveMember(member: SpaceMemberDto): void {
    if (this.savingUserId()) return;
    this.savingUserId.set(member.userId);
    this.error.set(null);
    this._spaceService.updateSpaceMember(this.spaceId(), {
      spaceId: member.spaceId,
      userId: member.userId,
      roleId: this.effectiveRoleId(member),
      spaceUsername: member.spaceUsername,
      subgroupId: this.effectiveSubgroupId(member),
      joinedAt: member.joinedAt,
    }).subscribe({
      next: updated => {
        this.membersChange.emit(this.members().map(m => m.userId === updated.userId ? updated : m));
        this._pendingRoles.update(p => { const n = { ...p }; delete n[member.userId]; return n; });
        this._pendingSubgroups.update(p => { const n = { ...p }; delete n[member.userId]; return n; });
        this.savingUserId.set(null);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(err.error?.message ?? this._t.translate('space.members.errorSave'));
        this.savingUserId.set(null);
      },
    });
  }

  removeMember(member: SpaceMemberDto): void {
    if (this.removingUserId()) return;
    this.removingUserId.set(member.userId);
    this.error.set(null);
    this._spaceService.removeSpaceMember(this.spaceId(), member.userId).subscribe({
      next: () => {
        this.membersChange.emit(this.members().filter(m => m.userId !== member.userId));
        this._pendingRoles.update(p => { const n = { ...p }; delete n[member.userId]; return n; });
        this._pendingSubgroups.update(p => { const n = { ...p }; delete n[member.userId]; return n; });
        this.removingUserId.set(null);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(err.error?.message ?? this._t.translate('space.members.errorRemove'));
        this.removingUserId.set(null);
      },
    });
  }

  addSelected(): void {
    const users = this._selectedNew();
    if (!users.length || this.adding()) return;
    this.adding.set(true);
    this.error.set(null);

    const defaultRole = this.roles().find(r => r.name === 'Member') ?? this.roles()[0];
    if (!defaultRole) { this.adding.set(false); return; }

    forkJoin(
      users.map(u =>
        this._spaceService.addSpaceMember(this.spaceId(), { userId: u.id, roleId: defaultRole.id })
          .pipe(catchError(() => of(null))),
      ),
    ).subscribe(results => {
      const added = results.filter((r): r is SpaceMemberDto => r !== null);
      this.membersChange.emit([...this.members(), ...added]);
      this._selectedNew.set([]);
      this.adding.set(false);
      this.showAddSection.set(false);
      setTimeout(() => this.showAddSection.set(true), 0);
      this.success.set(this._t.translate('space.members.addedCount', { count: added.length }));
      setTimeout(() => this.success.set(null), 3000);
    });
  }
}
