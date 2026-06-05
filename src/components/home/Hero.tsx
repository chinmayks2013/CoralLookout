"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Scan, Users, Map, Zap, PlayCircle, Trophy } from "lucide-react";
import { HeroStats } from "@/components/home/HeroStats";
import { getHackathonConfig } from "@/lib/hackathon/config";

export function Hero() {
  const cfg = getHackathonConfig();
  const hackathon = cfg.enabled;

  return (
    <section className="relative min-h-[calc(100dvh-3.5rem)] flex items-center justify-center overflow-hidden px-4 py-10 sm:py-14">
      {hackathon && (
        <div className="absolute inset-0 hackathon-hero-glow pointer-events-none" />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-cyan-950/40 to-slate-950" />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full blur-3xl"
            style={{
              width: 200 + i * 80,
              height: 200 + i * 80,
              left: `${10 + i * 15}%`,
              top: `${20 + (i % 3) * 20}%`,
              background:
                i % 2 === 0
                  ? hackathon
                    ? "rgba(139, 92, 246, 0.12)"
                    : "rgba(6, 182, 212, 0.15)"
                  : "rgba(249, 115, 22, 0.1)",
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 overflow-hidden opacity-30">
        <div className="animate-wave flex w-[200%]">
          <svg
            viewBox="0 0 1200 120"
            className="w-1/2 h-full fill-cyan-500/30"
            preserveAspectRatio="none"
          >
            <path d="M0,60 C300,120 600,0 900,60 C1050,90 1150,30 1200,60 L1200,120 L0,120 Z" />
          </svg>
          <svg
            viewBox="0 0 1200 120"
            className="w-1/2 h-full fill-cyan-500/30"
            preserveAspectRatio="none"
          >
            <path d="M0,60 C300,120 600,0 900,60 C1050,90 1150,30 1200,60 L1200,120 L0,120 Z" />
          </svg>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {hackathon ? (
            <div className="flex flex-wrap items-center justify-center gap-2 mb-4 sm:mb-6">
              <span className="sticker inline-flex items-center gap-1.5">
                <Trophy className="h-3.5 w-3.5" />
                {cfg.name}
              </span>
              {cfg.tracks.map((track) => (
                <span key={track} className="sticker sticker-sm sticker-cyan">
                  {track}
                </span>
              ))}
            </div>
          ) : (
            <span className="inline-block rounded-full glass px-3 py-1 text-xs sm:text-sm text-cyan-300 mb-4 sm:mb-6 max-w-full text-balance">
              🌊 Student-Driven Reef Conservation Network
            </span>
          )}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 sm:mb-6 text-balance">
            {hackathon ? (
              <>
                <span className="gradient-text">Coral Lookout</span>
                <span className="block text-2xl sm:text-3xl md:text-4xl mt-2 text-slate-200 font-semibold">
                  AI reef monitoring for students worldwide
                </span>
              </>
            ) : (
              <>
                Using{" "}
                <span className="gradient-text">AI and student innovation</span>{" "}
                to help protect coral reefs worldwide.
              </>
            )}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-8 sm:mb-10 leading-relaxed text-pretty">
            {hackathon ? cfg.tagline : (
              <>
                Monitor reef health, detect bleaching, learn marine science, and
                compete globally — all in one platform built by students, for the
                ocean.
              </>
            )}
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center w-full max-w-xl sm:max-w-none mx-auto">
            {hackathon ? (
              <>
                <Link
                  href="/scanner"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-500 via-cyan-500 to-teal-500 px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-bold text-slate-950 hover:opacity-90 transition-opacity shadow-lg shadow-violet-500/25 w-full sm:w-auto"
                >
                  <PlayCircle className="h-5 w-5" />
                  Start live demo
                </Link>
                <Link
                  href="/pitch"
                  className="inline-flex items-center justify-center gap-2 rounded-full glass px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-semibold text-white hover:bg-white/10 transition-colors w-full sm:w-auto border border-violet-500/30"
                >
                  <Zap className="h-5 w-5 text-violet-300" />
                  Pitch deck
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/scanner"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-semibold text-slate-900 hover:opacity-90 transition-opacity shadow-lg shadow-cyan-500/25 w-full sm:w-auto"
                >
                  <Scan className="h-5 w-5" />
                  Analyze Reef
                </Link>
                <Link
                  href="/community"
                  className="inline-flex items-center justify-center gap-2 rounded-full glass px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-semibold text-white hover:bg-white/10 transition-colors w-full sm:w-auto"
                >
                  <Users className="h-5 w-5" />
                  Join Community
                </Link>
                <Link
                  href="/map"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-cyan-500/40 px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-semibold text-cyan-300 hover:bg-cyan-500/10 transition-colors w-full sm:w-auto"
                >
                  <Map className="h-5 w-5" />
                  Explore Global Map
                </Link>
              </>
            )}
          </div>
        </motion.div>

        <HeroStats />
      </div>
    </section>
  );
}
