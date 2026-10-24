import { DashboardAnalytics } from "@/types/analytics";
import { apiFetch } from "./apiFetch";
import { supabase } from "@/integrations/supabase/client";
import { API_BASE_URL } from "./apiConfig";
import type { GroupAnalytics } from '@/types/groupAnalytics';
import { groupAnalyticsPath } from './groupAnalyticsMath';


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
  getGroupAnalytics: async (groupId: number | string, date?: string): Promise<GroupAnalytics> => {
    const headers = await getAuthHeaders();
    const response = await apiFetch(`${API_BASE_URL}${groupAnalyticsPath(groupId, date)}`, { headers });
    if (!response.ok) throw new Error('Failed to fetch group analytics');
    return response.json();
  },
  getDashboardAnalytics: async (): Promise<DashboardAnalytics> => {
    const headers = await getAuthHeaders();
    const response = await apiFetch(`${API_BASE_URL}/api/analytics/dashboard`, { headers });
    if (!response.ok) throw new Error("Failed to fetch dashboard analytics");
    return response.json();
  },
};
