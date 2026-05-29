import { supabase } from "@/integrations/supabase/client";
import { API_BASE_URL as API_BASE } from "./apiConfig";
import { GroupsApiError } from "./groupsApi";
import type { GroupMember } from "./groupsApi";

export type GroupJobStatus = "APPLIED" | "EXPIRED" | "NA";

export interface GroupJobStatusEntry {
  memberId: number;
  status: GroupJobStatus;
}

export interface GroupJob {
  jobId: number;
  normalizedUrl: string;
  originalUrl: string;
  companyName: string;
  roleName: string;
  dateAdded: string;
  addedByUserId: number;
  addedByMemberId: number | null;
  statuses: GroupJobStatusEntry[];
}

export interface GroupBoard {
  id: number;
  name: string;
  members: GroupMember[];
  jobs: GroupJob[];
}

export interface CreateGroupJobPayload {
  jobLink: string;
  companyName: string;
  roleName: string;
}

const getAuthHeaders = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new GroupsApiError("Not authenticated", 401);
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.access_token}`,
  };
};

const parseError = async (res: Response): Promise<GroupsApiError> => {
  let body: unknown = undefined;
  let message = `Request failed with status ${res.status}`;
  try {
    const text = await res.text();
    if (text) {
      try {
        body = JSON.parse(text);
        const b = body as { message?: string; error?: string };
        message = b.message || b.error || text;
      } catch {
        body = text;
        message = text;
      }
    }
  } catch {
    // ignore
  }
  return new GroupsApiError(message, res.status, body);
};

export const groupJobsApi = {
  getBoard: async (groupId: number | string): Promise<GroupBoard> => {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/api/groups/${groupId}/jobs`, { headers });
    if (!res.ok) throw await parseError(res);
    return res.json();
  },

  createJob: async (
    groupId: number | string,
    payload: CreateGroupJobPayload,
  ): Promise<GroupJob> => {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/api/groups/${groupId}/jobs`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw await parseError(res);
    return res.json();
  },

  updateJob: async (
    groupId: number | string,
    jobId: number | string,
    payload: CreateGroupJobPayload,
  ): Promise<GroupJob> => {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/api/groups/${groupId}/jobs/${jobId}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw await parseError(res);
    return res.json();
  },

  setStatus: async (
    groupId: number | string,
    jobId: number | string,
    status: GroupJobStatus,
  ): Promise<void> => {
    const headers = await getAuthHeaders();
    const res = await fetch(
      `${API_BASE}/api/groups/${groupId}/jobs/${jobId}/status`,
      {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status }),
      },
    );
    if (!res.ok) throw await parseError(res);
  },

  deleteJob: async (
    groupId: number | string,
    jobId: number | string,
  ): Promise<void> => {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/api/groups/${groupId}/jobs/${jobId}`, {
      method: "DELETE",
      headers,
    });
    if (!res.ok) throw await parseError(res);
  },
};

export const nextStatus = (s: GroupJobStatus): GroupJobStatus => {
  if (s === "NA") return "APPLIED";
  if (s === "APPLIED") return "EXPIRED";
  return "NA";
};

export const statusBadgeClass = (s: GroupJobStatus) => {
  switch (s) {
    case "APPLIED":
      return "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30";
    case "EXPIRED":
      return "bg-red-500/10 text-red-500 border border-red-500/30";
    default:
      return "bg-muted text-muted-foreground border border-border";
  }
};
