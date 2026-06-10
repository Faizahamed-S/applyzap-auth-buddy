// Normalize a status string the same way the backend does:
// trim, uppercase, replace spaces with underscores.
export const normalizeStatus = (s: string): string =>
  s.trim().toUpperCase().replace(/\s+/g, '_');

// Convert a canonical status (e.g. "TO_APPLY") into a human-readable label
// (e.g. "To Apply"). Used for UI display only.
export const canonicalToLabel = (canonical: string): string =>
  canonical
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

import { z } from 'zod';

export const transformForBackend = (data: any) => {
  if (data && typeof data.status === 'string') {
    return { ...data, status: normalizeStatus(data.status) };
  }
  return data;
};

// Schema for job application data coming from the backend.
// Coerces id to string and ensures critical fields are strings before reaching the UI.
const backendJobSchema = z.object({
  id: z.union([z.string(), z.number()]).transform((v) => String(v)),
  companyName: z.string().max(500).default(''),
  roleName: z.string().max(500).default(''),
  dateOfApplication: z.string().max(100).default(''),
  jobLink: z.string().max(2000).optional().nullable(),
  tailored: z.boolean().optional().default(false),
  jobDescription: z.string().max(50000).optional().nullable(),
  referral: z.boolean().optional().default(false),
  status: z.string().max(200).default(''),
  applicationMetadata: z.record(z.unknown()).optional().nullable(),
}).passthrough();

export const transformFromBackend = (data: any) => {
  const parsed = backendJobSchema.safeParse(data);
  if (!parsed.success) {
    console.warn('Backend response failed validation', parsed.error.flatten());
    // Return a minimally-safe fallback to avoid runtime crashes in the UI.
    return {
      id: String((data && data.id) ?? ''),
      companyName: '',
      roleName: '',
      dateOfApplication: '',
      tailored: false,
      referral: false,
      status: '',
    };
  }
  return parsed.data;
};

