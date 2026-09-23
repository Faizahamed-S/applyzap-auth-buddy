# One status rule everywhere

Some statuses load their list page and some don't. Confirmed from the code: when you click a column header, the app asks the server for the column title exactly as it is written ("Phone Screen"), and the server stores statuses in its normalized form ("PHONE_SCREEN"). Single-word titles happen to match after the server's own handling; multi-word ones do not. The space is also put straight into the web address without encoding.

## What changes for the user

- Clicking any column header opens its list, including multi-word ones like "Phone Screen" or "Offer Received".
- Column headers, badges and buttons keep showing the friendly label ("Phone Screen"); only the saved value is the normalized one.
- Cards land in the right column regardless of spacing or capitalisation differences.
- Nothing else about the board, forms or groups changes.

## Technical details

Single helper `normalizeStatus` from `src/lib/statusMapper.ts` used at every boundary:

1. `src/lib/jobApi.ts` — `getApplicationsByStatus`: request `/board/applications/status/${encodeURIComponent(normalizeStatus(status))}`. This is the actual fix for the failing statuses.
2. `src/components/kanban/KanbanColumn.tsx` — navigate to `/status/${encodeURIComponent(normalizeStatus(status))}` so the route param is already canonical.
3. `src/pages/StatusApplicationsPage.tsx` — normalize the route param once (`const canonical = normalizeStatus(decodeURIComponent(status))`), use it for the query key, the fetch and `getStatusConfig`; keep `canonicalToLabel` for the heading and badge.
4. `src/components/kanban/JobKanbanBoard.tsx` — drag-drop and column matching already compare via `normalizeStatus`; send `normalizeStatus(newStatus)` in the optimistic update and patch so the cached card and server agree immediately.
5. `src/components/kanban/InlineStatusSelect.tsx` — save `normalizeStatus(editValue)` and compare normalized against `currentStatus`.
6. `StatusInput.tsx` and `transformForBackend` already normalize and dedupe — no change.

No comparisons of raw titles to raw stored statuses remain after this.

## Verification

- Typecheck and build pass.
- In the preview, open the board and click each column header, including a multi-word one, and confirm the list loads with the correct count instead of an empty or failed state.
- Drag a card between columns and confirm it stays in the new column after refresh.
