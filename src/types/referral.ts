export interface AssociatedApplicationSummary {
  id: string;
  companyName: string;
  roleName: string;
  dateOfApplication: string;
  status: string;
}

export interface Referral {
  id: string;
  name: string;
  companyName?: string;
  mobile?: string;
  email?: string;
  linkedinUrl?: string;
  notes?: string;
  customFields?: Record<string, string>;
  /** Server-populated on GET /api/referrals/{id}. */
  associatedApplications?: AssociatedApplicationSummary[];
  createdAt: string;
  updatedAt: string;
}

export interface ReferralFieldTemplate {
  fields: { key: string; label: string }[];
}

export type CreateReferral = Omit<Referral, 'id' | 'createdAt' | 'updatedAt' | 'associatedApplications'>;
export type UpdateReferral = Partial<CreateReferral>;
