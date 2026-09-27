import { BadgeCheck, Clock3 } from "lucide-react";

export type ReviewStatus = "none" | "needs_review" | "educator_verified";

const LABELS: Record<ReviewStatus, string> = {
  none: "Not reviewed",
  needs_review: "Pending educator review",
  educator_verified: "Educator verified",
};

const STYLES: Record<ReviewStatus, string> = {
  none: "bg-slate-500/15 text-slate-400 border-slate-500/25",
  needs_review: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  educator_verified: "bg-teal-500/15 text-teal-300 border-teal-500/30",
};

export function getReviewStatusLabel(status: ReviewStatus): string {
  return LABELS[status];
}

export function ReviewBadge({
  status,
  className = "",
}: {
  status: ReviewStatus;
  className?: string;
}) {
  if (status === "none") return null;
  const Icon = status === "educator_verified" ? BadgeCheck : Clock3;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${STYLES[status]} ${className}`}
    >
      <Icon className="h-3 w-3" />
      {LABELS[status]}
    </span>
  );
}
