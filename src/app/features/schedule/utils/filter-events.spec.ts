import { describe, it, expect } from 'vitest';
import { shouldDimEvent } from './filter-events';
import { Day, Frequency, RegularEventDto } from '../../../api/event-schedule/models/regular-event';

function makeEvent(frequency: Frequency): RegularEventDto {
  return {
    id: 'ev-1', spaceId: 'sp-1', categoryId: 'cat-1',
    title: 'T', description: '', timeZone: 'UTC',
    startTime: '10:00:00', duration: '01:30:00',
    day: Day.Monday, frequency, tags: [],
  };
}

describe('shouldDimEvent', () => {
  it('Weekly — never dimmed', () => {
    const ev = makeEvent(Frequency.Weekly);
    expect(shouldDimEvent(ev, 'Numerator',   1)).toBe(false);
    expect(shouldDimEvent(ev, 'Denominator', 4)).toBe(false);
  });

  it('BiWeekly — never dimmed (neutral, no Ч/З)', () => {
    const ev = makeEvent(Frequency.BiWeekly);
    expect(shouldDimEvent(ev, 'Numerator',   1)).toBe(false);
    expect(shouldDimEvent(ev, 'Denominator', 2)).toBe(false);
  });

  it('Numerator — dimmed when effectiveWeekType is Denominator', () => {
    const ev = makeEvent(Frequency.Numerator);
    expect(shouldDimEvent(ev, 'Numerator',   1)).toBe(false);
    expect(shouldDimEvent(ev, 'Denominator', 1)).toBe(true);
  });

  it('TriWeekly — dimmed on weekNum 2 and 3, not on 1', () => {
    const ev = makeEvent(Frequency.TriWeekly);
    expect(shouldDimEvent(ev, 'Numerator', 1)).toBe(false);
    expect(shouldDimEvent(ev, 'Numerator', 2)).toBe(true);
    expect(shouldDimEvent(ev, 'Numerator', 3)).toBe(true);
    expect(shouldDimEvent(ev, 'Numerator', 4)).toBe(false); // 4%3=1
  });
});
