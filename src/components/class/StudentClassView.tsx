"use client";

import { useCallback, useEffect, useMemo, useState, FormEvent } from "react";
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
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MapPin,
  Camera,
} from "lucide-react";
import { usePlatform } from "@/context/PlatformContext";
import { useAuth } from "@/context/AuthContext";
import { joinSchoolChapter, fetchStudentClass } from "@/lib/school/cloud";
import type {
  AssignmentCompletionDto,
  SchoolAssignmentDto,
} from "@/lib/school/cloud";
import type { ChapterLeaderboardEntry, SchoolRosterMember } from "@/lib/school/types";
import { safeNumber } from "@/lib/platform/numbers";
import { OnboardingChecklist } from "@/components/ui/OnboardingChecklist";

type ClassTab = "work" | "people" | "leaderboard";

const ACCENT_BORDER: Record<string, string> = {
  cyan: "border-cyan-500/30",
  teal: "border-teal-500/30",
  violet: "border-violet-500/30",
  amber: "border-amber-500/30",
};

const ACCENT_CHIP: Record<string, string> = {
  cyan: "bg-cyan-500/15 border-cyan-500/25 text-cyan-200",
  teal: "bg-teal-500/15 border-teal-500/25 text-teal-200",
  violet: "bg-violet-500/15 border-violet-500/25 text-violet-200",
  amber: "bg-amber-500/15 border-amber-500/25 text-amber-200",
};

function dueMeta(dueAt: string | null): {
  label: string;
  tone: "overdue" | "soon" | "ok" | "none";
} {
  if (!dueAt) return { label: "No due date", tone: "none" };
  const due = new Date(dueAt);
  if (Number.isNaN(due.getTime())) return { label: "No due date", tone: "none" };
  const now = Date.now();
  const diffMs = due.getTime() - now;
  const dayMs = 24 * 60 * 60 * 1000;
  const formatted = due.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  if (diffMs < 0) return { label: `Overdue · was ${formatted}`, tone: "overdue" };
  if (diffMs < 2 * dayMs) return { label: `Due soon · ${formatted}`, tone: "soon" };
  return { label: `Due ${formatted}`, tone: "ok" };
}

export function StudentClassView() {
  const router = useRouter();
  const { state, hydrated, dispatch } = usePlatform();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [tab, setTab] = useState<ClassTab>("work");

  const [chapterName, setChapterName] = useState<string | null>(null);
  const [schoolTagline, setSchoolTagline] = useState<string | null>(null);
  const [brandingAccent, setBrandingAccent] = useState("cyan");
  const [classActive, setClassActive] = useState(true);
  const [classmates, setClassmates] = useState<SchoolRosterMember[]>([]);
  const [leaderboard, setLeaderboard] = useState<ChapterLeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState(0);
  const [myStats, setMyStats] = useState<ChapterLeaderboardEntry | null>(null);
  const [assignments, setAssignments] = useState<SchoolAssignmentDto[]>([]);
  const [myCompletions, setMyCompletions] = useState<AssignmentCompletionDto[]>(
    []
  );

  const enrolled = Boolean(chapterName);

  const load = useCallback(async () => {
    if (!state.userId) return;
    setError(null);
    const data = await fetchStudentClass(state.userId);
    if (data.enrolled && data.chapter) {
      setChapterName(data.chapter.schoolName);
      setSchoolTagline(data.chapter.brandingTagline);
      setBrandingAccent(data.chapter.brandingAccent || "cyan");
      setClassActive(data.classActive !== false);
      setClassmates(data.classmates ?? []);
      setLeaderboard(data.leaderboard ?? []);
      setMyRank(data.myRank ?? 0);
      setMyStats(data.myStats ?? null);
      setAssignments(data.assignments ?? []);
      setMyCompletions(data.myCompletions ?? []);
      dispatch({
        type: "SET_SCHOOL_CHAPTER",
        chapterId: data.chapter.id,
        role: "student",
      });
    } else {
      setChapterName(null);
      setAssignments([]);
      setMyCompletions([]);
    }
  }, [state.userId, dispatch]);

  useEffect(() => {
    if (!hydrated) return;
    if (!state.userId || !state.profile?.name?.trim()) {
      setLoading(false);
      return;
    }
    void load().finally(() => setLoading(false));
  }, [hydrated, state.profile?.name, state.userId, load]);

  async function onJoin(e: FormEvent) {
    e.preventDefault();
    if (!state.profile?.name?.trim() || !state.userId || !joinCode.trim()) return;
    setJoining(true);
    setError(null);
    try {
      const { chapter } = await joinSchoolChapter({
        joinCode: joinCode.trim(),
        userId: state.userId,
        displayName: state.profile.name,
        email: state.profile.email ?? user?.email ?? "",
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

  const completedIds = useMemo(() => {
    const ids = new Set<string>();
    if (enrolled) ids.add("join");
    if (myCompletions.length > 0) {
      ids.add("scan");
      ids.add("pin");
    }
    return Array.from(ids);
  }, [enrolled, myCompletions.length]);

  const doneIds = useMemo(
    () => new Set(myCompletions.map((c) => c.assignmentId)),
    [myCompletions]
  );

  const todoCount = assignments.filter((a) => !doneIds.has(a.id)).length;
  const doneCount = assignments.filter((a) => doneIds.has(a.id)).length;

  const sortedAssignments = useMemo(() => {
    return [...assignments].sort((a, b) => {
      const aDone = doneIds.has(a.id) ? 1 : 0;
      const bDone = doneIds.has(b.id) ? 1 : 0;
      if (aDone !== bDone) return aDone - bDone;
      const aDue = a.dueAt ? new Date(a.dueAt).getTime() : Number.POSITIVE_INFINITY;
      const bDue = b.dueAt ? new Date(b.dueAt).getTime() : Number.POSITIVE_INFINITY;
      return aDue - bDue;
    });
  }, [assignments, doneIds]);

  if (!hydrated || loading) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-16 text-center text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3" />
        Loading…
      </section>
    );
  }

  if (!user || !state.userId || !state.profile?.name?.trim()) {
    return (
      <section className="mx-auto max-w-md px-4 py-16 text-center">
        <GraduationCap className="h-12 w-12 text-teal-400 mx-auto mb-4" />
        <h1 className="text-xl font-bold mb-2">Join your class</h1>
        <p className="text-slate-400 text-sm mb-6">
          Sign in and set a display name, then enter your teacher&apos;s class code.
        </p>
        <Link
          href="/login?next=/class"
          className="inline-flex rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-2.5 text-sm font-semibold text-slate-900"
        >
          Sign in
        </Link>
        <Link
          href="/community"
          className="block mt-3 text-sm text-cyan-300 underline"
        >
          Set display name
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

        <div className="mt-8">
          <OnboardingChecklist role="student" />
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          New here?{" "}
          <Link href="/pilot" className="text-cyan-300 underline">
            See the student quick start
          </Link>
        </p>
      </section>
    );
  }

  const others = classmates.filter((c) => c.userId !== state.userId);
  const accentBorder = ACCENT_BORDER[brandingAccent] ?? ACCENT_BORDER.cyan;
  const accentChip = ACCENT_CHIP[brandingAccent] ?? ACCENT_CHIP.cyan;

  return (
    <section className="mx-auto max-w-5xl px-3 py-8 sm:px-6 sm:py-10 min-w-0">
      <header className={`mb-6 rounded-2xl border ${accentBorder} bg-slate-950/40 p-5 sm:p-6`}>
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-400 mb-1">
          My class
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold gradient-text">{chapterName}</h1>
        {schoolTagline && (
          <p className="text-slate-400 text-sm mt-1">{schoolTagline}</p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm ${accentChip}`}
          >
            <ClipboardList className="h-4 w-4" />
            {todoCount} to do
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/15 border border-teal-500/25 px-3 py-1 text-sm text-teal-200">
            <CheckCircle2 className="h-4 w-4" />
            {doneCount} done
          </span>
          {myStats && (
            <>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-sm text-amber-200">
                <Trophy className="h-4 w-4" />
                Rank #{myRank || "—"}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 text-sm text-cyan-200">
                <Sparkles className="h-4 w-4" />
                {myStats.score} pts
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 border border-slate-600 px-3 py-1 text-sm text-slate-300">
                <Coins className="h-4 w-4 text-teal-400" />
                {safeNumber(state.corals)} corals
              </span>
            </>
          )}
        </div>
      </header>

      {!classActive && (
        <aside className="mb-6 rounded-xl border border-amber-500/30 bg-amber-950/25 px-4 py-3 text-sm text-amber-100">
          Your teacher still needs to activate the School Chapter for the full
          leaderboard. You can still view class work below.
        </aside>
      )}

      <div className="flex flex-wrap gap-2 border-b border-cyan-500/15 pb-1 mb-6">
        {(
          [
            { id: "work" as const, label: "Work", icon: ClipboardList },
            { id: "people" as const, label: "People", icon: Users },
            { id: "leaderboard" as const, label: "Leaderboard", icon: Trophy },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`inline-flex items-center gap-1.5 rounded-t-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === id
                ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 border-b-transparent -mb-px"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
            {id === "work" && todoCount > 0 && (
              <span className="ml-1 rounded-full bg-teal-500/20 px-1.5 text-[10px] font-semibold text-teal-200">
                {todoCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "work" && (
        <div className="space-y-4">
          {assignments.length === 0 ? (
            <article className="glass rounded-xl p-6 border border-cyan-500/15 space-y-4">
              <h2 className="font-semibold flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-cyan-400" />
                My Work
              </h2>
              <p className="text-sm text-slate-400">
                No assignments yet. When your teacher posts class work, it will
                show up here with a one-tap path to the reef scanner.
              </p>
              <OnboardingChecklist role="student" completedIds={completedIds} />
              <div className="flex flex-wrap gap-3 pt-1">
                <Link
                  href="/scanner"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-slate-900"
                >
                  <Scan className="h-4 w-4" />
                  Practice a reef scan
                </Link>
                <Link
                  href="/gallery"
                  className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 px-4 py-2 text-sm text-cyan-300 hover:bg-cyan-500/10"
                >
                  <Images className="h-4 w-4" />
                  Gallery
                </Link>
              </div>
            </article>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-semibold flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-cyan-400" />
                  My Work
                </h2>
                <p className="text-xs text-slate-500">
                  {todoCount} open · {doneCount} complete
                </p>
              </div>
              <ul className="space-y-3">
                {sortedAssignments.map((a) => {
                  const done = doneIds.has(a.id);
                  const due = dueMeta(a.dueAt);
                  return (
                    <li
                      key={a.id}
                      className={`glass rounded-xl p-4 sm:p-5 border ${
                        done
                          ? "border-teal-500/25 bg-teal-950/10"
                          : due.tone === "overdue"
                            ? "border-red-500/25"
                            : accentBorder
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="font-semibold text-slate-100">
                              {a.title}
                            </h3>
                            {done ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/15 border border-teal-500/30 px-2 py-0.5 text-[11px] font-semibold text-teal-200">
                                <CheckCircle2 className="h-3 w-3" />
                                Done
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[11px] font-semibold text-amber-200">
                                To do
                              </span>
                            )}
                          </div>
                          {a.description && (
                            <p className="text-sm text-slate-400 mb-2">
                              {a.description}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-2 text-xs">
                            {a.requiresScan && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 text-cyan-200">
                                <Camera className="h-3 w-3" />
                                Scan a reef photo
                              </span>
                            )}
                            {a.requiresPin && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 text-violet-200">
                                <MapPin className="h-3 w-3" />
                                Pin it on the map
                              </span>
                            )}
                            <span
                              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 ${
                                due.tone === "overdue"
                                  ? "bg-red-500/10 border-red-500/30 text-red-200"
                                  : due.tone === "soon"
                                    ? "bg-amber-500/10 border-amber-500/30 text-amber-200"
                                    : "bg-slate-800/60 border-slate-600 text-slate-400"
                              }`}
                            >
                              {due.tone === "overdue" ? (
                                <AlertTriangle className="h-3 w-3" />
                              ) : (
                                <Clock className="h-3 w-3" />
                              )}
                              {due.label}
                            </span>
                          </div>
                        </div>
                        {!done && (
                          <Link
                            href={`/scanner?assignmentId=${encodeURIComponent(a.id)}`}
                            className="shrink-0 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-slate-900"
                          >
                            <Scan className="h-4 w-4" />
                            Start
                          </Link>
                        )}
                        {done && (
                          <Link
                            href="/class"
                            className="shrink-0 inline-flex items-center gap-2 rounded-full border border-teal-500/30 px-4 py-2 text-sm text-teal-200"
                          >
                            Completed
                          </Link>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
              {todoCount === 0 && (
                <div className="pt-2">
                  <OnboardingChecklist role="student" completedIds={completedIds} />
                </div>
              )}
            </>
          )}
        </div>
      )}

      {tab === "people" && (
        <article className="glass rounded-xl p-5 border border-cyan-500/15">
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
            <ul className="space-y-2 max-h-96 overflow-y-auto pr-1">
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
      )}

      {tab === "leaderboard" && (
        <article className="glass rounded-xl p-5 border border-cyan-500/15">
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
      )}

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
