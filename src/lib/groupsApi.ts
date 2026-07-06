import { supabase } from "@/integrations/supabase/client";
import { apiFetch } from "./apiFetch";
import { API_BASE_URL as API_BASE } from "./apiConfig";

export interface Group {
  id: number;
  name: string;
  ownerId: number;
  createdAt: string;
}

export type GroupMemberRole = "OWNER" | "MEMBER";

export interface GroupMember {
  memberId: number;
  displayName: string;
  role: GroupMemberRole;
  userId: number;
}

export interface GroupDetail extends Group {
  members: GroupMember[];
}

export interface GroupInviteInfo {
  groupName: string;
  inviterName: string;
  email: string;
  valid: boolean;
}

export class GroupsApiError extends Error {
  status: number;
  body?: unknown;
  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
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

export const groupsApi = {
  listGroups: async (): Promise<Group[]> => {
    const headers = await getAuthHeaders();
    const res = await apiFetch(`${API_BASE}/api/groups`, { headers });
    if (!res.ok) throw await parseError(res);
    return res.json();
  },

  createGroup: async (name: string): Promise<Group> => {
    const headers = await getAuthHeaders();
    const res = await apiFetch(`${API_BASE}/api/groups`, {
      method: "POST",
      headers,
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw await parseError(res);
    return res.json();
  },

  getGroup: async (groupId: number | string): Promise<GroupDetail> => {
    const headers = await getAuthHeaders();
    const res = await apiFetch(`${API_BASE}/api/groups/${groupId}`, { headers });
    if (!res.ok) throw await parseError(res);
    return res.json();
  },

  inviteMember: async (groupId: number | string, email: string): Promise<string> => {
    const headers = await getAuthHeaders();
    const res = await apiFetch(`${API_BASE}/api/groups/${groupId}/invites`, {
      method: "POST",
      headers,
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw await parseError(res);
    // Backend returns invite token string (may be plain text or JSON-wrapped).
    const text = await res.text();
    try {
      const parsed = JSON.parse(text);
      if (typeof parsed === "string") return parsed;
      if (parsed && typeof parsed === "object") {
        const p = parsed as { token?: string; inviteToken?: string };
        return p.token || p.inviteToken || text;
      }
    } catch {
      // not JSON, fall through
    }
    return text;
  },

  leaveGroup: async (groupId: number | string): Promise<void> => {
    const headers = await getAuthHeaders();
    const res = await apiFetch(`${API_BASE}/api/groups/${groupId}/members/me`, {
      method: "DELETE",
      headers,
    });
    if (!res.ok) throw await parseError(res);
  },

  deleteGroup: async (groupId: number | string): Promise<void> => {
    const headers = await getAuthHeaders();
    const res = await apiFetch(`${API_BASE}/api/groups/${groupId}`, {
      method: "DELETE",
      headers,
    });
    if (!res.ok) throw await parseError(res);
  },

  getInviteInfo: async (token: string): Promise<GroupInviteInfo> => {
    const headers = await getAuthHeaders();
    const res = await apiFetch(`${API_BASE}/api/groups/invites/${token}`, { headers });
    if (!res.ok) throw await parseError(res);
    return res.json();
  },

  acceptInvite: async (token: string): Promise<void> => {
    const headers = await getAuthHeaders();
    const res = await apiFetch(`${API_BASE}/api/groups/invites/${token}/accept`, {
      method: "POST",
      headers,
    });
    if (!res.ok) throw await parseError(res);
  },
};
