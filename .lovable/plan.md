# Fix the tracker page: fixed top bar, only the board scrolls

## Goal
On the /tracker page, the top bar (title, settings, Add Application, view toggle) stays fixed to the window width and never scrolls. Only the Kanban board area scrolls — horizontally when there are many columns, vertically when columns are tall. One scroll area instead of two.

## What changes for the user
- On a 13" laptop with the sidebar open or collapsed, the whole top bar fits on screen with no scrolling.
- On narrower windows, the top bar wraps neatly onto two lines instead of pushing off-screen.
- The board scrolls on its own; the page itself no longer scrolls sideways.
- Columns, cards, drag-and-drop, sticky column headers and the table view all behave exactly as today.

## Technical details
1. `DashboardLayout.tsx`: add `min-w-0` (and `overflow-x-hidden`) to `<main>` so wide board content can no longer stretch the main area past the window — this is the root cause of the page-level horizontal scroll that drags the header along.
2. `JobKanbanBoard.tsx` header:
   - Make the header row `flex-wrap gap-3` with `min-w-0` on the title block so controls wrap instead of overflowing.
   - Reduce side padding on laptop widths (e.g. `px-4 lg:px-6 xl:px-10`) for header and board container, keeping them aligned.
   - Subtitle truncates on small widths.
3. Board area: keep `flex-1 overflow-auto` as the single scroll container; add `min-w-0` so horizontal scrolling happens only inside it. Sticky column headers keep working since they stick to this container.
4. No changes to data, statuses, drag logic, or other pages (other pages share the layout but gain only the harmless `min-w-0`).

## Verification
Playwright screenshots at 1280px and 793px widths with sidebar open and collapsed: header fully visible, page has no horizontal scroll, board scrolls independently.
