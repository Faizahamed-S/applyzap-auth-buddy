import { toast } from 'sonner';
import { getGroupsCache } from '@/lib/groupsCache';
import type { GroupAddResult } from './jobApi';

/**
 * Show per-group toasts after mirroring a personal application to collaborative groups.
 * `groupIds` is the list the caller requested; `groupResults` is the backend response.
 */
export function reportGroupMirrorResults(
  groupIds: number[],
  groupResults: GroupAddResult[] | undefined,
  fallbackSuccess: string,
): void {
  if (!groupIds || groupIds.length === 0) {
    toast.success(fallbackSuccess);
    return;
  }

  const cachedGroups = getGroupsCache()?.groups ?? [];
  const nameFor = (id: number) =>
    cachedGroups.find((g) => g.id === id)?.name ?? `Group #${id}`;

  const results = groupResults ?? [];
  const succeeded = results.filter((r) => r.success).map((r) => nameFor(r.groupId));
  const failed = results.filter((r) => !r.success);

  if (succeeded.length > 0) {
    toast.success(
      succeeded.length === 1
        ? `Added to ${succeeded[0]}`
        : `Added to ${succeeded.join(', ')}`,
    );
  }

  for (const f of failed) {
    toast.error(`${nameFor(f.groupId)}: ${f.error ?? 'Failed to add to group'}`);
  }

  // Personal update always saved — surface that even if all groups failed.
  if (succeeded.length === 0 && failed.length > 0) {
    toast.success(fallbackSuccess);
  } else if (succeeded.length === 0 && failed.length === 0) {
    // groupIds sent but backend returned nothing — treat as personal-only success.
    toast.success(fallbackSuccess);
  }
}
