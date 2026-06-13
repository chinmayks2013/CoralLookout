"use client";

import { useCallback, useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  GraduationCap,
  Users,
  Copy,
  Check,
  Download,
  Trophy,
  Mail,
  CreditCard,
  Loader2,
  Lock,
  Sparkles,
  BarChart3,
  LayoutDashboard,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { usePlatform } from "@/context/PlatformContext";
import { useAuth } from "@/context/AuthContext";
import {
  createTeacherChapter,
  fetchChapterInsights,
  fetchChapterLeaderboard,
  fetchRoster,
  fetchTeacherChapter,
  getChapterExportUrl,
  openBillingPortal,
  startSchoolCheckout,
  updateChapterBranding,
} from "@/lib/school/cloud";
import type {
  ChapterInsights,
  ChapterLeaderboardEntry,
  SchoolChapter,
  SchoolRosterMember,
} from "@/lib/school/types";
import { isChapterSubscriptionActive } from "@/lib/school/types";
import { TeacherInsightsPanel } from "@/components/teacher/TeacherInsightsPanel";

const ACCENT_OPTIONS = [
  { id: "cyan", label: "Ocean cyan" },
  { id: "teal", label: "Reef teal" },
  { id: "violet", label: "Deep violet" },
  { id: "amber", label: "Sunset amber" },
];

const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SCHOOL_SUPPORT_EMAIL ?? "schools@corallookout.org";

type TeacherTab = "overview" | "insights" | "leaderboard";

export function TeacherDashboardView() {
  const searchParams = useSearchParams();
  const { state, hydrated, dispatch } = usePlatform();
  const { user } = useAuth();
  const teacherEmail = state.profile?.email ?? user?.email ?? "";
  const [chapter, setChapter] = useState<SchoolChapter | null>(null);
  const [roster, setRoster] = useState<SchoolRosterMember[]>([]);
  const [leaderboard, setLeaderboard] = useState<ChapterLeaderboardEntry[]>([]);
  const [insights, setInsights] = useState<ChapterInsights | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [tab, setTab] = useState<TeacherTab>("insights");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  const [schoolName, setSchoolName] = useState("");
  const [tagline, setTagline] = useState("");
  const [accent, setAccent] = useState("cyan");
  const subscribed = chapter
    ? isChapterSubscriptionActive(chapter.subscriptionStatus)
    : false;
  const premiumUnlocked = Boolean(chapter && (demoMode || subscribed));

  const loadChapter = useCallback(async () => {
    if (!state.userId) return;
    setError(null);
    const { chapter: ch, demoMode: demo, error: err } =
      await fetchTeacherChapter(state.userId);
    if (err) setError(err);
    setDemoMode(Boolean(demo));
    setChapter(ch);
    if (ch) {
      dispatch({
        type: "SET_SCHOOL_CHAPTER",
        chapterId: ch.id,
        role: "teacher",
      });
      setSchoolName(ch.schoolName);
      setTagline(ch.brandingTagline ?? "");
      setAccent(ch.brandingAccent);
    }
  }, [state.userId, dispatch]);

  const loadPremiumData = useCallback(async () => {
    if (!chapter || !state.userId) {
      setRoster([]);
      setLeaderboard([]);
      return;
    }
    const unlocked =
      demoMode || isChapterSubscriptionActive(chapter.subscriptionStatus);
    if (!unlocked) {
      setRoster([]);
      setLeaderboard([]);
      setInsights(null);
      return;
    }
    try {
      const [r, lb, ins] = await Promise.all([
        fetchRoster(chapter.id, state.userId),
        fetchChapterLeaderboard(chapter.id, state.userId),
        fetchChapterInsights(chapter.id, state.userId),
      ]);
      setRoster(r);
      setLeaderboard(lb);
      setInsights(ins);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load chapter data");
    }
  }, [chapter, state.userId, demoMode]);

  const refreshInsights = useCallback(async () => {
    if (!chapter || !state.userId || !premiumUnlocked) return;
    setInsightsLoading(true);
    try {
      const ins = await fetchChapterInsights(chapter.id, state.userId);
      setInsights(ins);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to refresh insights");
    } finally {
      setInsightsLoading(false);
    }
  }, [chapter, state.userId, premiumUnlocked]);

  useEffect(() => {
    if (!hydrated || !state.userId) return;
    void loadChapter().finally(() => setLoading(false));
  }, [hydrated, state.userId, loadChapter]);

  useEffect(() => {
    if (chapter) void loadPremiumData();
  }, [chapter, loadPremiumData]);

  useEffect(() => {
    const checkout = searchParams.get("checkout");
    if (checkout === "success") {
      setMessage("Payment received! Your School Chapter is activating…");
      void loadChapter();
    } else if (checkout === "canceled") {
      setMessage("Checkout canceled. Subscribe when you're ready.");
    }
  }, [searchParams, loadChapter]);

  async function handleCreateChapter(e: FormEvent) {
    e.preventDefault();
    if (!state.profile || !state.userId) return;
    setError(null);
    try {
      const { chapter: ch, demoMode: demo } = await createTeacherChapter({
        teacherUserId: state.userId,
        teacherName: state.profile.name,
        teacherEmail,
        schoolName: schoolName.trim() || state.profile.school || "My school",
      });
      setChapter(ch);
      setDemoMode(demo);
      dispatch({ type: "SET_SCHOOL_CHAPTER", chapterId: ch.id, role: "teacher" });
      setMessage(
        demo
          ? "Demo chapter ready — all teacher tools are unlocked (no payment required)."
          : "School chapter created. Subscribe to unlock the full dashboard."
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create chapter");
    }
  }

  async function handleSubscribe() {
    if (!chapter || !state.profile || !state.userId) return;
    setCheckoutLoading(true);
    setError(null);
    try {
      const url = await startSchoolCheckout({
        chapterId: chapter.id,
        teacherUserId: state.userId,
        teacherEmail,
      });
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setCheckoutLoading(false);
    }
  }

  async function handleManageBilling() {
    if (!chapter || !state.userId) return;
    setCheckoutLoading(true);
    try {
      const url = await openBillingPortal({
        chapterId: chapter.id,
        teacherUserId: state.userId,
      });
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Billing portal failed");
      setCheckoutLoading(false);
    }
  }

  async function handleSaveBranding(e: FormEvent) {
    e.preventDefault();
    if (!chapter || !state.userId || !premiumUnlocked) return;
    setError(null);
    try {
      const updated = await updateChapterBranding({
        chapterId: chapter.id,
        teacherUserId: state.userId,
        schoolName,
        brandingTagline: tagline.trim() || null,
        brandingAccent: accent,
      });
      setChapter(updated);
      setMessage("School branding saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  }

  function copyJoinCode() {
    if (!chapter) return;
    void navigator.clipboard.writeText(chapter.joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!hydrated || loading) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-12 text-center text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3" />
        Loading teacher dashboard…
      </section>
    );
  }

  if (!state.profile || !state.userId) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-12 text-center">
        <GraduationCap className="h-12 w-12 text-teal-400 mx-auto mb-4" />
        <p className="text-slate-400 mb-4">
          Create your Coral Enthusiast profile before setting up a school chapter.
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

  return (
    <section className="mx-auto max-w-5xl px-3 py-8 sm:px-6 sm:py-12 min-w-0">
      <PageHeader
        badge={demoMode ? "Demo — full access" : "School Chapter — $49/mo"}
        title="Teacher Dashboard"
        subtitle={
          demoMode
            ? "Demo mode: roster, exports, private leaderboard, and branding all work without Stripe."
            : "Run your reef program: roster, private leaderboard, exports, and school branding."
        }
      />

      {message && (
        <aside className="mb-4 rounded-xl border border-teal-500/30 bg-teal-950/30 px-4 py-3 text-sm text-teal-200">
          {message}
        </aside>
      )}
      {error && (
        <aside className="mb-4 rounded-xl border border-red-500/30 bg-red-950/20 px-4 py-3 text-sm text-red-300">
          {error}
        </aside>
      )}

      {!chapter ? (
        <article className="glass rounded-2xl p-8 max-w-lg mx-auto">
          <h2 className="text-lg font-bold mb-2">Create your school chapter</h2>
          <p className="text-sm text-slate-400 mb-6">
            {demoMode
              ? "Create your chapter to unlock the full demo dashboard instantly — no payment."
              : "Set up your chapter first, then subscribe at $49/month to unlock roster tools, exports, and the private leaderboard."}
          </p>
          <form onSubmit={(e) => void handleCreateChapter(e)} className="space-y-4">
            <input
              type="text"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder={`School name (e.g. ${state.profile.school})`}
              className="w-full rounded-lg bg-slate-800/50 border border-cyan-500/20 px-4 py-3 text-sm"
              required
            />
            <button
              type="submit"
              className="w-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 py-3 font-semibold text-slate-900"
            >
              Create chapter
            </button>
          </form>
        </article>
      ) : (
        <div className="space-y-6">
          <article
            className={`rounded-2xl p-6 border ${
              premiumUnlocked
                ? "border-teal-500/40 bg-teal-950/20"
                : "border-amber-500/40 bg-amber-950/20"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
                  {demoMode ? "Demo access" : "Subscription"}
                </p>
                <p className="text-lg font-bold flex items-center gap-2">
                  {demoMode ? (
                    <>
                      <Sparkles className="h-5 w-5 text-violet-400" />
                      Demo teacher dashboard
                    </>
                  ) : premiumUnlocked ? (
                    <>
                      <Sparkles className="h-5 w-5 text-teal-400" />
                      School Chapter active
                    </>
                  ) : (
                    <>
                      <Lock className="h-5 w-5 text-amber-400" />
                      Subscribe to unlock premium tools
                    </>
                  )}
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  {demoMode
                    ? "All School Chapter features work for demos and competitions. Add Stripe keys in .env.local when you are ready for real $49/month billing."
                    : premiumUnlocked
                      ? chapter.subscriptionCurrentPeriodEnd
                        ? `Renews ${new Date(chapter.subscriptionCurrentPeriodEnd).toLocaleDateString()}`
                        : "Billing active"
                      : "$49/month — roster, exports & private leaderboard"}
                </p>
              </div>
              {!demoMode && (
                <div className="flex flex-wrap gap-2">
                  {subscribed ? (
                    <button
                      type="button"
                      disabled={checkoutLoading}
                      onClick={() => void handleManageBilling()}
                      className="inline-flex items-center gap-2 rounded-full border border-teal-500/40 px-5 py-2.5 text-sm text-teal-300 hover:bg-teal-500/10 disabled:opacity-50"
                    >
                      <CreditCard className="h-4 w-4" />
                      Manage billing
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={checkoutLoading}
                      onClick={() => void handleSubscribe()}
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-2.5 text-sm font-semibold text-slate-900 disabled:opacity-50"
                    >
                      {checkoutLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CreditCard className="h-4 w-4" />
                      )}
                      Subscribe — $49/month
                    </button>
                  )}
                </div>
              )}
            </div>
          </article>

          {premiumUnlocked && (
            <div className="flex flex-wrap gap-2 border-b border-cyan-500/15 pb-1">
              {(
                [
                  { id: "insights" as const, label: "Insights", icon: BarChart3 },
                  { id: "leaderboard" as const, label: "Leaderboard", icon: Trophy },
                  { id: "overview" as const, label: "Overview", icon: LayoutDashboard },
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
                </button>
              ))}
            </div>
          )}

          {premiumUnlocked && tab === "insights" && (
            <article className="glass rounded-xl p-6 border border-violet-500/20">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-violet-400" />
                  Learning insights
                </h3>
                <button
                  type="button"
                  onClick={() => void refreshInsights()}
                  disabled={insightsLoading}
                  className="text-xs text-cyan-300 border border-cyan-500/30 rounded-lg px-3 py-1.5 hover:bg-cyan-500/10 disabled:opacity-50"
                >
                  {insightsLoading ? "Refreshing…" : "Refresh"}
                </button>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Concept mastery from reef scans, Reef Academy quizzes, and forum vocabulary —
                not just posts and views.
              </p>
              <TeacherInsightsPanel insights={insights} loading={insightsLoading && !insights} />
            </article>
          )}

          {(tab === "overview" || !premiumUnlocked) && (
          <>
          <div className="grid gap-6 lg:grid-cols-2">
            <article className="glass rounded-xl p-5 border border-cyan-500/15">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Users className="h-4 w-4 text-cyan-400" />
                Class join code
              </h3>
              <p className="text-sm text-slate-400 mb-3">
                Students sign in, open{" "}
                <Link href="/class" className="text-cyan-300 underline">
                  Join class
                </Link>
                , and enter this code — you cannot add them manually.
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-lg bg-slate-950/60 border border-cyan-500/20 px-4 py-3 text-xl font-mono tracking-widest text-cyan-300">
                  {chapter.joinCode}
                </code>
                <button
                  type="button"
                  onClick={copyJoinCode}
                  className="shrink-0 rounded-lg border border-cyan-500/30 p-3 text-cyan-300 hover:bg-cyan-500/10"
                  aria-label="Copy join code"
                >
                  {copied ? (
                    <Check className="h-5 w-5 text-teal-400" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </button>
              </div>
            </article>

            <article className="glass rounded-xl p-5 border border-cyan-500/15">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Mail className="h-4 w-4 text-violet-400" />
                Priority email support
              </h3>
              <p className="text-sm text-slate-400 mb-3">
                School Chapter subscribers get priority help within one business day.
              </p>
              <a
                href={`mailto:${SUPPORT_EMAIL}?subject=School Chapter support — ${encodeURIComponent(chapter.schoolName)}&body=Chapter ID: ${chapter.id}%0ATeacher: ${encodeURIComponent(state.profile.name)}`}
                className="inline-flex items-center gap-2 text-sm text-violet-300 hover:underline"
              >
                {SUPPORT_EMAIL}
                <ArrowLink />
              </a>
            </article>
          </div>

          <article className={`glass rounded-xl p-6 border border-cyan-500/15 ${!premiumUnlocked ? "opacity-60 pointer-events-none" : ""}`}>
            <h3 className="font-semibold mb-4">School branding</h3>
            <form onSubmit={(e) => void handleSaveBranding(e)} className="grid gap-4 sm:grid-cols-2">
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="School display name"
                className="rounded-lg bg-slate-800/50 border border-cyan-500/20 px-3 py-2 text-sm sm:col-span-2"
              />
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Chapter tagline shown to students"
                maxLength={120}
                className="rounded-lg bg-slate-800/50 border border-cyan-500/20 px-3 py-2 text-sm sm:col-span-2"
              />
              <select
                value={accent}
                onChange={(e) => setAccent(e.target.value)}
                className="rounded-lg bg-slate-800/50 border border-cyan-500/20 px-3 py-2 text-sm text-slate-300 sm:col-span-2"
              >
                {ACCENT_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    Accent: {o.label}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={!premiumUnlocked}
                className="sm:col-span-2 rounded-lg border border-teal-500/40 py-2 text-sm text-teal-300 hover:bg-teal-500/10 disabled:opacity-50"
              >
                Save branding
              </button>
            </form>
          </article>

          <article className={`glass rounded-xl p-6 border border-cyan-500/15 ${!premiumUnlocked ? "opacity-60 pointer-events-none" : ""}`}>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 text-teal-400" />
                Students who joined ({roster.filter((m) => m.status === "active").length})
              </h3>
              <a
                href={premiumUnlocked ? getChapterExportUrl(chapter.id, state.userId) : "#"}
                className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/30 px-3 py-1.5 text-xs text-cyan-300 hover:bg-cyan-500/10"
              >
                <Download className="h-3.5 w-3.5" />
                Export CSV report
              </a>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Read-only list — students appear here after they use your join code on{" "}
              <Link href="/class" className="text-cyan-300 underline">
                My Class
              </Link>
              .
            </p>

            {roster.filter((m) => m.status === "active").length === 0 ? (
              <p className="text-sm text-slate-500">
                No students yet. Share your join code and have them open Join class after
                signing in.
              </p>
            ) : (
              <ul className="divide-y divide-cyan-500/10 text-sm">
                {roster
                  .filter((m) => m.status === "active")
                  .map((m) => (
                    <li key={m.id} className="flex items-center gap-2 py-2.5">
                      <span className="font-medium">{m.displayName}</span>
                      {m.email && (
                        <span className="text-slate-500 truncate">{m.email}</span>
                      )}
                    </li>
                  ))}
              </ul>
            )}
          </article>

          </>
          )}

          {premiumUnlocked && tab === "leaderboard" && (
          <article className={`glass rounded-xl p-6 border border-cyan-500/15`}>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-400" />
              Private chapter leaderboard
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Activity metrics — switch to Insights for learning outcomes.
            </p>
            {leaderboard.length === 0 ? (
              <p className="text-sm text-slate-500">
                Students appear here once they join and post in the gallery or forum.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="text-xs text-slate-500 uppercase">
                      <th className="pb-2 pr-4">#</th>
                      <th className="pb-2 pr-4">Student</th>
                      <th className="pb-2 pr-4">Posts</th>
                      <th className="pb-2 pr-4">Views</th>
                      <th className="pb-2 pr-4">Comments</th>
                      <th className="pb-2">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry, i) => (
                      <tr key={entry.userId} className="border-t border-cyan-500/10">
                        <td className="py-2 pr-4 text-slate-500">{i + 1}</td>
                        <td className="py-2 pr-4 font-medium">{entry.displayName}</td>
                        <td className="py-2 pr-4">{entry.postCount}</td>
                        <td className="py-2 pr-4">{entry.totalViews}</td>
                        <td className="py-2 pr-4">{entry.commentCount}</td>
                        <td className="py-2 text-teal-300 font-semibold">{entry.score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </article>
          )}
        </div>
      )}
    </section>
  );
}

function ArrowLink() {
  return (
    <svg
      className="h-3.5 w-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  );
}
