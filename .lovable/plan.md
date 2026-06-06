Implement the kanban columns as two layers so both requested behaviors can coexist:

1. **Keep every status heading sticky while scrolling**
   - Make each column’s outer wrapper tall enough to participate in the full board scroll area.
   - Keep the status header inside that wrapper with `sticky top-0`, so every heading remains pinned independently even for empty or short statuses.

2. **Make each visible status box use its own content height**
   - Move the visible bordered column/background styling to an inner panel that only wraps the header area and that column’s cards.
   - Keep the cards area natural height, so a status with 1 application is short, a status with 5 applications is longer, and no column stretches to match the tallest one.

3. **Preserve the current sticky styling**
   - Keep the existing separated status-box appearance, rounded corners, borders, blur/background behavior, and card spacing.
   - Only adjust layout structure/classes needed to separate “sticky scroll range” from “visible box height”.

Technical approach:
- In `JobKanbanBoard.tsx`, keep the board row aligned at the top but give the row/columns enough scroll height for sticky headers.
- In `KanbanColumn.tsx`, restructure the column markup so:

```text
outer invisible full-height column wrapper
  sticky header / top panel
  natural-height visible cards panel
```

This avoids the previous trade-off where short boxes caused sticky headers to stop early, while stretched boxes made every status match the tallest column.