# Board Settings save — verified against the new merge behavior

The backend now merges `trackerConfig` by top-level key. I checked the frontend against your four requirements — all four are already satisfied by the current code, so this plan is verification-only with no code changes.

## Current state (verified in code)

1. **Request body** — `BoardSettingsModal.tsx` (line 84) sends exactly `{ trackerConfig: { columns } }`. It does not spread the existing trackerConfig, so stale `applicationCustomFields` / `referralCustomFields` are never sent.
2. **Cache refresh after save** — the same mutation's `onSuccess` (lines 85-91) already invalidates three keys:
   - `['user-profile']` — board columns
   - `['fieldTemplate']` — the key the add/edit job form uses for `GET /board/field-template` (via `useStatusOptions`), so the status dropdown picks up new/renamed/removed columns immediately
   - `['unique-statuses']` — the fallback status list
3. **No other changes** — column create/rename/reorder/delete, status normalization, and drag-between-columns are untouched.
4. **Other profile saves** — the only other `PUT /api/user/profile` caller is `ProfilePage.tsx` (line 90), which sends only `{ firstName, lastName, timezone, profileData }` — never trackerConfig. No caller sends the whole trackerConfig object.

## What I will do

- No code edits.
- Run the typecheck and confirm the build is clean.
- Report back so you can do the manual confirmation: add a column in Board Settings, save, and check the add-job form's status dropdown shows it without a reload, with custom fields still intact.

## If anything fails your manual check

If the status dropdown does not refresh after saving, the likely cause is the field-template endpoint still returning 403 (a backend-side permission issue seen earlier) — in that case the dropdown falls back to board columns, which also refresh via `['user-profile']`, so it should still work.
