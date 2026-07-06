import { DashboardAnalytics } from "@/types/analytics";
import { apiFetch } from "./apiFetch";
import { supabase } from "@/integrations/supabase/client";
import { API_BASE_URL } from "./apiConfig";


const getAuthHeaders = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error("No authentication token available");
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.access_token}`,
  };
};

export const analyticsApi = {
  getDashboardAnalytics: async (): Promise<DashboardAnalytics> => {
    const headers = await getAuthHeaders();
    const response = await apiFetch(`${API_BASE_URL}/api/analytics/dashboard`, { headers });
    if (!response.ok) throw new Error("Failed to fetch dashboard analytics");
    return response.json();
  },
};
