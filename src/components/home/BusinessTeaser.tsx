"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, GraduationCap, Leaf } from "lucide-react";
import { BUSINESS_TAGLINE } from "@/lib/data/business-model";

export function BusinessTeaser() {
  return (
    <section className="py-20 px-4">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-3xl p-8 sm:p-10 border border-teal-500/20 flex flex-col lg:flex-row gap-8 items-center"
        >
          <div className="flex-1 text-center lg:text-left">
            <span className="inline-block rounded-full bg-teal-500/20 px-3 py-1 text-xs font-semibold text-teal-300 mb-4">
              Sustainable & scalable
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              Free for students.{" "}
              <span className="gradient-text">Built to last.</span>
            </h2>
            <p className="text-slate-400 leading-relaxed">{BUSINESS_TAGLINE}</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              <li className="flex items-center gap-2 justify-center lg:justify-start">
                <GraduationCap className="h-4 w-4 text-cyan-400 shrink-0" />
                School chapters from $49/mo
              </li>
              <li className="flex items-center gap-2 justify-center lg:justify-start">
                <Leaf className="h-4 w-4 text-teal-400 shrink-0" />
                NGO & research partnerships
              </li>
            </ul>
          </div>
          <div className="shrink-0 flex flex-col gap-3 w-full sm:w-auto">
            <Link
              href="/business"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-3 text-sm font-semibold text-slate-900 hover:opacity-90"
            >
              See business model
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/teacher"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-cyan-500/30 px-6 py-3 text-sm text-cyan-300 hover:bg-cyan-500/10"
            >
              Request school pilot
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
