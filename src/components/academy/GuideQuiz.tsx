"use client";

import { useState } from "react";
import type { GuideLesson } from "@/lib/academy/types";

interface GuideQuizProps {
  lesson: GuideLesson;
  passThreshold: number;
  onSubmit: (
    answers: Record<number, number>
  ) => Promise<{ score: number; passed: boolean; correct: number; total: number }>;
  onClose: (passed: boolean) => void;
}

export function GuideQuiz({ lesson, passThreshold, onSubmit, onClose }: GuideQuizProps) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    score: number;
    passed: boolean;
    correct: number;
    total: number;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (Object.keys(answers).length < lesson.quiz.length) {
      setError("Answer every question before submitting.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const graded = await onSubmit(answers);
      setResult(graded);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not submit quiz");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    const pct = Math.round(result.score * 100);
    return (
      <div className="space-y-4">
        <div
          className={`rounded-xl p-4 ${
            result.passed
              ? "bg-teal-500/15 border border-teal-500/30"
              : "bg-amber-500/10 border border-amber-500/30"
          }`}
        >
          <p className="text-lg font-bold">
            {result.passed ? "Passed!" : "Not quite — try again"}
          </p>
          <p className="text-sm text-slate-300 mt-1">
            Score: {result.correct}/{result.total} ({pct}%) — need{" "}
            {Math.round(passThreshold * 100)}% to pass
          </p>
        </div>
        <button
          type="button"
          onClick={() => onClose(result.passed)}
          className="w-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 py-3 font-semibold text-slate-900"
        >
          {result.passed ? "Continue" : "Review video & retry"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">
        Quick check — score {Math.round(passThreshold * 100)}% or higher to pass.
      </p>
      {lesson.quiz.map((q, qi) => (
        <fieldset key={qi} className="rounded-xl border border-slate-700/60 p-4">
          <legend className="text-sm font-medium px-1 mb-2">
            {qi + 1}. {q.question}
          </legend>
          <div className="space-y-2">
            {q.options.map((opt, oi) => (
              <label
                key={oi}
                className="flex items-center gap-2 text-sm cursor-pointer rounded-lg px-2 py-1.5 hover:bg-slate-800/60"
              >
                <input
                  type="radio"
                  name={`guide-q-${lesson.id}-${qi}`}
                  checked={answers[qi] === oi}
                  onChange={() =>
                    setAnswers((prev) => ({ ...prev, [qi]: oi }))
                  }
                  className="accent-cyan-500"
                />
                {opt}
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 py-3 font-semibold text-slate-900 disabled:opacity-40"
      >
        {submitting ? "Grading…" : "Submit quiz"}
      </button>
    </div>
  );
}
