"use client";

import Link from "next/link";
import {
  ArrowRight,
  Camera,
  GraduationCap,
  Mail,
  Microscope,
  School,
  Shield,
  Sparkles,
  Star,
  User,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { BOOK_PILOT_MAILTO } from "@/lib/data/cohorts";
import {
  STATUS_LABEL,
  VISION_MOAT_SUMMARY,
  VISION_PHASES,
  VISION_PILLARS,
  VISION_TAGLINE,
  VISION_THESIS,
  type PillarStatus,
} from "@/lib/data/vision-moat";
import { AI_TRUST } from "@/lib/data/ai-trust";

function statusStyles(status: PillarStatus): string {
  switch (status) {
    case "live":
      return "bg-teal-500/20 text-teal-300 border-teal-500/30";
    case "building":
      return "bg-cyan-500/20 text-cyan-300 border-cyan-500/30";
    default:
      return "bg-slate-500/20 text-slate-300 border-slate-500/30";
  }
}

function StarRating({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${count} of 5 priority`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${
            i < count ? "fill-amber-400 text-amber-400" : "text-slate-600"
          }`}
        />
      ))}
    </span>
  );
}

export function VisionMoatView() {
  const MoatIcon = VISION_MOAT_SUMMARY.icon;
  const deferredPillars = VISION_PILLARS.filter((p) => p.status === "planned");

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <PageHeader
        badge="Strategy"
        title="Vision & Data Moat"
        subtitle={VISION_TAGLINE}
      />

      <article className="glass rounded-2xl border border-cyan-500/20 p-6 sm:p-8 mb-14">
        <p className="text-xs font-semibold uppercase tracking-wide text-cyan-400 mb-2">
          {VISION_THESIS.eyebrow}
        </p>
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 text-balance">
          {VISION_THESIS.headline}
        </h2>
        <p className="text-slate-400 leading-relaxed max-w-3xl">
          {VISION_THESIS.body}
        </p>
        <div className="mt-6 flex flex-wrap gap-3 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1">
            <Shield className="h-3.5 w-3.5 text-cyan-400" />
            Data moat
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-500/20 bg-teal-500/10 px-3 py-1">
            <Sparkles className="h-3.5 w-3.5 text-teal-400" />
            Workflow moat
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1">
            <MoatIcon className="h-3.5 w-3.5 text-violet-400" />
            Network effects
          </span>
        </div>
      </article>

      <article
        id="methodology"
        className="glass rounded-2xl border border-amber-500/25 p-6 sm:p-8 mb-16 scroll-mt-20"
      >
        <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
          <Microscope className="h-5 w-5 text-amber-300" />
          Honest AI methodology
        </h2>
        <p className="text-slate-300 leading-relaxed max-w-3xl mb-4">
          {AI_TRUST.title}. Our scanner estimates a relative reef health label
          from color and texture cues and always returns a confidence score —
          it does not diagnose species-level disease or replace a trained
          marine biologist. We would rather under-claim than oversell an AI
          score to a classroom or a partner.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 mb-5">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-teal-400/90 mb-1.5 font-semibold">
              What it does
            </p>
            <ul className="space-y-1">
              {AI_TRUST.does.slice(0, 3).map((item) => (
                <li key={item} className="text-sm text-slate-400 leading-relaxed">
                  · {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-rose-300/90 mb-1.5 font-semibold">
              What it doesn&apos;t claim
            </p>
            <ul className="space-y-1">
              {AI_TRUST.doesNot.slice(0, 3).map((item) => (
                <li key={item} className="text-sm text-slate-400 leading-relaxed">
                  · {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <Link
          href="/scanner"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-cyan-300 hover:text-cyan-200"
        >
          See it on a real scan
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </article>

      <div className="mb-16">
        <h2 className="text-xl font-bold text-center mb-2">
          Ten pillars of the moat
        </h2>
        <p className="text-sm text-slate-400 text-center mb-8 max-w-2xl mx-auto">
          We are not chasing one killer feature. We are building the layers that
          make Coral Lookout hard to replace — and mission-critical for schools,
          science, NGOs, and governments.
        </p>

        <div className="grid gap-5 md:grid-cols-2">
          {VISION_PILLARS.map((pillar) => (
            <article
              key={pillar.id}
              id={pillar.id}
              className={`rounded-2xl p-5 sm:p-6 border flex flex-col ${
                pillar.featured
                  ? "border-teal-400/40 bg-gradient-to-b from-teal-500/15 to-slate-900/40 shadow-lg shadow-teal-500/5 md:col-span-2"
                  : "border-cyan-500/15 glass"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3 min-w-0">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-300">
                    <pillar.icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-wide text-slate-500 font-medium">
                      Pillar {pillar.rank}
                    </p>
                    <h3 className="text-lg font-bold text-white leading-snug">
                      {pillar.title}
                    </h3>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <StarRating count={pillar.stars} />
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusStyles(
                      pillar.status
                    )}`}
                  >
                    {STATUS_LABEL[pillar.status]}
                  </span>
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                {pillar.summary}
              </p>

              <ul className="space-y-1.5 mb-5 flex-1">
                {pillar.details.map((detail) => (
                  <li
                    key={detail}
                    className="text-sm text-slate-400 flex gap-2 leading-relaxed"
                  >
                    <span className="text-teal-400/80 shrink-0">·</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>

              {pillar.href && (
                <Link
                  href={pillar.href}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-cyan-300 hover:text-cyan-200 mt-auto"
                >
                  {pillar.hrefLabel ?? "Learn more"}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </article>
          ))}
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-xl font-bold text-center mb-2">
          Four phases of network effects
        </h2>
        <p className="text-sm text-slate-400 text-center mb-8 max-w-2xl mx-auto">
          Features get us started. Network effects make Coral Lookout the
          standard — and the place historical reef data lives.
        </p>

        <ol className="relative space-y-4 before:absolute before:left-[1.15rem] before:top-3 before:bottom-3 before:w-px before:bg-cyan-500/20 sm:before:left-6">
          {VISION_PHASES.map((phase) => (
            <li
              key={phase.id}
              className="relative grid gap-3 sm:grid-cols-[auto_1fr] sm:gap-5 glass rounded-2xl border border-cyan-500/15 p-5 sm:p-6"
            >
              <div className="flex sm:flex-col items-center gap-3 sm:gap-2">
                <span className="relative z-10 flex h-9 w-9 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 text-sm sm:text-base font-bold text-slate-900 shadow-lg shadow-cyan-500/20">
                  {phase.phase}
                </span>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusStyles(
                    phase.status
                  )}`}
                >
                  {STATUS_LABEL[phase.status]}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{phase.title}</h3>
                <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">
                  {phase.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <article className="glass rounded-2xl border border-slate-600/30 p-6 sm:p-8 mb-16">
        <h2 className="text-xl font-bold mb-2">Explicitly later</h2>
        <p className="text-sm text-slate-400 leading-relaxed mb-5 max-w-3xl">
          We would rather say &ldquo;not yet&rdquo; than overpromise. These
          pillars are real parts of the roadmap but are deliberately
          deprioritized (P3) behind the live and building work above —
          including 3D digital twins, drone/robot ingest, full predictive AI,
          and a public API marketplace.
        </p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {deferredPillars.map((pillar) => (
            <li
              key={pillar.id}
              className="flex items-center gap-2 rounded-lg border border-slate-700/50 bg-slate-900/40 px-3 py-2 text-sm text-slate-400"
            >
              <pillar.icon className="h-4 w-4 text-slate-500 shrink-0" />
              {pillar.title}
            </li>
          ))}
        </ul>
      </article>

      <article className="glass rounded-2xl border border-violet-500/25 p-6 sm:p-8 mb-16">
        <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
          <MoatIcon className="h-5 w-5 text-violet-400" />
          {VISION_MOAT_SUMMARY.title}
        </h2>
        <p className="text-slate-300 leading-relaxed max-w-3xl">
          {VISION_MOAT_SUMMARY.body}
        </p>
      </article>

      <article className="rounded-2xl bg-gradient-to-r from-cyan-600/30 via-teal-600/20 to-violet-600/30 border border-cyan-500/30 p-6 sm:p-10 text-center">
        <h2 className="text-xl sm:text-2xl font-bold mb-3">Help grow the network</h2>
        <p className="text-slate-300 max-w-xl mx-auto mb-6 text-sm leading-relaxed">
          Every scan, school chapter, and research partnership compounds the
          dataset and the workflow moat. Start contributing today.
        </p>
        <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-3">
          <Link
            href="/scanner"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-2.5 text-sm font-semibold text-slate-900"
          >
            <Camera className="h-4 w-4" />
            Scan a reef
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href={BOOK_PILOT_MAILTO}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-teal-400/40 px-6 py-2.5 text-sm font-medium text-teal-200 hover:bg-teal-500/10"
          >
            <Mail className="h-4 w-4" />
            Book a pilot
          </a>
          <Link
            href="/vision/one-pager"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-cyan-500/40 px-6 py-2.5 text-sm font-medium text-cyan-300 hover:bg-cyan-500/10"
          >
            Partner one-pager (print)
          </Link>
          <Link
            href="/schools"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-cyan-500/40 px-6 py-2.5 text-sm font-medium text-cyan-300 hover:bg-cyan-500/10"
          >
            <School className="h-4 w-4" />
            For Schools
          </Link>
          <Link
            href="/teacher"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-cyan-500/40 px-6 py-2.5 text-sm font-medium text-cyan-300 hover:bg-cyan-500/10"
          >
            <GraduationCap className="h-4 w-4" />
            School chapter
          </Link>
          <Link
            href="/business"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-violet-500/40 px-6 py-2.5 text-sm font-medium text-violet-200 hover:bg-violet-500/10"
          >
            Business model
          </Link>
          <Link
            href="/founder"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-violet-500/40 px-6 py-2.5 text-sm font-medium text-violet-200 hover:bg-violet-500/10"
          >
            <User className="h-4 w-4" />
            Founder
          </Link>
        </div>
      </article>
    </section>
  );
}
