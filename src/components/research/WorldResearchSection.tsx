"use client";

import Link from "next/link";
import {
  RESEARCH_SITES,
  NOAA_WMS,
  ALERT_LABELS,
  ALERT_COLORS,
  getWorldResearchSummary,
} from "@/lib/data/world-research";
import { Globe, ExternalLink, Satellite } from "lucide-react";

export function WorldResearchSection() {
  const summary = getWorldResearchSummary();

  return (
    <section className="mt-12 border-t border-cyan-500/20 pt-12">
      <header className="mb-8">
        <span className="inline-flex items-center gap-2 rounded-full bg-violet-500/20 px-3 py-1 text-xs font-semibold text-violet-300 mb-3">
          <Globe className="h-3.5 w-3.5" />
          World research data
        </span>
        <h2 className="text-2xl font-bold mb-2">Global reef analysis</h2>
        <p className="text-slate-400 text-sm max-w-3xl leading-relaxed">
          Satellite and field research from NOAA Coral Reef Watch — separate from
          your personal scans. View the live bleaching layer on the{" "}
          <Link href="/map" className="text-cyan-300 underline">
            Global Map
          </Link>
          .
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <article className="glass rounded-2xl p-5">
          <Satellite className="h-5 w-5 text-violet-400 mb-2" />
          <p className="text-2xl font-bold text-cyan-300">{summary.siteCount}</p>
          <p className="text-sm text-slate-400">Monitored reef provinces</p>
        </article>
        <article className="glass rounded-2xl p-5">
          <Globe className="h-5 w-5 text-violet-400 mb-2" />
          <p className="text-2xl font-bold text-cyan-300">{summary.regions}</p>
          <p className="text-sm text-slate-400">World regions covered</p>
        </article>
        <article className="glass rounded-2xl p-5">
          <p className="text-2xl font-bold text-orange-400">{summary.highStress}</p>
          <p className="text-sm text-slate-400">Sites at Alert L1+ (CRW)</p>
        </article>
        <article className="glass rounded-2xl p-5">
          <p className="text-2xl font-bold text-cyan-300">+{summary.avgAnomalyC}°C</p>
          <p className="text-sm text-slate-400">Avg. reported SST anomaly</p>
        </article>
      </section>

      <article className="glass rounded-2xl p-6 mb-8">
        <h3 className="font-bold mb-2 flex items-center gap-2">
          NOAA satellite layer
        </h3>
        <p className="text-sm text-slate-400 mb-3 leading-relaxed">
          {NOAA_WMS.attribution}. Daily 5 km Bleaching Alert Area (7-day maximum).
          Toggle it on the map to compare heat stress with your uploads.
        </p>
        <a
          href={NOAA_WMS.infoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-cyan-300 hover:text-white"
        >
          NOAA Coral Reef Watch products
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </article>

      <section className="grid gap-4 md:grid-cols-2">
        {RESEARCH_SITES.map((site) => (
          <article key={site.id} className="glass rounded-xl p-5">
            <div className="flex justify-between gap-2 mb-2">
              <h3 className="font-semibold">{site.name}</h3>
              <span
                className="text-xs shrink-0 px-2 py-0.5 rounded-full"
                style={{
                  color: ALERT_COLORS[site.alertLevel],
                  backgroundColor: `${ALERT_COLORS[site.alertLevel]}22`,
                }}
              >
                {ALERT_LABELS[site.alertLevel]}
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-2">
              {site.region} · SST +{site.sstAnomalyC}°C · as of {site.asOf}
            </p>
            <p className="text-sm text-slate-400 leading-relaxed">{site.summary}</p>
            <a
              href={site.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-cyan-400 mt-2 inline-block hover:underline"
            >
              {site.source}
            </a>
          </article>
        ))}
      </section>
    </section>
  );
}
