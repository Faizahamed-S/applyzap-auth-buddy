## Goal

Add a shortcut inside **Board Settings** to wipe every job application on the personal Kanban board, protected by a GitHub-style typed confirmation.

## Confirmation string

The app doesn't store a "username" — the closest unique identifier tied to the account is the user's **email address** (from `useUserProfile`). We'll use the full email as the confirmation string, shown in bold in the dialog copy ("Type `you@example.com` to confirm"). The Delete button stays disabled until the input matches exactly (case-insensitive, trimmed).

If you'd rather use `firstName lastName` instead of email, say the word and I'll swap it — everything else stays the same.

## UX

Inside `BoardSettingsModal`, below the existing column list and Add Column button, add a **Danger Zone** section:

```text
──────────────────────────────
Danger Zone
Delete all applications on this board.
This permanently removes every job you've added. This action cannot be undone.
[ Delete all applications ]  (destructive button)
──────────────────────────────
```

Clicking the button opens a **nested confirmation dialog** (AlertDialog) with:

- Warning icon + "Delete all applications?" title
- Body: "This will permanently delete all N applications on your board. To confirm, type your email `you@example.com` below."
- Text input
- Cancel + "Delete everything" (destructive, disabled until input matches)
- While deleting: button shows "Deleting… (x / N)"

## Implementation

**`src/lib/jobApi.ts`** — add one helper:

```ts
deleteAllApplications: async (): Promise<{ deleted: number; failed: number }> => { ... }
```

It fetches every application via existing `getAllApplications()` (paginated if needed — loop until returned page is short), then calls `deleteApplication(id)` for each with limited concurrency (e.g. 5 at a time via a small pool). Returns counts so the toast can summarize. No new backend endpoint required.

**`src/components/kanban/BoardSettingsModal.tsx`**:

- Import `useUserProfile` to read the current user's email.
- Add state: `wipeDialogOpen`, `confirmText`, `wipeProgress`.
- Add the Danger Zone section as described.
- Add nested `AlertDialog` (shadcn) for the typed confirmation.
- Wire up a `wipeMutation` using `useMutation` calling `jobApi.deleteAllApplications`.
- On success: `queryClient.invalidateQueries({ queryKey: ['applications'] })`, toast `"Deleted N applications"` (or partial-failure warning if any failed), close both dialogs.
- On error: toast error, keep dialog open.

**No changes** to backend, routes, or other components.

## Out of scope

- No bulk-delete endpoint on the Spring Boot backend (uses existing per-item DELETE loop).
- Does not touch collaborative group boards — only the user's personal board, matching the current "Board Settings" scope.
- No change to columns / trackerConfig behavior.
