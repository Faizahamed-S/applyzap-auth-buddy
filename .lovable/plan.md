## Goal
Make the group's collaborative board the default view when entering a group, and move the current group detail (members, invite, leave/delete) behind a "Member settings" button.

## Changes

### 1. Routing (`src/App.tsx`)
Swap which component is mounted at each route:
- `/groups/:groupId` → `GroupBoardPage` (was `GroupDetailPage`)
- `/groups/:groupId/settings` → `GroupDetailPage` (new route; replaces `/groups/:groupId/board`)

Keep `/groups/:groupId/board` as a redirect to `/groups/:groupId` for any existing links/bookmarks.

### 2. `GroupBoardPage` (now the group landing page)
- Update "Back" link target from `/groups/:groupId` → `/groups` (back to groups list).
- Add a **"Member settings"** button (icon: `Users` or `Settings`) in the header next to "Add job" that navigates to `/groups/:groupId/settings`.
- Keep all existing board functionality (add job, status cycling, delete job, tutorial preview).

### 3. `GroupDetailPage` (now the settings page)
- Update "Back" link from `/groups` → `/groups/:groupId` (back to the board).
- Update page title context (e.g. "{group.name} — Members & settings") so it's clear this is a sub-page.
- Remove the "Open collaborative board" button (board is now the parent page) — or replace it with a subtle "View board" link. Recommend removing since back-button already returns to board.
- Keep Invite member (owner only), member list, Leave group, Delete group (owner only).

### 4. Entry points that link into a group
Audit and update any `navigate("/groups/${id}")` or `<Link to="/groups/...">` callers that previously expected the detail page. These should now naturally land on the board, which is the desired behavior. Specifically check:
- `MyGroupsHub` / `GroupCard` — clicking a group card lands on the board ✓ (desired)
- `InviteAcceptPage` — after accepting invite, lands on board ✓ (desired)
- Any internal "Open board" buttons → can be removed or repointed.

## Out of scope
- No changes to board logic, members API, invite flow, or styling beyond the new button.
- No backend changes.