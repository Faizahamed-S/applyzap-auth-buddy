# Activity chart card

## What you'll get
An "Activity" card in the Analytics chart grid, subtitle "Jobs added + status changes", with tabs **Today | Week | Month | Year**:
- **Today** — bars per hour, labelled 12am … 11pm (all 24 hours shown, missing hours count as 0).
- **Week** — bars for the last 7 days ending today; days the server leaves out are shown as 0.
- **Month** — area chart of the last 30 days.
- **Year** — bars per month, labelled like "Oct 2026".
- The tooltip shows the label and "N activities". The word "applications" is not used anywhere on the card.
- Grey placeholder while loading. "No data yet" for a tab whose data is missing or all zero.

## Steps
1. **Helpers** in `src/lib/analyticsMath.ts`:
   - `hourLabel(h)` → 0 = "12am", 12 = "12pm", 23 = "11pm".
   - `fillHours(rows)` → 24 entries, 0 for missing hours.
   - `fillLastNDays(rows, n, today)` → n consecutive `yyyy-MM-dd` dates ending today (local time), 0 for missing; labels like "Oct 18".
   - `monthLabel("2026-10")` → "Oct 2026" (also accepts a full date; leaves anything unparseable unchanged).
2. **Chart** `src/components/analytics/ActivityChart.tsx`: uses the shared `useDashboardAnalytics()` request; shadcn `Tabs`; Recharts inside the existing `ChartContainer`; primary theme color; same tooltip style as Status Breakdown.
3. **Page** — add the card to the grid on `AnalyticsPage`.
4. **Tests** — hour labels (0, 12, 23); a week with 2 reported days becomes 7 entries with 0s in the right places; "2026-10" → "Oct 2026".

## Not changed
API calls, KPI row, Status Breakdown, Dashboard page.
