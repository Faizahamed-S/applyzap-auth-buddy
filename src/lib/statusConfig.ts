import { JobStatus } from '@/types/job';

interface StatusConfig {
  label: string;
  badgeColor: string;
  headerTextColor: string;
}

export const STATUS_CONFIG: Record<JobStatus, StatusConfig> = {
  APPLIED: {
    label: 'Applied',
    badgeColor: 'bg-blue-500 text-white',
    headerTextColor: 'text-blue-400',
  },
  REJECTED: {
    label: 'Rejected',
    badgeColor: 'bg-red-500 text-white',
    headerTextColor: 'text-red-400',
  },
  ONLINE_ASSESSMENT: {
    label: 'Online Assessment',
    badgeColor: 'bg-purple-500 text-white',
    headerTextColor: 'text-purple-400',
  },
  INTERVIEW: {
    label: 'Interview',
    badgeColor: 'bg-amber-500 text-white',
    headerTextColor: 'text-amber-400',
  },
  OFFER: {
    label: 'Offer',
    badgeColor: 'bg-emerald-500 text-white',
    headerTextColor: 'text-emerald-400',
  },
};
