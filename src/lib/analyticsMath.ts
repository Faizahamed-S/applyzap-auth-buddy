/** Whole-number percent of part over total; 0 when total is 0 or invalid. */
export const pct = (part: number | undefined, total: number | undefined): number => {
  if (!total || !Number.isFinite(total) || total <= 0) return 0;
  return Math.round(((part ?? 0) / total) * 100);
};
