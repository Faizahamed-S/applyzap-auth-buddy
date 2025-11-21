import { JobStatus } from '@/types/job';

// Backend enum mapping (matches Java enum order)
// APPLIED = 0, REJECTED = 1, ONLINE_ASSESSMENT = 2, INTERVIEW = 3, OFFER = 4
export const statusToBackendIndex: Record<JobStatus, number> = {
  APPLIED: 0,
  REJECTED: 1,
  ONLINE_ASSESSMENT: 2,
  INTERVIEW: 3,
  OFFER: 4,
};

// Convert frontend string status to backend integer index
export const toBackendStatus = (status: JobStatus): number => {
  return statusToBackendIndex[status];
};

// Convert backend integer index to frontend string status
export const fromBackendStatus = (index: number): JobStatus => {
  const statusMap: Record<number, JobStatus> = {
    0: 'APPLIED',
    1: 'REJECTED', 
    2: 'ONLINE_ASSESSMENT',
    3: 'INTERVIEW',
    4: 'OFFER',
  };
  
  if (statusMap[index] === undefined) {
    throw new Error(`Invalid status index: ${index}`);
  }
  
  return statusMap[index];
};

// Transform application data for backend (convert status to integer)
export const transformForBackend = (data: any) => {
  if (data.status && typeof data.status === 'string') {
    return {
      ...data,
      status: toBackendStatus(data.status as JobStatus)
    };
  }
  return data;
};

// Transform application data from backend (convert status from integer to string)
export const transformFromBackend = (data: any) => {
  if (data.status !== undefined && typeof data.status === 'number') {
    return {
      ...data,
      status: fromBackendStatus(data.status)
    };
  }
  return data;
};
