# Responsive Tracker Spacing

**Problem:** Currently both the header and board use `max-w-[1600px] w-[85%] mx-auto`. At narrow widths, that fixed 85% steals ~15% of the screen as empty side margin — wasteful and visually awkward. At wide widths, centering is good but the 85% cap can feel arbitrary.

**Fix (best-practice responsive container):** Replace the `w-[85%]` rule with a responsive horizontal padding scale, keep the `max-w-[1600px]` cap, and keep `mx-auto` so content centers once the viewport exceeds the max width.

## Change

In `src/components/kanban/JobKanbanBoard.tsx`, both wrapper divs (header row + scrollable board row) currently use:

```
max-w-[1600px] w-[85%] mx-auto px-4 py-6
```

Replace with:

```
max-w-[1600px] mx-auto w-full px-3 sm:px-6 lg:px-10 xl:px-16 py-6
```

Behavior:
- **Small screens (<640px):** `px-3` only → near edge-to-edge, no wasted side space.
- **Medium (≥640px):** `px-6` → comfortable breathing room.
- **Large (≥1024px):** `px-10`.
- **XL (≥1280px):** `px-16` → generous gutters.
- **Beyond 1600px:** `mx-auto` centers the capped container, giving symmetric left/right space.

No other files change. No logic, no kanban column behavior, no sticky-header changes.
