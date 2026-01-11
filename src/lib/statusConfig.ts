import { JobStatus } from '@/types/job';

interface StatusConfig {
  label: string;
  badgeBg: string;
  badgeColor: string;
}

export const STATUS_CONFIG: Record<JobStatus, StatusConfig> = {
  APPLIED: {
    label: 'Applied',
    badgeBg: 'bg-blue-500',
    badgeColor: 'bg-blue-500 text-white',
  },
  REJECTED: {
    label: 'Rejected',
    badgeBg: 'bg-red-500',
    badgeColor: 'bg-red-500 text-white',
  },
  ONLINE_ASSESSMENT: {
    label: 'Assessment',
    badgeBg: 'bg-purple-500',
    badgeColor: 'bg-purple-500 text-white',
  },
  INTERVIEW: {
    label: 'Interview',
    badgeBg: 'bg-amber-500',
    badgeColor: 'bg-amber-500 text-white',
  },
  OFFER: {
    label: 'Offer',
    badgeBg: 'bg-emerald-500',
    badgeColor: 'bg-emerald-500 text-white',
  },
};
