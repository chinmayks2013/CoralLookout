"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, CloudOff, Users } from "lucide-react";

interface CloudSetupBannerProps {
  title?: string;
  setupMessage?: string | null;
  feature?: "gallery" | "forum";
}

const FEATURE_COPY = {
  gallery: {
    headline: "Shared reef gallery coming online",
    body: "Our student-led team is connecting the global gallery so every reef scan can be seen, discussed, and learned from across the community.",
  },
  forum: {
    headline: "Community forum connecting soon",
    body: "Coral Lookout is wiring up a shared space for reef discussions — built so young conservationists can learn from each other in one place.",
  },
} as const;

export function CloudSetupBanner({
  title,
  setupMessage,
  feature = "gallery",
}: CloudSetupBannerProps) {
  const [showAdmin, setShowAdmin] = useState(false);
  const copy = FEATURE_COPY[feature];

  return (
    <aside className="rounded-xl border border-cyan-500/30 bg-gradient-to-br from-slate-900/80 to-cyan-950/30 p-5 mb-6 text-sm">
      <div className="flex items-start gap-3">
        <CloudOff className="h-6 w-6 shrink-0 text-cyan-400 mt-0.5" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-cyan-100 mb-1.5">
            {title ?? copy.headline}
          </p>
          <p className="text-slate-300 leading-relaxed text-pretty">
            {setupMessage ? (
              <span className="text-amber-100/90">{setupMessage}</span>
            ) : (
              copy.body
            )}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/founder"
              className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-200 hover:bg-cyan-500/20"
            >
              <Users className="h-3.5 w-3.5" />
              Meet the founder
            </Link>
            <Link
              href="/community"
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-600 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/5"
            >
              Join the community
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setShowAdmin((v) => !v)}
            className="mt-4 inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-400"
          >
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${showAdmin ? "rotate-180" : ""}`}
            />
            Site administrator setup
          </button>

          {showAdmin && (
            <ol className="mt-2 space-y-1.5 text-xs text-slate-400 list-decimal list-inside border-t border-slate-700/50 pt-3">
              <li>
                Vercel → Settings → Environment Variables:{" "}
                <code className="text-cyan-300/90">NEXT_PUBLIC_SUPABASE_URL</code>,{" "}
                <code className="text-cyan-300/90">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>,{" "}
                <code className="text-cyan-300/90">SUPABASE_SERVICE_ROLE_KEY</code>
              </li>
              <li>Redeploy production after saving (required for build-time vars)</li>
              <li>
                Or locally: <code className="text-cyan-300/90">npm run push:vercel-env</code>
              </li>
              <li>
                Verify{" "}
                <Link href="/api/health" className="text-cyan-400 underline">
                  /api/health
                </Link>{" "}
                — <code className="text-cyan-300/90">galleryReady: true</code>
              </li>
            </ol>
          )}
        </div>
      </div>
    </aside>
  );
}
