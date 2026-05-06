import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateSpaceDto, SpaceDtoShort } from './space.models';

@Injectable({ providedIn: 'root' })
export class SpaceService {
  private readonly _http = inject(HttpClient);
  private readonly _base = `${environment.apiUrl}/api/spaces`;

  private readonly _spaces = signal<SpaceDtoShort[]>([]);
  private readonly _selectedSpaceId = signal<string | null>(null);

  readonly spaces = this._spaces.asReadonly();
  readonly selectedSpaceId = this._selectedSpaceId.asReadonly();

  loadMySpaces() {
    return this._http
      .get<SpaceDtoShort[]>(`${this._base}/my-spaces`)
      .pipe(tap(spaces => this._spaces.set(spaces)));
  }

  createSpace(dto: CreateSpaceDto) {
    return this._http
      .post<SpaceDtoShort>(`${this._base}/create`, dto)
      .pipe(tap(space => this._spaces.update(spaces => [...spaces, space])));
  }

  uploadSpaceAvatar(spaceId: string, file: File) {
    const formData = new FormData();
    formData.append('avatar', file);
    return this._http
      .post<SpaceDtoShort>(`${this._base}/${spaceId}/avatar`, formData)
      .pipe(
        tap(updated =>
          this._spaces.update(spaces => spaces.map(s => (s.id === updated.id ? updated : s))),
        ),
      );
  }

  selectSpace(id: string): void {
    this._selectedSpaceId.set(id);
  }
}