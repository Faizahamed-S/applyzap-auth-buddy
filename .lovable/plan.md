## Phase 1: My Groups Dashboard

Unlock the sidebar "Collaborative Apply" item (the locked "coming soon" entry that matches "Collaborative job tracker") and wire it to a new `/groups` route that lists and creates groups.

### Files to create

1. **`src/lib/groupsApi.ts`** — new API client
   - `API_BASE = "http://localhost:8080"`
   - Reuses Supabase session token (same pattern as `jobApi.ts`) to build `Authorization: Bearer <token>` header.
   - `listGroups(): Promise<Group[]>` → `GET /api/groups`
   - `createGroup(name: string): Promise<Group>` → `POST /api/groups` with `{ name }`
   - Both throw a typed error carrying `status` + parsed message so callers can branch on 500 / limit errors locally (no global handler).
   - `Group` type: `{ id: number; name: string; ownerId: number; createdAt: string }`.

2. **`src/pages/GroupsPage.tsx`** — new route
   - Wrapped in `DashboardLayout` (same shell as `/dashboard` and `/tracker`).
   - Auth guard mirroring `Dashboard.tsx` (redirect to `/login` if no Supabase session).
   - Renders `<MyGroupsHub />`.

3. **`src/components/groups/MyGroupsHub.tsx`** — main view
   - Uses `@tanstack/react-query` `useQuery(['groups'], groupsApi.listGroups)`.
   - Header: "My Groups" + "Create New Group" button (top-right).
   - Loading skeleton, empty state ("No groups yet — create your first"), and error state with retry.
   - Grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`) of `GroupCard`s.
   - Local try/catch around fetch: on 500 / network error → `toast.error("Couldn't load groups. Please try again.")`. No global handler.

4. **`src/components/groups/GroupCard.tsx`**
   - Card shows group name, small "Created {relative date}" subtitle.
   - Primary button "Enter group" → `navigate(/groups/${id})` (route added in next phase; for now it just navigates — fine since route doesn't exist yet, but we'll guard with a toast "Coming in next phase" to avoid a 404 until then).

5. **`src/components/groups/CreateGroupModal.tsx`**
   - Shadcn `Dialog` + `Input` + `Button`.
   - Form: single text input (name, required, trimmed, max ~60 chars).
   - On submit → `useMutation(groupsApi.createGroup)`.
   - Local error handling:
     - If `err.status === 403` or message indicates group limit (e.g. "limit", "maximum", "2") → `toast.error("You can own a maximum of 2 groups. Delete one to create another.")`.
     - Other 4xx → show server-provided message via toast.
     - 5xx / network → `toast.error("Something went wrong creating the group. Please try again.")`.
   - On success → `toast.success("Group created")`, `queryClient.invalidateQueries(['groups'])`, close modal, reset input.

### Files to modify

6. **`src/components/dashboard/DashboardSidebar.tsx`**
   - Replace the `Collaborative Apply` nav item:
     - Remove `comingSoon: true`.
     - Set `href: '/groups'`.
     - Optionally relabel to "Collaborative Tracker" to match the user's wording (kept short for collapsed-sidebar fit). Keep the `Handshake` icon.

7. **`src/App.tsx`**
   - Import `GroupsPage` and add `<Route path="/groups" element={<GroupsPage />} />` above the catch-all.

### Technical notes

- **Auth header**: built per-request from `supabase.auth.getSession()` — same pattern as `jobApi.ts`. No new env vars; backend base URL is hard-coded to `http://localhost:8080` as specified.
- **CORS / mixed content**: the deployed preview is HTTPS, so calls to `http://localhost:8080` will be blocked by the browser in the hosted preview. This will work when running the frontend locally against the local backend. Flagging so you're not surprised when testing from the lovable preview URL.
- **No global error handler**: errors are caught inside each component/mutation and surfaced via `sonner` toasts.
- **Next phase placeholder**: `/groups/:groupId` is intentionally out of scope; "Enter group" button will just show an info toast until that phase lands.

### Out of scope (Phase 2+)

- Group detail page, membership, invites, deletion, permissions UI.

```text
sidebar (Collaborative Apply unlocked)
        │
        ▼
   /groups  ──►  MyGroupsHub
                 ├── Create button ──► CreateGroupModal ──► POST /api/groups
                 └── GroupCard grid  ◄── GET /api/groups
```
