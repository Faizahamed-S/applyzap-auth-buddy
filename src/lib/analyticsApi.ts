import { DashboardAnalytics } from "@/types/analytics";
import { supabase } from "@/integrations/supabase/client";

const API_BASE_URL = "https://tracker-backend-production-535d.up.railway.app";

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
    const response = await fetch(`${API_BASE_URL}/api/analytics/dashboard`, { headers });
    if (!response.ok) throw new Error("Failed to fetch dashboard analytics");
    return response.json();
  },
};
