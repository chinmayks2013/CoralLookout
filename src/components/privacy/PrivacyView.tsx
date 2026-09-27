"use client";

import Link from "next/link";
import {
  Camera,
  Database,
  GraduationCap,
  Images,
  Mail,
  School,
  Timer,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";

const SUPPORT_EMAIL = "schools@corallookout.org";

const SECTIONS = [
  {
    id: "what-we-collect",
    icon: Database,
    title: "What we collect",
    body: [
      "A display name, and optionally a school, region, bio, and tagline you choose to add to your profile.",
      "Reef scan results: the image you submit, the AI health estimate, confidence score, and an optional location pin.",
      "Basic activity: lessons completed, challenge progress, forum posts, and gallery submissions.",
      "We do not collect precise device location automatically — location pins are added manually by the student.",
    ],
  },
  {
    id: "student-accounts",
    icon: GraduationCap,
    title: "Student accounts",
    body: [
      "Students sign in and join a class using a teacher-issued join code — teachers cannot add students manually or see anything beyond what the platform shows.",
      "Student accounts do not require a home address, phone number, or payment information.",
      "Teachers see student display names, activity within their chapter, and export data for grading — not private messages or account credentials.",
    ],
  },
  {
    id: "gallery-image-rights",
    icon: Images,
    title: "Gallery & image rights",
    body: [
      "Sharing a scan to the public Reef Gallery is opt-in per scan, not automatic.",
      "Before publishing, we ask you to confirm you have the right to share the image.",
      "Gallery posts show the image, AI analysis, display name, and optional school/location — students and teachers can request removal at any time.",
    ],
  },
  {
    id: "school-chapter-data",
    icon: School,
    title: "School chapter data",
    body: [
      "School Chapter subscriptions add a roster, private leaderboard, and CSV export scoped to that chapter only.",
      "Chapter data (roster, leaderboard, insights) is visible to the teacher who created the chapter and is not shared with other schools.",
      "Billing information for paid chapters is processed by our payment provider — we do not store full card numbers.",
    ],
  },
  {
    id: "retention",
    icon: Timer,
    title: "Retention",
    body: [
      "We keep account and scan data for as long as the account is active so progress and history aren't lost.",
      "Teachers or students can request account or scan deletion at any time by emailing us — we will remove the data associated with that account.",
      "Deleted gallery posts are removed from public view promptly; underlying backups age out on our normal backup rotation.",
    ],
  },
] as const;

export function PrivacyView() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <PageHeader
        badge="For school procurement & families"
        title="Privacy & Student Data"
        subtitle="A plain-language summary of what Coral Lookout collects, why, and how schools stay in control. No legal jargon — ask us anything that's missing."
      />

      <div className="space-y-6 mb-14">
        {SECTIONS.map((section) => (
          <article
            key={section.id}
            id={section.id}
            className="glass rounded-2xl border border-cyan-500/15 p-6 sm:p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-300">
                <section.icon className="h-5 w-5" />
              </span>
              <h2 className="text-lg font-bold text-white">{section.title}</h2>
            </div>
            <ul className="space-y-2">
              {section.body.map((line) => (
                <li
                  key={line}
                  className="text-sm text-slate-400 leading-relaxed flex gap-2"
                >
                  <span className="text-teal-400/80 shrink-0">·</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <article
        id="contact"
        className="rounded-2xl bg-gradient-to-r from-cyan-600/30 via-teal-600/20 to-violet-600/30 border border-cyan-500/30 p-8 sm:p-10 text-center"
      >
        <Mail className="h-6 w-6 text-cyan-300 mx-auto mb-3" />
        <h2 className="text-xl font-bold mb-3">Questions for procurement?</h2>
        <p className="text-slate-300 max-w-xl mx-auto mb-6 text-sm leading-relaxed">
          If your district needs a data processing addendum, a specific
          answer for a procurement form, or anything not covered here, email
          us directly.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
              "Privacy / student data question"
            )}`}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-2.5 text-sm font-semibold text-slate-900"
          >
            <Mail className="h-4 w-4" />
            {SUPPORT_EMAIL}
          </a>
          <Link
            href="/schools"
            className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 px-6 py-2.5 text-sm font-medium text-cyan-300 hover:bg-cyan-500/10"
          >
            <Camera className="h-4 w-4" />
            Back to Schools
          </Link>
        </div>
      </article>
    </section>
  );
}
