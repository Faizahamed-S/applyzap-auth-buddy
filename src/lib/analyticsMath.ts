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

export interface ActivityPoint {
  label: string;
  count: number;
}

/** 0 → "12am", 12 → "12pm", 23 → "11pm". */
export const hourLabel = (h: number): string => {
  const hr = ((Math.floor(h) % 24) + 24) % 24;
  const base = hr % 12 === 0 ? 12 : hr % 12;
  return `${base}${hr < 12 ? 'am' : 'pm'}`;
};

/** 24 hourly entries, 0 where the server sent nothing. */
export const fillHours = (rows: Array<{ hour: number; count: number }> | undefined): ActivityPoint[] => {
  const m = new Map<number, number>();
  for (const r of rows ?? []) m.set(Number(r.hour), (m.get(Number(r.hour)) ?? 0) + (Number(r.count) || 0));
  return Array.from({ length: 24 }, (_, h) => ({ label: hourLabel(h), count: m.get(h) ?? 0 }));
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const pad = (n: number) => String(n).padStart(2, '0');
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** n consecutive local dates ending at `today`, 0 for missing days. Labels like "Oct 18". */
export const fillLastNDays = (
  rows: Array<{ date: string; count: number }> | undefined,
  n: number,
  today: Date = new Date(),
): Array<ActivityPoint & { date: string }> => {
  const m = new Map<string, number>();
  for (const r of rows ?? []) {
    const key = String(r.date).slice(0, 10);
    m.set(key, (m.get(key) ?? 0) + (Number(r.count) || 0));
  }
  const out: Array<ActivityPoint & { date: string }> = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    const key = ymd(d);
    out.push({ date: key, label: `${MONTHS[d.getMonth()]} ${d.getDate()}`, count: m.get(key) ?? 0 });
  }
  return out;
};

/** "2026-10" or "2026-10-01" → "Oct 2026"; anything else unchanged. */
export const monthLabel = (s: string): string => {
  const m = /^(\d{4})-(\d{1,2})/.exec(String(s ?? ''));
  if (!m) return String(s ?? '');
  const mi = Number(m[2]) - 1;
  return mi >= 0 && mi < 12 ? `${MONTHS[mi]} ${m[1]}` : String(s);
};

/** "2026-10-18" → "Oct 18"; anything else unchanged. */
export const dayLabel = (s: string): string => {
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(String(s ?? ''));
  if (!m) return String(s ?? '');
  const mi = Number(m[2]) - 1;
  return mi >= 0 && mi < 12 ? `${MONTHS[mi]} ${Number(m[3])}` : String(s);
};

/** Heatmap intensity 0–4: 0 = no activity, then quarters of the max count. */
export const heatLevel = (count: number, max: number): 0 | 1 | 2 | 3 | 4 => {
  if (!count || count <= 0 || !max || max <= 0) return 0;
  const r = count / max;
  if (r <= 0.25) return 1;
  if (r <= 0.5) return 2;
  if (r <= 0.75) return 3;
  return 4;
};

export interface DonutSegment {
  key: 'yes' | 'no';
  label: string;
  count: number;
  percent: number;
}

/** Two slices: `part` vs the rest of `total`. total <= 0 → both slices are 0 with 0%. */
export const buildDonut = (
  part: number | undefined,
  total: number | undefined,
  yesLabel: string,
  noLabel: string,
): DonutSegment[] => {
  const t = Math.max(0, Number(total) || 0);
  const p = Math.min(Math.max(0, Number(part) || 0), t);
  return [
    { key: 'yes', label: yesLabel, count: p, percent: pct(p, t) },
    { key: 'no', label: noLabel, count: t - p, percent: pct(t - p, t) },
  ];
};

