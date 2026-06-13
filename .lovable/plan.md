# Dashboard Stat Cards Update

Replace 2 of the 4 stat cards on `/dashboard` while keeping Total Applied and Interviews unchanged.

## Final card order
1. **Total Applied** — unchanged
2. **Streaks** — NEW, side-by-side split (Current | Best)
3. **Interviews** — unchanged
4. **Referrals** — NEW, replaces Success Rate

## Changes

### 1. `src/types/analytics.ts`
Extend the `summary` shape to include the new backend fields:

```ts
summary: {
  totalApplications: number;
  interviews: number;
  offers: number;
  statusCounts: Record<string, number>;
  referral_count: number;
  tailored_count: number;
  current_streak: number;
  longest_streak: number;
}
```

### 2. `src/components/dashboard/DashboardHub.tsx`
- Remove the `successRate` calculation.
- Replace the `statsCards` array entries for "In Review" and "Success Rate".
- Render the Streaks card with a custom split layout (the other three keep the existing single-value layout). The simplest way: keep `statsCards` as a uniform list of 4, but allow an optional `render` override for the Streaks card so its `CardContent` shows two stacked number+label pairs separated by a vertical divider.

Streaks card layout (inside the same bordered Card used by the others):
```
┌───────────────────────────────────────┐
│  Streaks                       [icon] │
│  ┌──────────┬──────────┐              │
│  │  5       │   12     │              │
│  │ Current  │   Best   │              │
│  └──────────┴──────────┘              │
└───────────────────────────────────────┘
```
- Left half: `summary.current_streak` (big number) + "Current" label
- Right half: `summary.longest_streak` (big number) + "Best" label
- Divider: `border-l border-border` on the right half
- Icon: `Flame` from `lucide-react` (orange-500), placed top-right like the other cards
- Numbers use `text-3xl font-bold` (same as other cards) so visual rhythm is preserved
- On very narrow widths the grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`) already stacks cards, and the inner two-column split stays since it only needs ~140px

Referrals card:
- `title: 'Referrals'`
- `value: summary?.referral_count ?? 0`
- `icon: UserPlus` (lucide-react), color `text-accent` (or keep `text-zap` for visual variety — will use `text-accent` to match the brand accent and free `text-zap` for "coming soon" usage per memory)

### 3. No other files
No backend, no API client, no routing changes — `analyticsApi.getDashboardAnalytics` already returns the full payload; only the TS type needs widening.

## Notes
- All colors via semantic tokens (`text-accent`, `border-border`, `bg-muted`) — no hardcoded hex.
- No changes to loading/empty states.
- Memory `mem://tech/analytics-integration` may want updating after build to record the new fields consumed; will do that post-implementation.
