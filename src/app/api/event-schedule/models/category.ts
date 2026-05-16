import { RegularEventDto } from './regular-event';
import { SoloEventDto } from './solo-event';

export interface CategoryShortDto {
  id: string;
  spaceId: string;
  title: string;
  description: string;
  color: string;
  icon: string;
}

export interface CategoryDto extends CategoryShortDto {
  regularEvents: RegularEventDto[];
  soloEvents: SoloEventDto[];
}

export interface CategoryCreateDto {
  spaceId: string;
  title: string;
  description: string;
  color: string;
  icon: string;
}
