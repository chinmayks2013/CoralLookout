import type { ReefMarker } from "@/lib/types";
import type { StoredScan } from "./types";

export function scansToMarkers(scans: StoredScan[]): ReefMarker[] {
  return scans.map((scan) => ({
    id: scan.id,
    lat: scan.lat,
    lng: scan.lng,
    name: scan.locationName,
    health: scan.health,
    type:
      scan.health === "bleaching" || scan.health === "severe_damage"
        ? "hotspot"
        : "upload",
    students: 1,
    lastUpdated: scan.timestamp.slice(0, 10),
  }));
}

export function getMapCenter(
  markers: ReefMarker[]
): [number, number] {
  if (markers.length === 0) return [10, 20];
  const lat =
    markers.reduce((sum, m) => sum + m.lat, 0) / markers.length;
  const lng =
    markers.reduce((sum, m) => sum + m.lng, 0) / markers.length;
  return [lat, lng];
}
