export interface TrackerConfig {
  columns: Array<{ id: string; title: string; color: string }>;
  [key: string]: unknown;
}

export interface ProfileLink {
  label: string;
  url: string;
}

// Keep old interface for backward compat during transition
export interface ProfileLinks {
  github?: string;
  linkedin?: string;
  portfolio?: string;
}

export interface ProfileExperienceHighlight {
  id?: string;
  text: string;
  skills?: string[];
  metric?: string | null;
  include?: boolean;
}

export interface ProfileExperience {
  /** Server-assigned stable id (e.g. "exp_1a2b3c4d"). Never generated on the client. */
  id?: string;
  title: string;
  company: string;
  description: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  location?: string;
  rawNotes?: string;
  highlights?: ProfileExperienceHighlight[];
  [key: string]: unknown;
}

export interface BasicInfoExtraField {
  label: string;
  value: string;
}

export interface CustomSectionField {
  label: string;
  value: string;
}

export interface CustomSubsection {
  id: string;
  subsectionTitle: string;
  fields: CustomSectionField[];
}

export interface CustomSection {
  id: string;
  sectionTitle: string;
  fields?: CustomSectionField[];
  subsections: CustomSubsection[];
}

export interface ProfileData {
  aboutMe?: string;
  headline?: string; // legacy
  skills?: string[]; // legacy
  experiences?: ProfileExperience[];
  links?: ProfileLink[];
  basicInfoExtra?: BasicInfoExtraField[];
  customSections?: CustomSection[];
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
