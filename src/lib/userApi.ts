import { User, UserProfileUpdateDTO } from "@/types/user";
import { supabase } from "@/integrations/supabase/client";

const API_BASE_URL = "https://tracker-backend-production-535d.up.railway.app/api/user";

const getAuthToken = async (): Promise<string> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error("No authentication token available");
  }
  return session.access_token;
};

const getAuthHeaders = async () => {
  const token = await getAuthToken();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const userApi = {
  getProfile: async (): Promise<User> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/profile`, { headers });
    if (!response.ok) throw new Error("Failed to fetch user profile");
    return response.json();
  },

  updateProfile: async (data: UserProfileUpdateDTO): Promise<User> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update user profile");
    return response.json();
  },
};
