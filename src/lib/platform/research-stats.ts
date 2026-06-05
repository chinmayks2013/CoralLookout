import type { PlatformState } from "./types";
import type { ReefHealth } from "@/lib/types";

export function getResearchStats(state: PlatformState) {
  const scans = state.scans;
  const userScans = scans.length;

  const bleachingEvents = scans.filter(
    (s) => s.health === "bleaching" || s.health === "severe_damage"
  ).length;

  const healthCounts: Record<ReefHealth, number> = {
    healthy: 0,
    mild_stress: 0,
    bleaching: 0,
    severe_damage: 0,
  };

  for (const scan of scans) {
    healthCounts[scan.health]++;
  }

  const healthBreakdown =
    userScans === 0
      ? []
      : (
          [
            ["Healthy", healthCounts.healthy, "#22d3ee"],
            ["Mild Stress", healthCounts.mild_stress, "#fbbf24"],
            ["Bleaching", healthCounts.bleaching, "#fb923c"],
            ["Severe Damage", healthCounts.severe_damage, "#f87171"],
          ] as const
        ).map(([label, count, color]) => ({
          label,
          pct: Math.round((count / userScans) * 100),
          color,
        }));

  const avgConfidence =
    userScans === 0
      ? 0
      : Math.round(
          scans.reduce((sum, s) => sum + s.confidence, 0) / userScans
        );

  const monthlyTrend = buildTrendFromScans(scans);
  const uniqueSites = new Set(
    scans.map((s) => `${s.lat.toFixed(2)},${s.lng.toFixed(2)}`)
  ).size;

  return {
    totalUploads: userScans,
    bleachingEvents,
    userScans,
    healthBreakdown,
    monthlyTrend,
    avgConfidence,
    lessonsCompleted: state.completedLessons.length,
    uniqueSites,
    hasUserData: userScans > 0,
  };
}

function buildTrendFromScans(scans: PlatformState["scans"]) {
  if (scans.length === 0) return [];

  const buckets = new Map<
    string,
    { total: number; stress: number; sortKey: number }
  >();

  for (const scan of scans) {
    const d = new Date(scan.timestamp);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleString("en", { month: "short", year: "2-digit" });
    const existing = buckets.get(key) ?? {
      total: 0,
      stress: 0,
      sortKey: d.getTime(),
    };
    existing.total += 1;
    if (scan.health === "bleaching" || scan.health === "severe_damage") {
      existing.stress += 1;
    }
    buckets.set(key, { ...existing, sortKey: d.getTime() });
  }

  return [...buckets.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-6)
    .map(([key, data]) => {
      const [y, m] = key.split("-");
      const d = new Date(Number(y), Number(m) - 1);
      return {
        month: d.toLocaleString("en", { month: "short" }),
        value:
          data.total === 0
            ? 0
            : Math.round((data.stress / data.total) * 100),
        count: data.total,
      };
    });
}
