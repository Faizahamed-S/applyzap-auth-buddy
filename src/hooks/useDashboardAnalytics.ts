import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/lib/analyticsApi';

/** Shared by every analytics chart — one cached request. Same key as Dashboard. */
export const useDashboardAnalytics = () =>
  useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: analyticsApi.getDashboardAnalytics,
  });
