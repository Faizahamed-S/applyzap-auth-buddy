import { describe, expect, it } from 'vitest';
import { buildContributorLeaderboard, groupAnalyticsPath } from './groupAnalyticsMath';
import type { GroupAnalytics } from '@/types/groupAnalytics';

const contributor = (memberId: number, displayName: string, jobsAdded: number) =>
  ({ memberId, userId: memberId, displayName, jobsAdded });
const data: GroupAnalytics = {
  totalJobs: 12, jobsAddedToday: 3, date: '2026-10-24',
  contributorsOverall: [contributor(1, 'A', 4), contributor(2, 'B', 8)],
  contributorsByDay: [contributor(1, 'A', 3), contributor(2, 'B', 0)],
};

describe('group contributors', () => {
  it('ranks all-time contributions highest first and highlights the leader', () => {
    expect(buildContributorLeaderboard(data, 'overall').map(c => [c.displayName, c.jobsAdded, c.isTop]))
      .toEqual([['B', 8, true], ['A', 4, false]]);
  });
  it('switches to selected-day contributions and its leader', () => {
    expect(buildContributorLeaderboard(data, 'day').map(c => [c.displayName, c.jobsAdded, c.isTop]))
      .toEqual([['A', 3, true], ['B', 0, false]]);
  });
  it('does not crown a leader when all counts are zero', () => {
    expect(buildContributorLeaderboard({ ...data, contributorsByDay: [contributor(1, 'A', 0)] }, 'day')[0].isTop)
      .toBe(false);
  });
  it('sends the selected date as YYYY-MM-DD', () => {
    expect(groupAnalyticsPath(3, '2026-10-24')).toBe('/api/groups/3/analytics?date=2026-10-24');
  });
  it('omits the optional date for all time', () => {
    expect(groupAnalyticsPath(3)).toBe('/api/groups/3/analytics');
  });
});