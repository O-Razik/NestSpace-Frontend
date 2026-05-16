import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { SpaceEventSettingsDto, UpdateSpaceEventSettingsDto } from '../models/space-event-settings';

@Injectable({ providedIn: 'root' })
export class SpaceEventSettingsApiService {
  private readonly _http = inject(HttpClient);
  private readonly _base = environment.apiUrl;

  getSettings(spaceId: string) {
    return this._http.get<SpaceEventSettingsDto>(`${this._base}/space/${spaceId}/regular_events/settings`);
  }

  updateSettings(dto: UpdateSpaceEventSettingsDto) {
    return this._http.put<SpaceEventSettingsDto>(
      `${this._base}/space/${dto.spaceId}/regular_events/settings`,
      dto,
    );
  }
}
