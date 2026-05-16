import { describe, it, expect } from 'vitest';
import { expandRegularEvent } from './expand-regular-event';
import { Day, Frequency, RegularEventDto } from '../../../api/event-schedule/models/regular-event';

function makeEvent(overrides: Partial<RegularEventDto> = {}): RegularEventDto {
  return {
    id: 'ev-1',
    spaceId: 'space-1',
    categoryId: 'cat-1',
    title: 'Test',
    description: '',
    timeZone: 'UTC',
    startTime: '10:00:00',
    duration: '01:30:00',
    day: Day.Monday,
    frequency: Frequency.Weekly,
    tags: [],
    ...overrides,
  };
}

// A 28-day month (Feb 2022): Mon Feb 7, 14, 21, 28 — 4 Mondays
// ISO week 1 start: Mon Jan 3 2022
const FEB_2022_START = new Date(2022, 1, 1); // Feb 1
const FEB_2022_END   = new Date(2022, 1, 28); // Feb 28
// Reference: first Monday of 2022 = Jan 3
const REF_MON_2022 = new Date(2022, 0, 3);

describe('expandRegularEvent', () => {
  it('Weekly — returns all 4 Mondays in Feb 2022', () => {
    const ev = makeEvent({ frequency: Frequency.Weekly });
    const result = expandRegularEvent(ev, FEB_2022_START, FEB_2022_END, REF_MON_2022);
    expect(result).toHaveLength(4);
    expect(result[0].date.getDate()).toBe(7);
    expect(result[3].date.getDate()).toBe(28);
  });

  it('BiWeekly — returns every 2nd Monday (2 out of 4)', () => {
    const ev = makeEvent({ frequency: Frequency.BiWeekly });
    // Ref is Jan 3, week-0. Feb 7 = week 5 (odd, skip), Feb 14 = week 6 (even, keep),
    // Feb 21 = week 7 (odd, skip), Feb 28 = week 8 (even, keep) → 2 results
    const result = expandRegularEvent(ev, FEB_2022_START, FEB_2022_END, REF_MON_2022);
    expect(result).toHaveLength(2);
  });

  it('TriWeekly — returns every 3rd Monday (at most 2 per month)', () => {
    const ev = makeEvent({ frequency: Frequency.TriWeekly });
    // weekDiff % 3 === 0. Feb 7 = week 5 (5%3=2 skip), Feb 14 = week 6 (6%3=0 keep),
    // Feb 21 = week 7 (7%3=1 skip), Feb 28 = week 8 (8%3=2 skip) → 1 result
    const result = expandRegularEvent(ev, FEB_2022_START, FEB_2022_END, REF_MON_2022);
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result.length).toBeLessThanOrEqual(2);
  });

  it('Monthly — returns at most 1 Monday per month', () => {
    const ev = makeEvent({ frequency: Frequency.Monthly });
    const result = expandRegularEvent(ev, FEB_2022_START, FEB_2022_END, REF_MON_2022);
    expect(result.length).toBeLessThanOrEqual(1);
  });
});
