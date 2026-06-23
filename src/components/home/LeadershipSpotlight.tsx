"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { FOUNDER, FOUNDER_MISSION } from "@/lib/data/founder";

export function LeadershipSpotlight() {
  return (
    <section className="py-16 px-4">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-cyan-500/25 bg-gradient-to-br from-slate-900/90 to-cyan-950/40 p-6 sm:p-8"
        >
          <p className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400 mb-2">
            Student-led · Community-first
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 text-balance">
            Led by {FOUNDER.name}, age {FOUNDER.age}
          </h2>
          <p className="text-slate-300 leading-relaxed text-pretty max-w-2xl">
            {FOUNDER_MISSION}
          </p>
          <Link
            href="/founder"
            className="inline-flex items-center gap-1.5 mt-5 text-sm font-medium text-cyan-300 hover:text-cyan-200"
          >
            Read the founder story
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
