"use client";

import Link from "next/link";
import { Code2, ExternalLink, Play, Trophy, Zap } from "lucide-react";
import { getHackathonConfig } from "@/lib/hackathon/config";

export function HackathonBanner() {
  const cfg = getHackathonConfig();
  if (!cfg.enabled) return null;

  return (
    <div className="hackathon-banner border-b border-violet-500/25 bg-gradient-to-r from-violet-950/90 via-slate-950/95 to-cyan-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-9 max-w-7xl items-center justify-between gap-2 px-3 sm:px-5 min-w-0">
        <div className="flex items-center gap-2 min-w-0 text-xs sm:text-sm">
          <span className="live-dot shrink-0" aria-hidden />
          <Trophy className="h-3.5 w-3.5 text-amber-400 shrink-0 hidden sm:block" />
          <span className="font-semibold text-violet-200 truncate">
            {cfg.name}
          </span>
          <span className="hidden md:inline text-slate-500">·</span>
          <span className="hidden md:inline text-slate-400 truncate">
            {cfg.track}
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <Link
            href="/pitch"
            className="inline-flex items-center gap-1 rounded-full bg-violet-500/20 border border-violet-400/30 px-2.5 py-0.5 text-[11px] sm:text-xs font-semibold text-violet-200 hover:bg-violet-500/30"
          >
            <Zap className="h-3 w-3" />
            Pitch deck
          </Link>
          {cfg.githubUrl && (
            <a
              href={cfg.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
            >
              <Code2 className="h-3.5 w-3.5" />
              Code
            </a>
          )}
          {cfg.devpostUrl && (
            <a
              href={cfg.devpostUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Devpost
            </a>
          )}
          {cfg.videoUrl && (
            <a
              href={cfg.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-cyan-300 hover:text-cyan-200"
            >
              <Play className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Demo</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
