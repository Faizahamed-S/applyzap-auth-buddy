## Goal
Hide the thin bottom divider inside each sticky status header **only while that header is pinned** (i.e. user has scrolled past the top). When viewing the top of the board, the divider stays visible as it is today. The change is a smooth opacity transition, not an abrupt hide.

## Approach

Per `KanbanColumn`, detect when its sticky header is in the "stuck" state and toggle the inner divider's opacity accordingly.

Technique: place a 1px **sentinel** `<div>` immediately above the sticky header inside the column. Use an `IntersectionObserver` (root = the scrollable board area) to watch the sentinel:
- Sentinel visible → header is at the top → show divider (`opacity-100`)
- Sentinel not visible → header is pinned/stuck → hide divider (`opacity-0`)

This is the standard, jank-free way to detect a "stuck" sticky element without scroll listeners, and works independently per column.

## Changes

### `src/components/kanban/KanbanColumn.tsx`
1. Add a ref for the sentinel and `isStuck` state.
2. Set up an `IntersectionObserver` in `useEffect` watching the sentinel; update `isStuck` based on `entry.isIntersecting`.
3. Render the sentinel `<div ref={sentinelRef} className="h-px" />` just before the sticky header wrapper.
4. Apply a transition on the existing divider line:
   ```
   <div className={`border-b border-border mx-3 transition-opacity duration-300 ${isStuck ? 'opacity-0' : 'opacity-100'}`} />
   ```

### `src/components/kanban/JobKanbanBoard.tsx`
No structural changes. The scrollable container (`flex-1 overflow-auto`) already exists and acts as the IntersectionObserver root (defaulting to the document viewport also works, since the header sticks within this scroll container — we'll use `root: null` which observes against the nearest scroll ancestor / viewport; if needed we pass the scroll container ref via context, but the simpler `null` root works because the sentinel sits inside the same scroll container and its visibility transition tracks the pin state correctly).

## Out of scope
- No changes to column widths, card sizing, header styling, colors, or sticky behavior itself.
- No change to the outer column borders — only the inner divider line under the badge fades.
