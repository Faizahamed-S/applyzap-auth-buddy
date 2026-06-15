# Plan: Trim Application Detail + Align Referral Contract

## Part 1 — Remove duplicate "View Original Job Posting" link

In `src/components/kanban/ApplicationDetailModal.tsx`, the same job link is rendered twice:
- Inline block under "Application Information" (lines 165–184) labelled **View Original Job Posting**
- Footer action button (lines 242–258) labelled **View Job Posting**

Remove the inline block (lines 165–184). Keep the footer button. Nothing else in that file changes.

## Part 2 — Align referral frontend to the agreed Spring Boot contract

Currently the frontend uses a local-only field name `referralId`, filters `associatedApplications` client-side, and the application has no embedded referral summary. The agreed backend contract is:

| Concern | Backend field |
|---|---|
| Link a referral on an application (write) | `referralContactId` (omit when no contact) |
| Display referral name on an application (read) | `referralContactSummary.name` |
| Linked jobs on a referral (read) | `GET /api/referrals/{id}` → `associatedApplications[]` |
| "Has referral" only (no contact) | send `referral: true`, omit `referralContactId` |

### 2a. Types (`src/types/job.ts`)

Replace `referralId?: string | null` with the backend shape:

```ts
referralContactId?: string | null;     // write
referralContactSummary?: {             // read-only (server-populated)
  id: string;
  name: string;
} | null;
```

### 2b. Backend transform (`src/lib/statusMapper.ts`)

Update `backendJobSchema`:
- Replace `referralId` with `referralContactId: z.string().nullable().optional()`.
- Add `referralContactSummary: z.object({ id: z.string(), name: z.string() }).nullable().optional()`.

`transformForBackend` already passes through; no change needed beyond field rename. When `referral === false`, ensure `referralContactId` is stripped from the payload so we don't send a stale value. When `referral === true` but no contact selected, omit the key (do not send `null` unless the backend requires it; default to omit).

### 2c. Add/Edit Job modals (`AddJobModal.tsx`, `EditJobModal.tsx`)

- Rename form field `referralId` → `referralContactId` everywhere (schema, defaultValues, reset, Switch reset handler, `ReferralCombobox` value/onChange).
- On submit, if `referral === false`, drop `referralContactId` from the outgoing payload.
- `EditJobModal` initial value: `job.referralContactId ?? null`.

### 2d. Application Detail modal

In the "Tags" section, when `application.referral` is true, render the referral pill as:
- If `referralContactSummary?.name` exists → `Referral · {name}`
- Else → `Referral` (unchanged)

### 2e. Referral Detail modal (`ReferralDetailModal.tsx`)

Stop filtering `jobApi.getAllApplications()` client-side. Source linked jobs from the referral object itself, which the backend will populate as `associatedApplications: Array<{ id, companyName, roleName, dateOfApplication, status }>`.

- Add `associatedApplications?: AssociatedApplicationSummary[]` to `Referral` in `src/types/referral.ts`.
- Render `referral.associatedApplications ?? []`. Empty array → existing empty state.
- Remove the `useQuery(['applications', 'all'])` block and the `(a as any).referralId` filter.
- Click on a row still opens the existing `ApplicationDetailModal` via `setSelectedAppId(app.id)` (no change).

### 2f. Mock referral API (`src/lib/referralApi.ts`)

Backend isn't ready yet, so to keep the dev UX working until the Spring Boot endpoint lands, the mock `get(id)` should synthesise `associatedApplications` by calling `jobApi.getAllApplications()` and filtering by `referralContactId === id`. This is a temporary shim, clearly commented as "remove when backend ships GET /api/referrals/{id}".

### 2g. Referral Combobox

No interface change — it still takes `value: string | null` and `onChange(id: string | null)`. Only the form field name binding changes.

## Out of scope

- No changes to `ReferralCombobox` internals.
- No changes to `jobApi.ts` URLs (backend will reuse existing `PUT /applications/{id}` with the new field name).
- No migration of existing localStorage data (`referralId` linked apps in dev will simply lose their link; acceptable since this is pre-prod mock data).

## Risk / verification

- After build, open Tracker → application detail: only one job-link link remains (the footer button).
- Add/Edit job: toggle Referral on, pick a contact, save → payload contains `referralContactId`, not `referralId`. Toggle off → payload omits `referralContactId`.
- Referral Base → open a referral that has linked apps → Associated Applications list still renders (via mock shim until backend lands).
