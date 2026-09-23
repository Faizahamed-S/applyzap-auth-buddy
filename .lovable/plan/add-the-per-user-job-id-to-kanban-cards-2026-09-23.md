# Add the per-user job ID to Kanban cards

## Goal
Use the backend-provided `userJobId` as the compact, user-facing application identifier while preserving the existing long `id` for application operations.

## Changes
- Extend the application response model and response validation to accept `userJobId` from the backend.
- Keep `userJobId` read-only: application create and update payload types will not require or send it.
- Add `#<userJobId>` on the right side of the existing date row on each Kanban card, with the date remaining on the left.
- Keep the existing long `id` for detail retrieval, update, status changes, deletion, drag-and-drop identity, and API URLs.
- Reserve `userJobId` for user-facing resume/tool keys when those features exist; there is currently no resume/tool key implementation to migrate in this frontend.
- Hide the identifier gracefully if an older application response does not contain `userJobId`, so current behavior remains stable during rollout.

## Technical details
- Update the shared `JobApplication` type and backend response schema.
- Adjust create/update utility types so server-generated identifiers are excluded from submitted form data.
- Update only the metadata row in `JobCard`; no other card content or behavior changes.
- Verify type checking, the preview build, and compact card layout at the current narrow viewport.
