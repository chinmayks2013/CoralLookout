"use client";

import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { usePlatform } from "@/context/PlatformContext";
import { getChallengesWithProgress } from "@/lib/platform/challenges";
import { Target, Trash2, Megaphone, Lightbulb } from "lucide-react";

const categoryIcons = {
  identify: Target,
  cleanup: Trash2,
  awareness: Megaphone,
  stem: Lightbulb,
};

const categoryColors = {
  identify: "from-cyan-500 to-teal-500",
  cleanup: "from-emerald-500 to-green-500",
  awareness: "from-violet-500 to-purple-500",
  stem: "from-amber-500 to-orange-500",
};

export function ChallengesView() {
  const {
    state,
    hydrated,
    markAwareness,
    markCleanup,
    markStem,
  } = usePlatform();
  const challenges = getChallengesWithProgress(state);

  function handleAction(challengeId: string) {
    switch (challengeId) {
      case "c2":
        markCleanup();
        break;
      case "c3":
        markAwareness();
        break;
      case "c4":
        markStem();
        break;
      default:
        break;
    }
  }

  function getActionLabel(challengeId: string, done: boolean) {
    if (done) return "Completed";
    switch (challengeId) {
      case "c1":
        return "Go to AI Scanner";
      case "c5":
        return "Go to Academy";
      case "c2":
        return "Log cleanup completed";
      case "c3":
        return "Mark awareness post shared";
      case "c4":
        return "Submit STEM concept";
      default:
        return "Continue";
    }
  }

  function handleClick(challengeId: string, done: boolean) {
    if (done) return;
    if (challengeId === "c1") {
      window.location.href = "/scanner";
      return;
    }
    if (challengeId === "c5") {
      window.location.href = "/academy";
      return;
    }
    const confirmed = window.confirm(
      "Confirm you completed this mission step? Points will be added to your profile."
    );
    if (confirmed) handleAction(challengeId);
  }

  if (!hydrated) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-12 text-center text-slate-400">
        Loading challenges...
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <PageHeader
        badge="Missions"
        title="Challenges & Missions"
        subtitle="Progress updates automatically from scans and lessons. Log manual missions when done."
      />

      <p className="text-sm text-slate-400 mb-6 text-center">
        Scan reefs at{" "}
        <Link href="/scanner" className="text-cyan-300 underline">
          AI Scanner
        </Link>{" "}
        to advance the Reef Condition challenge ({state.scans.length}/5).
      </p>

      <section className="grid gap-6 md:grid-cols-2">
        {challenges.map((challenge) => {
          const Icon = categoryIcons[challenge.category];
          const done = challenge.progress >= challenge.total;
          const progressPct = (challenge.progress / challenge.total) * 100;

          return (
            <article
              key={challenge.id}
              className={`glass rounded-2xl p-6 flex flex-col ${
                done ? "border border-teal-500/30" : ""
              }`}
            >
              <header className="flex items-start gap-4 mb-4">
                <span
                  className={`rounded-xl bg-gradient-to-br ${categoryColors[challenge.category]} p-3`}
                >
                  <Icon className="h-5 w-5 text-white" />
                </span>
                <span>
                  <h3 className="font-semibold text-lg">{challenge.title}</h3>
                  <p className="text-xs text-cyan-400 mt-1">
                    Due {challenge.deadline} · {challenge.points} pts
                  </p>
                </span>
              </header>
              <p className="text-slate-400 text-sm flex-1 mb-4">
                {challenge.description}
              </p>
              <footer>
                <p className="flex justify-between text-xs text-slate-400 mb-2">
                  <span>Progress</span>
                  <span>
                    {challenge.progress}/{challenge.total}
                  </span>
                </p>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden mb-4">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 transition-all"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <button
                  type="button"
                  disabled={done}
                  onClick={() => handleClick(challenge.id, done)}
                  className="w-full rounded-full border border-cyan-500/40 py-2 text-sm font-medium text-cyan-300 hover:bg-cyan-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {getActionLabel(challenge.id, done)}
                </button>
              </footer>
            </article>
          );
        })}
      </section>
    </section>
  );
}
