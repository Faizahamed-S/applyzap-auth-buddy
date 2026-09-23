# Fix status page 404 when clicking a Kanban column header

## Root cause (verified)
- `KanbanColumn.tsx` navigates to `/status/${status}` when you click a column header (e.g. "Wishlist").
- `StatusApplicationsPage.tsx` exists and is imported in `App.tsx`, but **no route is registered** for it — the catch-all `*` route renders the 404 page instead.
- The page itself already calls the backend correctly: `GET /board/applications/status/{status}` via `jobApi.getApplicationsByStatus`. So only the missing route causes the 404.

## What changes for the user
- Clicking a Kanban status header (Wishlist, Applied, Interviewing, Offer, Rejected, Expired, or any custom column) opens the status applications list page instead of a 404.
- Statuses containing spaces or special characters (e.g. "Phone Screen") also open correctly.

## What stays the same
- The backend endpoint and response handling — no API changes.
- The status page UI, table, search, sort, edit/delete flows.
- All other routes.

## Technical details
1. `src/App.tsx`: add the missing route above the catch-all:
   `<Route path="/status/:status" element={<StatusApplicationsPage />} />`
2. `src/components/kanban/KanbanColumn.tsx`: encode the status in the header-click navigation (`encodeURIComponent(status)`) so multi-word statuses produce valid URLs. React Router decodes the param automatically, and `getApplicationsByStatus` already passes the decoded value to the backend.

## Verification
- Typecheck/build pass.
- Preview check: on /tracker, click "Wishlist" and another status header; the status page loads with the correct applications (no 404). Back button returns to the board.
