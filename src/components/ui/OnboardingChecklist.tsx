"use client";

import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";
import {
  STUDENT_CHECKLIST,
  TEACHER_CHECKLIST,
} from "@/lib/data/onboarding";
import { getCohort } from "@/lib/data/cohorts";

export function OnboardingChecklist({
  role,
  cohortId,
  completedIds = [],
}: {
  role: "teacher" | "student";
  cohortId?: string | null;
  completedIds?: string[];
}) {
  const items = role === "teacher" ? TEACHER_CHECKLIST : STUDENT_CHECKLIST;
  const cohort = getCohort(cohortId);

  return (
    <aside className="rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-5">
      <h3 className="text-sm font-semibold text-cyan-100 mb-1">
        {role === "teacher" ? "Teacher onboarding" : "Student quick start"}
      </h3>
      {cohort && (
        <p className="text-xs text-teal-300/90 mb-3 leading-relaxed">
          <span className="font-semibold">{cohort.welcomeTitle}</span>
          {" — "}
          {cohort.welcomeBody}
        </p>
      )}
      {!cohort && (
        <p className="text-xs text-slate-400 mb-3">
          Complete these steps to get your first reef observation into the
          classroom workflow.
        </p>
      )}
      <ol className="space-y-2.5">
        {items.map((item) => {
          const done = completedIds.includes(item.id);
          return (
            <li key={item.id} className="flex gap-2.5">
              {done ? (
                <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
              ) : (
                <Circle className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
              )}
              <div className="min-w-0">
                <Link
                  href={item.href}
                  className={`text-sm font-medium hover:underline ${
                    done ? "text-slate-400 line-through" : "text-white"
                  }`}
                >
                  {item.title}
                </Link>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {item.detail}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
