# Tracker page scroll fix — audit and revised plan

## Audit of current code

1. Height chain — MISSING (partly)
   - `DashboardLayout.tsx` root: `min-h-screen w-full bg-background flex` — no fixed height, no overflow-hidden.
   - `<main>`: `flex-1 transition-all duration-300` + inline `marginLeft` — no flex-col, no min-h-0.
   - `JobKanbanBoard.tsx` root: `w-full h-screen flex flex-col bg-background` — fixed height comes from here, not the layout.
   - Board scroll wrapper: `flex-1 overflow-auto` — no min-h-0.
   - Inner board container: `max-w-[1600px] mx-auto w-full px-3 sm:px-6 lg:px-10 xl:px-16 py-6 min-h-full flex flex-col`.
2. `<main>` width — MISSING. No `min-w-0`, no overflow classes. This is why wide boards stretch `<main>` and the whole page (header included) scrolls sideways.
3. Header — PARTLY DONE
   - Wrapper is `shrink-0` — ALREADY DONE.
   - Action buttons (settings, Add Application, ViewToggle) are already in one shared wrapper `flex items-center gap-3` — ALREADY DONE.
   - Title block has no `min-w-0` — MISSING. Subtitle has no `truncate` — MISSING. Row is `flex items-center justify-between`, no wrap — MISSING.
4. Padding — MISSING (duplicated). Same string `max-w-[1600px] mx-auto w-full px-3 sm:px-6 lg:px-10 xl:px-16` written twice inline (header and board), not defined in one place.
5. Board scroll container — `flex-1 overflow-auto`. Other overflow on the page: none on `<main>` or columns; the table view's shadcn `Table` wrapper has its own `overflow-auto`, and `AllApplicationsTable` has `overflow-hidden` on its card. Because `<main>` lacks min-w-0, the browser window currently also scrolls horizontally.
6. Drag and drop — `@dnd-kit/core`. No `autoScroll` prop is set, so dnd-kit's default auto-scroll is on; it scrolls every scrollable ancestor of the pointer (not limited to one parent), so it will work with the board container.
7. Sticky column headers — `sticky top-0` inside each column; nearest scroll ancestor is the board `flex-1 overflow-auto` div, so they stick to that container (not the window).
8. Table view — rendered inside the same board scroll container; the table also has its own inner `overflow-auto`, so it doesn't need page scrolling except when `<main>` stretches.
9. Hidden scrollbar — NOT APPLICABLE. A `.scrollbar-stealth` class exists in `index.css` but is not used anywhere.

## Revised plan (MISSING items only)

1. `DashboardLayout.tsx` `<main>`: add `min-w-0` and `min-h-0` only. No overflow-x-hidden.
2. `JobKanbanBoard.tsx` board scroll wrapper: `flex-1 min-h-0 min-w-0 overflow-auto` — the only scroll container for the board.
3. Header row: `flex flex-wrap items-center justify-between gap-3`; title block gets `min-w-0`; subtitle gets `truncate`. Action wrapper stays as one group (add `shrink-0`) so the two groups wrap, never individual buttons.
4. Shared padding: define one constant (e.g. `const CONTAINER = 'max-w-[1600px] mx-auto w-full px-4 lg:px-6 xl:px-10'`) in `JobKanbanBoard.tsx` and use it for both header and board.
5. No changes to drag-and-drop config, sticky headers, table, statuses, or data.

## Verification
Playwright at 1280px and 793px, sidebar open and collapsed: header fully visible, window has no horizontal scroll, board scrolls on its own, drag near edge still auto-scrolls.
