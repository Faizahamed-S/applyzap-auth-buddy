## Phase 1 patch — Collaborative Groups + API base URL fix

Strict-scope patch. No redesign, no global error handler, no Phase 2/3 features (no invites, members, or group board).

### 1. Centralize backend base URL

Create `src/lib/apiConfig.ts`:

```ts
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  "https://tracker-backend-production-535d.up.railway.app";
```

Document the variable in `.env.example` (create if missing):

```
VITE_API_BASE_URL=http://localhost:8080
```

Note: `.env` is auto-managed and not edited; users set `VITE_API_BASE_URL` in their local env. Production build uses the Railway fallback when the var is unset (matches current prod behavior).

### 2. Replace hardcoded hosts in API modules

**Before / After base URL usage:**

| File | Before | After |
|---|---|---|
| `src/lib/jobApi.ts` | `const API_BASE_URL = "https://tracker-backend-production-535d.up.railway.app/board"` | `import { API_BASE_URL as BASE } from "./apiConfig"; const API_BASE_URL = ${'`${BASE}/board`'}` |
| `src/lib/userApi.ts` | `"https://tracker-backend-production-535d.up.railway.app/api/user"` | ${'`${BASE}/api/user`'} |
| `src/lib/analyticsApi.ts` | `"https://tracker-backend-production-535d.up.railway.app"` | uses `BASE` directly for `/api/analytics/dashboard` |
| `src/lib/groupsApi.ts` | `const API_BASE = "http://localhost:8080"` | uses `BASE` for `/api/groups` |

No other behavior changes in jobApi/userApi/analyticsApi — auth header logic untouched, no global error handler added.

### 3. Groups Phase 1

**`src/lib/groupsApi.ts`** — switch to shared `BASE`. Keep existing `GroupsApiError`, `listGroups`, `createGroup`. Add limit detection helper to also match backend's 500 message `"Maximum number of groups"`.

**`src/components/groups/CreateGroupModal.tsx`** — update `looksLikeLimitError` to also match `"maximum number of groups"` substring (covers 500 with that text). Limit toast text changed to: `"You can own at most 2 groups."` per spec.

**`src/components/groups/GroupCard.tsx`** — replace placeholder toast with real navigation:
```tsx
const handleEnter = () => navigate(`/groups/${group.id}`);
```

**`src/pages/GroupDetailPage.tsx`** (new) — minimal placeholder:
- Reads `:groupId` from URL.
- Renders inside `DashboardLayout` with heading "Group workspace" and copy "Coming in Phase 2." plus a back link to `/groups`.
- No API calls.

**`src/App.tsx`** — add route:
```tsx
<Route path="/groups/:groupId" element={<GroupDetailPage />} />
```

**Dashboard sidebar button** — `src/components/dashboard/DashboardSidebar.tsx` already routes `Collaborative Tracker` to `/groups` (unlocked previously). No change needed.

**`MyGroupsHub.tsx`** — local error toasts already cover 401 / 500 / generic. Tweak the 401 message to `"Please sign in again"` to match spec.

### 4. Out of scope (explicitly NOT doing)

- No group job board, invites, or members UI.
- No global API error handler / interceptor.
- No refactor of unrelated pages.
- No changes to board query params (we don't touch `jobApi` call sites).

### Files changed

- `src/lib/apiConfig.ts` (new)
- `.env.example` (new, documentation only)
- `src/lib/jobApi.ts` (base URL only)
- `src/lib/userApi.ts` (base URL only)
- `src/lib/analyticsApi.ts` (base URL only)
- `src/lib/groupsApi.ts` (base URL + limit message match)
- `src/components/groups/CreateGroupModal.tsx` (limit detection + toast text)
- `src/components/groups/GroupCard.tsx` (real navigation)
- `src/components/groups/MyGroupsHub.tsx` (401 toast text)
- `src/pages/GroupDetailPage.tsx` (new placeholder)
- `src/App.tsx` (new route)

### Acceptance checks

1. With `VITE_API_BASE_URL=http://localhost:8080`, all `/board`, `/api/user`, `/api/analytics`, `/api/groups` calls hit localhost.
2. Without the var (prod build), all calls hit Railway.
3. Signed-in user can list and create groups; second create over limit shows `"You can own at most 2 groups."`
4. Personal board/profile/analytics unaffected (only base URL string changed).
5. Clicking "Enter group" navigates to `/groups/{id}` placeholder page.
6. No global error handler added — confirmed; all error toasts remain local to `MyGroupsHub` and `CreateGroupModal`.
