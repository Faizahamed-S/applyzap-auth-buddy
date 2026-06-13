# Referral Base CRM

Frontend-only build against a mocked API client. When the Spring Boot endpoints land, only `src/lib/referralApi.ts` needs to be swapped — the rest of the UI stays as-is.

## Architecture

```text
src/
├── types/referral.ts                       # types
├── lib/referralApi.ts                      # mocked API (localStorage), same shape as future REST
├── hooks/useReferrals.ts                   # react-query hooks
├── pages/ReferralsPage.tsx                 # route /referrals
└── components/referrals/
    ├── ReferralBaseHub.tsx                 # table + header + empty state
    ├── ReferralTable.tsx                   # directory (Name, Company, Mobile, Email, LinkedIn)
    ├── AddEditReferralModal.tsx            # create / edit form
    ├── ReferralDetailModal.tsx             # centered modal, contact + custom fields + linked apps
    ├── CustomFieldsTemplateModal.tsx       # manage user's custom-field template
    └── ReferralCombobox.tsx                # search/select used by job modals
```

## Data model (mock + future REST contract)

```ts
type Referral = {
  id: string;
  name: string;
  companyName?: string;
  mobile?: string;
  email?: string;
  linkedinUrl?: string;
  notes?: string;
  customFields?: Record<string, string>;  // keys come from template
  createdAt: string;
  updatedAt: string;
};

type ReferralFieldTemplate = {
  fields: { key: string; label: string }[];  // e.g. "Met At", "Relationship Strength"
};
```

Mock client persists to `localStorage` under `applyzap.referrals.v1` and `applyzap.referralTemplate.v1`. Methods: `list`, `get`, `create`, `update`, `delete`, `getTemplate`, `updateTemplate`.

## Component 1 — Referrals directory (`/referrals`)

- New route in `src/App.tsx` wrapped in `DashboardLayout`, auth-guarded like `TrackerPage`.
- Sidebar: remove `comingSoon` from "Referral Base" item in `DashboardSidebar.tsx`, set `href: '/referrals'`.
- Header row: page title + "Manage Custom Fields" (ghost) + "Add Referral" (primary).
- Table columns: **Name** (font-semibold), Company (muted), Mobile, Email (renders `<a href="mailto:…">`), LinkedIn (icon link, `target="_blank" rel="noreferrer"`), row actions (Edit, Delete).
- Row click → open `ReferralDetailModal`.
- Empty state: centered icon + "No referrals added yet" + CTA "Add your first referral".

## Component 2 — Referral detail modal

Centered `Dialog` matching `ApplicationDetailModal` styling:
- Top: name (h2), company, contact rows (mailto, tel, LinkedIn), notes block.
- Custom fields grid (only keys present in template).
- **Associated Applications** section: filter `jobApi.getAllApplications()` cached list by `referralId === this.id`. Each row shows Company • Role • Date; clicking opens existing `ApplicationDetailModal` (pass selected `JobApplication`).
- Empty linked-apps state: "No applications linked yet."
- Footer: Edit, Close.

## Component 3 — Tracker integration

Edit `AddJobModal.tsx` and `EditJobModal.tsx`:
- Keep existing `referral` boolean switch (backward compat per decision).
- When ON, reveal `ReferralCombobox` (shadcn `Command` inside `Popover`) — search by name/company, plus inline "+ Add new referral" that opens `AddEditReferralModal`.
- Selected referral persisted to form state as `referralId: string | null`.
- Add `referralId?: string` to `JobApplication`, `CreateJobApplication`, `UpdateJobApplication` in `src/types/job.ts`. Pass through transformers in `statusMapper.ts` untouched (string passthrough). Backend will ignore until ready — non-breaking.

## Custom fields template

`CustomFieldsTemplateModal` reuses the visual pattern of `CustomFieldsEditor.tsx`: list of `{label}` rows with add/remove. Template applies to all referrals; when editing a referral, the form renders one input per template field.

## Styling

Uses existing tokens only — `Card`, `Dialog`, `Input`, `Button`, `Table`, `Command`, `Popover`, `Tooltip`. No hardcoded colors. Matches density of `AllApplicationsTable` and `ApplicationDetailModal`.

## Out of scope

- Real backend endpoints (mock only; swap `referralApi.ts` later).
- Import/export, dedupe, bulk actions.
- Tags, avatars, activity timeline.