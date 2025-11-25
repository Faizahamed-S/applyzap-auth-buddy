import { JobStatus } from '@/types/job';

interface StatusConfig {
  label: string;
  badgeColor: string;
  columnBgColor: string;
  columnBorderColor: string;
}

export const STATUS_CONFIG: Record<JobStatus, StatusConfig> = {
  APPLIED: {
    label: 'Applied',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    columnBgColor: 'bg-blue-50 dark:bg-blue-950/30',
    columnBorderColor: 'border-blue-200 dark:border-blue-800',
  },
  REJECTED: {
    label: 'Rejected',
    badgeColor: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    columnBgColor: 'bg-gray-50 dark:bg-gray-950/30',
    columnBorderColor: 'border-gray-200 dark:border-gray-800',
  },
  ONLINE_ASSESSMENT: {
    label: 'Online Assessment',
    badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    columnBgColor: 'bg-purple-50 dark:bg-purple-950/30',
    columnBorderColor: 'border-purple-200 dark:border-purple-800',
  },
  INTERVIEW: {
    label: 'Interview',
    badgeColor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    columnBgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
    columnBorderColor: 'border-yellow-200 dark:border-yellow-800',
  },
  OFFER: {
    label: 'Offer',
    badgeColor: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    columnBgColor: 'bg-green-50 dark:bg-green-950/30',
    columnBorderColor: 'border-green-200 dark:border-green-800',
  },
};
