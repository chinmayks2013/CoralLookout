"use client";

import { motion } from "framer-motion";

export function Mission() {
  return (
    <section className="py-24 px-4 bg-gradient-to-b from-transparent via-cyan-950/20 to-transparent">
      <div className="mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass rounded-3xl p-8 sm:p-12"
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">
            Our Mission
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-slate-300 leading-relaxed mb-6 text-balance">
            Create the world&apos;s largest{" "}
            <span className="text-cyan-400 font-semibold">
              student-driven
            </span>{" "}
            coral reef monitoring and conservation network.
          </p>
          <p className="text-slate-400 leading-relaxed">
            We combine AI, environmental science, community, gamification,
            research, and education — so students don&apos;t just learn about
            reefs, they actively protect them with real data and global impact.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
