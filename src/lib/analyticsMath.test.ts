import { describe, it, expect } from 'vitest';
import { pct, buildStatusBreakdown } from './analyticsMath';

describe('pct', () => {
  it('3 of 12 is 25%', () => expect(pct(3, 12)).toBe(25));
  it('guards divide by zero', () => expect(pct(5, 0)).toBe(0));
});

describe('buildStatusBreakdown', () => {
  it('follows board column order, unknown statuses last', () => {
    const r = buildStatusBreakdown(
      { GHOSTED: 1, APPLIED: 2, WISHLIST: 3 },
      ['Wishlist', 'Applied'],
    );
    expect(r.map((x) => x.key)).toEqual(['WISHLIST', 'APPLIED', 'GHOSTED']);
  });
  it('matches column "Phone Screen" to key PHONE_SCREEN with Title Case label', () => {
    const r = buildStatusBreakdown({ APPLIED: 1, PHONE_SCREEN: 3 }, ['Phone Screen', 'Applied']);
    expect(r[0]).toEqual({ key: 'PHONE_SCREEN', label: 'Phone Screen', count: 3, percent: 75 });
  });
  it('percent is 0 when total is 0', () => {
    const r = buildStatusBreakdown({ APPLIED: 0 }, ['Applied']);
    expect(r[0].percent).toBe(0);
  });
});

import { hourLabel, fillLastNDays, monthLabel, fillHours } from './analyticsMath';

describe('activity helpers', () => {
  it('hour labels', () => {
    expect(hourLabel(0)).toBe('12am');
    expect(hourLabel(12)).toBe('12pm');
    expect(hourLabel(23)).toBe('11pm');
  });
  it('fills 24 hours', () => {
    const r = fillHours([{ hour: 9, count: 4 }]);
    expect(r).toHaveLength(24);
    expect(r[9]).toEqual({ label: '9am', count: 4 });
    expect(r[10].count).toBe(0);
  });
  it('week zero-fills to 7 days ending today', () => {
    const r = fillLastNDays(
      [{ date: '2026-10-18', count: 2 }, { date: '2026-10-24', count: 5 }],
      7,
      new Date(2026, 9, 24),
    );
    expect(r.map((x) => x.count)).toEqual([2, 0, 0, 0, 0, 0, 5]);
    expect(r[0].label).toBe('Oct 18');
  });
  it('month label', () => expect(monthLabel('2026-10')).toBe('Oct 2026'));
});

import { heatLevel } from './analyticsMath';

describe('heatLevel', () => {
  it('0 activity is level 0', () => expect(heatLevel(0, 10)).toBe(0));
  it('max is level 4', () => expect(heatLevel(10, 10)).toBe(4));
  it('quarters map to levels 1-3', () => {
    expect(heatLevel(2, 10)).toBe(1);
    expect(heatLevel(5, 10)).toBe(2);
    expect(heatLevel(7, 10)).toBe(3);
  });
});

import { buildDonut } from './analyticsMath';

describe('buildDonut', () => {
  it('splits part vs rest with percents', () => {
    expect(buildDonut(3, 12, 'Referral', 'No referral')).toEqual([
      { key: 'yes', label: 'Referral', count: 3, percent: 25 },
      { key: 'no', label: 'No referral', count: 9, percent: 75 },
    ]);
  });
  it('total 0 gives zero slices and 0%', () => {
    expect(buildDonut(0, 0, 'Referral', 'No referral')).toEqual([
      { key: 'yes', label: 'Referral', count: 0, percent: 0 },
      { key: 'no', label: 'No referral', count: 0, percent: 0 },
    ]);
  });
  it('part bigger than total is clamped', () => {
    expect(buildDonut(5, 3, 'Tailored', 'Not tailored').map((s) => s.count)).toEqual([3, 0]);
  });
});

