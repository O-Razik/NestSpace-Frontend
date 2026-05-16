import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, merge, of, switchMap, map } from 'rxjs';
import { ChannelSidebar } from '../../features/sidebars/channel/channel-sidebar';
import { MembersPanel } from '../../features/members-panel/members-panel.component';
import { SpaceService } from '../../core/space/space.service';
import { AuthService } from '../../core/auth/auth.service';
import { SpaceMemberDto, SubgroupDto } from '../../core/space/space.models';
import { SpaceMember } from '../../features/members-panel/members-panel.types';
import { environment } from '../../../environments/environment';

const PALETTE = [
  '#4f46e5', '#0891b2', '#059669', '#d97706',
  '#dc2626', '#7c3aed', '#db2777', '#65a30d',
];

function colorFromId(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = Math.imul(31, h) + id.charCodeAt(i) | 0;
  return PALETTE[Math.abs(h) % PALETTE.length];
}

function toSpaceMember(dto: SpaceMemberDto): SpaceMember {
  return {
    id: dto.userId,
    name: dto.spaceUsername ?? dto.user.username,
    username: dto.user.username,
    avatarUrl: dto.user.avatarUrl?.startsWith('/')
      ? `${environment.apiUrl}${dto.user.avatarUrl}`
      : dto.user.avatarUrl ?? null,
    avatarColor: colorFromId(dto.userId),
    role: dto.role?.name && dto.role.name !== 'Member' ? dto.role.name : null,
    online: false,
    subgroupId: dto.subgroupId,
    hasAccess: true,
  };
}

@Component({
  selector: 'space-layout',
  imports: [RouterOutlet, ChannelSidebar, MembersPanel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'flex flex-1 min-w-0 h-full' },
  template: `
    <channel-sidebar />

    <main class="flex-1 min-w-0 overflow-auto" aria-label="Channel content">
      <router-outlet />
    </main>

    <members-panel
      [members]="members()"
      [subgroups]="subgroups()"
      [currentMemberDto]="currentMemberDto()"
      [spaceId]="_spaceService.selectedSpaceId()" />
  `,
})
export class SpaceLayout {
  protected readonly _spaceService = inject(SpaceService);
  private readonly _authService = inject(AuthService);
  private readonly _destroyRef = inject(DestroyRef);

  readonly members = signal<SpaceMember[]>([]);
  readonly subgroups = signal<SubgroupDto[]>([]);
  readonly currentMemberDto = signal<SpaceMemberDto | null>(null);

  constructor() {
    const selectedSpaceId$ = toObservable(this._spaceService.selectedSpaceId);

    // Re-fetch when space changes OR when member/subgroup data is mutated in settings.
    // debounceTime(300) collapses rapid sequential updates (e.g. batch member adds).
    merge(
      selectedSpaceId$,
      this._spaceService.memberDataChanged$.pipe(
        debounceTime(300),
        map(() => this._spaceService.selectedSpaceId()),
      ),
    )
      .pipe(
        switchMap(id =>
          id
            ? this._spaceService.getSpaceById(id).pipe(
                map(dto => ({
                  members: dto.members.map(toSpaceMember),
                  subgroups: dto.subgroups ?? [],
                  rawMembers: dto.members,
                })),
                catchError(() => of({ members: [] as SpaceMember[], subgroups: [] as SubgroupDto[], rawMembers: [] as SpaceMemberDto[] })),
              )
            : of({ members: [] as SpaceMember[], subgroups: [] as SubgroupDto[], rawMembers: [] as SpaceMemberDto[] }),
        ),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe(({ members, subgroups, rawMembers }) => {
        this.members.set(members);
        this.subgroups.set(subgroups);
        const currentUserId = this._authService.currentUser()?.id;
        const currentDto = currentUserId ? rawMembers.find(m => m.userId === currentUserId) ?? null : null;
        this.currentMemberDto.set(currentDto);
      });
  }
}
