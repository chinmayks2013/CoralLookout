import Link from "next/link";
import { Waves } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-cyan-500/20 bg-slate-950/80 mt-auto">
      <div className="mx-auto max-w-7xl px-3 py-8 sm:px-6 sm:py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="md:col-span-2">
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
                <Link href="/scanner" className="hover:text-white">
                  AI Coral Scanner
                </Link>
              </li>
              <li>
                <Link href="/map" className="hover:text-white">
                  Global Reef Map
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-white">
                  Reef Gallery
                </Link>
              </li>
              <li>
                <Link href="/academy" className="hover:text-white">
                  Reef Academy
                </Link>
              </li>
              <li>
                <Link href="/research" className="hover:text-white">
                  Research Dashboard
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-cyan-300 mb-3">Community</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/compete" className="hover:text-white">
                  Competitions
                </Link>
              </li>
              <li>
                <Link href="/challenges" className="hover:text-white">
                  Challenges
                </Link>
              </li>
              <li>
                <Link href="/community" className="hover:text-white">
                  Join a Team
                </Link>
              </li>
              <li>
                <Link href="/forum" className="hover:text-white">
                  Coral Forum
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-cyan-300 mb-3">For partners</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/business" className="hover:text-white">
                  Business model
                </Link>
              </li>
              <li>
                <Link href="/teacher" className="hover:text-white">
                  Teacher dashboard
                </Link>
              </li>
              <li>
                <Link href="/community?school=pilot" className="hover:text-white">
                  School pilots
                </Link>
              </li>
              <li>
                <Link href="/community?partner=inquiry" className="hover:text-white">
                  NGO partnerships
                </Link>
              </li>
              <li>
                <Link href="/founder" className="hover:text-white">
                  Founder
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
