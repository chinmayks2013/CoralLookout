"use client";

import Link from "next/link";
import type { ConservationPlan } from "@/lib/pipeline/types";
import { AlertTriangle, ArrowRight } from "lucide-react";

const URGENCY_STYLE: Record<
  ConservationPlan["urgency"],
  { label: string; className: string }
> = {
  low: { label: "Low urgency", className: "bg-teal-500/15 text-teal-300 border-teal-500/30" },
  medium: {
    label: "Monitor closely",
    className: "bg-amber-500/15 text-amber-200 border-amber-500/30",
  },
  high: {
    label: "High priority",
    className: "bg-orange-500/15 text-orange-200 border-orange-500/30",
  },
  critical: {
    label: "Critical — act now",
    className: "bg-red-500/15 text-red-200 border-red-500/30",
  },
};

export function ConservationPlanCard({ plan }: { plan: ConservationPlan }) {
  const style = URGENCY_STYLE[plan.urgency];

  return (
    <section className="rounded-xl border border-cyan-500/20 bg-slate-900/40 p-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold flex items-center gap-2 text-cyan-200">
            <AlertTriangle className="h-4 w-4" />
            Conservation orchestrator
          </h3>
          <p className="text-sm text-slate-400 mt-1">{plan.summary}</p>
        </div>
        <span
          className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${style.className}`}
        >
          {style.label} · {plan.priorityScore}
        </span>
      </div>

      <ol className="space-y-2">
        {plan.actions.map((action) => (
          <li key={action.order}>
            <Link
              href={action.href}
              className="group flex items-start gap-3 rounded-lg border border-slate-700/80 bg-slate-950/40 px-3 py-2.5 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-colors"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-xs font-bold text-violet-200">
                {action.order}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium group-hover:text-cyan-200">
                  {action.title}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{action.detail}</p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-slate-600 group-hover:text-cyan-400 mt-0.5" />
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
