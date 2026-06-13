"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, LogIn, Mail, Lock, User } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { formatAuthError } from "@/lib/auth/errors";

export function LoginView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/scanner";
  const { configured, loading, signInWithPassword, signUp, signInWithGoogle, user } =
    useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  if (!loading && user) {
    router.replace(next);
    return null;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error: err } = await signInWithPassword(email.trim(), password);
        if (err) setError(formatAuthError(err));
        else router.push(next);
      } else {
        const { error: err } = await signUp(
          email.trim(),
          password,
          displayName.trim() || undefined
        );
        if (err) setError(formatAuthError(err));
        else
          setMessage(
            "Account created. Check your email to confirm, then sign in."
          );
      }
    } finally {
      setBusy(false);
    }
  }

  async function onGoogle() {
    setError(null);
    setBusy(true);
    const { error: err } = await signInWithGoogle();
    if (err) {
      setError(formatAuthError(err));
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <section className="mx-auto max-w-md px-4 py-16 text-center text-slate-400">
        Loading…
      </section>
    );
  }

  if (!configured) {
    return (
      <section className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-slate-300">
          Sign-in requires Supabase Auth. Add{" "}
          <code className="text-cyan-300">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to{" "}
          <code className="text-cyan-300">.env.local</code> and enable Email + Google
          providers in your Supabase dashboard.
        </p>
        <Link href="/" className="mt-4 inline-block text-cyan-300 underline text-sm">
          Back home
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-md px-4 py-10 sm:py-14">
      <PageHeader
        badge="Account"
        title={mode === "signin" ? "Sign in" : "Create account"}
        subtitle="Save reef scans to your account, sync across devices, and share to the gallery."
      />

      {error && (
        <aside className="mb-4 rounded-xl border border-red-500/30 bg-red-950/30 p-3 text-sm text-red-300">
          {error}
        </aside>
      )}
      {message && (
        <aside className="mb-4 rounded-xl border border-teal-500/30 bg-teal-950/30 p-3 text-sm text-teal-300">
          {message}
        </aside>
      )}

      <article className="glass rounded-2xl p-6 space-y-5">
        <button
          type="button"
          onClick={onGoogle}
          disabled={busy}
          title="Requires Google enabled in Supabase → Authentication → Providers"
          className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-600 bg-white/5 py-3 text-sm font-medium hover:bg-white/10 disabled:opacity-60"
        >
          Continue with Google
        </button>
        <p className="text-[11px] text-slate-500 text-center -mt-2">
          Google must be enabled in your Supabase project. Email sign-in works without it.
        </p>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="h-px flex-1 bg-slate-700" />
          or email
          <span className="h-px flex-1 bg-slate-700" />
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          {mode === "signup" && (
            <label className="block">
              <span className="sr-only">Display name</span>
              <span className="relative block">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Display name (optional)"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full rounded-lg bg-slate-800/50 border border-cyan-500/20 pl-10 pr-4 py-3 text-sm"
                />
              </span>
            </label>
          )}
          <label className="block">
            <span className="sr-only">Email</span>
            <span className="relative block">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                className="w-full rounded-lg bg-slate-800/50 border border-cyan-500/20 pl-10 pr-4 py-3 text-sm"
              />
            </span>
          </label>
          <label className="block">
            <span className="sr-only">Password</span>
            <span className="relative block">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                required
                minLength={6}
                className="w-full rounded-lg bg-slate-800/50 border border-cyan-500/20 pl-10 pr-4 py-3 text-sm"
              />
            </span>
          </label>
          <button
            type="submit"
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 py-3 font-semibold text-slate-900 disabled:opacity-60"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogIn className="h-4 w-4" />
            )}
            {mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400">
          {mode === "signin" ? (
            <>
              New here?{" "}
              <button
                type="button"
                onClick={() => setMode("signup")}
                className="text-cyan-300 underline"
              >
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("signin")}
                className="text-cyan-300 underline"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </article>

      <p className="mt-6 text-center text-xs text-slate-500 leading-relaxed">
        School, tagline, and bio are optional — add them later on{" "}
        <Link href="/community" className="text-cyan-400 underline">
          Community
        </Link>{" "}
        if you want a public profile.
      </p>
    </section>
  );
}
