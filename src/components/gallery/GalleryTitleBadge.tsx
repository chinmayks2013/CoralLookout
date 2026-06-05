"use client";

import type { TopPercentTiers, TopTier } from "@/lib/gallery/leaderboard";
import { AuthorLink } from "./AuthorLink";

export type GalleryTitleKind =
  | "top-creator"
  | "top-commenter"
  | "top-donor";

type TitleRole = "creator" | "commenter" | "donor";

const TIER_STYLES: Record<TopTier, string> = {
  1: "bg-amber-500/25 text-amber-200 border-amber-400/50",
  5: "bg-violet-500/20 text-violet-300 border-violet-500/40",
  10: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
};

const ROLE_LABEL: Record<TitleRole, string> = {
  creator: "Coral Enthusiast",
  commenter: "Commenter",
  donor: "Donor",
};

function tierForRole(
  tiers: TopPercentTiers,
  role: TitleRole,
  userId: string
): TopTier | undefined {
  const map =
    role === "creator"
      ? tiers.creators
      : role === "commenter"
        ? tiers.commenters
        : tiers.donors;
  return map.get(userId);
}

export function galleryTitlesForUser(
  userId: string,
  tiers: TopPercentTiers
): GalleryTitleKind[] {
  const titles: GalleryTitleKind[] = [];
  if (tiers.creators.has(userId)) titles.push("top-creator");
  if (tiers.commenters.has(userId)) titles.push("top-commenter");
  if (tiers.donors.has(userId)) titles.push("top-donor");
  return titles;
}

export function GalleryTitleBadge({
  role,
  tier,
}: {
  role: TitleRole;
  tier: TopTier;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${TIER_STYLES[tier]}`}
    >
      Top {tier}% {ROLE_LABEL[role]}
    </span>
  );
}

export function GalleryAuthorLine({
  userId,
  name,
  tiers,
}: {
  userId: string;
  name: string;
  tiers: TopPercentTiers;
}) {
  const creatorTier = tierForRole(tiers, "creator", userId);
  const commenterTier = tierForRole(tiers, "commenter", userId);
  const donorTier = tierForRole(tiers, "donor", userId);

  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <AuthorLink userId={userId} name={name} />
      {creatorTier && <GalleryTitleBadge role="creator" tier={creatorTier} />}
      {commenterTier && (
        <GalleryTitleBadge role="commenter" tier={commenterTier} />
      )}
      {donorTier && <GalleryTitleBadge role="donor" tier={donorTier} />}
    </span>
  );
}
