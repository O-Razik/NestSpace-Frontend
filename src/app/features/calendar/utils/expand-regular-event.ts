import {
  eachDayOfInterval,
  differenceInCalendarWeeks,
  getDay,
  startOfWeek,
  startOfYear,
} from 'date-fns';
import { Day, Frequency, RegularEventDto } from '../../../api/event-schedule/models/regular-event';
import { TagDto } from '../../../api/event-schedule/models/tag';

export interface EventOccurrence {
  id: string;
  sourceId: string;
  title: string;
  date: Date;
  startTime: string;
  duration: string;
  type: 'regular';
  categoryId: string;
  tags: TagDto[];
}

const DAY_TO_JS: Record<Day, number> = {
  [Day.Monday]:    1,
  [Day.Tuesday]:   2,
  [Day.Wednesday]: 3,
  [Day.Thursday]:  4,
  [Day.Friday]:    5,
  [Day.Saturday]:  6,
  [Day.Sunday]:    0,
};

export function expandRegularEvent(
  ev: RegularEventDto,
  monthStart: Date,
  monthEnd: Date,
  referenceWeekStart?: Date,
): EventOccurrence[] {
  const ref = referenceWeekStart ?? startOfWeek(startOfYear(monthStart), { weekStartsOn: 1 });
  const targetDow = DAY_TO_JS[ev.day];

  const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const matchingDays = allDays.filter(d => getDay(d) === targetDow);

  const filtered = matchingDays.filter(d => {
    const weekDiff = differenceInCalendarWeeks(
      startOfWeek(d, { weekStartsOn: 1 }),
      ref,
      { weekStartsOn: 1 },
    );
    switch (ev.frequency) {
      case Frequency.Weekly:
        return true;
      case Frequency.BiWeekly:
      case Frequency.Numerator:
      case Frequency.Denominator:
        return weekDiff % 2 === 0;
      case Frequency.TriWeekly:
        return weekDiff % 3 === 0;
      case Frequency.Monthly:
        return weekDiff % 4 === 0;
      default:
        return true;
    }
  });

  return filtered.map(date => ({
    id:         `${ev.id}-${date.toISOString()}`,
    sourceId:   ev.id,
    title:      ev.title,
    date,
    startTime:  ev.startTime,
    duration:   ev.duration,
    type:       'regular',
    categoryId: ev.categoryId,
    tags:       ev.tags,
  }));
}
