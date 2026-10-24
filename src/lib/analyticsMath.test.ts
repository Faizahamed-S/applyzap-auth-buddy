import { describe, it, expect } from 'vitest';
import { pct } from './analyticsMath';

describe('pct', () => {
  it('3 of 12 is 25%', () => expect(pct(3, 12)).toBe(25));
  it('guards divide by zero', () => expect(pct(5, 0)).toBe(0));
});
