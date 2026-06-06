# Notion-style Kanban layout for /tracker

Layout-only refactor. Job card design, drag-and-drop, API contract, and sort order are untouched.

## 1. `src/components/kanban/KanbanColumn.tsx`
- Remove `min-h-[calc(100vh-220px)]` and `flex-1`. Columns become natural-height, fixed-width (e.g. `w-[280px] shrink-0`) so short columns stay short and tall columns grow with their cards.
- Remove `overflow-y-auto` from the inner cards container — no internal scroll.
- Wrap the header (status pill + count + separator) in a `sticky top-0 z-10` block with a subtle `bg-background/80 backdrop-blur` so it stays readable while the page scrolls. Top offset = 0 within the column; the page-level offset is handled by the scroll container.
- Keep header click → `/status/:status`, empty state, badge color, and `SortableContext` exactly as today.
- Optional: if `jobs.length > 20`, render a small "View all {n} →" link in the header that navigates to `/status/:status`. No other behavior change.

## 2. `src/components/kanban/JobKanbanBoard.tsx`
- Columns row: switch wrapper to `flex gap-6 items-start overflow-x-auto` (horizontal scroll only; vertical scroll happens at the page level).
- Remove the `pb-4 overflow-x-auto` height constraint side effects — keep horizontal scroll, drop vertical clipping.
- Fetch all applications in one request: bump `itemsPerPage` to `200` (or pass a high limit) and stop paginating Kanban. Keep the query key shape so caching still works.
- Hide `PaginationControls` when `currentView === 'kanban'`. Keep it rendered for `'table'` view only.
- No changes to: `handleDragStart`, `handleDragEnd`, `patchMutation`, optimistic update, `getJobsByColumn`, `unmatchedApps`, modals, settings button, Add Application button.

## 3. `src/pages/TrackerPage.tsx` / `src/components/dashboard/DashboardLayout.tsx`
- Ensure the page scrolls as one continuous surface:
  - `DashboardLayout` `<main>` keeps `min-h-screen` flow scrolling (default body scroll). No `overflow-hidden` introduced.
  - Remove any `min-h-screen` flex traps inside the board that would prevent natural growth.
- Sticky offset: column header uses `top-0` relative to the page scroll. If a fixed dashboard header is added later, swap to `top-[<header-height>]`; today there is none, so `top-0` is correct.

## 4. Explicitly NOT changed
- `src/components/kanban/JobCard.tsx` — untouched.
- dnd-kit setup, sensors, `DragOverlay`, status patch flow — untouched.
- Backend ordering — frontend continues to render API order as-is. No client-side sort added.
- Table view, Board settings modal, Add/Edit/Delete/Detail modals, auth — untouched.

## Acceptance
- Short columns render at natural height; tall columns extend the page.
- Page scrolls vertically as one surface; no scrollbar inside any column.
- Status header pill stays pinned at the top of its column while scrolling past long lists.
- Horizontal scroll appears only when columns overflow viewport width.
- Kanban view shows no pagination control; Table view still does.
- Drag-and-drop between columns continues to update status optimistically.
