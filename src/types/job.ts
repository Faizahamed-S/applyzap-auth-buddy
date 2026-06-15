export type JobStatus = string;

export interface ReferralContactSummary {
  id: string;
  name: string;
}

export interface JobApplication {
  id: string;
  companyName: string;
  roleName: string;
  dateOfApplication: string;
  jobLink?: string;
  tailored: boolean;
  jobDescription?: string;
  referral?: boolean;
  /** Write field — contact id to link to a referral. Omit when not linked. */
  referralContactId?: string | null;
  /** Read-only — server-populated summary of the linked referral contact. */
  referralContactSummary?: ReferralContactSummary | null;
  status: JobStatus;
  applicationMetadata?: Record<string, unknown>;
}

export interface CreateJobApplication extends Omit<JobApplication, 'id'> {}

export interface UpdateJobApplication extends Partial<Omit<JobApplication, 'id'>> {}
