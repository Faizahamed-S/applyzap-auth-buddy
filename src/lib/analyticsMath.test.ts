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
