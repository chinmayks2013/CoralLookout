"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, Menu, User, Waves, X } from "lucide-react";
import { usePlatform } from "@/context/PlatformContext";
import { useAuth } from "@/context/AuthContext";

const primaryLinks = [
  { href: "/scanner", label: "Scanner" },
  { href: "/academy", label: "Academy" },
  { href: "/gallery", label: "Gallery" },
  { href: "/forum", label: "Forum" },
  { href: "/map", label: "Map" },
];

const moreLinks = [
  { href: "/challenges", label: "Challenges" },
  { href: "/research", label: "Research" },
  { href: "/compete", label: "Compete" },
  { href: "/community", label: "Community" },
  { href: "/teacher", label: "Teachers" },
  { href: "/business", label: "Partners" },
  { href: "/founder", label: "Founder" },
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
  const { user, loading: authLoading, signOut, configured: authConfigured } =
    useAuth();
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  const hasProfile = hydrated && Boolean(state.profile?.name?.trim());
  const signedIn = authConfigured && Boolean(user);
  const inClass =
    state.schoolChapterRole === "student" && Boolean(state.schoolChapterId);

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
          {primaryLinks.map((link) => (
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
          {!authLoading && authConfigured && (
            signedIn ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/community"
                  className="inline-flex items-center gap-1 rounded-full border border-cyan-500/30 px-3 py-1.5 text-xs font-medium text-cyan-300 hover:bg-cyan-500/10 max-w-[8rem] truncate"
                  title={state.profile?.name ?? user?.email ?? "Account"}
                >
                  <User className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">
                    {state.profile?.name ?? user?.email?.split("@")[0]}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => void signOut()}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-600 px-2.5 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-white/5"
                  aria-label="Sign out"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <Link
                href={`/login?next=${encodeURIComponent(pathname)}`}
                className="hidden sm:inline-flex rounded-full border border-cyan-500/40 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/10"
              >
                Sign in
              </Link>
            )
          )}
          <Link
            href="/academy"
            className="hidden md:inline-flex rounded-full border border-emerald-500/40 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/10"
          >
            Academy
          </Link>
          <Link
            href="/scanner"
            className="hidden sm:inline-flex rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 px-3 py-1.5 text-xs font-semibold text-slate-900 hover:opacity-90 sm:px-3.5"
          >
            Scan
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
            {primaryLinks.map((link) => (
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
            href="/academy"
            onClick={() => setOpen(false)}
            className="mt-3 block rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-center text-sm font-semibold text-slate-900"
          >
            Reef Academy
          </Link>
          <Link
            href="/scanner"
            onClick={() => setOpen(false)}
            className="mt-2 block rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 px-4 py-2.5 text-center text-sm font-semibold text-slate-900"
          >
            Scan reef
          </Link>
          {authConfigured && !signedIn && (
            <Link
              href={`/login?next=${encodeURIComponent(pathname)}`}
              onClick={() => setOpen(false)}
              className="mt-2 block rounded-full border border-cyan-500/40 px-4 py-2.5 text-center text-sm font-semibold text-cyan-300"
            >
              Sign in
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
