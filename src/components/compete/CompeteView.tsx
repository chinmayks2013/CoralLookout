"use client";

import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { usePlatform } from "@/context/PlatformContext";
import { getEarnedBadges } from "@/lib/platform/badges";
import { getLeaderboardWithUser, getUserRank } from "@/lib/platform/leaderboard";
import { Flame, Medal, Award, AlertCircle } from "lucide-react";

export function CompeteView() {
  const { state, hydrated } = usePlatform();
  const badges = getEarnedBadges(state);
  const board = getLeaderboardWithUser(state);
  const rank = getUserRank(state);
  const earnedCount = badges.filter((b) => b.earned).length;

  if (!hydrated) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-12 text-center text-slate-400">
        Loading your progress...
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <PageHeader
        badge="Competition"
        title="Student Competition System"
        subtitle="Earn points, badges, rankings, and streaks — synced across Scanner, Academy, and Challenges."
      />

      {!state.profile && (
        <aside className="glass rounded-xl p-4 mb-8 flex items-start gap-3 border border-amber-500/30">
          <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-sm">
            <span className="text-amber-200 font-medium block">
              Create a profile to appear on the leaderboard with your name
            </span>
            <span className="text-slate-400 mt-1 block">
              <Link href="/community" className="text-cyan-300 underline">
                Register on Community
              </Link>{" "}
              — or scan reefs and complete lessons to earn points now.
            </span>
          </p>
        </aside>
      )}

      <section className="grid gap-4 grid-cols-2 sm:grid-cols-4 mb-12">
        {[
          { label: "Your Points", value: state.points.toLocaleString(), icon: Medal },
          {
            label: "Your rank",
            value: state.profile ? (rank ? `#${rank}` : "—") : "Register",
            icon: Award,
          },
          { label: "Day Streak", value: String(state.streak), icon: Flame },
          {
            label: "Badges Earned",
            value: `${earnedCount}/${badges.length}`,
            icon: Award,
          },
        ].map((stat) => (
          <article key={stat.label} className="glass rounded-2xl p-4 sm:p-6 text-center">
            <stat.icon className="h-6 w-6 sm:h-8 sm:w-8 text-cyan-400 mx-auto mb-2" />
            <p className="text-lg sm:text-2xl font-bold text-cyan-300">{stat.value}</p>
            <p className="text-xs sm:text-sm text-slate-400">{stat.label}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Medal className="h-5 w-5 text-amber-400" />
            Your leaderboard
          </h2>
          <p className="text-xs text-slate-500 mb-3">
            Only your real score is shown. Global rankings need a shared database.
          </p>
          <div className="glass rounded-2xl overflow-x-auto">
            {board.length === 0 ? (
              <p className="p-8 text-center text-slate-400 text-sm">
                <Link href="/community" className="text-cyan-300 underline">
                  Register on Community
                </Link>{" "}
                to track your rank and points.
              </p>
            ) : (
            <table className="w-full text-sm min-w-[400px]">
              <thead>
                <tr className="border-b border-cyan-500/20 text-slate-400">
                  <th className="p-4 text-left">Rank</th>
                  <th className="p-4 text-left">Student</th>
                  <th className="p-4 text-right">Points</th>
                  <th className="p-4 text-right hidden sm:table-cell">Streak</th>
                </tr>
              </thead>
              <tbody>
                {board.map((entry) => (
                  <tr
                    key={`${entry.rank}-${entry.name}`}
                    className={`border-b border-slate-800/50 ${
                      entry.isYou
                        ? "bg-cyan-500/10 ring-1 ring-cyan-500/30"
                        : "hover:bg-white/5"
                    }`}
                  >
                    <td className="p-4 font-bold text-cyan-300">#{entry.rank}</td>
                    <td className="p-4">
                      <p className="font-medium">
                        {entry.name}
                        {entry.isYou && (
                          <span className="ml-2 text-xs text-cyan-400">(You)</span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500">{entry.school}</p>
                    </td>
                    <td className="p-4 text-right font-semibold">
                      {entry.points.toLocaleString()}
                    </td>
                    <td className="p-4 text-right hidden sm:table-cell text-orange-400">
                      {entry.streak} day streak
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">Your Badges</h2>
          <p className="text-xs text-slate-500 mb-3">
            Badges unlock when you scan, learn, and complete challenges.
          </p>
          <section className="grid gap-3 sm:grid-cols-2">
            {badges.map((badge) => (
              <article
                key={badge.id}
                className={`glass rounded-xl p-4 ${
                  badge.earned ? "border border-teal-500/30" : "opacity-50 grayscale"
                }`}
              >
                <span className="text-2xl">{badge.icon}</span>
                <h3 className="font-semibold mt-2">{badge.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{badge.description}</p>
                {badge.earned && (
                  <span className="inline-block mt-2 text-xs text-teal-400 font-medium">
                    Earned
                  </span>
                )}
              </article>
            ))}
          </section>
        </section>
      </section>

      <p className="mt-8 text-center text-sm text-slate-500">
        +50 per scan · +100 per lesson · challenge bonuses on completion
      </p>
    </section>
  );
}
