"use client";

import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { usePlatform } from "@/context/PlatformContext";
import { getResearchStats } from "@/lib/platform/research-stats";
import { getHealthLabel } from "@/lib/scanner/analyze";
import { TrendingUp, Image, BookOpen, MapPin, Download, FileJson, Scale } from "lucide-react";
import { WorldResearchSection } from "@/components/research/WorldResearchSection";
import { getWorldResearchSummary } from "@/lib/data/world-research";

export function ResearchView() {
  const { state, hydrated } = usePlatform();
  const stats = getResearchStats(state);
  const maxTrend = Math.max(...stats.monthlyTrend.map((d) => d.value), 1);
  const worldSummary = getWorldResearchSummary();

  if (!hydrated) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-12 text-center text-slate-400">
        Loading research data...
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <PageHeader
        badge="Science"
        title="Research Dashboard"
        subtitle="Your metrics come from your scans. Below that, global analysis uses NOAA Coral Reef Watch research data."
      />

      {!stats.hasUserData && (
        <aside className="glass rounded-xl p-4 mb-8 text-center text-sm text-slate-400 border border-cyan-500/20">
          No observations yet.{" "}
          <Link href="/scanner" className="text-cyan-300 underline">
            Scan and pin a reef
          </Link>{" "}
          to build your research dataset.
        </aside>
      )}

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <article className="glass rounded-2xl p-6">
          <Image className="h-6 w-6 text-cyan-400 mb-3" />
          <p className="text-2xl font-bold text-cyan-300">{stats.totalUploads}</p>
          <p className="text-sm font-medium mt-1">Your uploads</p>
        </article>
        <article className="glass rounded-2xl p-6">
          <TrendingUp className="h-6 w-6 text-cyan-400 mb-3" />
          <p className="text-2xl font-bold text-cyan-300">
            {stats.bleachingEvents}
          </p>
          <p className="text-sm font-medium mt-1">Stress / bleaching scans</p>
        </article>
        <article className="glass rounded-2xl p-6">
          <BookOpen className="h-6 w-6 text-cyan-400 mb-3" />
          <p className="text-2xl font-bold text-cyan-300">
            {stats.lessonsCompleted}
          </p>
          <p className="text-sm font-medium mt-1">Lessons completed</p>
        </article>
        <article className="glass rounded-2xl p-6">
          <MapPin className="h-6 w-6 text-cyan-400 mb-3" />
          <p className="text-2xl font-bold text-cyan-300">{stats.uniqueSites}</p>
          <p className="text-sm font-medium mt-1">Unique map sites</p>
        </article>
      </section>

      {stats.hasUserData && (
        <section className="glass rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-bold mb-4">Your observations</h2>
          <ul className="space-y-2">
            {[...state.scans].reverse().map((scan) => (
              <li
                key={scan.id}
                className="flex flex-col sm:flex-row sm:justify-between gap-1 text-sm border-b border-slate-800/50 pb-2"
              >
                <span>
                  {scan.locationName} — {getHealthLabel(scan.health)}
                </span>
                <span className="text-slate-500">
                  {scan.confidence}% ·{" "}
                  {new Date(scan.timestamp).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-slate-500 mt-4">
            Average model confidence: {stats.avgConfidence}%
          </p>
        </section>
      )}

      {stats.hasUserData && stats.monthlyTrend.length > 0 && (
        <section className="grid gap-6 lg:grid-cols-2">
          <article className="glass rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-400" />
              Stress rate by month
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              % of your scans each month flagged as bleaching or severe damage
            </p>
            <div className="flex items-end gap-3 h-48">
              {stats.monthlyTrend.map((d) => (
                <div
                  key={d.month}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-orange-600 to-orange-400"
                    style={{ height: `${(d.value / maxTrend) * 100}%` }}
                  />
                  <span className="text-xs text-slate-400">{d.month}</span>
                  <span className="text-xs font-medium text-orange-300">
                    {d.value}%
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {d.count} scan{d.count === 1 ? "" : "s"}
                  </span>
                </div>
              ))}
            </div>
          </article>

          <article className="glass rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-6">Health distribution</h2>
            <ul className="space-y-4">
              {stats.healthBreakdown.map((item) => (
                <li key={item.label}>
                  <p className="flex justify-between text-sm mb-1">
                    <span>{item.label}</span>
                    <span className="font-medium">{item.pct}%</span>
                  </p>
                  <div className="h-3 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${item.pct}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </article>
        </section>
      )}

      <section className="glass rounded-2xl p-6 mb-8">
        <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
          <Download className="h-5 w-5 text-cyan-400" />
          Export research data
        </h2>
        <p className="text-sm text-slate-400 mb-4 leading-relaxed">
          Public, anonymized export of platform scan data (no user IDs) — for
          researchers and partners building their own analysis.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="/api/research/export?format=csv"
            download
            className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 px-5 py-2.5 text-sm font-medium text-cyan-300 hover:bg-cyan-500/10"
          >
            <Download className="h-4 w-4" />
            Download CSV
          </a>
          <a
            href="/api/research/export?format=geojson"
            download
            className="inline-flex items-center gap-2 rounded-full border border-violet-500/40 px-5 py-2.5 text-sm font-medium text-violet-200 hover:bg-violet-500/10"
          >
            <FileJson className="h-4 w-4" />
            Download GeoJSON
          </a>
        </div>
      </section>

      <section className="glass rounded-2xl p-6 mb-8 border border-amber-500/15">
        <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
          <Scale className="h-5 w-5 text-amber-300" />
          Chapter vs. global demo sites
        </h2>
        <p className="text-sm text-slate-400 leading-relaxed mb-4">
          A simple, honest count comparison — not a scientific benchmark or ML
          claim. It shows scale, nothing more.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-cyan-500/15 bg-slate-950/30 p-4">
            <p className="text-2xl font-bold text-cyan-300">{stats.totalUploads}</p>
            <p className="text-sm text-slate-400 mt-1">
              Scans logged on this device{stats.uniqueSites > 0 ? ` across ${stats.uniqueSites} unique site${stats.uniqueSites === 1 ? "" : "s"}` : ""}
            </p>
          </div>
          <div className="rounded-xl border border-violet-500/15 bg-slate-950/30 p-4">
            <p className="text-2xl font-bold text-violet-300">{worldSummary.siteCount}</p>
            <p className="text-sm text-slate-400 mt-1">
              NOAA-monitored reef provinces shown as global demo comparison
              sites (see below)
            </p>
          </div>
        </div>
      </section>

      <WorldResearchSection />
    </section>
  );
}
