"use client";

import { BarChart3, BookOpen, Brain, MessageSquare, Scan } from "lucide-react";
import type { ChapterInsights } from "@/lib/school/types";
import { getHealthColor, getHealthLabel } from "@/lib/scanner/analyze";

interface TeacherInsightsPanelProps {
  insights: ChapterInsights | null;
  loading: boolean;
}

export function TeacherInsightsPanel({
  insights,
  loading,
}: TeacherInsightsPanelProps) {
  if (loading) {
    return (
      <p className="text-sm text-slate-400 py-8 text-center">
        Loading learning insights…
      </p>
    );
  }

  if (!insights) {
    return (
      <p className="text-sm text-slate-500 py-8 text-center">
        Could not load insights.
      </p>
    );
  }

  if (insights.rosterSize === 0) {
    return (
      <p className="text-sm text-slate-500 py-6">
        Share your join code — insights appear once students join and scan reefs,
        complete Reef Academy, or post in the forum.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-violet-500/25 bg-violet-950/20 p-5">
        <h3 className="text-sm font-bold text-violet-200 mb-3 flex items-center gap-2">
          <Brain className="h-4 w-4 shrink-0" />
          Class summary
        </h3>
        <ul className="space-y-2">
          {insights.narrativeBullets.map((line, i) => (
            <li key={i} className="text-sm text-slate-200 leading-relaxed">
              {line}
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={Scan}
          label="Scans this week"
          value={String(insights.scansThisWeek)}
          sub={
            insights.mildStressChangePercent !== null
              ? `Mild stress ${insights.mildStressChangePercent > 0 ? "+" : ""}${insights.mildStressChangePercent}% vs last week`
              : `${insights.scansPriorWeek} scans prior week`
          }
        />
        <StatCard
          icon={BookOpen}
          label="Academy complete"
          value={`${insights.academyCompletionRate}%`}
          sub="Both Reef Academy lessons passed"
        />
        <StatCard
          icon={BarChart3}
          label="Students in class"
          value={String(insights.rosterSize)}
          sub="Active roster"
        />
      </div>

      {insights.healthThisWeek.total > 0 && (
        <section className="rounded-xl border border-cyan-500/15 p-4">
          <h3 className="text-sm font-semibold mb-3">Health classification this week</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {(
              [
                "healthy",
                "mild_stress",
                "bleaching",
                "severe_damage",
              ] as const
            ).map((health) => {
              const count = insights.healthThisWeek[health];
              if (count === 0) return null;
              return (
                <div
                  key={health}
                  className="flex items-center justify-between rounded-lg bg-slate-900/50 px-3 py-2 text-sm"
                >
                  <span style={{ color: getHealthColor(health) }}>
                    {getHealthLabel(health)}
                  </span>
                  <span className="font-semibold text-slate-200">{count}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {insights.lessonMastery.length > 0 && (
        <section className="rounded-xl border border-emerald-500/15 p-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-emerald-300">
            <BookOpen className="h-4 w-4" />
            Reef Academy mastery
          </h3>
          <ul className="space-y-2">
            {insights.lessonMastery.map((lesson) => (
              <li
                key={lesson.lessonId}
                className="rounded-lg bg-slate-900/40 px-3 py-2 text-sm"
              >
                <p className="font-medium text-slate-200">{lesson.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {lesson.passRate}% passed · avg quiz{" "}
                  {Math.round(lesson.avgScore * 100)}% · {lesson.studentsAttempted}{" "}
                  attempted
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {insights.conceptMastery.some((c) => c.studentsWithEvidence > 0) && (
        <section className="rounded-xl border border-cyan-500/15 p-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-cyan-300">
            <MessageSquare className="h-4 w-4" />
            Forum concept vocabulary
          </h3>
          <ul className="space-y-2">
            {insights.conceptMastery
              .filter((c) => c.studentsWithEvidence > 0)
              .map((concept) => (
                <li
                  key={concept.conceptId}
                  className="flex items-center justify-between gap-3 text-sm rounded-lg bg-slate-900/40 px-3 py-2"
                >
                  <span className="text-slate-300">{concept.label}</span>
                  <span className="font-semibold text-teal-300 shrink-0">
                    {concept.percent}%
                  </span>
                </li>
              ))}
          </ul>
          <p className="text-[11px] text-slate-500 mt-2">
            % of students who used this concept in forum posts or comments.
          </p>
        </section>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: typeof Scan;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <article className="rounded-xl border border-slate-700/60 bg-slate-900/40 p-4">
      <Icon className="h-4 w-4 text-cyan-400 mb-2" />
      <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
      <p className="text-[11px] text-slate-400 mt-1">{sub}</p>
    </article>
  );
}
