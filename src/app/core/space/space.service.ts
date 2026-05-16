import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Subject, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AddSpaceMemberDto, CreateSpaceDto, CreateSpaceRoleDto, CreateSubgroupDto, SpaceDto, SpaceDtoShort, SpaceMemberDto, SpaceRoleDto, SubgroupDto, UpdateSpaceMemberDto } from './space.models';

@Injectable({ providedIn: 'root' })
export class SpaceService {
  private readonly _http = inject(HttpClient);
  private readonly _base = `${environment.apiUrl}/spaces`;

  private readonly _spaces = signal<SpaceDtoShort[]>([]);
  private readonly _selectedSpaceId = signal<string | null>(null);
  private readonly _memberDataChanged$ = new Subject<void>();
  /** Emits whenever member/subgroup data changes — SpaceLayout reloads panel on this. */
  readonly memberDataChanged$ = this._memberDataChanged$.asObservable();

  readonly spaces = this._spaces.asReadonly();
  readonly selectedSpaceId = this._selectedSpaceId.asReadonly();
  readonly selectedSpace = computed(() =>
    this._spaces().find(s => s.id === this._selectedSpaceId()) ?? null,
  );

  loadMySpaces() {
    return this._http
      .get<SpaceDtoShort[]>(`${this._base}/my-spaces`)
      .pipe(
        map(spaces => spaces.map(s => this._normalizeSpace(s))),
        tap(spaces => this._spaces.set(spaces)),
      );
  }

  createSpace(dto: CreateSpaceDto) {
    return this._http
      .post<SpaceDtoShort>(`${this._base}/create`, dto)
      .pipe(
        map(space => this._normalizeSpace(space)),
        tap(space => this._spaces.update(spaces => [...spaces, space])),
      );
  }

  updateSpace(spaceId: string, name: string, avatar?: File) {
    const formData = new FormData();
    formData.append('name', name);
    if (avatar) formData.append('avatar', avatar);
    return this._http
      .put<SpaceDtoShort>(`${this._base}/${spaceId}/update`, formData)
      .pipe(
        map(space => this._normalizeSpace(space)),
        tap(updated =>
          this._spaces.update(spaces => spaces.map(s => s.id === updated.id ? updated : s)),
        ),
      );
  }

  getSpaceById(spaceId: string) {
    return this._http.get<SpaceDto>(`${this._base}/${spaceId}`).pipe(
      map(dto => ({
        ...dto,
        avatarUrl: this._normalizeUrl(dto.avatarUrl),
        members: dto.members.map(m => ({
          ...m,
          user: { ...m.user, avatarUrl: this._normalizeUrl(m.user.avatarUrl) },
        })),
      })),
    );
  }

  addSpaceMember(spaceId: string, dto: AddSpaceMemberDto) {
    return this._http.post<SpaceMemberDto>(`${this._base}/${spaceId}/member/add`, dto);
  }

  updateSpaceMember(spaceId: string, dto: UpdateSpaceMemberDto) {
    return this._http.put<SpaceMemberDto>(`${this._base}/${spaceId}/member/update`, dto)
      .pipe(tap(() => this._memberDataChanged$.next()));
  }

  removeSpaceMember(spaceId: string, userId: string) {
    return this._http.delete<void>(`${this._base}/${spaceId}/member/remove/${userId}`)
      .pipe(tap(() => this._memberDataChanged$.next()));
  }


  deleteSpace(spaceId: string) {
    return this._http
      .delete<void>(`${this._base}/${spaceId}/delete`)
      .pipe(tap(() => {
        this._spaces.update(spaces => spaces.filter(s => s.id !== spaceId));
        if (this._selectedSpaceId() === spaceId) this._selectedSpaceId.set(null);
      }));
  }

  deleteSpaceAvatar(spaceId: string) {
    return this._http
      .delete<void>(`${this._base}/${spaceId}/avatar`)
      .pipe(tap(() =>
        this._spaces.update(spaces =>
          spaces.map(s => s.id === spaceId ? { ...s, avatarUrl: null } : s),
        ),
      ));
  }

  getSubgroups(spaceId: string) {
    return this._http.get<SubgroupDto[]>(`${this._base}/${spaceId}/subgroups`);
  }

  createSubgroup(spaceId: string, dto: CreateSubgroupDto) {
    return this._http.post<SubgroupDto>(`${this._base}/${spaceId}/subgroup/create`, dto)
      .pipe(tap(() => this._memberDataChanged$.next()));
  }

  deleteSubgroup(spaceId: string, subgroupId: string) {
    return this._http.delete<void>(`${this._base}/${spaceId}/subgroup/${subgroupId}/delete`)
      .pipe(tap(() => this._memberDataChanged$.next()));
  }

  createSpaceRole(spaceId: string, dto: CreateSpaceRoleDto) {
    return this._http.post<SpaceRoleDto>(`${this._base}/${spaceId}/role/create`, dto);
  }

  updateSpaceRole(spaceId: string, dto: SpaceRoleDto) {
    return this._http.put<SpaceRoleDto>(`${this._base}/${spaceId}/role/update`, dto);
  }

  deleteSpaceRole(spaceId: string, roleId: string) {
    return this._http.delete<void>(`${this._base}/${spaceId}/role/${roleId}/delete`);
  }

  selectSpace(id: string): void {
    this._selectedSpaceId.set(id);
  }

  selectDashboard(): void {
    this._selectedSpaceId.set(null);
  }

  private _normalizeSpace(space: SpaceDtoShort): SpaceDtoShort {
    return { ...space, avatarUrl: this._normalizeUrl(space.avatarUrl) };
  }

  private _normalizeUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    return url.startsWith('/') ? `${environment.apiUrl}${url}` : url;
  }
}
