"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Scan,
  Map,
  Trophy,
  GraduationCap,
  Target,
  BarChart3,
  Users,
} from "lucide-react";

const features = [
  {
    icon: Scan,
    title: "AI Coral Scanner",
    description:
      "Upload reef images and get instant AI analysis — health status, confidence scores, and damage zone highlights.",
    href: "/scanner",
    color: "from-cyan-500 to-teal-500",
  },
  {
    icon: Map,
    title: "Global Reef Map",
    description:
      "Explore interactive worldwide data — uploads, bleaching hotspots, restoration projects, and student activity.",
    href: "/map",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Trophy,
    title: "Student Competitions",
    description:
      "Earn points, badges, rankings, and streaks. Schools compete globally for conservation impact.",
    href: "/compete",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: GraduationCap,
    title: "Reef Academy",
    description:
      "Interactive lessons on coral biology, bleaching, climate science, and conservation technology.",
    href: "/academy",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: Target,
    title: "Challenges & Missions",
    description:
      "Weekly missions — identify reef conditions, cleanup campaigns, awareness drives, and STEM contests.",
    href: "/challenges",
    color: "from-violet-500 to-purple-500",
  },
  {
    icon: BarChart3,
    title: "Research Dashboard",
    description:
      "Bleaching trends, upload statistics, reef health analytics, and ocean temperature correlations.",
    href: "/research",
    color: "from-rose-500 to-pink-500",
  },
  {
    icon: Users,
    title: "Community System",
    description:
      "Create profiles, join teams, form school chapters, share findings, and collaborate on projects.",
    href: "/community",
    color: "from-indigo-500 to-blue-500",
  },
];

export function Features() {
  return (
    <section className="py-16 sm:py-24 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            A complete <span className="gradient-text">conservation platform</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Not just awareness — a real tool, research system, community, and
            competition ecosystem built for lasting impact.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Link
                href={feature.href}
                className="group block h-full glass rounded-2xl p-6 hover:border-cyan-400/40 transition-all hover:-translate-y-1"
              >
                <div
                  className={`inline-flex rounded-xl bg-gradient-to-br ${feature.color} p-3 mb-4`}
                >
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-cyan-300 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
