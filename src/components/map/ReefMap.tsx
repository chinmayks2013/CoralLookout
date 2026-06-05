"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePlatform } from "@/context/PlatformContext";
import { getMapCenter, scansToMarkers } from "@/lib/platform/scans-to-markers";
import { RESEARCH_SITES } from "@/lib/data/world-research";
import { getHealthColor, getHealthLabel } from "@/lib/scanner/analyze";
import { ALERT_COLORS, ALERT_LABELS } from "@/lib/data/world-research";
import { MapLegend } from "@/components/map/MapLegend";
import { MapPin, Satellite } from "lucide-react";

type LayerMode = "both" | "research" | "yours";

export function ReefMap() {
  const { state, hydrated } = usePlatform();
  const [mounted, setMounted] = useState(false);
  const [layerMode, setLayerMode] = useState<LayerMode>("both");
  const [showNoaa, setShowNoaa] = useState(true);
  const [MapComponent, setMapComponent] = useState<
    typeof import("./ReefMapInner").ReefMapInner | null
  >(null);

  const userMarkers = useMemo(
    () => scansToMarkers(state.scans),
    [state.scans]
  );

  const showUser = layerMode === "both" || layerMode === "yours";
  const showResearch = layerMode === "both" || layerMode === "research";

  const allForCenter = useMemo(() => {
    const pts: [number, number][] = [];
    if (showUser) userMarkers.forEach((m) => pts.push([m.lat, m.lng]));
    if (showResearch)
      RESEARCH_SITES.forEach((s) => pts.push([s.lat, s.lng]));
    return pts;
  }, [showUser, showResearch, userMarkers]);

  const center: [number, number] =
    allForCenter.length > 0
      ? [
          allForCenter.reduce((s, p) => s + p[0], 0) / allForCenter.length,
          allForCenter.reduce((s, p) => s + p[1], 0) / allForCenter.length,
        ]
      : getMapCenter([]);

  const zoom =
    allForCenter.length === 0 ? 2 : allForCenter.length === 1 ? 5 : 3;

  useEffect(() => {
    setMounted(true);
    import("./ReefMapInner").then((mod) => {
      setMapComponent(() => mod.ReefMapInner);
    });
  }, []);

  if (!hydrated) {
    return (
      <p className="text-center text-slate-400 py-12">Loading map…</p>
    );
  }

  const sidebarSites = showResearch ? RESEARCH_SITES : [];
  const sidebarUsers = showUser ? userMarkers : [];

  return (
    <div className="space-y-6">
      <aside className="glass rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="text-sm text-slate-300 flex items-center gap-2">
          <Satellite className="h-4 w-4 text-cyan-400 shrink-0" />
          NOAA satellite bleaching layer + documented research sites (2023–25).
          Your pins are separate.
        </p>
        <label className="flex items-center gap-2 text-sm text-slate-300 shrink-0">
          <input
            type="checkbox"
            checked={showNoaa}
            onChange={(e) => setShowNoaa(e.target.checked)}
            className="accent-cyan-500"
          />
          NOAA heat-stress overlay
        </label>
      </aside>

      <div className="flex flex-wrap gap-2 justify-center">
        {(
          [
            { id: "both" as const, label: "Research + yours" },
            { id: "research" as const, label: "Research only" },
            { id: "yours" as const, label: "Your observations" },
          ] as const
        ).map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setLayerMode(f.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              layerMode === f.id
                ? "bg-cyan-500 text-slate-900"
                : "glass text-slate-300 hover:text-white"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3 h-[min(55vh,520px)] min-h-[280px] sm:min-h-[360px] rounded-2xl overflow-hidden glass p-1">
          {mounted && MapComponent ? (
            <MapComponent
              userMarkers={userMarkers}
              researchSites={RESEARCH_SITES}
              center={center}
              zoom={zoom}
              showNoaaLayer={showNoaa && showResearch}
              showUserPins={showUser}
              showResearchPins={showResearch}
            />
          ) : (
            <p className="h-full flex items-center justify-center text-slate-400">
              Loading map…
            </p>
          )}
        </div>
        <MapLegend showNoaa={showNoaa && showResearch} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="text-lg font-bold mb-3">Research monitoring sites</h2>
          <div className="space-y-3 max-h-[320px] overflow-y-auto">
            {sidebarSites.length === 0 ? (
              <p className="text-sm text-slate-500">Hidden — switch layer above.</p>
            ) : (
              sidebarSites.map((site) => (
                <article key={site.id} className="glass rounded-xl p-4">
                  <div className="flex justify-between gap-2">
                    <h3 className="font-semibold text-sm">{site.name}</h3>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full shrink-0"
                      style={{
                        backgroundColor: `${ALERT_COLORS[site.alertLevel]}22`,
                        color: ALERT_COLORS[site.alertLevel],
                      }}
                    >
                      {ALERT_LABELS[site.alertLevel]}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    +{site.sstAnomalyC}°C · {site.region} · {site.asOf}
                  </p>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                    {site.summary}
                  </p>
                </article>
              ))
            )}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3">Your observations</h2>
          {sidebarUsers.length === 0 ? (
            <article className="glass rounded-xl p-6 text-center">
              <MapPin className="h-8 w-8 text-cyan-400 mx-auto mb-2" />
              <p className="text-sm text-slate-400 mb-4">
                No pins yet. Scan a reef and add a location.
              </p>
              <Link
                href="/scanner"
                className="text-sm text-cyan-300 underline"
              >
                Open AI Scanner
              </Link>
            </article>
          ) : (
            <div className="space-y-3 max-h-[320px] overflow-y-auto">
              {sidebarUsers.map((marker) => (
                <article key={marker.id} className="glass rounded-xl p-4">
                  <div className="flex justify-between gap-2">
                    <h3 className="font-semibold text-sm">{marker.name}</h3>
                    <span
                      className="text-xs font-medium"
                      style={{ color: getHealthColor(marker.health) }}
                    >
                      {getHealthLabel(marker.health)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {marker.lat.toFixed(3)}, {marker.lng.toFixed(3)}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
