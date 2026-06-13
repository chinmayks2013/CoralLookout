"use client";

import Link from "next/link";
import { CloudOff } from "lucide-react";

interface CloudSetupBannerProps {
  title: string;
  setupMessage?: string | null;
}

export function CloudSetupBanner({ title, setupMessage }: CloudSetupBannerProps) {
  return (
    <aside className="rounded-xl border border-amber-500/40 bg-amber-950/30 p-5 mb-6 text-sm text-amber-100">
      <div className="flex items-start gap-3">
        <CloudOff className="h-6 w-6 shrink-0 text-amber-400" />
        <div>
          <p className="font-semibold text-amber-200 mb-2">{title}</p>
          <p className="text-amber-100/90 leading-relaxed">
            {setupMessage ??
              "Cloud features need Supabase env vars on your hosting platform (not just localhost)."}
          </p>
          <ol className="mt-3 space-y-1.5 text-xs text-amber-100/80 list-decimal list-inside">
            <li>
              Vercel → Project → Settings → Environment Variables: add{" "}
              <code className="text-amber-200">NEXT_PUBLIC_SUPABASE_URL</code>,{" "}
              <code className="text-amber-200">SUPABASE_SERVICE_ROLE_KEY</code>,{" "}
              <code className="text-amber-200">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
            </li>
            <li>Redeploy after saving env vars</li>
            <li>
              Run <code className="text-amber-200">supabase/schema.sql</code> in Supabase SQL Editor
            </li>
            <li>
              Check: <code className="text-amber-200">/api/health</code> on your live site —{" "}
              <code className="text-amber-200">galleryReady</code> should be{" "}
              <code className="text-amber-200">true</code>
            </li>
          </ol>
          <Link
            href="/api/health"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-3 text-amber-200 underline text-xs"
          >
            Open cloud health check →
          </Link>
        </div>
      </div>
    </aside>
  );
}
