"use client";

import { CheckCircle2, Circle, Loader2, XCircle } from "lucide-react";
import type { PipelineStepTrace } from "@/lib/pipeline/types";

const STEP_LABELS: Record<string, string> = {
  ingest: "Ingest",
  preprocess: "Preprocess",
  validate: "AI reef check",
  classify: "Classify",
  localize: "Localize",
  conserve: "Conserve",
  trace: "W&B trace",
};

interface PipelineProgressProps {
  steps: PipelineStepTrace[];
  active?: boolean;
  modelVersion?: string;
  wandbRunUrl?: string;
}

export function PipelineProgress({
  steps,
  active,
  modelVersion,
  wandbRunUrl,
}: PipelineProgressProps) {
  if (steps.length === 0 && !active) return null;

  return (
    <aside className="rounded-xl border border-violet-500/25 bg-violet-950/20 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-violet-300">
          Coral-saving pipeline
        </p>
        {modelVersion && (
          <span className="text-[10px] text-slate-500 font-mono">{modelVersion}</span>
        )}
      </div>
      <ol className="space-y-2">
        {(active && steps.length === 0
          ? ["ingest", "preprocess", "validate", "classify", "localize", "conserve", "trace"]
          : steps.map((s) => s.id)
        ).map((id, i) => {
          const step = steps.find((s) => s.id === id);
          const label = STEP_LABELS[id] ?? id;
          return (
            <li key={id} className="flex items-center gap-2 text-sm">
              {step?.status === "ok" ? (
                <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0" />
              ) : step?.status === "error" ? (
                <XCircle className="h-4 w-4 text-red-400 shrink-0" />
              ) : active && i >= steps.length ? (
                <Loader2 className="h-4 w-4 text-violet-400 animate-spin shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-slate-600 shrink-0" />
              )}
              <span
                className={
                  step?.status === "ok"
                    ? "text-slate-200"
                    : step?.status === "error"
                      ? "text-red-300"
                      : "text-slate-400"
                }
              >
                {label}
                {step?.durationMs != null && (
                  <span className="text-slate-500 ml-1.5 text-xs">
                    {step.durationMs}ms
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ol>
      {wandbRunUrl && (
        <a
          href={wandbRunUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-xs text-violet-300 hover:underline"
        >
          View traces in Weights & Biases →
        </a>
      )}
    </aside>
  );
}
