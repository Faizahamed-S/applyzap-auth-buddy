# Fix Add-Group-Job error UX

Scope: `src/components/groups/AddGroupJobModal.tsx` and `src/lib/groupJobsApi.ts`. Personal board flow untouched.

## 1. Backend message parsing (`groupJobsApi.createJob`)

`parseError` already JSON-parses and extracts `message`/`error`. Keep it — `GroupsApiError.message` will carry the backend message. Verify the `Authorization` header in `getAuthHeaders` already uses `session.access_token` (it does); no change needed.

## 2. Map messages to friendly toasts (`AddGroupJobModal.onError`)

Replace the current status-based switch with message-content matching first, falling back to status-based hints:

```text
msg = err.message ?? ""

if msg includes "Invalid job link" | "Invalid job URL" | "Job link is required"
    → "Invalid link — use a full URL starting with https://"
else if msg includes "Not a member"
    → "You don't have access to this group"
else if msg includes "Group not found"
    → "Group not found"
else if err.status === 401
    → "Please sign in again"
else if err.status === 409
    → "That job is already on the board."
else
    → msg || "Couldn't add job. Try again."
```

No more generic "Unable to add" when a specific backend message exists.

## 3. Client-side validation before submit

In `handleSubmit`:
- Block submit if `jobLink.trim()` is empty → inline error + toast
- Block submit if it does not start with `http://` or `https://` → inline error + toast
- Keep `new URL()` sanity check

## 4. Inline hint under the Job link field

Always render helper text:
> "Paste the full job URL (e.g. https://company.com/careers/123)"

Switch to red/destructive copy when the inline validation error is set.

## Files touched
- `src/components/groups/AddGroupJobModal.tsx` — validation, inline hint, new error mapping
- (No change needed in `src/lib/groupJobsApi.ts` — `parseError` already extracts `message`; auth header already uses session token.)

## Out of scope
Personal board create flow, other group endpoints, AddJobModal in kanban.
