"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { usePlatform } from "@/context/PlatformContext";
import { getMapCenter, scansToMarkers } from "@/lib/platform/scans-to-markers";
import {
  ALERT_COLORS,
  ALERT_LABELS,
  type ResearchSite,
} from "@/lib/data/world-research";
import { getHealthColor, getHealthLabel } from "@/lib/scanner/analyze";
import { MapLegend } from "@/components/map/MapLegend";
import { getCohort } from "@/lib/data/cohorts";
import { MapPin, Satellite, Filter, Check, Copy } from "lucide-react";

type LayerMode = "both" | "research" | "yours";

export function ReefMap() {
  const { state, hydrated } = usePlatform();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [layerMode, setLayerMode] = useState<LayerMode>("both");
  const [showNoaa, setShowNoaa] = useState(true);
  const [linkCopied, setLinkCopied] = useState(false);
  const [researchSites, setResearchSites] = useState<ResearchSite[]>([]);
  const [MapComponent, setMapComponent] = useState<
    typeof import("./ReefMapInner").ReefMapInner | null
  >(null);

  const cohortParam = searchParams.get("cohort");
  const chapterIdParam = searchParams.get("chapterId");
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");
  const activeCohort = getCohort(cohortParam);
  const hasCohortFilter = Boolean(cohortParam);

  function copyShareableLink() {
    void navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }

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
      researchSites.forEach((s) => pts.push([s.lat, s.lng]));
    return pts;
  }, [showUser, showResearch, userMarkers, researchSites]);

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

  useEffect(() => {
    let cancelled = false;
    // Edge-cached JSON (s-maxage=86400) — avoids bundling research sites into every map visit.
    fetch("/api/map/research-sites")
      .then((res) => res.json())
      .then((data: { sites?: ResearchSite[] }) => {
        if (!cancelled && Array.isArray(data.sites)) {
          setResearchSites(data.sites);
        }
      })
      .catch(() => {
        /* keep empty; map still shows user pins + NOAA tiles */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!hydrated) {
    return (
      <p className="text-center text-slate-400 py-12">Loading map…</p>
    );
  }

  const sidebarSites = showResearch ? researchSites : [];
  const sidebarUsers = showUser ? userMarkers : [];

  return (
    <div className="space-y-6">
      {hasCohortFilter && (
        <aside className="rounded-xl border border-violet-500/30 bg-violet-950/25 p-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-violet-100 flex items-start gap-2">
            <Filter className="h-4 w-4 text-violet-300 shrink-0 mt-0.5" />
            <span>
              <span className="font-semibold">
                {activeCohort?.label ?? cohortParam} cohort filter active
              </span>
              {" — "}
              markers below aren&apos;t tagged with cohort yet, so this is a
              pinned, shareable view for coordinating with a specific class
              (e.g. Courtney&apos;s class in Puerto Rico).
              {chapterIdParam && ` Chapter: ${chapterIdParam}.`}
              {fromParam && toParam && ` Date range: ${fromParam} → ${toParam}.`}
            </span>
          </p>
          <button
            type="button"
            onClick={copyShareableLink}
            className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/40 px-3 py-1.5 text-xs font-medium text-violet-200 hover:bg-violet-500/10 shrink-0"
          >
            {linkCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {linkCopied ? "Link copied" : "Copy shareable link"}
          </button>
        </aside>
      )}

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
              researchSites={researchSites}
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
