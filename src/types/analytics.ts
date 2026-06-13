export interface DashboardAnalytics {
  summary: {
    totalApplications: number;
    interviews: number;
    offers: number;
    statusCounts: Record<string, number>;
    referral_count: number;
    tailored_count: number;
    current_streak: number;
    longest_streak: number;
  };
  recent_activity: Array<{ date: string; count: number }>;
}
