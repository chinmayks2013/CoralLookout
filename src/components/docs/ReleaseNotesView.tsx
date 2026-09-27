import Link from "next/link";
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";

interface ReleaseItem {
  priority: "P0" | "P1";
  text: string;
}

const SHIPPED: ReleaseItem[] = [
  { priority: "P0", text: "Cohort tagging for school chapters (e.g. Puerto Rico pilot) with region metadata" },
  { priority: "P0", text: "Scan provenance: contributor name, model version, notes, and observed-at timestamps" },
  { priority: "P0", text: "Teacher-created assignments with scan/pin requirements and student completion tracking" },
  { priority: "P0", text: "Reef Gallery report/flag queue, with a lightweight moderation view in Admin Metrics" },
  { priority: "P0", text: "Partner & NGO inquiry form on Community with an auto-reply confirmation and calendar link" },
  { priority: "P0", text: "Public research data export (CSV & GeoJSON) for scans across the platform" },
  { priority: "P1", text: "Admin metrics dashboard: scans today, active chapters, open flags, partner leads" },
  { priority: "P1", text: "Case studies page with honest, in-progress pilot metrics — no invented numbers" },
  { priority: "P1", text: "Dataset citation snippet generator for classroom datasets" },
  { priority: "P1", text: "Honest \"Explicitly later\" deferred roadmap section on the Vision page" },
  { priority: "P1", text: "Demo-grade rate limiting on the AI analyze and image-fetch endpoints" },
  { priority: "P1", text: "Co-teacher / TA invites on the Teacher Dashboard" },
  { priority: "P1", text: "Optional \"Request educator review\" flow with a review status badge" },
  { priority: "P1", text: "Printable partner one-pager for pilot conversations" },
  { priority: "P1", text: "SEO metadata (title, description, Open Graph) across key marketing pages" },
];

function priorityStyles(priority: ReleaseItem["priority"]): string {
  return priority === "P0"
    ? "bg-teal-500/20 text-teal-300 border-teal-500/30"
    : "bg-cyan-500/20 text-cyan-300 border-cyan-500/30";
}

export function ReleaseNotesView() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link
        href="/docs"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Guides & Docs
      </Link>

      <PageHeader
        badge="Release notes"
        title="60-Day Sales Sprint"
        subtitle="What shipped to support the first cohort pilots, partner conversations, and honest data storytelling."
      />

      <article className="glass rounded-2xl p-6 sm:p-8 border border-cyan-500/15">
        <ul className="space-y-3">
          {SHIPPED.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
              <span
                className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${priorityStyles(
                  item.priority
                )}`}
              >
                {item.priority}
              </span>
              <span className="text-sm text-slate-300 leading-relaxed">{item.text}</span>
            </li>
          ))}
        </ul>
        <p className="flex items-start gap-2 text-xs text-slate-500 mt-6 pt-4 border-t border-cyan-500/10">
          <Circle className="h-3 w-3 shrink-0 mt-0.5" />
          Deferred (P3) items — 3D digital twin, drone/robot ingest, full
          predictive AI, and a public API marketplace — are tracked openly on
          the{" "}
          <Link href="/vision" className="text-cyan-300 underline">
            Vision page
          </Link>
          .
        </p>
      </article>
    </section>
  );
}
