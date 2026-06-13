export interface Referral {
  id: string;
  name: string;
  companyName?: string;
  mobile?: string;
  email?: string;
  linkedinUrl?: string;
  notes?: string;
  customFields?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface ReferralFieldTemplate {
  fields: { key: string; label: string }[];
}

export type CreateReferral = Omit<Referral, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateReferral = Partial<CreateReferral>;
