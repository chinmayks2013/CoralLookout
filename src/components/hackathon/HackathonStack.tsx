"use client";

import { getHackathonConfig } from "@/lib/hackathon/config";

export function HackathonStack() {
  const cfg = getHackathonConfig();
  if (!cfg.enabled) return null;

  return (
    <section className="py-12 sm:py-16 px-4 border-y border-cyan-500/10 bg-slate-950/50">
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">
          Built with
        </p>
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
          {cfg.techStack.map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-cyan-500/20 bg-cyan-500/5 px-3 py-1.5 text-xs sm:text-sm font-medium text-cyan-200/90"
            >
              {tech}
            </span>
          ))}
        </div>
        {cfg.tracks.length > 0 && (
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {cfg.tracks.map((track) => (
              <span
                key={track}
                className="sticker sticker-sm text-[10px] sm:text-xs"
              >
                {track}
              </span>
            ))}
          </div>
        )}
        <p className="mt-6 text-xs text-slate-500">
          {cfg.teamLabel} · swap hackathon name in{" "}
          <code className="text-violet-300/80">.env.local</code>
        </p>
      </div>
    </section>
  );
}
