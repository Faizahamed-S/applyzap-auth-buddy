import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/lib/analyticsApi';

export const useGroupAnalytics = (groupId: number | string, date?: string) =>
  useQuery({
    queryKey: ['group-analytics', String(groupId), date ?? 'overall'],
    queryFn: () => analyticsApi.getGroupAnalytics(groupId, date),
  });