# Analytics page — foundation + KPI row

## What you'll get
- The "Analytics" sidebar item becomes a working page at `/analytics` (no longer "Coming soon").
- A top row of 5 cards: Total Applications, Interviews, Offers, Referrals, Tailored.
- Referrals and Tailored show "% of total" underneath (shows 0% when there are no applications).
- Below the cards, an empty responsive grid ready for charts (1 column on small screens, 2 on large).
- No charts yet.

## Steps
1. **Types** — extend `src/types/analytics.ts` `DashboardAnalytics` with optional `activity_by_hour_today: {hour, count}[]`, `activity_by_day_last_30: {date, count}[]`, `activity_by_month_last_12: {month, count}[]` (optional so the dashboard keeps working if the backend omits them).
2. **Hook** — `src/hooks/useDashboardAnalytics.ts`: React Query wrapper around existing `analyticsApi.getDashboardAnalytics`, key `['dashboard-analytics']` (same key the Dashboard already uses, so both share one cached request). No change to `analyticsApi.ts`.
3. **KPI component** — `src/components/analytics/KpiRow.tsx`: uses the hook's `summary`; card style matches existing Dashboard cards; loading skeletons (shadcn `Skeleton`); "No data yet" when the request returns nothing. Percent helper `pct(part, total)` returns 0 when total is 0, rounded to whole number.
4. **Page** — `src/pages/AnalyticsPage.tsx` inside `DashboardLayout` with same auth redirect pattern as other pages; header, `KpiRow`, empty chart grid placeholder.
5. **Wiring** — add `/analytics` route in `App.tsx`; set `href: '/analytics'` and remove `comingSoon` on the sidebar Analytics item.
6. **Test** — small unit test for `pct` (e.g. 3 of 12 → 25, any of 0 → 0).

## Not changed
Backend calls elsewhere, Dashboard page behaviour, other sidebar items.
