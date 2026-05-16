import { TagDto } from './tag';

export interface SoloEventDto {
  id: string;
  spaceId: string;
  categoryId: string;
  subgroupId?: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  isYearly: boolean;
  tags: TagDto[];
}

export interface SoloEventCreateDto {
  spaceId: string;
  categoryId: string;
  subgroupId?: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  isYearly: boolean;
  tags: TagDto[];
}

export interface SoloEventUpdateDto {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  isYearly: boolean;
  tagIds: string[];
}
