interface StatusConfig {
  label: string;
  badgeBg: string;
  badgeColor: string;
}

// Color name → Tailwind class mapping (matches BoardSettingsModal & KanbanColumn)
const COLOR_MAP: Record<string, string> = {
  blue: 'bg-blue-500',
  red: 'bg-red-500',
  green: 'bg-green-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  purple: 'bg-purple-500',
  pink: 'bg-pink-500',
  indigo: 'bg-indigo-500',
  cyan: 'bg-cyan-500',
  orange: 'bg-orange-500',
  teal: 'bg-teal-500',
  gray: 'bg-gray-500',
};

// Fallback config for unknown statuses
const DEFAULT_STATUS_CONFIG: StatusConfig = {
  label: '',
  badgeBg: 'bg-gray-500',
  badgeColor: 'bg-gray-500 text-white',
};

/**
 * Build a StatusConfig from a tracker column color name.
 * Falls back to gray for unknown colors.
 */
const configFromColor = (label: string, color?: string): StatusConfig => {
  const bg = COLOR_MAP[color?.toLowerCase() || ''] || 'bg-gray-500';
  return { label, badgeBg: bg, badgeColor: `${bg} text-white` };
};

/**
 * Get config for any status string.
 * If trackerColumns are provided (from useTrackerColumns), match by column title for accurate color.
 * Otherwise fall back to a generic gray badge.
 */
export const getStatusConfig = (
  status: string,
  trackerColumns?: Array<{ title: string; color: string }>
): StatusConfig => {
  if (trackerColumns) {
    const col = trackerColumns.find(
      (c) => c.title.toLowerCase() === status.toLowerCase()
    );
    if (col) return configFromColor(col.title, col.color);
  }
  return { ...DEFAULT_STATUS_CONFIG, label: status };
};

// Keep backward-compatible export
export const STATUS_CONFIG = new Proxy({} as Record<string, StatusConfig>, {
  get: (_target, prop: string) => getStatusConfig(prop),
});
