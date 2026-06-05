import type { PlatformState } from "./types";

export interface BadgeDef {
  id: string;
  name: string;
  icon: string;
  description: string;
  check: (state: PlatformState) => boolean;
}

export const BADGE_DEFS: BadgeDef[] = [
  {
    id: "b1",
    name: "First Scan",
    icon: "🔬",
    description: "Completed your first AI reef analysis",
    check: (s) => s.scans.length >= 1,
  },
  {
    id: "b2",
    name: "Reef Guardian",
    icon: "🛡️",
    description: "Uploaded 5 reef observations",
    check: (s) => s.scans.length >= 5,
  },
  {
    id: "b3",
    name: "Bleaching Detective",
    icon: "🔍",
    description: "Detected bleaching or severe damage in 3 scans",
    check: (s) =>
      s.scans.filter(
        (scan) => scan.health === "bleaching" || scan.health === "severe_damage"
      ).length >= 3,
  },
  {
    id: "b4",
    name: "Academy Scholar",
    icon: "📚",
    description: "Completed 3 Reef Academy lessons",
    check: (s) => s.completedLessons.length >= 3,
  },
  {
    id: "b5",
    name: "Community Member",
    icon: "🌍",
    description: "Registered on the reef network",
    check: (s) => s.profile !== null,
  },
  {
    id: "b6",
    name: "Challenge Champion",
    icon: "🏆",
    description: "Finished any conservation challenge",
    check: (s) => {
      const scanChallenge = s.scans.length >= 5;
      const academyChallenge = s.completedLessons.length >= 3;
      return (
        scanChallenge ||
        academyChallenge ||
        s.awarenessPosted ||
        s.cleanupLogged ||
        s.stemSubmitted
      );
    },
  },
];

export function getEarnedBadges(state: PlatformState) {
  return BADGE_DEFS.map((b) => ({
    ...b,
    earned: b.check(state),
  }));
}
