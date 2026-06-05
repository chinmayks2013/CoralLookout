"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Clock, PlayCircle } from "lucide-react";
import { getHackathonConfig } from "@/lib/hackathon/config";

export function HackathonDemoPath({ compact = false }: { compact?: boolean }) {
  const cfg = getHackathonConfig();
  if (!cfg.enabled) return null;

  const totalMinutes = "~3 min";

  return (
    <section className={`px-4 ${compact ? "py-0" : "py-16 sm:py-20"}`}>
      <div className="mx-auto max-w-4xl">
        {!compact && (
          <div className="text-center mb-10">
            <span className="sticker sticker-cyan mb-4 inline-block">
              Live demo script
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold">
              Follow the <span className="gradient-text">demo path</span>
            </h2>
            <p className="mt-2 text-sm text-slate-400 flex items-center justify-center gap-1.5">
              <Clock className="h-4 w-4" />
              {totalMinutes} · click each step to show judges
            </p>
          </div>
        )}

        <ol className="space-y-3">
          {cfg.demoSteps.map((step, i) => (
            <motion.li
              key={step.step}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
            >
              <Link
                href={step.href}
                className="group flex gap-4 rounded-2xl border border-cyan-500/15 glass p-4 sm:p-5 hover:border-violet-400/40 hover:bg-violet-500/5 transition-all"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 text-sm font-black text-slate-950">
                  {step.step}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white group-hover:text-cyan-200">
                      {step.title}
                    </h3>
                    <span className="text-[10px] uppercase tracking-wide text-slate-500 bg-slate-800/80 px-2 py-0.5 rounded-full">
                      {step.duration}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {step.hook}
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 shrink-0 text-slate-600 group-hover:text-violet-300 self-center transition-colors" />
              </Link>
            </motion.li>
          ))}
        </ol>

        {!compact && (
          <div className="mt-8 text-center">
            <Link
              href="/scanner"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 via-cyan-500 to-teal-500 px-8 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-violet-500/20 hover:opacity-90"
            >
              <PlayCircle className="h-5 w-5" />
              Start live demo
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
