import Link from "next/link";
import { Waves } from "lucide-react";

/** Footer links are non-essential — disable prefetch to cut edge request volume. */
const footerLinkClass = "hover:text-white";

export function Footer() {
  return (
    <footer className="border-t border-cyan-500/20 bg-slate-950/80 mt-auto">
      <div className="mx-auto max-w-7xl px-3 py-8 sm:px-6 sm:py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-6">
          <div className="sm:col-span-2">
            <div className="flex items-center gap-2 font-bold text-lg mb-3">
              <Waves className="h-6 w-6 text-cyan-400" />
              <span className="gradient-text">Coral Lookout</span>
            </div>
            <p className="text-slate-400 text-sm max-w-md leading-relaxed">
              Building the world&apos;s largest student-driven coral reef
              monitoring and conservation network — powered by AI, science,
              and young innovators worldwide.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-cyan-300 mb-3">Platform</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/scanner" prefetch={false} className={footerLinkClass}>
                  AI Coral Scanner
                </Link>
              </li>
              <li>
                <Link href="/map" prefetch={false} className={footerLinkClass}>
                  Global Reef Map
                </Link>
              </li>
              <li>
                <Link href="/gallery" prefetch={false} className={footerLinkClass}>
                  Reef Gallery
                </Link>
              </li>
              <li>
                <Link href="/academy" prefetch={false} className={footerLinkClass}>
                  Reef Academy
                </Link>
              </li>
              <li>
                <Link href="/research" prefetch={false} className={footerLinkClass}>
                  Research Dashboard
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-cyan-300 mb-3">Community</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/compete" prefetch={false} className={footerLinkClass}>
                  Competitions
                </Link>
              </li>
              <li>
                <Link href="/challenges" prefetch={false} className={footerLinkClass}>
                  Challenges
                </Link>
              </li>
              <li>
                <Link href="/community" prefetch={false} className={footerLinkClass}>
                  Join a Team
                </Link>
              </li>
              <li>
                <Link href="/forum" prefetch={false} className={footerLinkClass}>
                  Coral Forum
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-cyan-300 mb-3">For partners</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/vision" prefetch={false} className={footerLinkClass}>
                  Vision & data moat
                </Link>
              </li>
              <li>
                <Link href="/business" prefetch={false} className={footerLinkClass}>
                  Business model
                </Link>
              </li>
              <li>
                <Link href="/teacher" prefetch={false} className={footerLinkClass}>
                  Teacher dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/community?partner=inquiry"
                  prefetch={false}
                  className={footerLinkClass}
                >
                  NGO partnerships
                </Link>
              </li>
              <li>
                <Link href="/founder" prefetch={false} className={footerLinkClass}>
                  Founder
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-cyan-300 mb-3">Schools & docs</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/schools" prefetch={false} className={footerLinkClass}>
                  For schools
                </Link>
              </li>
              <li>
                <Link href="/pilot" prefetch={false} className={footerLinkClass}>
                  Student quick start
                </Link>
              </li>
              <li>
                <Link href="/case-studies" prefetch={false} className={footerLinkClass}>
                  Case studies
                </Link>
              </li>
              <li>
                <Link href="/docs" prefetch={false} className={footerLinkClass}>
                  Guides
                </Link>
              </li>
              <li>
                <Link href="/privacy" prefetch={false} className={footerLinkClass}>
                  Privacy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <p className="mt-8 text-center text-xs text-slate-500">
          © 2026 Coral Lookout. Student-driven reef conservation for a living
          ocean.
        </p>
      </div>
    </footer>
  );
}
