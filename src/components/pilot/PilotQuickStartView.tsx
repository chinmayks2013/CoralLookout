"use client";

import Link from "next/link";
import {
  ArrowRight,
  Camera,
  MapPin,
  School,
  Users,
  BookOpen,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { OnboardingChecklist } from "@/components/ui/OnboardingChecklist";
import { BOOK_PILOT_MAILTO } from "@/lib/data/cohorts";

export function PilotQuickStartView() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <PageHeader
        badge="Puerto Rico & Caribbean pilots"
        title="Student quick start"
        subtitle="Join your chapter, scan a reef image, pin a location, and optionally share to the gallery — in under 10 minutes."
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] mb-12">
        <div className="space-y-4">
          <article className="glass rounded-xl border border-cyan-500/15 p-5">
            <h2 className="font-semibold text-white mb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-cyan-400" />
              Three steps
            </h2>
            <ol className="space-y-3 text-sm text-slate-300">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-bold text-cyan-300">
                  1
                </span>
                <span>
                  Sign in, open{" "}
                  <Link href="/class" className="text-cyan-300 underline">
                    My Class
                  </Link>
                  , and enter your teacher&apos;s join code.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-bold text-cyan-300">
                  2
                </span>
                <span>
                  Go to the{" "}
                  <Link href="/scanner" className="text-cyan-300 underline">
                    Scanner
                  </Link>
                  . Drop a reef photo (from your files or the web).
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-bold text-cyan-300">
                  3
                </span>
                <span>
                  Pin a location, save the scan, and share to the gallery if your
                  assignment asks for it.
                </span>
              </li>
            </ol>
          </article>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/class"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-900"
            >
              <Users className="h-4 w-4" />
              Join class
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/scanner"
              className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 px-5 py-2.5 text-sm font-medium text-cyan-300 hover:bg-cyan-500/10"
            >
              <Camera className="h-4 w-4" />
              Open scanner
            </Link>
            <Link
              href="/map?cohort=puerto-rico"
              className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 px-5 py-2.5 text-sm font-medium text-cyan-300 hover:bg-cyan-500/10"
            >
              <MapPin className="h-4 w-4" />
              Puerto Rico map
            </Link>
          </div>
        </div>

        <OnboardingChecklist role="student" cohortId="puerto-rico" />
      </div>

      <article className="rounded-2xl border border-teal-500/25 bg-teal-950/30 p-6 text-center">
        <School className="h-6 w-6 text-teal-300 mx-auto mb-2" />
        <h2 className="text-lg font-bold mb-2">Teachers & partners</h2>
        <p className="text-sm text-slate-400 max-w-lg mx-auto mb-4">
          Need a printable join guide, roster tools, or a founding school price?
          Start on the teacher dashboard or book a pilot.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/teacher"
            className="inline-flex items-center gap-2 rounded-full border border-teal-400/40 px-5 py-2 text-sm font-medium text-teal-200 hover:bg-teal-500/10"
          >
            Teacher dashboard
          </Link>
          <Link
            href="/schools"
            className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 px-5 py-2 text-sm font-medium text-cyan-300 hover:bg-cyan-500/10"
          >
            Schools overview
          </Link>
          <a
            href={BOOK_PILOT_MAILTO}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 px-5 py-2 text-sm font-semibold text-slate-900"
          >
            Book a pilot
          </a>
        </div>
      </article>
    </section>
  );
}
