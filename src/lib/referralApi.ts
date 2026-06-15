import { Referral, ReferralFieldTemplate, CreateReferral, UpdateReferral, AssociatedApplicationSummary } from '@/types/referral';
import { jobApi } from './jobApi';

/**
 * Mocked Referral API backed by localStorage.
 * Mirrors the shape we expect the future Spring Boot endpoints to take so the UI
 * can be swapped over with no component changes — only this file changes.
 */

const REFERRALS_KEY = 'applyzap.referrals.v1';
const TEMPLATE_KEY = 'applyzap.referralTemplate.v1';

const readReferrals = (): Referral[] => {
  try {
    const raw = localStorage.getItem(REFERRALS_KEY);
    return raw ? (JSON.parse(raw) as Referral[]) : [];
  } catch {
    return [];
  }
};

const writeReferrals = (list: Referral[]) => {
  localStorage.setItem(REFERRALS_KEY, JSON.stringify(list));
};

const readTemplate = (): ReferralFieldTemplate => {
  try {
    const raw = localStorage.getItem(TEMPLATE_KEY);
    if (raw) return JSON.parse(raw) as ReferralFieldTemplate;
  } catch {
    /* noop */
  }
  return { fields: [] };
};

const writeTemplate = (tpl: ReferralFieldTemplate) => {
  localStorage.setItem(TEMPLATE_KEY, JSON.stringify(tpl));
};

const newId = () =>
  (crypto as any)?.randomUUID?.() ?? `ref_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const delay = <T,>(value: T) => new Promise<T>((res) => setTimeout(() => res(value), 50));

export const referralApi = {
  list: async (): Promise<Referral[]> => {
    const list = readReferrals().sort((a, b) => a.name.localeCompare(b.name));
    return delay(list);
  },

  get: async (id: string): Promise<Referral | null> => {
    const referral = readReferrals().find((r) => r.id === id) ?? null;
    if (!referral) return delay(null);
    // TEMPORARY SHIM — remove when backend ships GET /api/referrals/{id} with
    // an `associatedApplications` array. Until then, derive it client-side.
    let associatedApplications: AssociatedApplicationSummary[] = [];
    try {
      const apps = await jobApi.getAllApplications();
      associatedApplications = apps
        .filter((a: any) => a.referralContactId === id)
        .map((a) => ({
          id: a.id,
          companyName: a.companyName,
          roleName: a.roleName,
          dateOfApplication: a.dateOfApplication,
          status: a.status,
        }));
    } catch {
      /* ignore — empty list */
    }
    return delay({ ...referral, associatedApplications });
  },

  create: async (data: CreateReferral): Promise<Referral> => {
    const now = new Date().toISOString();
    const referral: Referral = { id: newId(), ...data, createdAt: now, updatedAt: now };
    const list = readReferrals();
    list.push(referral);
    writeReferrals(list);
    return delay(referral);
  },

  update: async (id: string, patch: UpdateReferral): Promise<Referral> => {
    const list = readReferrals();
    const idx = list.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('Referral not found');
    const updated: Referral = { ...list[idx], ...patch, updatedAt: new Date().toISOString() };
    list[idx] = updated;
    writeReferrals(list);
    return delay(updated);
  },

  delete: async (id: string): Promise<void> => {
    writeReferrals(readReferrals().filter((r) => r.id !== id));
    return delay(undefined);
  },

  getTemplate: async (): Promise<ReferralFieldTemplate> => delay(readTemplate()),

  updateTemplate: async (tpl: ReferralFieldTemplate): Promise<ReferralFieldTemplate> => {
    writeTemplate(tpl);
    return delay(tpl);
  },
};
