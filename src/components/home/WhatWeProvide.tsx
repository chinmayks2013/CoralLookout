"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Camera,
  GraduationCap,
  MapPin,
  School,
  Users,
} from "lucide-react";

const included = [
  {
    icon: Camera,
    title: "AI reef scanner",
    description:
      "Upload a reef photo and get instant health analysis — bleaching signals, confidence scores, and highlighted damage zones.",
  },
  {
    icon: GraduationCap,
    title: "Reef Academy",
    description:
      "A short guided course with videos and quizzes so you learn how coral reefs work and how to help protect them.",
  },
  {
    icon: MapPin,
    title: "Global reef map",
    description:
      "Pin scan locations, explore community uploads, and see bleaching hotspots and restoration activity worldwide.",
  },
  {
    icon: Users,
    title: "Community & gallery",
    description:
      "Share findings, join discussions, complete challenges, and collaborate with other young conservationists.",
  },
];

export function WhatWeProvide() {
  return (
    <section
      id="what-we-provide"
      className="py-16 sm:py-20 px-4 border-y border-white/5 bg-slate-950/40"
    >
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-12"
        >
          <span className="inline-block rounded-full bg-cyan-500/15 px-3 py-1 text-xs font-semibold text-cyan-300 mb-4">
            What you get
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-balance">
            Coral Lookout is a free web platform for{" "}
            <span className="gradient-text">reef monitoring and conservation</span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed text-pretty">
            Students, teachers, and ocean enthusiasts use Coral Lookout to analyze
            reef photos with AI, learn coral science, and contribute real
            observations to a shared global map — no app download required.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 mb-8">
          {included.map((item, i) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="glass rounded-2xl p-5 sm:p-6 flex gap-4"
            >
              <div className="shrink-0 inline-flex rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 p-2.5 h-fit">
                <item.icon className="h-5 w-5 text-cyan-300" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </motion.article>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-2xl p-5 sm:p-6 border border-teal-500/15 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6"
        >
          <div className="flex items-start gap-3 flex-1">
            <div className="shrink-0 inline-flex rounded-xl bg-teal-500/20 p-2.5">
              <School className="h-5 w-5 text-teal-300" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">
                For teachers & schools
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Create a chapter, share a join code, assign reef scans to your
                class, review student work, and export data for STEM lessons —
                students stay free.
              </p>
            </div>
          </div>
          <Link
            href="/schools"
            className="inline-flex items-center justify-center gap-2 shrink-0 rounded-full border border-cyan-500/30 px-5 py-2.5 text-sm font-medium text-cyan-300 hover:bg-cyan-500/10 transition-colors"
          >
            School overview
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
