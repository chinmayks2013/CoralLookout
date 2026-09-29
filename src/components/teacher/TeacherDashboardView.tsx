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
  Printer,
  ClipboardList,
  FlaskConical,
  Plus,
  MapPin,
  UserPlus,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { usePlatform } from "@/context/PlatformContext";
import { useAuth } from "@/context/AuthContext";
import {
  createAssignment,
  createTeacherChapter,
  fetchAssignmentsWithCompletions,
  fetchChapterInsights,
  fetchChapterLeaderboard,
  fetchCoTeachers,
  fetchRoster,
  fetchTeacherChapter,
  getChapterExportUrl,
  inviteCoTeacher,
  openBillingPortal,
  startSchoolCheckout,
  updateChapterBranding,
  type AssignmentCompletionDto,
  type CoTeacherDto,
  type SchoolAssignmentDto,
} from "@/lib/school/cloud";
import type {
  ChapterInsights,
  ChapterLeaderboardEntry,
  SchoolChapter,
  SchoolRosterMember,
} from "@/lib/school/types";
import { isChapterSubscriptionActive } from "@/lib/school/types";
import { TeacherInsightsPanel } from "@/components/teacher/TeacherInsightsPanel";
import { TeacherFieldworkPanel } from "@/components/teacher/TeacherFieldworkPanel";
import { OnboardingChecklist } from "@/components/ui/OnboardingChecklist";

const ACCENT_OPTIONS = [
  { id: "cyan", label: "Ocean cyan" },
  { id: "teal", label: "Reef teal" },
  { id: "violet", label: "Deep violet" },
  { id: "amber", label: "Sunset amber" },
];

const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SCHOOL_SUPPORT_EMAIL ?? "schools@corallookout.org";

type TeacherTab = "overview" | "insights" | "leaderboard" | "assignments" | "fieldwork";

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
  const [tab, setTab] = useState<TeacherTab>("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [annualBillingAvailable, setAnnualBillingAvailable] = useState(false);

  const [assignments, setAssignments] = useState<SchoolAssignmentDto[]>([]);
  const [assignmentCompletions, setAssignmentCompletions] = useState<
    AssignmentCompletionDto[]
  >([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [assignmentDescription, setAssignmentDescription] = useState("");
  const [assignmentDueAt, setAssignmentDueAt] = useState("");
  const [assignmentRequiresScan, setAssignmentRequiresScan] = useState(true);
  const [assignmentRequiresPin, setAssignmentRequiresPin] = useState(true);
  const [creatingAssignment, setCreatingAssignment] = useState(false);
  const [expandedAssignmentId, setExpandedAssignmentId] = useState<string | null>(
    null
  );

  const [schoolName, setSchoolName] = useState("");
  const [tagline, setTagline] = useState("");
  const [accent, setAccent] = useState("cyan");

  const [coTeachers, setCoTeachers] = useState<CoTeacherDto[]>([]);
  const [coTeacherName, setCoTeacherName] = useState("");
  const [coTeacherEmail, setCoTeacherEmail] = useState("");
  const [invitingCoTeacher, setInvitingCoTeacher] = useState(false);
  const subscribed = chapter
    ? isChapterSubscriptionActive(chapter.subscriptionStatus)
    : false;
  const premiumUnlocked = Boolean(chapter && (demoMode || subscribed));

  const loadChapter = useCallback(async () => {
    if (!state.userId) return;
    setError(null);
    const {
      chapter: ch,
      demoMode: demo,
      annualBillingAvailable: annual,
      error: err,
    } = await fetchTeacherChapter(state.userId);
    if (err) setError(err);
    setDemoMode(Boolean(demo));
    setAnnualBillingAvailable(Boolean(annual));
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
    if (!hydrated) return;
    if (!state.userId) {
      setChapter(null);
      setLoading(false);
      return;
    }
    void loadChapter().finally(() => setLoading(false));
  }, [hydrated, state.userId, loadChapter]);

  useEffect(() => {
    if (chapter) void loadPremiumData();
  }, [chapter, loadPremiumData]);

  const loadAssignments = useCallback(async () => {
    if (!chapter || !premiumUnlocked) {
      setAssignments([]);
      setAssignmentCompletions([]);
      return;
    }
    setAssignmentsLoading(true);
    try {
      const { assignments: list, completions } =
        await fetchAssignmentsWithCompletions(chapter.id);
      setAssignments(list);
      setAssignmentCompletions(completions);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load assignments");
    } finally {
      setAssignmentsLoading(false);
    }
  }, [chapter, premiumUnlocked]);

  useEffect(() => {
    if (chapter && premiumUnlocked) void loadAssignments();
  }, [chapter, premiumUnlocked, loadAssignments]);

  const loadCoTeachers = useCallback(async () => {
    if (!chapter || !premiumUnlocked) {
      setCoTeachers([]);
      return;
    }
    try {
      const list = await fetchCoTeachers(chapter.id);
      setCoTeachers(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load co-teachers");
    }
  }, [chapter, premiumUnlocked]);

  useEffect(() => {
    if (chapter && premiumUnlocked) void loadCoTeachers();
  }, [chapter, premiumUnlocked, loadCoTeachers]);

  async function handleInviteCoTeacher(e: FormEvent) {
    e.preventDefault();
    if (!chapter || !state.userId || !coTeacherName.trim()) return;
    setInvitingCoTeacher(true);
    setError(null);
    try {
      await inviteCoTeacher({
        chapterId: chapter.id,
        teacherUserId: state.userId,
        displayName: coTeacherName.trim(),
        email: coTeacherEmail.trim() || undefined,
      });
      setCoTeacherName("");
      setCoTeacherEmail("");
      await loadCoTeachers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to invite co-teacher");
    } finally {
      setInvitingCoTeacher(false);
    }
  }

  async function handleCreateAssignment(e: FormEvent) {
    e.preventDefault();
    if (!chapter || !state.userId || !assignmentTitle.trim()) return;
    setCreatingAssignment(true);
    setError(null);
    try {
      await createAssignment({
        chapterId: chapter.id,
        teacherUserId: state.userId,
        title: assignmentTitle.trim(),
        description: assignmentDescription.trim() || undefined,
        requiresScan: assignmentRequiresScan,
        requiresPin: assignmentRequiresPin,
        dueAt: assignmentDueAt.trim()
          ? new Date(assignmentDueAt).toISOString()
          : null,
      });
      setAssignmentTitle("");
      setAssignmentDescription("");
      setAssignmentDueAt("");
      setAssignmentRequiresScan(true);
      setAssignmentRequiresPin(true);
      await loadAssignments();
      setTab("assignments");
      setMessage("Assignment created. Students will see it under My Work.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create assignment");
    } finally {
      setCreatingAssignment(false);
    }
  }

  function printSummary() {
    window.print();
  }

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

  async function handleSubscribe(billingInterval: "month" | "year" = "month") {
    if (!chapter || !state.profile || !state.userId) return;
    setCheckoutLoading(true);
    setError(null);
    try {
      const url = await startSchoolCheckout({
        chapterId: chapter.id,
        teacherUserId: state.userId,
        teacherEmail,
        billingInterval,
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

      {chapter?.cohort && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/15 border border-violet-500/30 px-3 py-1 text-xs font-semibold text-violet-200">
            <MapPin className="h-3.5 w-3.5" />
            {chapter.cohort}
            {chapter.region ? ` · ${chapter.region}` : ""}
          </span>
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-3 print:hidden">
        <Link
          href="/teacher/join-guide"
          className="inline-flex items-center gap-1.5 text-sm text-cyan-300 hover:text-cyan-200"
        >
          <Printer className="h-3.5 w-3.5" />
          Print join guide
        </Link>
        <button
          type="button"
          onClick={printSummary}
          className="inline-flex items-center gap-1.5 text-sm text-cyan-300 hover:text-cyan-200"
        >
          <Printer className="h-3.5 w-3.5" />
          Print class summary
        </button>
      </div>

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
        <div className="space-y-6 print-summary">
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
                    ? "School Demo Mode — Stripe bypassed. Paid teachers: set SCHOOL_DEMO_MODE=false and configure Stripe."
                    : premiumUnlocked
                      ? chapter.subscriptionCurrentPeriodEnd
                        ? `Renews ${new Date(chapter.subscriptionCurrentPeriodEnd).toLocaleDateString()}`
                        : "Billing active"
                      : "$49/month or a discounted annual plan — roster, exports & private leaderboard"}
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
                    <>
                      <button
                        type="button"
                        disabled={checkoutLoading}
                        onClick={() => void handleSubscribe("month")}
                        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-2.5 text-sm font-semibold text-slate-900 disabled:opacity-50"
                      >
                        {checkoutLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CreditCard className="h-4 w-4" />
                        )}
                        Monthly — $49/mo
                      </button>
                      {annualBillingAvailable && (
                        <button
                          type="button"
                          disabled={checkoutLoading}
                          onClick={() => void handleSubscribe("year")}
                          className="inline-flex items-center gap-2 rounded-full border border-teal-500/40 px-6 py-2.5 text-sm font-semibold text-teal-300 hover:bg-teal-500/10 disabled:opacity-50"
                        >
                          <CreditCard className="h-4 w-4" />
                          Annual — save more
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </article>

          {premiumUnlocked && (
            <div className="flex flex-wrap gap-2 border-b border-cyan-500/15 pb-1">
              {(
                [
                  { id: "assignments" as const, label: "Assignments", icon: ClipboardList },
                  { id: "insights" as const, label: "Insights", icon: BarChart3 },
                  { id: "leaderboard" as const, label: "Leaderboard", icon: Trophy },
                  { id: "fieldwork" as const, label: "Fieldwork", icon: FlaskConical },
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

          {premiumUnlocked && tab === "fieldwork" && (
            <TeacherFieldworkPanel chapterId={chapter.id} teacherUserId={state.userId} />
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
              <div className="space-y-4">
                <p className="text-sm text-slate-500">
                  No students yet. Share your join code and have them open Join class after
                  signing in.
                </p>
                <OnboardingChecklist role="teacher" cohortId={chapter.cohort} />
              </div>
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

          {premiumUnlocked && tab === "assignments" && (
          <article id="assignments" className="glass rounded-xl p-6 border border-cyan-500/15 scroll-mt-24">
            <h3 className="font-semibold mb-1 flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-cyan-400" />
              Class work
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Create reef tasks students finish on the scanner. Track who turned
              work in without exporting a CSV.
            </p>

            <form
              onSubmit={(e) => void handleCreateAssignment(e)}
              className="grid gap-3 sm:grid-cols-2 mb-6 rounded-lg border border-cyan-500/15 bg-slate-900/30 p-4"
            >
              <input
                type="text"
                value={assignmentTitle}
                onChange={(e) => setAssignmentTitle(e.target.value)}
                placeholder="Assignment title (e.g. Scan a reef image + pin location)"
                className="rounded-lg bg-slate-800/50 border border-cyan-500/20 px-3 py-2 text-sm sm:col-span-2"
                required
              />
              <textarea
                value={assignmentDescription}
                onChange={(e) => setAssignmentDescription(e.target.value)}
                placeholder="Description (optional)"
                rows={2}
                className="rounded-lg bg-slate-800/50 border border-cyan-500/20 px-3 py-2 text-sm sm:col-span-2 resize-none"
              />
              <label className="block text-xs text-slate-400 sm:col-span-2">
                Due date (optional)
                <input
                  type="datetime-local"
                  value={assignmentDueAt}
                  onChange={(e) => setAssignmentDueAt(e.target.value)}
                  className="mt-1 w-full rounded-lg bg-slate-800/50 border border-cyan-500/20 px-3 py-2 text-sm text-slate-200"
                />
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={assignmentRequiresScan}
                  onChange={(e) => setAssignmentRequiresScan(e.target.checked)}
                  className="accent-cyan-500"
                />
                Requires a scan
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={assignmentRequiresPin}
                  onChange={(e) => setAssignmentRequiresPin(e.target.checked)}
                  className="accent-cyan-500"
                />
                Requires a pinned location
              </label>
              <button
                type="submit"
                disabled={creatingAssignment || !assignmentTitle.trim()}
                className="sm:col-span-2 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 py-2 text-sm font-semibold text-slate-900 disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                {creatingAssignment ? "Creating…" : "Create assignment"}
              </button>
            </form>

            {assignmentsLoading && assignments.length === 0 ? (
              <p className="text-sm text-slate-500">Loading assignments…</p>
            ) : assignments.length === 0 ? (
              <p className="text-sm text-slate-500">
                No assignments yet — create your first one above.
              </p>
            ) : (
              <ul className="space-y-3 text-sm">
                {assignments.map((a) => {
                  const turnedIn = assignmentCompletions.filter(
                    (c) => c.assignmentId === a.id
                  );
                  const rosterSize = roster.filter((m) => m.status === "active").length;
                  const overdue =
                    a.dueAt && new Date(a.dueAt).getTime() < Date.now();
                  const expanded = expandedAssignmentId === a.id;
                  const nameByUserId = new Map(
                    roster
                      .filter((m) => m.userId)
                      .map((m) => [m.userId as string, m.displayName])
                  );
                  return (
                    <li
                      key={a.id}
                      className={`rounded-xl border px-4 py-3 ${
                        overdue && turnedIn.length < rosterSize
                          ? "border-amber-500/30 bg-amber-950/10"
                          : "border-cyan-500/15 bg-slate-900/30"
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-slate-100">{a.title}</p>
                          {a.description && (
                            <p className="text-slate-400 text-xs mt-0.5">
                              {a.description}
                            </p>
                          )}
                          <p className="text-slate-500 text-xs mt-1">
                            {a.requiresScan ? "Scan a reef photo" : "Scan optional"}
                            {" · "}
                            {a.requiresPin ? "Pin on the map" : "Pin optional"}
                            {a.dueAt && (
                              <>
                                {" · "}
                                {overdue ? "Overdue" : "Due"}{" "}
                                {new Date(a.dueAt).toLocaleString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                  hour: "numeric",
                                  minute: "2-digit",
                                })}
                              </>
                            )}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedAssignmentId(expanded ? null : a.id)
                          }
                          className="shrink-0 rounded-full border border-cyan-500/30 px-3 py-1 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/10"
                        >
                          {turnedIn.length}/{rosterSize || "—"} turned in
                        </button>
                      </div>
                      {expanded && (
                        <div className="mt-3 border-t border-cyan-500/10 pt-3">
                          {turnedIn.length === 0 ? (
                            <p className="text-xs text-slate-500">
                              No submissions yet. Students start from My Class → Start.
                            </p>
                          ) : (
                            <ul className="space-y-1.5">
                              {turnedIn.map((c) => (
                                <li
                                  key={c.id}
                                  className="flex items-center justify-between gap-2 text-xs text-slate-300"
                                >
                                  <span>
                                    {nameByUserId.get(c.userId) ?? "Student"}
                                  </span>
                                  <span className="text-slate-500">
                                    {new Date(c.completedAt).toLocaleString(
                                      undefined,
                                      {
                                        month: "short",
                                        day: "numeric",
                                        hour: "numeric",
                                        minute: "2-digit",
                                      }
                                    )}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </article>
          )}

          {premiumUnlocked && tab === "overview" && (
          <article className="glass rounded-xl p-6 border border-cyan-500/15">
            <h3 className="font-semibold mb-1 flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-violet-400" />
              Co-teachers / TAs
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Invite other teachers or TAs to help run this chapter. This is a
              lightweight roster — they&apos;ll get full access once signed in
              with a matching email in a future update.
            </p>

            <form
              onSubmit={(e) => void handleInviteCoTeacher(e)}
              className="grid gap-3 sm:grid-cols-2 mb-5 rounded-lg border border-cyan-500/15 bg-slate-900/30 p-4"
            >
              <input
                type="text"
                value={coTeacherName}
                onChange={(e) => setCoTeacherName(e.target.value)}
                placeholder="Name"
                className="rounded-lg bg-slate-800/50 border border-cyan-500/20 px-3 py-2 text-sm"
                required
              />
              <input
                type="email"
                value={coTeacherEmail}
                onChange={(e) => setCoTeacherEmail(e.target.value)}
                placeholder="Email (optional)"
                className="rounded-lg bg-slate-800/50 border border-cyan-500/20 px-3 py-2 text-sm"
              />
              <button
                type="submit"
                disabled={invitingCoTeacher || !coTeacherName.trim()}
                className="sm:col-span-2 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500 py-2 text-sm font-semibold text-slate-900 disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                {invitingCoTeacher ? "Inviting…" : "Invite co-teacher"}
              </button>
            </form>

            {coTeachers.length === 0 ? (
              <p className="text-sm text-slate-500">No co-teachers added yet.</p>
            ) : (
              <ul className="divide-y divide-cyan-500/10 text-sm">
                {coTeachers.map((t) => (
                  <li key={t.id} className="flex items-center gap-2 py-2.5">
                    <span className="font-medium">{t.displayName}</span>
                    {t.email && <span className="text-slate-500 truncate">{t.email}</span>}
                    <span className="ml-auto text-xs uppercase tracking-wide text-slate-500">
                      {t.role === "co_teacher" ? "Co-teacher" : t.role}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </article>
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
