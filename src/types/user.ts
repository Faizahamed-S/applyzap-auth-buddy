export interface TrackerConfig {
  columns: Array<{ id: string; title: string; color: string }>;
  [key: string]: unknown;
}

export interface ProfileData {
  headline?: string;
  skills?: string[];
  experience?: Array<Record<string, unknown>>;
  [key: string]: unknown;
}

export interface User {
  id: string;
  supabaseUserId: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth?: string;
  timezone?: string;
  profileData?: ProfileData;
  trackerConfig?: TrackerConfig;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfileUpdateDTO {
  firstName?: string;
  lastName?: string;
  timezone?: string;
  profileData?: Partial<ProfileData>;
  trackerConfig?: Partial<TrackerConfig>;
}
