"use client";

import Link from "next/link";
import {
  Code2,
  ExternalLink,
  Play,
  Scan,
  Trophy,
  Zap,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { HackathonDemoPath } from "@/components/hackathon/HackathonDemoPath";
import { HackathonPitch } from "@/components/hackathon/HackathonPitch";
import { HackathonStack } from "@/components/hackathon/HackathonStack";
import { getHackathonConfig } from "@/lib/hackathon/config";

export function HackathonPitchPage() {
  const cfg = getHackathonConfig();

  if (!cfg.enabled) {
    return (
      <section className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-slate-400 mb-4">
          Hackathon mode is off. Set{" "}
          <code className="text-cyan-300">NEXT_PUBLIC_HACKATHON_MODE=true</code>{" "}
          in <code className="text-cyan-300">.env.local</code>.
        </p>
        <Link href="/" className="text-violet-300 underline">
          Back home
        </Link>
      </section>
    );
  }

  return (
    <>
      <section className="relative overflow-hidden px-4 pt-6 pb-4 sm:pt-10">
        <div className="absolute inset-0 hackathon-hero-glow pointer-events-none" />
        <div className="relative mx-auto max-w-3xl text-center">
          <span className="sticker mb-4 inline-flex items-center gap-1.5">
            <Trophy className="h-3.5 w-3.5" />
            {cfg.name}
          </span>
          <PageHeader
            badge={cfg.track}
            title="Coral Lookout"
            subtitle={cfg.tagline}
          />
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center -mt-6 mb-4">
            <Link
              href="/scanner"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 px-6 py-3 text-sm font-bold text-slate-950"
            >
              <Scan className="h-4 w-4" />
              Run live demo
            </Link>
            {cfg.videoUrl && (
              <a
                href={cfg.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-violet-500/40 px-6 py-3 text-sm text-violet-200 hover:bg-violet-500/10"
              >
                <Play className="h-4 w-4" />
                Watch video
              </a>
            )}
            {cfg.githubUrl && (
              <a
                href={cfg.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-600 px-6 py-3 text-sm text-slate-300 hover:bg-white/5"
              >
                <Code2 className="h-4 w-4" />
                GitHub
              </a>
            )}
            {cfg.devpostUrl && (
              <a
                href={cfg.devpostUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-600 px-6 py-3 text-sm text-slate-300 hover:bg-white/5"
              >
                <ExternalLink className="h-4 w-4" />
                Devpost
              </a>
            )}
          </div>
        </div>
      </section>

      <HackathonPitch />

      <section className="px-4 pb-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-2 mb-6">
            <Zap className="h-5 w-5 text-amber-400" />
            <h2 className="text-xl font-bold">Demo script</h2>
          </div>
          <HackathonDemoPath compact />
        </div>
      </section>

      <HackathonStack />
    </>
  );
}
