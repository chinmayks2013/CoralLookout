"use client";

import Link from "next/link";
import { User, Camera, Images, Gem } from "lucide-react";
import { usePlatform } from "@/context/PlatformContext";
import { safeNumber } from "@/lib/platform/numbers";

export function ForumSidebar() {
  const { state } = usePlatform();
  const corals = safeNumber(state.corals);

  const navClass =
    "flex items-center gap-2.5 w-full rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-violet-500/10 hover:text-violet-200 transition-colors";

  return (
    <aside className="w-full lg:w-56 shrink-0 space-y-3">
      <nav className="glass rounded-xl border border-violet-500/20 overflow-hidden lg:sticky lg:top-[4.5rem]">
        <div className="px-3 py-3 border-b border-violet-500/10 bg-slate-950/50">
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-300/80">
            Coral forum
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
            <Link href="/gallery" className={navClass}>
              <Images className="h-4 w-4 text-teal-400" />
              Reef gallery
            </Link>
          </li>
          <li>
            <Link href="/scanner" className={navClass}>
              <Camera className="h-4 w-4 text-cyan-400" />
              New reef scan
            </Link>
          </li>
        </ul>
      </nav>

      <p className="text-[11px] text-slate-500 leading-relaxed px-1 hidden lg:block">
        Discuss corals with the whole community. Optional images welcome if
        they support your topic.
      </p>
    </aside>
  );
}
