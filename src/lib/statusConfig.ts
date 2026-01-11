import { JobStatus } from '@/types/job';

interface StatusConfig {
  label: string;
  badgeColor: string;
  headerAccentColor: string;
}

export const STATUS_CONFIG: Record<JobStatus, StatusConfig> = {
  APPLIED: {
    label: 'Applied',
    badgeColor: 'bg-blue-500 text-white',
    headerAccentColor: 'bg-blue-500',
  },
  REJECTED: {
    label: 'Rejected',
    badgeColor: 'bg-gray-500 text-white',
    headerAccentColor: 'bg-gray-500',
  },
  ONLINE_ASSESSMENT: {
    label: 'Online Assessment',
    badgeColor: 'bg-purple-500 text-white',
    headerAccentColor: 'bg-purple-500',
  },
  INTERVIEW: {
    label: 'Interview',
    badgeColor: 'bg-amber-500 text-white',
    headerAccentColor: 'bg-amber-500',
  },
  OFFER: {
    label: 'Offer',
    badgeColor: 'bg-emerald-500 text-white',
    headerAccentColor: 'bg-emerald-500',
  },
};
