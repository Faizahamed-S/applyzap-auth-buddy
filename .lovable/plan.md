# Status options from the field template

Goal: the Status choices in the application forms come from the server's field template (`status.options`) so the extension, the forms and the Kanban board all agree — without changing anything users currently rely on.

## What changes for the user

- When adding or editing an application, the Status buttons show the same list the server defines for status.
- If the server list isn't available, the Status buttons keep showing what they show today (your board columns plus statuses already used), so nothing breaks.
- After you add or rename a column in Board Settings, the Status choices in the forms refresh automatically to include the new one.

## What stays the same

- Board columns are still saved the same way (profile update with tracker columns) — no change.
- Saving an application still sends a normalized status string; the server also normalizes, so old values keep working.
- Kanban grouping, inline status changes, the All Applications table and the field template editor behave as they do today.

## Technical details

1. `src/hooks/useFieldTemplate.ts`: add a small selector helper `useStatusOptions()` that reads `builtIn` for `key === 'status'` and returns its `options` normalized via `normalizeStatus`, deduped, order preserved. Returns `[]` when absent.
2. `src/lib/fieldTemplateApi.ts`: no contract change; `options` is already parsed for both `builtIn` and `custom`. Keep the existing 404/validation fallbacks.
3. `src/components/kanban/StatusInput.tsx`: build the option list with priority
   - template `status.options` (if non-empty) first,
   - then board columns,
   - then statuses from `/board/applications/statuses`,
   all deduped by canonical key. Current behavior is the fallback when the template returns nothing or 403.
4. Invalidate `['fieldTemplate']` alongside `['user-profile']` after a successful column save in `src/components/kanban/BoardSettingsModal.tsx`, so renamed/added columns propagate to the forms.
5. No change to `transformForBackend` — status is still normalized before posting.

## Verification

- Typecheck and build must pass.
- Preview check: open Add Application; Status buttons render; picking one and submitting still saves and lands in the correct Kanban column. With the template endpoint failing (current 403), the buttons must still show the board-column list.
