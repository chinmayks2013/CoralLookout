import type { ReefMarker } from "@/lib/types";
import type { ResearchSite } from "@/lib/data/world-research";

export function researchSitesToMarkers(
  sites: ResearchSite[]
): ReefMarker[] {
  return sites.map((site) => ({
    id: `research-${site.id}`,
    lat: site.lat,
    lng: site.lng,
    name: site.name,
    health:
      site.alertLevel >= 4
        ? "severe_damage"
        : site.alertLevel >= 3
          ? "bleaching"
          : site.alertLevel >= 2
            ? "mild_stress"
            : "healthy",
    type: site.alertLevel >= 3 ? "hotspot" : "restoration",
    students: 0,
    lastUpdated: site.asOf,
  }));
}
