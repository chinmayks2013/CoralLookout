"use client";

import { useCallback, useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  KeyRound,
  Trophy,
  Users,
  Loader2,
  Sparkles,
  Scan,
  MessageSquare,
  Images,
  Coins,
} from "lucide-react";
import { usePlatform } from "@/context/PlatformContext";
import { joinSchoolChapter, fetchStudentClass } from "@/lib/school/cloud";
import type { ChapterLeaderboardEntry, SchoolRosterMember } from "@/lib/school/types";
import { safeNumber } from "@/lib/platform/numbers";

export function StudentClassView() {
  const router = useRouter();
  const { state, hydrated, dispatch } = usePlatform();
  const [loading, setLoading] = useState(true);
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  const [chapterName, setChapterName] = useState<string | null>(null);
  const [schoolTagline, setSchoolTagline] = useState<string | null>(null);
  const [classActive, setClassActive] = useState(true);
  const [classmates, setClassmates] = useState<SchoolRosterMember[]>([]);
  const [leaderboard, setLeaderboard] = useState<ChapterLeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState(0);
  const [myStats, setMyStats] = useState<ChapterLeaderboardEntry | null>(null);

  const enrolled = Boolean(chapterName);

  const load = useCallback(async () => {
    if (!state.userId) return;
    setError(null);
    const data = await fetchStudentClass(state.userId);
    if (data.enrolled && data.chapter) {
      setChapterName(data.chapter.schoolName);
      setSchoolTagline(data.chapter.brandingTagline);
      setClassActive(data.classActive !== false);
      setClassmates(data.classmates ?? []);
      setLeaderboard(data.leaderboard ?? []);
      setMyRank(data.myRank ?? 0);
      setMyStats(data.myStats ?? null);
      dispatch({
        type: "SET_SCHOOL_CHAPTER",
        chapterId: data.chapter.id,
        role: "student",
      });
    } else {
      setChapterName(null);
    }
  }, [state.userId, dispatch]);

  useEffect(() => {
    if (!hydrated) return;
    if (!state.profile || !state.userId) {
      setLoading(false);
      return;
    }
    void load().finally(() => setLoading(false));
  }, [hydrated, state.profile, state.userId, load]);

  async function onJoin(e: FormEvent) {
    e.preventDefault();
    if (!state.profile || !state.userId || !joinCode.trim()) return;
    setJoining(true);
    setError(null);
    try {
      const { chapter } = await joinSchoolChapter({
        joinCode: joinCode.trim(),
        userId: state.userId,
        displayName: state.profile.name,
        email: state.profile.email,
      });
      dispatch({
        type: "SET_SCHOOL_CHAPTER",
        chapterId: chapter.id,
        role: "student",
      });
      await load();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not join class");
    } finally {
      setJoining(false);
    }
  }

  if (!hydrated || loading) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-16 text-center text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3" />
        Loading…
      </section>
    );
  }

  if (!state.profile || !state.userId) {
    return (
      <section className="mx-auto max-w-md px-4 py-16 text-center">
        <GraduationCap className="h-12 w-12 text-teal-400 mx-auto mb-4" />
        <h1 className="text-xl font-bold mb-2">Join your class</h1>
        <p className="text-slate-400 text-sm mb-6">
          Log in with a Coral Enthusiast profile first, then enter your teacher&apos;s
          class code.
        </p>
        <Link
          href="/community"
          className="inline-flex rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-2.5 text-sm font-semibold text-slate-900"
        >
          Join community
        </Link>
      </section>
    );
  }

  if (!enrolled) {
    return (
      <section className="mx-auto max-w-md px-4 py-10 sm:py-14">
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-teal-500/15 border border-teal-500/30 px-3 py-1 text-xs font-semibold text-teal-300 mb-4">
            <KeyRound className="h-3.5 w-3.5" />
            Student
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Join your class</h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Your teacher will give you a class code. Enter it after you sign in — only
            students join this way; teachers cannot add you manually.
          </p>
        </div>

        <form
          onSubmit={(e) => void onJoin(e)}
          className="glass rounded-2xl p-6 border border-teal-500/20 space-y-4"
        >
          <label className="block text-sm font-medium text-slate-300">
            Class code
          </label>
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="e.g. AB12CD34"
            maxLength={12}
            autoComplete="off"
            className="w-full rounded-xl bg-slate-900/60 border border-cyan-500/25 px-4 py-3.5 text-center text-lg font-mono tracking-[0.2em] uppercase text-cyan-200"
          />
          {error && (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={joining || !joinCode.trim()}
            className="w-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 py-3 font-semibold text-slate-900 disabled:opacity-50"
          >
            {joining ? "Joining…" : "Join class"}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          Teacher?{" "}
          <Link href="/teacher" className="text-cyan-300 underline">
            Open teacher dashboard
          </Link>
        </p>
      </section>
    );
  }

  const others = classmates.filter((c) => c.userId !== state.userId);

  return (
    <section className="mx-auto max-w-5xl px-3 py-8 sm:px-6 sm:py-10 min-w-0">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-400 mb-1">
          My class
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold">{chapterName}</h1>
        {schoolTagline && (
          <p className="text-slate-400 text-sm mt-1">{schoolTagline}</p>
        )}
        {myStats && (
          <div className="mt-4 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/15 border border-teal-500/25 px-3 py-1 text-sm text-teal-200">
              <Trophy className="h-4 w-4" />
              Rank #{myRank || "—"} of {leaderboard.length || classmates.length}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 text-sm text-cyan-200">
              <Sparkles className="h-4 w-4" />
              {myStats.score} engagement pts
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 border border-slate-600 px-3 py-1 text-sm text-slate-300">
              <Coins className="h-4 w-4 text-teal-400" />
              {safeNumber(state.corals)} corals
            </span>
          </div>
        )}
      </header>

      {!classActive && (
        <aside className="mb-6 rounded-xl border border-amber-500/30 bg-amber-950/25 px-4 py-3 text-sm text-amber-100">
          Your class hub will show the full leaderboard once your teacher activates
          the School Chapter.
        </aside>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        <article className="lg:col-span-2 glass rounded-xl p-5 border border-cyan-500/15">
          <h2 className="font-semibold flex items-center gap-2 mb-4">
            <Users className="h-4 w-4 text-cyan-400" />
            Classmates ({others.length})
          </h2>
          {others.length === 0 ? (
            <p className="text-sm text-slate-500">
              You&apos;re the first one here — invite friends with the class code from
              your teacher.
            </p>
          ) : (
            <ul className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {others.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center gap-3 rounded-lg bg-slate-900/40 px-3 py-2"
                >
                  <span className="h-9 w-9 rounded-full bg-gradient-to-br from-cyan-500/40 to-teal-500/40 flex items-center justify-center text-xs font-bold text-teal-100">
                    {m.displayName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                  <span className="text-sm font-medium truncate">{m.displayName}</span>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="lg:col-span-3 glass rounded-xl p-5 border border-cyan-500/15">
          <h2 className="font-semibold flex items-center gap-2 mb-4">
            <Trophy className="h-4 w-4 text-amber-400" />
            Class leaderboard
          </h2>
          {!classActive ? (
            <p className="text-sm text-slate-500">Leaderboard unlocks with your class.</p>
          ) : leaderboard.length === 0 ? (
            <p className="text-sm text-slate-500">
              Post in the gallery or forum to climb the board — scans and comments count.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-500 uppercase">
                    <th className="pb-2 pr-3">#</th>
                    <th className="pb-2 pr-3">Name</th>
                    <th className="pb-2 pr-3">Posts</th>
                    <th className="pb-2 pr-3">Views</th>
                    <th className="pb-2">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry, i) => {
                    const isMe = entry.userId === state.userId;
                    return (
                      <tr
                        key={entry.userId}
                        className={`border-t border-cyan-500/10 ${
                          isMe ? "bg-teal-500/10" : ""
                        }`}
                      >
                        <td className="py-2.5 pr-3 text-slate-500">{i + 1}</td>
                        <td className="py-2.5 pr-3 font-medium">
                          {entry.displayName}
                          {isMe && (
                            <span className="ml-2 text-[10px] uppercase text-teal-400">
                              you
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 pr-3">{entry.postCount}</td>
                        <td className="py-2.5 pr-3">{entry.totalViews}</td>
                        <td className="py-2.5 text-teal-300 font-semibold">
                          {entry.score}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </article>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/scanner"
          className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 px-4 py-2 text-sm text-cyan-300 hover:bg-cyan-500/10"
        >
          <Scan className="h-4 w-4" />
          Reef scan
        </Link>
        <Link
          href="/gallery"
          className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 px-4 py-2 text-sm text-cyan-300 hover:bg-cyan-500/10"
        >
          <Images className="h-4 w-4" />
          Gallery
        </Link>
        <Link
          href="/forum"
          className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 px-4 py-2 text-sm text-cyan-300 hover:bg-cyan-500/10"
        >
          <MessageSquare className="h-4 w-4" />
          Forum
        </Link>
      </div>
    </section>
  );
}
