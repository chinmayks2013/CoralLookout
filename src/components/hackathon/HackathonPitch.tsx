"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Lightbulb, Rocket } from "lucide-react";
import { getHackathonConfig } from "@/lib/hackathon/config";

const cards = [
  {
    key: "problem",
    icon: AlertTriangle,
    label: "Problem",
    color: "from-rose-500/20 to-orange-500/10 border-rose-500/30 text-rose-300",
    field: "problem" as const,
  },
  {
    key: "solution",
    icon: Lightbulb,
    label: "Solution",
    color: "from-cyan-500/20 to-teal-500/10 border-cyan-500/30 text-cyan-300",
    field: "solution" as const,
  },
  {
    key: "impact",
    icon: Rocket,
    label: "Impact",
    color: "from-violet-500/20 to-fuchsia-500/10 border-violet-500/30 text-violet-300",
    field: "impact" as const,
  },
];

export function HackathonPitch() {
  const cfg = getHackathonConfig();
  if (!cfg.enabled) return null;

  return (
    <section className="py-16 sm:py-20 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-10 sm:mb-12">
          <span className="sticker mb-4 inline-block">For judges & mentors</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-balance">
            The <span className="gradient-text">3-minute pitch</span>
          </h2>
          <p className="mt-3 text-slate-400 max-w-2xl mx-auto text-sm sm:text-base text-pretty">
            {cfg.tagline}
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
          {cards.map((card, i) => (
            <motion.article
              key={card.key}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={`rounded-2xl border bg-gradient-to-br p-5 sm:p-6 ${card.color}`}
            >
              <card.icon className="h-6 w-6 mb-3 opacity-90" />
              <h3 className="text-xs font-bold uppercase tracking-wider mb-2 opacity-80">
                {card.label}
              </h3>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                {cfg[card.field]}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
