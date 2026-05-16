import { Frequency, RegularEventDto } from '../../../api/event-schedule/models/regular-event';

export type WeekTypeName = 'Numerator' | 'Denominator';

export function shouldDimEvent(
  ev: RegularEventDto,
  effectiveWeekType: WeekTypeName,
  weekNum: number,
): boolean {
  switch (ev.frequency) {
    case Frequency.Weekly:
      return false;
    case Frequency.BiWeekly:
      return false;
    case Frequency.Numerator:
      return effectiveWeekType !== 'Numerator';
    case Frequency.Denominator:
      return effectiveWeekType !== 'Denominator';
    case Frequency.TriWeekly:
      return weekNum % 3 !== 1;
    case Frequency.Monthly:
      return weekNum !== 1;
    default:
      return false;
  }
}

export function isVisibleBySubgroup(ev: RegularEventDto, subgroup: number): boolean {
  if (subgroup === 0) return true;
  // Binary: subgroupId=null → whole group (visible everywhere).
  // any GUID → subgroup events are shown in both Пгр.1 and Пгр.2.
  return true;
}
