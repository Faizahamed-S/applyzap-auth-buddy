export interface TrackerConfig {
  columns: Array<{ id: string; title: string; color: string }>;
  [key: string]: unknown;
}

export interface ProfileLinks {
  github?: string;
  linkedin?: string;
  portfolio?: string;
}

export interface ProfileExperience {
  title: string;
  company: string;
  description: string;
  startDate?: string;
  endDate?: string;
}

export interface ProfileData {
  headline?: string;
  skills?: string[];
  experiences?: ProfileExperience[];
  links?: ProfileLinks;
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
