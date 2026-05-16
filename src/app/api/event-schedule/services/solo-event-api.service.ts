import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { SoloEventCreateDto, SoloEventDto, SoloEventUpdateDto } from '../models/solo-event';

@Injectable({ providedIn: 'root' })
export class SoloEventApiService {
  private readonly _http = inject(HttpClient);
  private readonly _base = environment.apiUrl;

  getAll(spaceId: string) {
    return this._http.get<SoloEventDto[]>(`${this._base}/space/${spaceId}/solo_events/all`);
  }

  getById(spaceId: string, eventId: string) {
    return this._http.get<SoloEventDto>(`${this._base}/space/${spaceId}/solo_events/${eventId}`);
  }

  create(spaceId: string, dto: SoloEventCreateDto) {
    return this._http.post<SoloEventDto>(`${this._base}/space/${spaceId}/solo_events/create`, dto);
  }

  update(spaceId: string, dto: SoloEventUpdateDto) {
    return this._http.put<SoloEventDto>(`${this._base}/space/${spaceId}/solo_events/update`, dto);
  }

  delete(spaceId: string, eventId: string) {
    return this._http.delete(`${this._base}/space/${spaceId}/solo_events/${eventId}/delete`);
  }
}
