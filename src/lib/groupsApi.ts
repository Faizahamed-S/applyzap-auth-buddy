import { supabase } from "@/integrations/supabase/client";
import { API_BASE_URL as API_BASE } from "./apiConfig";


export interface Group {
  id: number;
  name: string;
  ownerId: number;
  createdAt: string;
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
    const res = await fetch(`${API_BASE}/api/groups`, { headers });
    if (!res.ok) throw await parseError(res);
    return res.json();
  },

  createGroup: async (name: string): Promise<Group> => {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/api/groups`, {
      method: "POST",
      headers,
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw await parseError(res);
    return res.json();
  },
};
