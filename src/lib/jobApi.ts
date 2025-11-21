import { JobApplication, CreateJobApplication, UpdateJobApplication, JobStatus } from '@/types/job';
import { transformForBackend, transformFromBackend } from './statusMapper';
import { supabase } from '@/integrations/supabase/client';

const API_BASE_URL = 'https://5baa8e9283a6.ngrok-free.app/board';

// Helper to get auth token
const getAuthToken = async (): Promise<string> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('No authentication token available');
  }
  return session.access_token;
};

// Helper to create headers with auth token
const getAuthHeaders = async () => {
  const token = await getAuthToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

export const jobApi = {
  // Fetch all job applications
  getAllApplications: async (status?: JobStatus, page = 1, limit = 100): Promise<JobApplication[]> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    const url = `${API_BASE_URL}/applications?${params.toString()}`;
    const headers = await getAuthHeaders();

    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error('Failed to fetch applications');
    const result = await response.json();
    return result.map(transformFromBackend);
  },

  // Fetch single application
  getApplication: async (id: string): Promise<JobApplication> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/applications/${id}`, { headers });
    if (!response.ok) throw new Error('Failed to fetch application');
    const result = await response.json();
    return transformFromBackend(result);
  },

  // Fetch applications by status
  getApplicationsByStatus: async (status: JobStatus): Promise<JobApplication[]> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/applications/status/${status}`, { headers });
    if (!response.ok) throw new Error('Failed to fetch applications by status');
    const result = await response.json();
    return result.map(transformFromBackend);
  },

  // Create new application
  createApplication: async (data: CreateJobApplication): Promise<JobApplication> => {
    const transformedData = transformForBackend(data);
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/applications`, {
      method: 'POST',
      headers,
      body: JSON.stringify(transformedData),
    });
    if (!response.ok) throw new Error('Failed to create application');
    const result = await response.json();
    return transformFromBackend(result);
  },

  // Update application (full)
  updateApplication: async (id: string, data: UpdateJobApplication): Promise<JobApplication> => {
    const transformedData = transformForBackend(data);
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/applications/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(transformedData),
    });
    if (!response.ok) throw new Error('Failed to update application');
    const result = await response.json();
    return transformFromBackend(result);
  },

  // Partial update (PATCH)
  patchApplication: async (id: string, data: UpdateJobApplication): Promise<JobApplication> => {
    const transformedData = transformForBackend(data);
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/applications/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(transformedData),
    });
    if (!response.ok) throw new Error('Failed to patch application');
    const result = await response.json();
    return transformFromBackend(result);
  },

  // Delete application
  deleteApplication: async (id: string): Promise<void> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/applications/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) throw new Error('Failed to delete application');
  },
};
