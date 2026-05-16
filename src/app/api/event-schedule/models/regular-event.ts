import { TagDto } from './tag';

export enum Day {
  Monday    = 0,
  Tuesday   = 1,
  Wednesday = 2,
  Thursday  = 3,
  Friday    = 4,
  Saturday  = 5,
  Sunday    = 6,
}

export enum Frequency {
  Weekly      = 0,
  BiWeekly    = 1,
  TriWeekly   = 2,
  Monthly     = 3,
  Numerator   = 4,
  Denominator = 5,
}

export const isNumeratorFreq   = (f: Frequency): boolean => f === Frequency.Numerator;
export const isDenominatorFreq = (f: Frequency): boolean => f === Frequency.Denominator;
export const isChZFreq         = (f: Frequency): boolean => f === Frequency.Numerator || f === Frequency.Denominator;

export interface RegularEventDto {
  id: string;
  spaceId: string;
  categoryId: string;
  subgroupId?: string;
  title: string;
  description: string;
  timeZone: string;
  startTime: string;
  duration: string;
  day: Day;
  frequency: Frequency;
  tags: TagDto[];
}

export interface RegularEventCreateDto {
  spaceId: string;
  categoryId: string;
  subgroupId?: string;
  title: string;
  description: string;
  timeZone: string;
  startTime: string;
  duration: string;
  day: Day;
  frequency: Frequency;
  tags: TagDto[];
}

export interface UpdateRegularEventDto {
  id: string;
  spaceId: string;
  categoryId: string;
  day: Day;
  frequency: Frequency;
  title: string;
  description: string;
  startTime: string;
  duration: string;
  tagIds: string[];
}
