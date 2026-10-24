import { normalizeStatus, canonicalToLabel } from './statusMapper';

/** Whole-number percent of part over total; 0 when total is 0 or invalid. */
export const pct = (part: number | undefined, total: number | undefined): number => {
  if (!total || !Number.isFinite(total) || total <= 0) return 0;
  return Math.round(((part ?? 0) / total) * 100);
};

export interface StatusBreakdownItem {
  key: string;
  label: string;
  count: number;
  percent: number;
}

/** Board columns first (board order), then statuses not on the board (server order). */
export const buildStatusBreakdown = (
  statusCounts: Record<string, number> | undefined,
  columnTitles: string[],
): StatusBreakdownItem[] => {
  const counts = new Map<string, number>();
  for (const [k, v] of Object.entries(statusCounts ?? {})) {
    const key = normalizeStatus(k);
    counts.set(key, (counts.get(key) ?? 0) + (Number(v) || 0));
  }
  const total = [...counts.values()].reduce((a, b) => a + b, 0);

  const order: string[] = [];
  for (const t of columnTitles) {
    const key = normalizeStatus(t);
    if (counts.has(key) && !order.includes(key)) order.push(key);
  }
  for (const key of counts.keys()) if (!order.includes(key)) order.push(key);

  return order.map((key) => {
    const count = counts.get(key) ?? 0;
    return { key, label: canonicalToLabel(key), count, percent: pct(count, total) };
  });
};
