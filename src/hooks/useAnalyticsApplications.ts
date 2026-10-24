import { useQuery } from '@tanstack/react-query';
import { jobApi } from '@/lib/jobApi';

/** Reuses the tracker list's request and cache; both application-derived cards share it. */
export const useAnalyticsApplications = () => useQuery({
  queryKey: ['job-applications', 1, 200],
  queryFn: () => jobApi.getAllApplications(undefined, 1, 200),
});