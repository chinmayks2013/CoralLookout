"use client";

import Link from "next/link";
import { Printer, Mail, Waves } from "lucide-react";
import {
  STATUS_LABEL,
  VISION_PILLARS,
  VISION_TAGLINE,
  VISION_THESIS,
} from "@/lib/data/vision-moat";
import { BOOK_PILOT_MAILTO } from "@/lib/data/cohorts";

export function OnePagerView() {
  const topPillars = [...VISION_PILLARS].sort((a, b) => a.rank - b.rank).slice(0, 6);

  return (
    <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 print:px-0 print:py-4">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Link href="/vision" className="text-sm text-cyan-300 hover:text-cyan-200">
          ← Back to Vision
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/40 px-4 py-1.5 text-sm text-cyan-300 hover:bg-cyan-500/10"
        >
          <Printer className="h-4 w-4" />
          Print / Save as PDF
        </button>
      </div>

      <article className="glass rounded-2xl border border-cyan-500/20 p-6 sm:p-10 print:border-0 print:bg-transparent print:p-0">
        <header className="mb-6 flex items-center gap-2">
          <Waves className="h-6 w-6 text-cyan-400 print:text-black" />
          <span className="font-bold text-lg gradient-text print:text-black">Coral Lookout</span>
        </header>

        <h1 className="text-2xl sm:text-3xl font-bold mb-2 print:text-black">
          Partner one-pager
        </h1>
        <p className="text-slate-400 print:text-slate-700 leading-relaxed mb-6">
          {VISION_TAGLINE}
        </p>

        <div className="rounded-xl border border-cyan-500/15 bg-slate-900/30 print:border-slate-300 print:bg-transparent p-4 mb-6">
          <p className="text-xs uppercase tracking-wide text-cyan-400 print:text-slate-500 font-semibold mb-1">
            {VISION_THESIS.eyebrow}
          </p>
          <h2 className="font-bold mb-1.5 print:text-black">{VISION_THESIS.headline}</h2>
          <p className="text-sm text-slate-400 print:text-slate-700 leading-relaxed">
            {VISION_THESIS.body}
          </p>
        </div>

        <h2 className="font-bold mb-3 print:text-black">Roadmap highlights</h2>
        <ul className="space-y-3 mb-6">
          {topPillars.map((pillar) => (
            <li key={pillar.id} className="flex items-start gap-3 text-sm">
              <span className="mt-0.5 shrink-0 rounded-full border border-cyan-500/30 bg-cyan-500/10 print:border-slate-300 print:bg-transparent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-cyan-300 print:text-slate-600">
                {STATUS_LABEL[pillar.status]}
              </span>
              <span className="text-slate-300 print:text-slate-800">
                <strong className="text-white print:text-black">{pillar.title}.</strong>{" "}
                {pillar.summary}
              </span>
            </li>
          ))}
        </ul>

        <div className="rounded-xl bg-gradient-to-r from-cyan-600/30 via-teal-600/20 to-violet-600/30 print:bg-transparent print:border print:border-slate-300 border border-cyan-500/30 p-5 text-center">
          <p className="font-semibold mb-3 print:text-black">Ready to run a pilot?</p>
          <a
            href={BOOK_PILOT_MAILTO}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-2.5 text-sm font-semibold text-slate-900 print:hidden"
          >
            <Mail className="h-4 w-4" />
            Book a pilot
          </a>
          <p className="hidden print:block text-sm text-slate-700">
            Book a pilot: {BOOK_PILOT_MAILTO.replace("mailto:", "").split("?")[0]}
          </p>
        </div>
      </article>
    </section>
  );
}
