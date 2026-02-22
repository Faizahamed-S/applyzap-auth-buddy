export interface DashboardAnalytics {
  summary: {
    totalApplications: number;
    interviews: number;
    offers: number;
    statusCounts: Record<string, number>;
  };
  recent_activity: Array<{ date: string; count: number }>;
}
