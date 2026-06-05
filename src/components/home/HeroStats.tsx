"use client";

import { usePlatform } from "@/context/PlatformContext";
import { getPlatformSummary } from "@/lib/platform/summary-stats";

export function HeroStats() {
  const { state, hydrated } = usePlatform();

  if (!hydrated) {
    return (
      <section className="mt-10 sm:mt-16 grid grid-cols-1 min-[420px]:grid-cols-3 gap-3 sm:gap-4 max-w-lg mx-auto w-full">
        {[1, 2, 3].map((i) => (
          <article key={i} className="glass rounded-xl p-3 sm:p-4 h-16 sm:h-20 animate-pulse" />
        ))}
      </section>
    );
  }

  const summary = getPlatformSummary(state);

  return (
    <section className="mt-10 sm:mt-16 grid grid-cols-1 min-[420px]:grid-cols-3 gap-3 sm:gap-4 max-w-lg mx-auto w-full">
      {[
        { value: String(summary.reefScans), label: "Your reef scans" },
        { value: String(summary.schoolChapters), label: "Your chapter" },
        { value: String(summary.mapPins), label: "Map pins" },
      ].map((stat) => (
        <article key={stat.label} className="glass rounded-xl p-3 sm:p-4 text-center">
          <p className="text-xl sm:text-2xl font-bold text-cyan-300">{stat.value}</p>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">{stat.label}</p>
        </article>
      ))}
    </section>
  );
}
