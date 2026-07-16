## Goal
Sort personal job applications in the frontend so the most recently applied appear first across the app (Dashboard, Tracker, table view, status pages).

## Decision
Use **frontend-only sort** (zero meaningful latency impact, no backend dependency). Sort by `dateOfApplication` descending, with `id` descending as tiebreaker to keep newest-saved first when dates collide.

## Changes

1. **`src/lib/jobApi.ts` — `getAllApplications`**
   - After the backend response is mapped via `transformFromBackend`, sort the returned array in place:
     ```ts
     return result
       .map(transformFromBackend)
       .sort((a, b) => {
         const dateDiff = new Date(b.dateOfApplication).getTime() - new Date(a.dateOfApplication).getTime();
         if (dateDiff !== 0) return dateDiff;
         return b.id.localeCompare(a.id);
       });
     ```
   - This single change propagates to every consumer that calls `getAllApplications`.

2. **No other files changed.**
   - Dashboard `Recent Applications`, Tracker board, status pages, and table view all consume `getAllApplications` or the same query data and will inherit the sort.

## Out of scope
- No backend/API changes.
- No `createdAt` support.
- No new components, UI, or settings toggles.

## Acceptance criteria
- Opening `/tracker` shows the most recently applied job cards at the top of each column.
- Dashboard `Recent Applications` list shows newest first.
- Status-specific page (`/status/:status`) shows newest first.
- Sort is stable across reloads without extra network cost.