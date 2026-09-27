"use client";

import Link from "next/link";
import { Info, ArrowRight } from "lucide-react";
import { AI_TRUST } from "@/lib/data/ai-trust";

export function AiTrustPanel({
  confidence,
  modelVersion,
  compact = false,
}: {
  confidence?: number;
  modelVersion?: string | null;
  compact?: boolean;
}) {
  return (
    <aside className="rounded-xl border border-amber-500/25 bg-amber-950/20 p-4 sm:p-5">
      <div className="flex items-start gap-2 mb-3">
        <Info className="h-4 w-4 text-amber-300 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-100">{AI_TRUST.title}</p>
          {confidence != null && (
            <p className="text-xs text-slate-400 mt-1">
              Model confidence on this scan:{" "}
              <span className="text-amber-200 font-medium">{confidence}%</span>
              {modelVersion ? (
                <>
                  {" "}
                  · pipeline <span className="font-mono text-slate-500">{modelVersion}</span>
                </>
              ) : null}
            </p>
          )}
        </div>
      </div>

      {!compact && (
        <div className="grid gap-4 sm:grid-cols-2 mb-4">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-teal-400/90 mb-1.5 font-semibold">
              Does
            </p>
            <ul className="space-y-1.5">
              {AI_TRUST.does.map((item) => (
                <li key={item} className="text-xs text-slate-300 leading-relaxed">
                  · {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-rose-300/90 mb-1.5 font-semibold">
              Does not claim
            </p>
            <ul className="space-y-1.5">
              {AI_TRUST.doesNot.map((item) => (
                <li key={item} className="text-xs text-slate-300 leading-relaxed">
                  · {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="mb-3">
        <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-2 font-semibold">
          Pipeline in plain language
        </p>
        <ol className="grid gap-1.5 sm:grid-cols-2">
          {AI_TRUST.buyerFriendlySteps.map((step, i) => (
            <li key={step.id} className="text-xs text-slate-400 leading-relaxed">
              <span className="text-cyan-300 font-medium">
                {i + 1}. {step.label}
              </span>
              {" — "}
              {step.plain}
            </li>
          ))}
        </ol>
      </div>

      <Link
        href={AI_TRUST.methodologyHref}
        className="inline-flex items-center gap-1 text-xs font-medium text-cyan-300 hover:text-cyan-200"
      >
        Methodology & honesty notes
        <ArrowRight className="h-3 w-3" />
      </Link>
    </aside>
  );
}
