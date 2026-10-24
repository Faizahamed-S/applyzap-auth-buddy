import type { GroupAnalytics } from '@/types/groupAnalytics';

export function buildContributorLeaderboard(
  data: GroupAnalytics | undefined,
  mode: 'overall' | 'day',
) {
  const contributors = mode === 'overall' ? data?.contributorsOverall : data?.contributorsByDay;
  const ranked = [...(contributors ?? [])].sort((a, b) => b.jobsAdded - a.jobsAdded);
  const top = mode === 'overall' ? data?.topContributorOverall : data?.topContributorByDay;
  const leader = ranked[0];
  const leaderId = leader && leader.jobsAdded > 0
    ? top && top.jobsAdded === leader.jobsAdded ? top.memberId : leader.memberId
    : undefined;
  return ranked.map((contributor) => ({
    ...contributor,
    isTop: contributor.memberId === leaderId,
  }));
}

export function groupAnalyticsPath(groupId: string | number, date?: string) {
  const path = `/api/groups/${encodeURIComponent(String(groupId))}/analytics`;
  return date ? `${path}?${new URLSearchParams({ date })}` : path;
}