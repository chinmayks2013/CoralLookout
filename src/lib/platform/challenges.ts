import { challenges as challengeDefs } from "@/lib/data/challenges";
import type { PlatformState } from "./types";

export function getChallengeProgress(
  state: PlatformState,
  challengeId: string
): number {
  switch (challengeId) {
    case "c1":
      return Math.min(state.scans.length, 5);
    case "c5":
      return Math.min(state.completedLessons.length, 3);
    case "c2":
      return state.cleanupLogged ? 1 : 0;
    case "c3":
      return state.awarenessPosted ? 1 : 0;
    case "c4":
      return state.stemSubmitted ? 1 : 0;
    default:
      return state.challengeProgress[challengeId] ?? 0;
  }
}

export function getChallengesWithProgress(state: PlatformState) {
  return challengeDefs.map((c) => {
    const progress = getChallengeProgress(state, c.id);
    return { ...c, progress, total: c.total };
  });
}

export function isChallengeComplete(state: PlatformState, challengeId: string) {
  const c = challengeDefs.find((x) => x.id === challengeId);
  if (!c) return false;
  return getChallengeProgress(state, challengeId) >= c.total;
}
