export interface GroupContributor {
  memberId: number;
  userId: number;
  displayName: string;
  jobsAdded: number;
}

export interface GroupAnalytics {
  totalJobs: number;
  jobsAddedToday: number;
  contributorsOverall: GroupContributor[];
  contributorsByDay: GroupContributor[];
  topContributorOverall?: GroupContributor | null;
  topContributorByDay?: GroupContributor | null;
  date: string;
}