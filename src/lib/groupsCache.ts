import { groupsApi } from "./groupsApi";

export interface GroupSummary {
  id: number;
  name: string;
}

interface CacheEntry {
  groups: GroupSummary[];
  fetchedAt: number;
}

const KEY = "applyzap_groups_cache";
const LAST_SELECTED_KEY = "applyzap_last_group_ids";
const TTL_MS = 30 * 60 * 1000;

export const getGroupsCache = (): CacheEntry | null => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEntry;
    if (!parsed || !Array.isArray(parsed.groups) || typeof parsed.fetchedAt !== "number") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

export const isFresh = (entry: CacheEntry | null): entry is CacheEntry =>
  !!entry && Date.now() - entry.fetchedAt < TTL_MS;

const writeCache = (groups: GroupSummary[]) => {
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({ groups, fetchedAt: Date.now() } satisfies CacheEntry),
    );
  } catch {
    // ignore
  }
};

export const refreshGroupsCache = async (): Promise<GroupSummary[]> => {
  try {
    const list = await groupsApi.listGroups();
    const summaries: GroupSummary[] = list.map((g) => ({ id: g.id, name: g.name }));
    writeCache(summaries);
    return summaries;
  } catch {
    return getGroupsCache()?.groups ?? [];
  }
};

export const ensureGroupsCache = async (): Promise<GroupSummary[]> => {
  const cached = getGroupsCache();
  if (isFresh(cached)) return cached.groups;
  return refreshGroupsCache();
};

export const clearGroupsCache = () => {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
};

export const getLastSelectedGroupIds = (): number[] => {
  try {
    const raw = localStorage.getItem(LAST_SELECTED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((n): n is number => typeof n === "number");
  } catch {
    return [];
  }
};

export const setLastSelectedGroupIds = (ids: number[]) => {
  try {
    localStorage.setItem(LAST_SELECTED_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
};
