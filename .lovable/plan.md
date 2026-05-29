# Group Invite Flow — Frontend Delivery

Backend creates invite tokens but does not send email. Frontend must surface the link to the inviter and run the accept flow on the invitee's side.

## Scope
- No UI redesign outside the invite modal + new accept page.
- No global error handler; all errors stay local toasts.
- Reuse `API_BASE_URL` from `src/lib/apiConfig.ts` and Supabase access token.

## Files

### 1. `src/lib/groupsApi.ts` (edit)
Add two methods + one type:
- `GroupInviteInfo = { groupName: string; inviterName: string; email: string; valid: boolean }`
- `getInviteInfo(token: string): Promise<GroupInviteInfo>` → `GET /api/groups/invites/{token}` (Bearer).
- `acceptInvite(token: string): Promise<void>` → `POST /api/groups/invites/{token}/accept` (Bearer).
- Keep existing `inviteMember` — it already returns the token string.

### 2. `src/components/groups/InviteMemberModal.tsx` (rewrite behavior, same shell)
Replace the "Invite sent" success toast with a two-step modal state:
- **Step 1 — Form**: email input + "Create invite" button (unchanged UI).
- **Step 2 — Share** (after 201 success):
  - Title: "Invite created"
  - Body: `Share this link with them. They must sign in as {email} to join.`
  - Read-only input showing `inviteUrl = ${window.location.origin}/invite/${token}`
  - **Copy link** button (uses `navigator.clipboard.writeText`, toast on success)
  - **Email link** button → `mailto:{email}?subject=Join {groupName} on ApplyZap&body={inviteUrl}` (opens user's mail client; we do not claim backend sent email)
  - **Done** button closes modal; **Invite another** resets to step 1
- Drop the dev-only auto-copy of the raw token.
- Keep local error toasts for 400/403/409/500.

### 3. `src/pages/InviteAcceptPage.tsx` (new)
Route `/invite/:token`. Flow:
1. Check Supabase session. If none → `navigate('/login?returnTo=/invite/' + token, { replace: true })`.
2. On mount (signed in) → `groupsApi.getInviteInfo(token)`.
3. Render card with:
   - Title: `Join {groupName}`
   - Subtext: `{inviterName} invited {email} to collaborate.`
   - Warning banner if `info.valid === false` OR if current Supabase user email !== `info.email` → "This invite is for {email}. Sign in with that account to accept." (Sign out button → supabase signOut + redirect to login with returnTo).
   - **Accept invite** button → `acceptInvite(token)` → on success: toast "Joined {groupName}", `navigate(`/groups/${groupId}`)` (need groupId — see note below).
   - **Decline** → `navigate('/groups')`.
4. Error states (local toasts + inline message):
   - 401 → re-login with returnTo
   - 404/410 → "This invite is no longer valid."
   - 409 → "You're already a member." + button to `/groups`
   - 500 → generic retry

Note on `groupId` after accept: `GroupInviteInfoDTO` shape per spec does not include groupId. After accept, navigate to `/groups` (groups list) as the safe default. If backend later adds `groupId` to the info DTO or the accept response, switch to `/groups/{id}`. Add a `// TODO` comment.

### 4. `src/pages/Login.tsx` (small edit)
Honor `?returnTo=` query param after successful sign-in (and after Google OAuth callback). If absent, keep current behavior (redirect to `/dashboard`).

### 5. `src/App.tsx` (edit)
Register `<Route path="/invite/:token" element={<InviteAcceptPage />} />` above the catch-all.

## Out of scope
- Backend changes (it already returns plain string token + has accept endpoint per spec).
- Sidebar, dashboard, board, profile, analytics — untouched.
- No new global error handler, no axios interceptors.

## Acceptance
1. Owner invites email → modal shows shareable `/invite/{token}` URL with copy + mailto buttons.
2. Visiting `/invite/{token}` while signed out redirects to login with returnTo and returns after auth.
3. Signed-in invitee sees group name + inviter; Accept joins group, lands on `/groups`.
4. Wrong-account warning appears when session email differs from invite email.
5. All requests use `API_BASE_URL` + Bearer; no global error handler added.
