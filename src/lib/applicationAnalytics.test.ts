import { describe, expect, it } from 'vitest';
import { topCompanies, isInterviewOrOffer, referralEffectiveness } from './applicationAnalytics';

describe('top companies', () => {
  it('counts applications by company and ranks highest first', () => {
    const jobs = ['Acme', 'Beta', ' acme ', 'Acme'].map(companyName => ({ companyName, status: 'APPLIED' }));
    expect(topCompanies(jobs)).toEqual([{ company: 'Acme', count: 3 }, { company: 'Beta', count: 1 }]);
  });
  it('limits the leaderboard to 10 companies', () => {
    const jobs = Array.from({ length: 12 }, (_, i) => ({ companyName: `Company ${i}`, status: 'APPLIED' }));
    expect(topCompanies(jobs)).toHaveLength(10);
  });
});

describe('referral effectiveness', () => {
  it.each(['Technical Interview', 'ONSITE', ' Phone Screen ', 'OFFER_ACCEPTED'])(
    'includes normalized status containing %s', status => expect(isInterviewOrOffer(status)).toBe(true),
  );
  it.each(['APPLIED', 'REJECTED', 'WISHLIST'])('excludes %s', status => expect(isInterviewOrOffer(status)).toBe(false));
  it('uses each cohort as its denominator and treats missing referral as non-referral', () => {
    const jobs = [
      { referral: true, status: 'INTERVIEW' }, { referral: true, status: 'APPLIED' },
      { referral: false, status: 'ONSITE' }, { status: 'PHONE_SCREEN' }, { status: 'OFFER' }, { status: 'REJECTED' },
    ].map(job => ({ ...job, companyName: 'Acme' }));
    expect(referralEffectiveness(jobs)).toEqual([
      { referral: true, total: 2, progressed: 1, percent: 50 },
      { referral: false, total: 4, progressed: 3, percent: 75 },
    ]);
  });
  it('guards empty cohorts against division by zero', () => {
    expect(referralEffectiveness([]).map(row => row.percent)).toEqual([0, 0]);
  });
});