# Dashboard Streak Relocation + Card Reorder + Hover Tooltips

Two changes, both confined to `src/components/dashboard/DashboardHub.tsx` (plus a tiny type tweak if needed — type already supports all fields).

## 1. Move streak to the Dashboard header

Remove the dedicated "Streaks" stat card. Place the current streak inline at the top-right of the header row, next to the "Dashboard" title block — the typical "🔥 5" pattern used by Duolingo/GitHub.

Layout:
```text
┌──────────────────────────────────────────────────────────┐
│ Dashboard                                    🔥  5       │
│ Your job search at a glance                              │
└──────────────────────────────────────────────────────────┘
```

- Wrap header in `flex items-start justify-between`.
- Right side: a small pill `flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card` containing `<Flame className="h-5 w-5 text-orange-500" />` and `<span className="text-lg font-bold">{summary?.current_streak ?? 0}</span>`.
- Wrap the pill in a Tooltip showing: "Current streak: consecutive active days. Best: {longest_streak}".

## 2. Reorder the 4 stat cards

Drop "Streaks" from the grid. New order:

1. **Total Applied** — `summary.totalApplications` — `Briefcase`, `text-primary`
2. **Interviews** — `summary.interviews` — `Users`, `text-green-500`
3. **Referrals** — `summary.referral_count` — `UserPlus`, `text-accent`
4. **Tailored Applications** — `summary.tailored_count` — `Sparkles` (lucide-react), `text-primary`

All four keep the identical structure already in use (`py-4 px-6`, `text-3xl font-bold`, icon in `p-3 rounded-xl bg-muted`). No layout differences between cards.

## 3. Hover effects + tooltips

Two layers of hover feedback on every stat card:

**Visual hover (CSS):**
- Add `transition-all hover:border-primary/40 hover:shadow-md cursor-default` to each `Card`.

**Tooltip (shadcn `Tooltip`):**
Wrap each Card in `<Tooltip><TooltipTrigger asChild>…</TooltipTrigger><TooltipContent>…</TooltipContent></Tooltip>` with copy taken from the backend semantics you provided:

| Card | Tooltip text |
|---|---|
| Total Applied | "Snapshot — all saved applications across every status." |
| Interviews | "Snapshot — applications currently in an Interview status." |
| Referrals | "Snapshot — applications marked as referrals." |
| Tailored Applications | "Snapshot — applications with a tailored resume/CV." |
| Streak pill (header) | "Historical — consecutive active days. Best ever: {longest_streak}." |

Wrap the whole DashboardHub return in a single `<TooltipProvider delayDuration={150}>`.

## Files touched
- `src/components/dashboard/DashboardHub.tsx` — header restructure, card reorder, tooltip + hover.

No other files, no backend, no API changes.
