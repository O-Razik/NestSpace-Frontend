import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { RegularEventCreateDto, RegularEventDto, UpdateRegularEventDto } from '../models/regular-event';

@Injectable({ providedIn: 'root' })
export class RegularEventApiService {
  private readonly _http = inject(HttpClient);
  private readonly _base = environment.apiUrl;

  getAll(spaceId: string) {
    return this._http.get<RegularEventDto[]>(`${this._base}/space/${spaceId}/regular_events/all`);
  }

  getById(spaceId: string, eventId: string) {
    return this._http.get<RegularEventDto>(`${this._base}/space/${spaceId}/regular_events/${eventId}`);
  }

  create(spaceId: string, dto: RegularEventCreateDto) {
    return this._http.post<RegularEventDto>(`${this._base}/space/${spaceId}/regular_events/create`, dto);
  }

  update(spaceId: string, dto: UpdateRegularEventDto) {
    return this._http.put<RegularEventDto>(`${this._base}/space/${spaceId}/regular_events/update`, dto);
  }

  delete(spaceId: string, eventId: string) {
    return this._http.delete(`${this._base}/space/${spaceId}/regular_events/${eventId}/delete`);
  }
}
