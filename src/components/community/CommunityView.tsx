"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { usePlatform } from "@/context/PlatformContext";
import { safeNumber } from "@/lib/platform/numbers";
import {
  Users,
  School,
  Upload,
  CheckCircle,
  Gem,
  Eye,
  Heart,
  Sparkles,
  ExternalLink,
  GraduationCap,
} from "lucide-react";

const REGIONS = [
  "North America",
  "Caribbean",
  "South America",
  "Europe",
  "Africa",
  "Middle East",
  "South Asia",
  "East Asia",
  "Southeast Asia",
  "Australia & Pacific",
];

export function CommunityView() {
  const searchParams = useSearchParams();
  const schoolPilot = searchParams.get("school") === "pilot";
  const partnerInquiry = searchParams.get("partner") === "inquiry";

  const { state, register, hydrated } = usePlatform();
  const [name, setName] = useState(state.profile?.name ?? "");
  const [school, setSchool] = useState(state.profile?.school ?? "");
  const [email, setEmail] = useState(state.profile?.email ?? "");
  const [region, setRegion] = useState(state.profile?.region ?? "");
  const [bio, setBio] = useState(state.profile?.bio ?? "");
  const [tagline, setTagline] = useState(state.profile?.tagline ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !school.trim() || !email.trim()) {
      setError("Please fill in name, school, and email.");
      return;
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email.");
      return;
    }
    register({
      name: name.trim(),
      school: school.trim(),
      email: email.trim(),
      region: region.trim() || undefined,
      bio: bio.trim() || undefined,
      tagline: tagline.trim() || undefined,
      joinedAt: state.profile?.joinedAt,
    });
    setMessage(
      "Profile saved. Your public page is live — share, comment, and earn corals from community engagement."
    );
  }

  const initials = state.profile
    ? state.profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  const corals = safeNumber(state.corals);

  if (!hydrated) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-12 text-center text-slate-400">
        Loading community...
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-3 py-8 sm:px-6 sm:py-12 min-w-0">
      <PageHeader
        badge="Community"
        title="Join the Reef Community"
        subtitle="Anyone can take part—comment, share reef scans, or cheer on fellow Coral Enthusiasts. Build your profile and earn corals along the way."
      />

      {(schoolPilot || partnerInquiry) && (
        <aside className="mb-6 rounded-xl border border-teal-500/30 bg-teal-950/40 p-5 text-sm">
          <p className="font-semibold text-teal-200 mb-1">
            {schoolPilot ? "School chapter pilot" : "Research & NGO partnership"}
          </p>
          <p className="text-slate-300 leading-relaxed">
            {schoolPilot
              ? "Teachers: set up your chapter on the Teacher Dashboard. Students join with the class code on My Class after signing in."
              : "Tell us about your organization in your bio — we’ll follow up about data exports, API access, and annual partnership options."}
          </p>
          {schoolPilot && (
            <Link
              href="/teacher"
              className="inline-block mt-3 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 px-5 py-2 text-sm font-semibold text-slate-900"
            >
              Open Teacher Dashboard →
            </Link>
          )}
          {!schoolPilot && (
            <Link
              href="/business"
              className="inline-block mt-2 text-cyan-300 underline text-xs"
            >
              View full business model →
            </Link>
          )}
        </aside>
      )}

      {message && (
        <aside className="mb-6 glass rounded-xl p-4 border border-teal-500/30 text-teal-300 text-sm flex items-center gap-2">
          <CheckCircle className="h-4 w-4 shrink-0" />
          {message}
        </aside>
      )}
      {error && (
        <aside className="mb-6 glass rounded-xl p-4 border border-red-500/30 text-red-300 text-sm">
          {error}
        </aside>
      )}

      <section className="grid gap-6 lg:grid-cols-3 mb-12">
        <article className="lg:col-span-2 glass rounded-2xl p-8">
          <h2 className="text-xl font-bold mb-2">
            {state.profile ? "Update your profile" : "Create your community profile"}
          </h2>
          <p className="text-slate-400 mb-6 text-sm leading-relaxed">
            This powers your public Coral Enthusiast page — bio, tagline, and school show on{" "}
            <Link href="/gallery" className="text-cyan-300 underline">
              gallery
            </Link>{" "}
            posts. Publish scans to earn corals when others view, comment, and donate.
          </p>
          <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
            <input
              type="text"
              placeholder="Display name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-lg bg-slate-800/50 border border-cyan-500/20 px-4 py-3 text-sm focus:outline-none focus:border-cyan-400"
            />
            <input
              type="text"
              placeholder="School / Organization"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              className="rounded-lg bg-slate-800/50 border border-cyan-500/20 px-4 py-3 text-sm focus:outline-none focus:border-cyan-400"
            />
            <input
              type="email"
              placeholder="Email (private — not shown publicly)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg bg-slate-800/50 border border-cyan-500/20 px-4 py-3 text-sm focus:outline-none focus:border-cyan-400 sm:col-span-2"
            />
            <input
              type="text"
              placeholder="Tagline (e.g. Coral enthusiast · student diver · Cairns)"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              maxLength={120}
              className="rounded-lg bg-slate-800/50 border border-cyan-500/20 px-4 py-3 text-sm focus:outline-none focus:border-cyan-400 sm:col-span-2"
            />
            <textarea
              placeholder="Bio — your reef story, focus species, dive experience…"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={500}
              rows={4}
              className="rounded-lg bg-slate-800/50 border border-cyan-500/20 px-4 py-3 text-sm focus:outline-none focus:border-cyan-400 sm:col-span-2 resize-y"
            />
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="rounded-lg bg-slate-800/50 border border-cyan-500/20 px-4 py-3 text-sm focus:outline-none focus:border-cyan-400 sm:col-span-2 text-slate-300"
            >
              <option value="">Region (optional)</option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="sm:col-span-2 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 py-3 font-semibold text-slate-900"
            >
              {state.profile ? "Save profile" : "Join as Coral Enthusiast (+25 pts, +50 corals)"}
            </button>
          </form>
        </article>

        <article className="glass rounded-2xl p-6 space-y-5">
          <h3 className="font-bold">Your dashboard</h3>
          <div className="flex items-center gap-3">
            <span className="h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center text-xl font-bold text-slate-900">
              {initials}
            </span>
            <span>
              <p className="font-medium">{state.profile?.name ?? "Guest"}</p>
              <p className="text-xs text-slate-400">
                {state.profile?.tagline ?? state.profile?.school ?? "Not registered"}
              </p>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="rounded-lg bg-slate-900/50 p-3">
              <Gem className="h-5 w-5 text-teal-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-teal-300">{corals}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">Corals</p>
            </div>
            <div className="rounded-lg bg-slate-900/50 p-3">
              <Sparkles className="h-5 w-5 text-cyan-400 mx-auto mb-1" />
              <p className="text-lg font-bold">{state.points}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">Points</p>
            </div>
          </div>

          <ul className="text-sm text-slate-400 space-y-2">
            <li className="flex items-center gap-2">
              <Upload className="h-4 w-4 text-cyan-400 shrink-0" />
              {state.scans.length} map observations
            </li>
            <li className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-violet-400 shrink-0" />
              Gallery views earn visibility
            </li>
            <li className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-teal-400 shrink-0" />
              {state.coralsReceived} corals received · {state.coralsDonated} given
            </li>
          </ul>

          {state.profile && state.userId && (
            <Link
              href={`/profile/${state.userId}`}
              className="flex items-center justify-center gap-2 w-full rounded-lg border border-cyan-500/30 py-2.5 text-sm text-cyan-300 hover:bg-cyan-500/10"
            >
              View public profile
              <ExternalLink className="h-4 w-4" />
            </Link>
          )}
        </article>
      </section>

      {state.profile && state.userId && (
        <section className="mb-12">
          <article className="glass rounded-2xl p-6 max-w-xl flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-teal-400" />
                School class
              </h2>
              <p className="text-sm text-slate-400">
                {state.schoolChapterRole === "student"
                  ? "Open your class dashboard for classmates and the leaderboard."
                  : "Your teacher shared a code? Join after you sign in — only students use this flow."}
              </p>
            </div>
            <Link
              href="/class"
              className="shrink-0 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-900"
            >
              {state.schoolChapterRole === "student" ? "My class" : "Join class"}
            </Link>
          </article>
        </section>
      )}

      <section>
        <h2 className="text-xl font-bold mb-4">How corals work</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <article className="glass rounded-xl p-5 text-sm">
            <p className="font-semibold text-cyan-300 mb-2">1. Publish</p>
            <p className="text-slate-400">
              Share a scan to the Reef Gallery from the scanner (+15 corals). Confirm you
              own rights to the image.
            </p>
          </article>
          <article className="glass rounded-xl p-5 text-sm">
            <p className="font-semibold text-violet-300 mb-2">2. Grow views</p>
            <p className="text-slate-400">
              Each unique view on your posts builds your stats and hot ranking.
            </p>
          </article>
          <article className="glass rounded-xl p-5 text-sm">
            <p className="font-semibold text-teal-300 mb-2">3. Earn support</p>
            <p className="text-slate-400">
              Comment on others&apos; posts (+2 corals for you). Donations go to post authors.
            </p>
          </article>
        </div>
      </section>

      {state.profile && (
        <section className="mt-10">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <School className="h-5 w-5 text-cyan-400" />
            {state.profile.school}
          </h2>
          <article className="glass rounded-xl p-6 max-w-xl">
            <p className="text-sm text-cyan-400">
              {state.profile.region ?? "Region not set"}
            </p>
            {state.profile.bio && (
              <p className="text-sm text-slate-300 mt-3 leading-relaxed">{state.profile.bio}</p>
            )}
            <p className="flex gap-4 mt-4 text-sm text-slate-400">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />1 member (you)
              </span>
              <span className="flex items-center gap-1">
                <Upload className="h-4 w-4" />
                {state.scans.length} uploads
              </span>
            </p>
          </article>
        </section>
      )}
    </section>
  );
}
