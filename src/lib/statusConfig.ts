interface StatusConfig {
  label: string;
  badgeBg: string;
  badgeColor: string;
}

// Default configs for well-known statuses
const KNOWN_STATUS_CONFIG: Record<string, StatusConfig> = {
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

// Fallback config for custom/unknown statuses
const DEFAULT_STATUS_CONFIG: StatusConfig = {
  label: '',
  badgeBg: 'bg-gray-500',
  badgeColor: 'bg-gray-500 text-white',
};

// Get config for any status string, falling back to a default for unknown statuses
export const getStatusConfig = (status: string): StatusConfig => {
  const known = KNOWN_STATUS_CONFIG[status];
  if (known) return known;
  return {
    ...DEFAULT_STATUS_CONFIG,
    label: status,
  };
};

// Keep backward-compatible export
export const STATUS_CONFIG = new Proxy({} as Record<string, StatusConfig>, {
  get: (_target, prop: string) => getStatusConfig(prop),
});
