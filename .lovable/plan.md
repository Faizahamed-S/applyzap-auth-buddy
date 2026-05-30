# Add to collaborative group(s) on job creation

Add an optional toggle in the personal "Add Application" modal that also posts the new job (subset fields only) to one or more collaborative groups.

## Files

**New**
- `src/lib/groupsCache.ts` — localStorage-backed cache of group summaries.

**Edited**
- `src/components/kanban/AddJobModal.tsx` — add toggle + group multi-select + remembered selection.
- `src/components/kanban/JobKanbanBoard.tsx` — extend `handleAddJob` to fan out to group endpoints after personal create.
- `src/components/groups/CreateGroupModal.tsx`, `src/pages/GroupDetailPage.tsx` (delete), `src/pages/InviteAcceptPage.tsx` (accept) — call `refreshGroupsCache()` after success.
- `src/pages/Login.tsx` — call `refreshGroupsCache()` after successful sign-in (email/password + OAuth callback path).

## Cache (`src/lib/groupsCache.ts`)

```ts
type GroupSummary = { id: number; name: string };
const KEY = "applyzap_groups_cache";
const TTL_MS = 30 * 60 * 1000;
```

- `getGroupsCache(): { groups, fetchedAt } | null` — returns parsed entry (no TTL check; caller decides).
- `isFresh(entry): boolean` — `Date.now() - fetchedAt < TTL_MS`.
- `refreshGroupsCache(): Promise<GroupSummary[]>` — calls `groupsApi.listGroups()`, maps to `{id, name}`, writes to localStorage, returns array. Silent on failure (returns existing cache or `[]`).
- `ensureGroupsCache(): Promise<GroupSummary[]>` — return cached if fresh, else `refreshGroupsCache()`.
- `clearGroupsCache()`.

Last-selected ids helper:
- `getLastSelectedGroupIds(): number[]` / `setLastSelectedGroupIds(ids)` against key `applyzap_last_group_ids`.

## AddJobModal changes

- On `open` transition to true: call `ensureGroupsCache()` once, store result in `groups` state; if toggle later turned on while cache is stale, `refreshGroupsCache()` again.
- New form state (outside zod schema to keep submit payload clean):
  - `postToGroups: boolean` (default `false`).
  - `selectedGroupIds: number[]` (init from `getLastSelectedGroupIds()` intersected with available groups).
- UI block placed above the action buttons:
  - If `groups.length === 0`: render disabled switch with helper text "Join or create a group first" linking to `/groups`.
  - Else: `<Switch>` labeled "Also add to collaborative group(s)".
  - When toggle is ON: render a bordered list of checkboxes (group name per row, scrollable max-h).
  - Inline error below list when toggle ON and `selectedGroupIds.length === 0` and submit attempted.
- On submit:
  - Block submit (set local error, do not call `onSubmit`) if toggle ON and no group selected.
  - Pass extra `__groupIds: number[]` alongside form values to `onSubmit` (keeps `AddJobModal` API additive; consumer strips before sending to personal endpoint).
  - Persist `setLastSelectedGroupIds(selectedGroupIds)` on successful submit.

## JobKanbanBoard submit flow

Replace `handleAddJob`:

```ts
const handleAddJob = async (data: any) => {
  const { __groupIds = [], ...personal } = data;
  let created: JobApplication;
  try {
    created = await jobApi.createApplication(personal);
  } catch {
    toast.error("Failed to add application");
    return;
  }
  queryClient.invalidateQueries({ queryKey: ["job-applications"] });
  queryClient.invalidateQueries({ queryKey: ["unique-statuses"] });

  if (__groupIds.length === 0) {
    toast.success("Application added successfully!");
    return;
  }

  const groups = getGroupsCache()?.groups ?? [];
  const payload = {
    jobLink: personal.jobLink || "",
    companyName: personal.companyName,
    roleName: personal.roleName,
  };
  const results = await Promise.allSettled(
    __groupIds.map((id) => groupJobsApi.createJob(id, payload))
  );
  const failed = results
    .map((r, i) => ({ r, name: groups.find(g => g.id === __groupIds[i])?.name ?? `#${__groupIds[i]}` }))
    .filter(({ r }) => r.status === "rejected");

  if (failed.length === 0) toast.success("Added to board and group(s)");
  else toast.warning(`Saved to board; failed for ${failed.map(f => f.name).join(", ")}`);
};
```

Drop `createMutation`'s `onSuccess` toast (handled inline now) or convert to a no-op success.

## Edge cases handled

- Dedup: backend returns 200/201 with existing job — both are non-error, counted as success.
- 403: surfaces in the partial-failure toast naming the group.
- Toggle on, zero selected: blocked client-side, no requests fired.
- No `jobLink` in personal form: send empty string (backend currently rejects invalid URLs; if user left blank, the group POST would 400 — captured in partial-failure toast). Out of scope to change schema.

## Out of scope

Chrome extension; group `jobDescription`; backend composite endpoint; edit-application sync to groups.
