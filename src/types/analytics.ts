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
  activity_by_hour_today?: Array<{ hour: number; count: number }>;
  activity_by_day_last_30?: Array<{ date: string; count: number }>;
  activity_by_month_last_12?: Array<{ month: string; count: number }>;
}
