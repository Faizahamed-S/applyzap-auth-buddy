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
