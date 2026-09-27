"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Camera,
  Handshake,
  Printer,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";

const GUIDES = [
  {
    id: "teacher-guide",
    icon: BookOpen,
    title: "Teacher guide",
    description:
      "Set up a school chapter, share a join code, review the roster, export data, and read learning insights.",
    links: [
      { href: "/teacher", label: "Open teacher dashboard" },
      { href: "/teacher/join-guide", label: "Printable join guide" },
      { href: "/class", label: "Preview the class view" },
    ],
  },
  {
    id: "student-guide",
    icon: Camera,
    title: "Student guide",
    description:
      "Join a class with a join code, run the AI reef scanner, and optionally share a scan to the gallery.",
    links: [
      { href: "/pilot", label: "Student quick start" },
      { href: "/class", label: "Join a class" },
      { href: "/scanner", label: "Try the scanner" },
    ],
  },
  {
    id: "partner-overview",
    icon: Handshake,
    title: "Partner overview",
    description:
      "For schools, NGOs, and researchers evaluating Coral Lookout — pricing, the data moat, and privacy posture.",
    links: [
      { href: "/business", label: "Pricing & business model" },
      { href: "/vision", label: "Vision & data moat" },
      { href: "/privacy", label: "Privacy & student data" },
    ],
  },
] as const;

export function DocsView() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <PageHeader
        badge="Docs"
        title="Guides & Docs"
        subtitle="Short, practical guides for teachers, students, and partners — grouped by who you are, not by feature."
      />

      <div className="mb-6 flex items-center justify-center gap-2 text-xs text-slate-500">
        <Printer className="h-3.5 w-3.5" />
        Tip: most guide pages, including the join guide, are print-friendly —
        use your browser&apos;s print option to make a handout.
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-16">
        {GUIDES.map((guide) => (
          <article
            key={guide.id}
            id={guide.id}
            className="glass rounded-2xl p-6 border border-cyan-500/15 flex flex-col"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-300 mb-4">
              <guide.icon className="h-5 w-5" />
            </span>
            <h2 className="text-lg font-bold text-white mb-2">{guide.title}</h2>
            <p className="text-sm text-slate-400 leading-relaxed mb-5 flex-1">
              {guide.description}
            </p>
            <ul className="space-y-2">
              {guide.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-cyan-300 hover:text-cyan-200"
                  >
                    {link.label}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <article className="glass rounded-2xl p-6 sm:p-8 border border-cyan-500/15 mb-16">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-cyan-400" />
          More resources
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/schools"
            className="inline-flex items-center gap-2 text-sm text-cyan-300 hover:text-cyan-200"
          >
            <ArrowRight className="h-3.5 w-3.5" />
            For Schools overview
          </Link>
          <Link
            href="/privacy"
            className="inline-flex items-center gap-2 text-sm text-cyan-300 hover:text-cyan-200"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Privacy & student data
          </Link>
          <Link
            href="/case-studies"
            className="inline-flex items-center gap-2 text-sm text-cyan-300 hover:text-cyan-200"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Case studies
          </Link>
          <Link
            href="/vision"
            className="inline-flex items-center gap-2 text-sm text-cyan-300 hover:text-cyan-200"
          >
            <ArrowRight className="h-3.5 w-3.5" />
            Vision & data moat
          </Link>
          <Link
            href="/docs/release-notes"
            className="inline-flex items-center gap-2 text-sm text-cyan-300 hover:text-cyan-200"
          >
            <ArrowRight className="h-3.5 w-3.5" />
            Release notes
          </Link>
        </div>
      </article>
    </section>
  );
}
