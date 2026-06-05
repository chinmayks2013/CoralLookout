import type { PlatformState } from "./types";

export function getPlatformSummary(state: PlatformState) {
  const regions = new Set<string>();
  if (state.profile?.region?.trim()) {
    regions.add(state.profile.region.trim());
  }

  return {
    reefScans: state.scans.length,
    schoolChapters: state.profile ? 1 : 0,
    regions: regions.size,
    mapPins: state.scans.length,
  };
}
