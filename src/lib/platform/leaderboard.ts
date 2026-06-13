import { getEarnedBadges } from "./badges";
import type { PlatformState } from "./types";

export interface LeaderboardRow {
  rank: number;
  name: string;
  school: string;
  points: number;
  streak: number;
  badgeCount: number;
  isYou: boolean;
}

/** Only the signed-in user — no fabricated competitors. */
export function getLeaderboardWithUser(
  state: PlatformState
): LeaderboardRow[] {
  if (!state.profile) return [];

  const badges = getEarnedBadges(state).filter((b) => b.earned).length;

  return [
    {
      rank: 1,
      name: state.profile.name,
      school: state.profile.school ?? "",
      points: state.points,
      streak: state.streak,
      badgeCount: badges,
      isYou: true,
    },
  ];
}

export function getUserRank(state: PlatformState): number | null {
  if (!state.profile) return null;
  return 1;
}
