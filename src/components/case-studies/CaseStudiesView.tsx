"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Quote, Target, Sparkles, Copy, Check, Quote as QuoteIcon } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { CASE_STUDIES, STATUS_LABEL, type CaseStudyStatus } from "@/lib/data/case-studies";
import { buildDatasetCitation } from "@/lib/data/citation";

function statusStyles(status: CaseStudyStatus): string {
  switch (status) {
    case "complete":
      return "bg-teal-500/20 text-teal-300 border-teal-500/30";
    case "in_progress":
      return "bg-cyan-500/20 text-cyan-300 border-cyan-500/30";
    default:
      return "bg-slate-500/20 text-slate-300 border-slate-500/30";
  }
}

function CopyCitationBox({ schoolName, cohort }: { schoolName: string; cohort: string }) {
  const [copied, setCopied] = useState(false);
  const year = new Date().getFullYear();
  const citation = buildDatasetCitation({ schoolName, cohort, year });

  async function copy() {
    try {
      await navigator.clipboard.writeText(citation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may be unavailable — fail silently, text is selectable.
    }
  }

  return (
    <article className="glass rounded-xl p-5 border border-cyan-500/15">
      <h3 className="font-semibold mb-2 flex items-center gap-2">
        <QuoteIcon className="h-4 w-4 text-cyan-400" />
        Cite this class dataset
      </h3>
      <p className="text-xs text-slate-500 mb-3">
        For students and researchers referencing this cohort&apos;s Coral
        Lookout observations in a paper or report.
      </p>
      <p className="text-sm text-slate-300 italic leading-relaxed rounded-lg bg-slate-950/40 border border-cyan-500/10 px-3 py-2.5 mb-3">
        {citation}
      </p>
      <button
        type="button"
        onClick={() => void copy()}
        className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/40 px-4 py-1.5 text-xs font-medium text-cyan-300 hover:bg-cyan-500/10"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? "Copied" : "Copy citation"}
      </button>
    </article>
  );
}

export function CaseStudiesView() {
  const featured = CASE_STUDIES.find((c) => c.featured) ?? CASE_STUDIES[0];
  const rest = CASE_STUDIES.filter((c) => c.id !== featured?.id);

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <PageHeader
        badge="Real pilots, honest numbers"
        title="Case Studies"
        subtitle="Early cohort pilots where classrooms use Coral Lookout in the field. We publish what's real and mark what's pending — no invented metrics."
      />

      {featured && (
        <article
          id={featured.id}
          className="glass rounded-2xl border border-teal-400/30 bg-gradient-to-b from-teal-500/10 to-slate-900/40 p-6 sm:p-8 mb-14"
        >
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span
              className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusStyles(
                featured.status
              )}`}
            >
              {STATUS_LABEL[featured.status]}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-slate-400">
              <MapPin className="h-3 w-3" />
              {featured.region}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">
            {featured.title}
          </h2>
          <p className="text-slate-300 leading-relaxed max-w-3xl mb-6">
            {featured.summary}
          </p>

          <div className="grid gap-3 sm:grid-cols-3 mb-6">
            {featured.metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-xl p-4 text-center border border-cyan-500/15 bg-slate-950/30"
              >
                <p
                  className={`text-base sm:text-lg font-bold ${
                    metric.placeholder ? "text-slate-500 italic" : "text-teal-300"
                  }`}
                >
                  {metric.value}
                </p>
                <p className="text-[11px] text-slate-500 uppercase tracking-wide mt-1">
                  {metric.label}
                </p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 sm:grid-cols-2 mb-6">
            <div>
              <h3 className="font-semibold text-cyan-200 mb-2 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Pilot goals
              </h3>
              <ul className="space-y-1.5">
                {featured.goals.map((goal) => (
                  <li
                    key={goal}
                    className="text-sm text-slate-400 flex gap-2 leading-relaxed"
                  >
                    <span className="text-teal-400/80 shrink-0">·</span>
                    <span>{goal}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative rounded-xl p-5 border border-dashed border-cyan-500/30 bg-slate-950/30">
              <span className="absolute -top-2.5 left-4 rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-300 border border-amber-500/30">
                Placeholder — pending approval
              </span>
              <Quote className="h-5 w-5 text-cyan-400/60 mb-2" />
              <p className="text-sm text-slate-300 italic leading-relaxed mb-3">
                &ldquo;{featured.quote.text}&rdquo;
              </p>
              <p className="text-xs text-slate-500">{featured.quote.attribution}</p>
            </div>
          </div>

          <div className="mb-6">
            <CopyCitationBox schoolName={featured.title} cohort={featured.region} />
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={featured.mapHref}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-900"
            >
              <MapPin className="h-4 w-4" />
              View on the map
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/pilot"
              className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 px-5 py-2.5 text-sm font-medium text-cyan-300 hover:bg-cyan-500/10"
            >
              Student quick start
            </Link>
            <Link
              href="/vision"
              className="inline-flex items-center gap-2 rounded-full border border-violet-500/40 px-5 py-2.5 text-sm font-medium text-violet-200 hover:bg-violet-500/10"
            >
              <Sparkles className="h-4 w-4" />
              Why this builds the data moat
            </Link>
          </div>
        </article>
      )}

      {rest.length > 0 && (
        <div className="mb-16">
          <h2 className="text-xl font-bold text-center mb-8">More pilots</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {rest.map((study) => (
              <article
                key={study.id}
                className="glass rounded-xl p-5 border border-cyan-500/15"
              >
                <span
                  className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide mb-3 ${statusStyles(
                    study.status
                  )}`}
                >
                  {STATUS_LABEL[study.status]}
                </span>
                <h3 className="font-semibold text-white">{study.title}</h3>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                  {study.summary}
                </p>
                <Link
                  href={study.mapHref}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-cyan-300 hover:text-cyan-200 mt-4"
                >
                  View on map
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      )}

      <article className="rounded-2xl bg-gradient-to-r from-cyan-600/30 via-teal-600/20 to-violet-600/30 border border-cyan-500/30 p-8 sm:p-10 text-center">
        <h2 className="text-2xl font-bold mb-3">Want your school in the next case study?</h2>
        <p className="text-slate-300 max-w-xl mx-auto mb-6 text-sm leading-relaxed">
          We publish honest, in-progress numbers — not polished marketing
          stats. Book a pilot and help write the next one.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/pilot"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-2.5 text-sm font-semibold text-slate-900"
          >
            Student quick start
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/schools"
            className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 px-6 py-2.5 text-sm font-medium text-cyan-300 hover:bg-cyan-500/10"
          >
            For schools
          </Link>
        </div>
      </article>
    </section>
  );
}
