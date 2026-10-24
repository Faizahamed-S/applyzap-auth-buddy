import type { JobApplication } from '@/types/job';
import { normalizeStatus } from './statusMapper';
import { pct } from './analyticsMath';

type AnalyticsJob = Pick<JobApplication, 'companyName' | 'status' | 'referral'>;

export function topCompanies(jobs: AnalyticsJob[]) {
  const counts = new Map<string, { company: string; count: number }>();
  for (const job of jobs) {
    const company = job.companyName.trim() || 'Unknown company';
    const key = company.toLocaleLowerCase();
    const existing = counts.get(key);
    if (existing) existing.count += 1;
    else counts.set(key, { company, count: 1 });
  }
  return [...counts.values()].sort((a, b) => b.count - a.count || a.company.localeCompare(b.company)).slice(0, 10);
}

export function isInterviewOrOffer(status: string) {
  const normalized = normalizeStatus(status);
  return ['INTERVIEW', 'ONSITE', 'PHONE_SCREEN', 'OFFER'].some(part => normalized.includes(part));
}

export function referralEffectiveness(jobs: AnalyticsJob[]) {
  return [true, false].map(referral => {
    const group = jobs.filter(job => Boolean(job.referral) === referral);
    const progressed = group.filter(job => isInterviewOrOffer(job.status)).length;
    return { referral, total: group.length, progressed, percent: pct(progressed, group.length) };
  });
}