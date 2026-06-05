"use client";

import Link from "next/link";
import { User, Camera, MessageSquareText, Gem } from "lucide-react";
import { usePlatform } from "@/context/PlatformContext";
import { safeNumber } from "@/lib/platform/numbers";

export function GallerySidebar() {
  const { state } = usePlatform();
  const corals = safeNumber(state.corals);

  const navClass =
    "flex items-center gap-2.5 w-full rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-200 transition-colors";

  return (
    <aside className="w-full lg:w-56 shrink-0 space-y-3">
      <nav className="glass rounded-xl border border-cyan-500/15 overflow-hidden lg:sticky lg:top-[4.5rem]">
        <div className="px-3 py-3 border-b border-cyan-500/10 bg-slate-950/50">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Reef gallery
          </p>
          <p className="flex items-center gap-1.5 text-sm text-teal-300 mt-1">
            <Gem className="h-4 w-4" />
            {corals} corals
          </p>
        </div>

        <ul className="p-2 space-y-0.5">
          {state.profile && state.userId ? (
            <li>
              <Link href={`/profile/${state.userId}`} className={navClass}>
                <User className="h-4 w-4 text-cyan-400" />
                Your profile
              </Link>
            </li>
          ) : (
            <li>
              <Link href="/community" className={navClass}>
                <User className="h-4 w-4 text-cyan-400" />
                Join community
              </Link>
            </li>
          )}
          <li>
            <Link href="/scanner" className={navClass}>
              <Camera className="h-4 w-4 text-teal-400" />
              New reef scan
            </Link>
          </li>
          <li>
            <Link href="/forum" className={navClass}>
              <MessageSquareText className="h-4 w-4 text-violet-400" />
              Coral forum
            </Link>
          </li>
        </ul>
      </nav>

      <p className="text-[11px] text-slate-500 leading-relaxed px-1 hidden lg:block">
        Share AI reef scans here. For community text discussions, visit the
        coral forum.
      </p>
    </aside>
  );
}
