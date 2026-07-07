import { JobApplication, CreateJobApplication, UpdateJobApplication } from "@/types/job";
import { apiFetch } from "./apiFetch";
import { transformForBackend, transformFromBackend } from "./statusMapper";
import { supabase } from "@/integrations/supabase/client";
import { API_BASE_URL as BASE } from "./apiConfig";

const API_BASE_URL = `${BASE}/board`;

export interface GroupAddResult {
  groupId: number;
  success: boolean;
  jobId: number | null;
  error: string | null;
}



// Helper to get auth token
const getAuthToken = async (): Promise<string> => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error("No authentication token available");
  }
  return session.access_token;
};

// Helper to create headers with auth token
const getAuthHeaders = async () => {
  const token = await getAuthToken();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const jobApi = {
  // Fetch all job applications
  getAllApplications: async (status?: string, page = 1, limit = 100): Promise<JobApplication[]> => {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    const url = `${API_BASE_URL}/applications?${params.toString()}`;
    const headers = await getAuthHeaders();

    const response = await apiFetch(url, { headers });
    if (!response.ok) throw new Error("Failed to fetch applications");
    const result = await response.json();
    return result.map(transformFromBackend);
  },

  // Fetch single application
  getApplication: async (id: string): Promise<JobApplication> => {
    const headers = await getAuthHeaders();
    const response = await apiFetch(`${API_BASE_URL}/applications/${id}`, { headers });
    if (!response.ok) throw new Error("Failed to fetch application");
    const result = await response.json();
    return transformFromBackend(result);
  },

  // Fetch applications by status
  getApplicationsByStatus: async (status: string): Promise<JobApplication[]> => {
    const headers = await getAuthHeaders();
    const response = await apiFetch(`${API_BASE_URL}/applications/status/${status}`, { headers });
    if (!response.ok) throw new Error("Failed to fetch applications by status");
    const result = await response.json();
    return result.map(transformFromBackend);
  },

  // Create new application (optionally fan-out to collaborative groups in same request)
  createApplication: async (
    data: CreateJobApplication,
    groupIds?: number[],
  ): Promise<{ application: JobApplication; groupResults: GroupAddResult[] }> => {
    const transformedData = transformForBackend(data);
    const headers = await getAuthHeaders();

    const body =
      groupIds && groupIds.length > 0
        ? { ...transformedData, groupIds }
        : transformedData;

    const response = await apiFetch(`${API_BASE_URL}/applications`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error("Failed to create application");
    const result = await response.json();

    // New wrapper shape: { application, groupResults }. Fallback to legacy flat shape.
    if (result && typeof result === "object" && "application" in result) {
      return {
        application: transformFromBackend(result.application),
        groupResults: Array.isArray(result.groupResults) ? result.groupResults : [],
      };
    }
    return { application: transformFromBackend(result), groupResults: [] };
  },


  // Update application (full). Optionally mirror to collaborative groups via `groupIds`.
  // Response is a flat Application; when `groupIds` is included in the request, the
  // response may also include a `groupResults` array with per-group outcomes.
  updateApplication: async (
    id: string,
    data: UpdateJobApplication,
    groupIds?: number[],
  ): Promise<{ application: JobApplication; groupResults: GroupAddResult[] }> => {
    const transformedData = transformForBackend(data);
    const headers = await getAuthHeaders();

    const body =
      groupIds !== undefined
        ? { ...transformedData, groupIds }
        : transformedData;

    const response = await apiFetch(`${API_BASE_URL}/applications/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error("Failed to update application");
    const result = await response.json();
    const { groupResults, ...appFields } = result ?? {};
    return {
      application: transformFromBackend(appFields),
      groupResults: Array.isArray(groupResults) ? groupResults : [],
    };
  },

  // Partial update (PATCH). Same groupIds/groupResults contract as PUT.
  patchApplication: async (
    id: string,
    data: UpdateJobApplication,
    groupIds?: number[],
  ): Promise<{ application: JobApplication; groupResults: GroupAddResult[] }> => {
    const transformedData = transformForBackend(data);
    const headers = await getAuthHeaders();

    const body =
      groupIds !== undefined
        ? { ...transformedData, groupIds }
        : transformedData;

    const response = await apiFetch(`${API_BASE_URL}/applications/${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error("Failed to patch application");
    const result = await response.json();
    const { groupResults, ...appFields } = result ?? {};
    return {
      application: transformFromBackend(appFields),
      groupResults: Array.isArray(groupResults) ? groupResults : [],
    };
  },

  // Delete application
  deleteApplication: async (id: string): Promise<void> => {
    const headers = await getAuthHeaders();
    const response = await apiFetch(`${API_BASE_URL}/applications/${id}`, {
      method: "DELETE",
      headers,
    });
    if (!response.ok) throw new Error("Failed to delete application");
  },

  // Bulk delete: fetches every application (paginated) then deletes them with
  // limited concurrency. Backend has no bulk endpoint, so this loops per-item.
  deleteAllApplications: async (
    onProgress?: (done: number, total: number) => void,
  ): Promise<{ deleted: number; failed: number; total: number }> => {
    const pageSize = 100;
    const all: JobApplication[] = [];
    let page = 1;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const batch = await jobApi.getAllApplications(undefined, page, pageSize);
      all.push(...batch);
      if (batch.length < pageSize) break;
      page += 1;
      if (page > 200) break; // safety cap
    }

    const total = all.length;
    let deleted = 0;
    let failed = 0;
    const concurrency = 5;
    let index = 0;

    const worker = async () => {
      while (index < all.length) {
        const current = all[index++];
        try {
          await jobApi.deleteApplication(current.id);
          deleted += 1;
        } catch {
          failed += 1;
        }
        onProgress?.(deleted + failed, total);
      }
    };

    await Promise.all(Array.from({ length: Math.min(concurrency, all.length) }, worker));
    return { deleted, failed, total };
  },

  // Fetch unique statuses
  getUniqueStatuses: async (): Promise<string[]> => {
    const headers = await getAuthHeaders();
    const response = await apiFetch(`${API_BASE_URL}/applications/statuses`, { headers });
    if (!response.ok) throw new Error("Failed to fetch statuses");
    return response.json();
  },
};
