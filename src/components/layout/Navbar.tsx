"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, Waves, X } from "lucide-react";
import { usePlatform } from "@/context/PlatformContext";
import { isHackathonMode } from "@/lib/hackathon/config";

const primaryLinks = [
  { href: "/scanner", label: "Scanner" },
  { href: "/gallery", label: "Gallery" },
  { href: "/forum", label: "Forum" },
  { href: "/map", label: "Map" },
];

const moreLinks = [
  { href: "/academy", label: "Academy" },
  { href: "/challenges", label: "Challenges" },
  { href: "/research", label: "Research" },
  { href: "/compete", label: "Compete" },
  { href: "/community", label: "Community" },
  { href: "/teacher", label: "Teachers" },
  { href: "/business", label: "Partners" },
];

function NavLink({
  href,
  label,
  pathname,
}: {
  href: string;
  label: string;
  pathname: string;
}) {
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      className={`whitespace-nowrap rounded-md px-2 py-1.5 text-xs font-medium transition-colors lg:px-2.5 lg:text-sm ${
        active
          ? "bg-cyan-500/20 text-cyan-300"
          : "text-slate-300 hover:bg-white/5 hover:text-white"
      }`}
    >
      {label}
    </Link>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const { state, hydrated } = usePlatform();
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  const hasProfile = hydrated && Boolean(state.profile);
  const inClass =
    state.schoolChapterRole === "student" && Boolean(state.schoolChapterId);
  const hackathon = isHackathonMode();
  const navPrimary = hackathon
    ? [{ href: "/pitch", label: "Pitch" }, ...primaryLinks]
    : primaryLinks;

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
    setMoreOpen(false);
  }, [pathname]);

  const moreActive = moreLinks.some(
    (l) => pathname === l.href || pathname.startsWith(`${l.href}/`)
  );

  const mobileLinkClass = (href: string) =>
    `rounded-lg px-3 py-2.5 text-sm font-medium ${
      pathname === href || pathname.startsWith(`${href}/`)
        ? "bg-cyan-500/20 text-cyan-300"
        : "text-slate-300 hover:bg-white/5"
    }`;

  return (
    <header className="glass border-b border-cyan-500/10 pt-safe">
      <nav className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-3 sm:gap-3 sm:px-5 min-w-0">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-1.5 font-bold text-sm sm:text-base lg:text-lg min-w-0"
        >
          <Waves className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-400 shrink-0" />
          <span className="gradient-text truncate max-w-[42vw] sm:max-w-none sm:truncate">
            Coral Lookout
          </span>
        </Link>

        <div className="hidden lg:flex min-w-0 flex-1 items-center justify-end gap-0.5 xl:justify-center xl:gap-1">
          {navPrimary.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              label={link.label}
              pathname={pathname}
            />
          ))}

          {hasProfile && (
            <NavLink
              href="/class"
              label={inClass ? "My class" : "Join class"}
              pathname={pathname}
            />
          )}

          <div className="relative shrink-0" ref={moreRef}>
            <button
              type="button"
              onClick={() => setMoreOpen(!moreOpen)}
              className={`inline-flex items-center gap-0.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors lg:text-sm ${
                moreActive || moreOpen
                  ? "bg-cyan-500/20 text-cyan-300"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
              aria-expanded={moreOpen}
              aria-haspopup="true"
            >
              More
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${moreOpen ? "rotate-180" : ""}`}
              />
            </button>
            {moreOpen && (
              <div className="absolute right-0 top-full z-50 mt-1 min-w-[11rem] rounded-lg border border-cyan-500/20 bg-slate-950/95 py-1 shadow-xl backdrop-blur-md xl:left-0 xl:right-auto">
                {moreLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMoreOpen(false)}
                    className={`block px-3 py-2 text-sm ${
                      pathname === link.href
                        ? "bg-cyan-500/15 text-cyan-300"
                        : "text-slate-300 hover:bg-white/5"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Link
            href="/scanner"
            className={`hidden sm:inline-flex rounded-full px-3 py-1.5 text-xs font-semibold sm:px-3.5 ${
              hackathon
                ? "bg-gradient-to-r from-violet-500 to-cyan-500 text-slate-950 hover:opacity-90"
                : "bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-900 hover:opacity-90"
            }`}
          >
            {hackathon ? "Demo" : "Scan"}
          </Link>

          <button
            type="button"
            className="lg:hidden p-2 -mr-1 text-slate-300"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="lg:hidden border-t border-cyan-500/15 px-3 py-3 max-h-[calc(100dvh-3.5rem-env(safe-area-inset-top))] overflow-y-auto overscroll-contain">
          <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
            {navPrimary.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={mobileLinkClass(link.href)}
              >
                {link.label}
              </Link>
            ))}
            {hasProfile && (
              <Link
                href="/class"
                onClick={() => setOpen(false)}
                className={mobileLinkClass("/class")}
              >
                {inClass ? "My class" : "Join class"}
              </Link>
            )}
          </div>
          <p className="text-[10px] uppercase tracking-wide text-slate-500 mt-3 mb-1.5 px-1">
            More
          </p>
          <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
            {moreLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={mobileLinkClass(link.href)}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <Link
            href="/scanner"
            onClick={() => setOpen(false)}
            className="mt-3 block rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 px-4 py-2.5 text-center text-sm font-semibold text-slate-950"
          >
            {hackathon ? "Start demo" : "Scan reef"}
          </Link>
        </div>
      )}
    </header>
  );
}
