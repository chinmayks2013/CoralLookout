"use client";

import Link from "next/link";
import { ArrowRight, Crown, Heart, Mail } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  COMMUNITY_LINES,
  FOUNDER,
  LEADERSHIP_LINES,
  LEADERSHIP_TRAITS,
} from "@/lib/data/founder";

export function FounderView() {
  const initials = FOUNDER.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <section className="mx-auto max-w-lg px-4 py-8 sm:py-12 min-w-0">
      <PageHeader
        badge="Leadership · Age 13"
        title={FOUNDER.name}
        subtitle={FOUNDER.tagline}
      />

      <article className="glass rounded-xl p-5 mb-6 border border-cyan-500/20 text-center">
        <div
          className="mx-auto h-16 w-16 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center text-xl font-bold text-slate-900 mb-3"
          aria-hidden
        >
          {initials}
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400">
          {FOUNDER.title}
        </p>
        <p className="text-xs text-teal-300/90 mt-1">{FOUNDER.age} years old</p>
        <a
          href={`mailto:${FOUNDER.email}`}
          className="inline-flex items-center gap-1.5 text-xs text-cyan-300 hover:text-cyan-200 mt-3"
        >
          <Mail className="h-3.5 w-3.5 shrink-0" />
          {FOUNDER.email}
        </a>
      </article>

      <div className="flex flex-wrap gap-1.5 justify-center mb-5">
        {LEADERSHIP_TRAITS.map((trait) => (
          <span
            key={trait}
            className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] font-semibold text-amber-200"
          >
            {trait}
          </span>
        ))}
      </div>

      <section className="mb-6">
        <h2 className="text-sm font-bold mb-3 flex items-center gap-2 text-amber-300">
          <Crown className="h-4 w-4 shrink-0" />
          My leadership
        </h2>
        <ul className="space-y-2">
          {LEADERSHIP_LINES.map((line, i) => (
            <li
              key={i}
              className="rounded-lg border border-amber-500/20 bg-amber-950/20 px-3.5 py-2.5 text-sm text-slate-100 leading-snug"
            >
              {line}
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-bold mb-3 flex items-center gap-2 text-teal-300">
          <Heart className="h-4 w-4 shrink-0" />
          Helping the community
        </h2>
        <ul className="space-y-2">
          {COMMUNITY_LINES.map((line, i) => (
            <li
              key={i}
              className="rounded-lg border border-slate-700/60 bg-slate-900/40 px-3.5 py-2 text-xs text-slate-300 leading-snug"
            >
              {line}
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-wrap justify-center gap-2">
        <Link
          href="/community"
          className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 px-4 py-2 text-xs font-semibold text-slate-900"
        >
          Join community
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <Link
          href="/scanner"
          className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 px-4 py-2 text-xs text-cyan-300"
        >
          Start scanning
        </Link>
      </div>
    </section>
  );
}
