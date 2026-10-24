# Status Breakdown chart

## What you'll get
A "Status Breakdown" card in the Analytics chart grid: horizontal bars, one per status, with the count at the end of each bar.
- Labels in Title Case with spaces ("PHONE_SCREEN" → "Phone Screen").
- Bars follow your board's column order; statuses that aren't on the board come last (in the order the server sends them).
- Hovering a bar shows the count and its % of the total (0% when the total is 0).
- Shows a grey placeholder while loading and "No data yet" when there are no statuses.

## Steps
1. **Ordering helper** — add `buildStatusBreakdown(statusCounts, columnTitles)` to `src/lib/analyticsMath.ts`:
   - normalizes column titles with the existing `normalizeStatus` (trim, uppercase, spaces → underscores) and dedupes them;
   - returns `{ key, label, count, percent }[]`: board columns first in board order (only those with a count in `statusCounts`), then the remaining statuses;
   - label from the existing `canonicalToLabel`; percent from `pct(count, total)`, where total is the sum of all counts.
2. **Chart** — `src/components/analytics/StatusBreakdownChart.tsx`:
   - data from `useDashboardAnalytics()` (the request already shared on the page) plus columns from the existing `useTrackerColumns()`;
   - Recharts horizontal `BarChart` (`layout="vertical"`) inside the existing `ChartContainer` from `src/components/ui/chart.tsx`, bar color `hsl(var(--primary))`, count labels at the end of each bar, a custom tooltip showing "N applications · X%";
   - height grows with the number of bars so labels don't overlap.
3. **Page** — place the chart in the existing grid on `AnalyticsPage`.
4. **Tests** — add to `analyticsMath.test.ts`: board order is followed; statuses not on the board come last; column "Phone Screen" matches key `PHONE_SCREEN`; percent is 0 when the total is 0.

## Not changed
API calls, the KPI row, the Dashboard page.
