"use client";

import { Fragment, FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { fetchAdminAcademyReport } from "@/lib/academy/cloud";
import { CORAL_GUIDE_LESSONS } from "@/lib/academy/course";
import type { AdminLearnerRow } from "@/lib/academy/types";
import {
  Award,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  RefreshCw,
  Users,
} from "lucide-react";

const ADMIN_KEY = "coral-lookout-admin-secret";

export function AdminAcademyView() {
  const [secret, setSecret] = useState("");
  const [storedSecret, setStoredSecret] = useState<string | null>(null);
  const [learners, setLearners] = useState<AdminLearnerRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupMessage, setSetupMessage] = useState<string | null>(null);

  const schemaMissing = Boolean(
    error?.includes("academy_learners") || error?.includes("schema cache")
  );

  const loadReport = useCallback(async (token: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminAcademyReport(token);
      setLearners(data.learners);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load report");
      setLearners([]);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleLogin(e: FormEvent) {
    e.preventDefault();
    if (!secret.trim()) return;
    sessionStorage.setItem(ADMIN_KEY, secret.trim());
    setStoredSecret(secret.trim());
    void loadReport(secret.trim());
  }

  function handleLogout() {
    sessionStorage.removeItem(ADMIN_KEY);
    setStoredSecret(null);
    setSecret("");
    setLearners([]);
  }

  useEffect(() => {
    const saved = sessionStorage.getItem(ADMIN_KEY);
    if (saved) {
      setStoredSecret(saved);
      void loadReport(saved);
    }
  }, [loadReport]);

  async function runDatabaseSetup() {
    if (!storedSecret) return;
    setSetupLoading(true);
    setSetupMessage(null);
    try {
      const res = await fetch("/api/admin/setup-academy", {
        method: "POST",
        headers: { Authorization: `Bearer ${storedSecret}` },
      });
      const data = (await res.json()) as { ok?: boolean; message?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Setup failed");
      setSetupMessage(data.message ?? "Tables created.");
      await loadReport(storedSecret);
    } catch (e) {
      setSetupMessage(e instanceof Error ? e.message : "Setup failed");
    } finally {
      setSetupLoading(false);
    }
  }

  const certified = learners.filter((l) => l.certificateIssued).length;
  const active = learners.filter((l) => l.modulesCompleted > 0).length;

  if (!storedSecret) {
    return (
      <section className="mx-auto max-w-md px-4 py-16 sm:px-6">
        <PageHeader
          badge="Admin"
          title="Academy Progress"
          subtitle="Track video views, quiz scores, and certificates for all learners."
        />
        <form onSubmit={handleLogin} className="glass rounded-2xl p-6 mt-8 space-y-4">
          <label className="block text-sm text-slate-400">
            Admin secret
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="ADMIN_SECRET from server env"
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
            />
          </label>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 py-3 font-semibold text-slate-900"
          >
            Sign in
          </button>
          <p className="text-xs text-slate-500 text-center">
            Enter the same value as <code className="text-slate-400">ADMIN_SECRET</code> in{" "}
            <code className="text-slate-400">.env.local</code>, then restart{" "}
            <code className="text-slate-400">npm run dev</code>. On Vercel, add{" "}
            <code className="text-slate-400">ADMIN_SECRET</code> under Environment Variables and
            redeploy.
          </p>
        </form>
        <p className="text-center mt-6">
          <Link href="/academy" className="text-sm text-cyan-400 hover:underline">
            ← Back to Academy
          </Link>
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <PageHeader
          badge="Admin"
          title="Academy Progress"
          subtitle="Video watch status, quiz grades, and certificate issuance."
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => storedSecret && loadReport(storedSecret)}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 px-4 py-2 text-sm text-cyan-200 hover:bg-cyan-500/10 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-slate-600 px-4 py-2 text-sm text-slate-400 hover:text-white"
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <article className="glass rounded-xl p-5">
          <Users className="h-5 w-5 text-cyan-400 mb-2" />
          <p className="text-2xl font-bold">{learners.length}</p>
          <p className="text-sm text-slate-400">Total learners tracked</p>
        </article>
        <article className="glass rounded-xl p-5">
          <CheckCircle className="h-5 w-5 text-teal-400 mb-2" />
          <p className="text-2xl font-bold">{active}</p>
          <p className="text-sm text-slate-400">Started at least one module</p>
        </article>
        <article className="glass rounded-xl p-5">
          <Award className="h-5 w-5 text-amber-400 mb-2" />
          <p className="text-2xl font-bold">{certified}</p>
          <p className="text-sm text-slate-400">Certificates issued</p>
        </article>
      </div>

      {error && (
        <div className="text-red-400 text-sm mb-4 glass rounded-lg p-4 space-y-3">
          <p>{error}</p>
          {schemaMissing && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-amber-100/90 text-xs space-y-2">
              <p className="font-medium text-amber-200">Academy tables not set up yet</p>
              <p>
                Option A: add <code className="text-amber-100">SUPABASE_DB_URL</code> to{" "}
                <code className="text-amber-100">.env.local</code>, restart the dev server,
                then click below.
              </p>
              <p>
                Option B: paste{" "}
                <code className="text-amber-100">supabase/migrations/006_academy_progress.sql</code>{" "}
                into the Supabase SQL Editor and run it.
              </p>
              <button
                type="button"
                onClick={() => void runDatabaseSetup()}
                disabled={setupLoading}
                className="rounded-full bg-amber-400 px-4 py-2 text-xs font-semibold text-slate-900 disabled:opacity-50"
              >
                {setupLoading ? "Creating tables…" : "Create academy tables"}
              </button>
            </div>
          )}
        </div>
      )}

      {setupMessage && (
        <p className="text-sm mb-4 glass rounded-lg p-3 text-teal-300">{setupMessage}</p>
      )}

      {loading && learners.length === 0 && !error ? (
        <p className="text-slate-400 text-center py-12">Loading learners…</p>
      ) : !error && learners.length === 0 ? (
        <p className="text-slate-400 text-center py-12 glass rounded-xl">
          No learner progress recorded yet. Activity appears when users watch
          videos or submit quizzes on the Academy page.
        </p>
      ) : !error ? (
        <div className="overflow-x-auto glass rounded-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/60 text-left text-slate-400">
                <th className="p-4 font-medium">Learner</th>
                <th className="p-4 font-medium">School</th>
                <th className="p-4 font-medium">Progress</th>
                <th className="p-4 font-medium">Certificate</th>
                <th className="p-4 font-medium">Last active</th>
                <th className="p-4 font-medium" />
              </tr>
            </thead>
            <tbody>
              {learners.map((row) => (
                <Fragment key={row.userId}>
                  <tr className="border-b border-slate-800/60 hover:bg-slate-800/30">
                    <td className="p-4">
                      <p className="font-medium">{row.displayName}</p>
                      <p className="text-xs text-slate-500 truncate max-w-[180px]">
                        {row.email ?? row.userId.slice(0, 8) + "…"}
                      </p>
                    </td>
                    <td className="p-4 text-slate-400">{row.school ?? "—"}</td>
                    <td className="p-4">
                      <span className="text-cyan-300 font-medium">
                        {row.modulesCompleted}/{row.totalModules}
                      </span>{" "}
                      passed
                    </td>
                    <td className="p-4">
                      {row.certificateIssued ? (
                        <span className="text-teal-400 font-mono text-xs">
                          {row.certificateCode}
                        </span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="p-4 text-slate-400 text-xs">
                      {row.lastActivityAt
                        ? new Date(row.lastActivityAt).toLocaleString()
                        : "—"}
                    </td>
                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() =>
                          setExpanded(expanded === row.userId ? null : row.userId)
                        }
                        className="text-cyan-400 hover:text-cyan-200"
                        aria-label="Toggle module details"
                      >
                        {expanded === row.userId ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                  {expanded === row.userId && (
                    <tr>
                      <td colSpan={6} className="p-4 bg-slate-900/50">
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {CORAL_GUIDE_LESSONS.map((lesson) => {
                            const detail = row.lessonDetails.find(
                              (d) => d.lessonId === lesson.id
                            );
                            return (
                              <div
                                key={lesson.id}
                                className="rounded-lg border border-slate-700/50 p-3 text-xs"
                              >
                                <p className="font-medium text-slate-200 mb-1">
                                  {lesson.order}. {lesson.title}
                                </p>
                                <p className="text-slate-500">
                                  Video:{" "}
                                  {detail?.videoWatched ? (
                                    <span className="text-teal-400">Watched</span>
                                  ) : (
                                    <span>Not watched</span>
                                  )}
                                </p>
                                <p className="text-slate-500">
                                  Quiz:{" "}
                                  {detail?.quizPassed ? (
                                    <span className="text-teal-400">
                                      Passed (
                                      {Math.round((detail.quizScore ?? 0) * 100)}
                                      %)
                                    </span>
                                  ) : detail?.quizScore != null ? (
                                    <span className="text-amber-400">
                                      Failed (
                                      {Math.round(detail.quizScore * 100)}%)
                                    </span>
                                  ) : (
                                    <span>Not attempted</span>
                                  )}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <p className="text-center mt-8">
        <Link href="/academy" className="text-sm text-cyan-400 hover:underline">
          ← Back to Academy
        </Link>
      </p>
    </section>
  );
}
