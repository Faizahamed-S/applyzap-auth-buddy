import type { Group } from "./groupsApi";

export const TUTORIAL_DISMISSED_KEY = "collab_tutorial_dismissed";

export interface TutorialGroup extends Group {
  blurb: string;
}

export const collabTutorialSamples: TutorialGroup[] = [
  {
    id: -1,
    name: "📘 Tutorial: Roommates Job Hunt",
    ownerId: -1,
    createdAt: new Date().toISOString(),
    blurb:
      "See how friends share leads, swap referrals, and cheer each other on across a shared board.",
  },
  {
    id: -2,
    name: "📘 Tutorial: Bootcamp Cohort",
    ownerId: -1,
    createdAt: new Date().toISOString(),
    blurb:
      "A cohort tracks 50+ applications together, with members posting interview tips and pacing each other.",
  },
];

export const isTutorialDismissed = () => {
  try {
    return localStorage.getItem(TUTORIAL_DISMISSED_KEY) === "true";
  } catch {
    return false;
  }
};

export const dismissTutorial = () => {
  try {
    localStorage.setItem(TUTORIAL_DISMISSED_KEY, "true");
  } catch {
    // ignore
  }
};

// ----- Phase 3: sample board for empty-state preview -----

import type { GroupBoard } from "./groupJobsApi";

export const sampleGroupBoard: GroupBoard = {
  id: -100,
  name: "Tutorial board",
  members: [
    { memberId: -1, displayName: "Alex (you)", role: "OWNER", userId: -1 },
    { memberId: -2, displayName: "Jordan", role: "MEMBER", userId: -2 },
  ],
  jobs: [
    {
      jobId: -1,
      normalizedUrl: "https://example.com/acme-swe",
      originalUrl: "https://example.com/acme-swe",
      companyName: "📘 Acme Corp",
      roleName: "Software Engineer",
      dateAdded: new Date().toISOString(),
      addedByUserId: -1,
      addedByMemberId: -1,
      statuses: [
        { memberId: -1, status: "APPLIED" },
        { memberId: -2, status: "NA" },
      ],
    },
    {
      jobId: -2,
      normalizedUrl: "https://example.com/globex-intern",
      originalUrl: "https://example.com/globex-intern",
      companyName: "📘 Globex",
      roleName: "Product Intern",
      dateAdded: new Date().toISOString(),
      addedByUserId: -2,
      addedByMemberId: -2,
      statuses: [
        { memberId: -1, status: "NA" },
        { memberId: -2, status: "EXPIRED" },
      ],
    },
  ],
};

