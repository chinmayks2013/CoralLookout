"use client";

import { useCallback, useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Activity, Flag, Loader2, School, Users } from "lucide-react";

const ADMIN_KEY = "coral-lookout-admin-secret";

interface AdminMetrics {
  scansToday: number;
  activeChapters: number;
  openFlags: number;
  partnerLeads: number;
}

interface OpenFlag {
  id: string;
  postId: string;
  reason: string;
  reporterName: string | null;
  createdAt: string;
}

export function AdminMetricsView() {
  const [secret, setSecret] = useState("");
  const [storedSecret, setStoredSecret] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flags, setFlags] = useState<OpenFlag[] | null>(null);
  const [flagsLoading, setFlagsLoading] = useState(false);

  const loadMetrics = useCallback(async (token: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/metrics", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load metrics");
      setMetrics(data as AdminMetrics);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load metrics");
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadFlags = useCallback(async (token: string) => {
    setFlagsLoading(true);
    try {
      const res = await fetch("/api/gallery/flags?status=open", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const data = await res.json();
      if (res.ok) setFlags(data.flags as OpenFlag[]);
    } catch {
      // Non-fatal — moderation list is a bonus panel.
    } finally {
      setFlagsLoading(false);
    }
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem(ADMIN_KEY);
    if (saved) {
      setStoredSecret(saved);
      void loadMetrics(saved);
      void loadFlags(saved);
    }
  }, [loadMetrics, loadFlags]);

  function handleLogin(e: FormEvent) {
    e.preventDefault();
    if (!secret.trim()) return;
    sessionStorage.setItem(ADMIN_KEY, secret.trim());
    setStoredSecret(secret.trim());
    void loadMetrics(secret.trim());
    void loadFlags(secret.trim());
  }

  function handleLogout() {
    sessionStorage.removeItem(ADMIN_KEY);
    setStoredSecret(null);
    setSecret("");
    setMetrics(null);
    setFlags(null);
  }

  if (!storedSecret) {
    return (
      <section className="mx-auto max-w-md px-4 py-16 sm:px-6">
        <PageHeader
          badge="Admin"
          title="Platform Metrics"
          subtitle="Scans today, active chapters, open moderation flags, and partner leads."
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
        </form>
        <p className="text-center mt-6">
          <Link href="/admin/academy" className="text-sm text-cyan-400 hover:underline">
            Academy admin →
          </Link>
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <PageHeader
          badge="Admin"
          title="Platform Metrics"
          subtitle="Scans today, active chapters, open moderation flags, and partner leads."
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => storedSecret && loadMetrics(storedSecret)}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 px-4 py-2 text-sm text-cyan-200 hover:bg-cyan-500/10 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
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

      {error && (
        <p className="text-red-400 text-sm mb-4 glass rounded-lg p-4">{error}</p>
      )}

      {loading && !metrics && !error ? (
        <p className="text-slate-400 text-center py-12">Loading metrics…</p>
      ) : metrics ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <article className="glass rounded-xl p-5">
            <Activity className="h-5 w-5 text-cyan-400 mb-2" />
            <p className="text-2xl font-bold">{metrics.scansToday}</p>
            <p className="text-sm text-slate-400">Scans today</p>
          </article>
          <article className="glass rounded-xl p-5">
            <School className="h-5 w-5 text-teal-400 mb-2" />
            <p className="text-2xl font-bold">{metrics.activeChapters}</p>
            <p className="text-sm text-slate-400">Active chapters</p>
          </article>
          <article className="glass rounded-xl p-5">
            <Flag className="h-5 w-5 text-amber-400 mb-2" />
            <p className="text-2xl font-bold">{metrics.openFlags}</p>
            <p className="text-sm text-slate-400">Open moderation flags</p>
          </article>
          <article className="glass rounded-xl p-5">
            <Users className="h-5 w-5 text-violet-400 mb-2" />
            <p className="text-2xl font-bold">{metrics.partnerLeads}</p>
            <p className="text-sm text-slate-400">Partner leads</p>
          </article>
        </div>
      ) : null}

      {metrics && (
        <article className="glass rounded-xl p-5 mt-6">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <Flag className="h-4 w-4 text-amber-400" />
            Moderation queue — open flags
          </h2>
          {flagsLoading && !flags ? (
            <p className="text-sm text-slate-500">Loading flags…</p>
          ) : !flags || flags.length === 0 ? (
            <p className="text-sm text-slate-500">
              No open flags. Reports from Reef Gallery posts show up here.
            </p>
          ) : (
            <ul className="divide-y divide-cyan-500/10 text-sm">
              {flags.map((f) => (
                <li key={f.id} className="py-2.5 flex flex-col gap-0.5">
                  <span className="text-slate-200">{f.reason}</span>
                  <span className="text-xs text-slate-500">
                    Post {f.postId.slice(0, 8)}… ·{" "}
                    {f.reporterName ?? "Anonymous"} ·{" "}
                    {new Date(f.createdAt).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs text-slate-600 mt-3">
            Stub queue — resolving/dismissing flags is not wired up yet; use
            Supabase directly to update <code>gallery_flags.status</code>.
          </p>
        </article>
      )}
    </section>
  );
}
