"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Camera,
  KeyRound,
  LogIn,
  Printer,
  Users,
  Waves,
} from "lucide-react";
import { usePlatform } from "@/context/PlatformContext";
import { fetchTeacherChapter } from "@/lib/school/cloud";
import type { SchoolChapter } from "@/lib/school/types";

const STEPS = [
  {
    icon: LogIn,
    title: "1. Sign in",
    body: "Go to corallookout.org and sign in (or create a free account).",
  },
  {
    icon: Users,
    title: "2. Open “My Class”",
    body: "From the menu, open My Class (or go to /class directly).",
  },
  {
    icon: KeyRound,
    title: "3. Enter the join code",
    body: "Type in the join code below exactly as shown, then submit.",
  },
  {
    icon: Camera,
    title: "4. Open the scanner",
    body: "Go to the AI Reef Scanner and scan your first reef image for class.",
  },
];

export function JoinGuideView() {
  const { state, hydrated } = usePlatform();
  const [chapter, setChapter] = useState<SchoolChapter | null>(null);
  const [loading, setLoading] = useState(true);

  const loadChapter = useCallback(async () => {
    if (!state.userId) {
      setLoading(false);
      return;
    }
    try {
      const { chapter: ch } = await fetchTeacherChapter(state.userId);
      setChapter(ch);
    } finally {
      setLoading(false);
    }
  }, [state.userId]);

  useEffect(() => {
    if (!hydrated) return;
    void loadChapter();
  }, [hydrated, loadChapter]);

  const schoolName = chapter?.schoolName ?? "_______________________";
  const joinCode = chapter?.joinCode ?? "_ _ _ _ _ _";
  const isRealChapter = Boolean(chapter);

  return (
    <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 print:max-w-none print:px-0 print:py-0">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8 print:hidden">
        <Link
          href="/teacher"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-cyan-300 hover:text-cyan-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to teacher dashboard
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-900"
        >
          <Printer className="h-4 w-4" />
          Print this page
        </button>
      </div>

      <article className="glass rounded-2xl border border-cyan-500/20 p-6 sm:p-10 print:rounded-none print:border-0 print:bg-transparent print:p-0 print:shadow-none">
        <div className="flex items-center gap-2 mb-2 text-cyan-400 print:text-slate-900">
          <Waves className="h-6 w-6" />
          <span className="font-bold text-lg gradient-text print:text-slate-900 print:bg-none">
            Coral Lookout
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 print:text-black">
          Join our reef class
        </h1>
        <p className="text-sm text-slate-400 mb-8 print:text-slate-700">
          {loading
            ? "Loading your chapter…"
            : isRealChapter
              ? "Print and hand this out, or share it digitally with students."
              : "Generic template — fill in your school name and join code by hand, or sign in on the teacher dashboard to auto-fill them."}
        </p>

        <div className="grid gap-3 sm:grid-cols-2 mb-8">
          <div className="rounded-xl border border-cyan-500/20 bg-slate-950/30 p-4 print:border-slate-400 print:bg-transparent">
            <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-1 print:text-slate-600">
              School / class name
            </p>
            <p className="text-lg font-semibold text-white print:text-black">
              {schoolName}
            </p>
          </div>
          <div className="rounded-xl border border-cyan-500/20 bg-slate-950/30 p-4 print:border-slate-400 print:bg-transparent">
            <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-1 print:text-slate-600">
              Join code
            </p>
            <p className="text-2xl font-mono font-bold tracking-widest text-cyan-300 print:text-black">
              {joinCode}
            </p>
          </div>
        </div>

        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400 mb-4 print:text-slate-700">
          Steps for students
        </h2>
        <ol className="space-y-4 mb-8">
          {STEPS.map((step) => (
            <li key={step.title} className="flex gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-500/15 text-cyan-300 print:border print:border-slate-400 print:bg-transparent print:text-black">
                <step.icon className="h-4 w-4" />
              </span>
              <div>
                <p className="font-medium text-white print:text-black">{step.title}</p>
                <p className="text-sm text-slate-400 print:text-slate-700">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <p className="text-xs text-slate-500 print:text-slate-600">
          Questions? Ask your teacher, or visit corallookout.org/pilot for the
          full student quick start.
        </p>
      </article>
    </section>
  );
}
