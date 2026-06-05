import { safeNumber } from "./numbers";
import { DEFAULT_STATE, type PlatformState } from "./types";

/** Normalize older localStorage shapes into the current schema. */
export function migrateState(raw: PlatformState): PlatformState {
  const scans = (raw.scans ?? [])
    .filter(
      (s): s is PlatformState["scans"][number] =>
        typeof s === "object" &&
        s !== null &&
        typeof (s as { lat?: number }).lat === "number" &&
        typeof (s as { lng?: number }).lng === "number" &&
        typeof (s as { locationName?: string }).locationName === "string"
    )
    .map((s) => ({
      id: s.id,
      timestamp: s.timestamp,
      health: s.health,
      label: s.label,
      confidence: s.confidence,
      locationName: s.locationName,
      lat: s.lat,
      lng: s.lng,
    }));

  const { joinedTeamId: _removed, ...rest } = raw as PlatformState & {
    joinedTeamId?: string | null;
  };
  const rawCorals =
    typeof rest.corals === "number" ? rest.corals : Number(rest.corals);
  const coralsWasInvalid = !Number.isFinite(rawCorals);
  const corals =
    coralsWasInvalid && rest.profile
      ? 50
      : safeNumber(rest.corals);
  return {
    ...DEFAULT_STATE,
    ...rest,
    scans,
    userId: typeof rest.userId === "string" ? rest.userId : "",
    points: safeNumber(rest.points),
    corals,
    streak: safeNumber(rest.streak),
    commentsMade: safeNumber(rest.commentsMade),
    coralsDonated: safeNumber(rest.coralsDonated),
    coralsReceived: safeNumber(rest.coralsReceived),
  };
}
