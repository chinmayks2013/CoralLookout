import type { GalleryPost } from "./types";
import type { LeaderboardUser } from "./types";

export type TopTier = 1 | 5 | 10;

export interface TopPercentTiers {
  creators: Map<string, TopTier>;
  commenters: Map<string, TopTier>;
  donors: Map<string, TopTier>;
}

/** One exclusive tier per user: 1% beats 5% beats 10% (no stacking). */
function buildExclusiveTiers(entries: Map<string, number>): Map<string, TopTier> {
  const sorted = [...entries.entries()].sort((a, b) => b[1] - a[1]);
  const n = sorted.length;
  if (n === 0) return new Map();

  const top1End = Math.max(1, Math.ceil(n * 0.01));
  const top5End = Math.max(top1End, Math.ceil(n * 0.05));
  const top10End = Math.max(top5End, Math.ceil(n * 0.1));

  const tiers = new Map<string, TopTier>();
  sorted.forEach(([userId], index) => {
    if (index < top1End) tiers.set(userId, 1);
    else if (index < top5End) tiers.set(userId, 5);
    else if (index < top10End) tiers.set(userId, 10);
  });
  return tiers;
}

export function getTopPercentTiers(posts: GalleryPost[]): TopPercentTiers {
  const creatorViews = new Map<string, number>();
  const commenterCounts = new Map<string, number>();
  const donorCounts = new Map<string, number>();

  for (const post of posts) {
    creatorViews.set(
      post.authorId,
      (creatorViews.get(post.authorId) ?? 0) + post.viewCount
    );
    for (const c of post.comments) {
      if (c.authorId === post.authorId) continue;
      commenterCounts.set(
        c.authorId,
        (commenterCounts.get(c.authorId) ?? 0) + 1
      );
    }
    for (const d of post.donations) {
      if (d.fromId === post.authorId) continue;
      donorCounts.set(d.fromId, (donorCounts.get(d.fromId) ?? 0) + d.amount);
    }
  }

  return {
    creators: buildExclusiveTiers(creatorViews),
    commenters: buildExclusiveTiers(commenterCounts),
    donors: buildExclusiveTiers(donorCounts),
  };
}

/** @deprecated Use getTopPercentTiers */
export type TopPercentSets = TopPercentTiers;

export function getTopPercentSets(posts: GalleryPost[]): TopPercentTiers {
  return getTopPercentTiers(posts);
}

export function getTopPercentUsers(
  posts: GalleryPost[],
  kind: "commenters" | "donors",
  topPercent = 10
): LeaderboardUser[] {
  const counts = new Map<string, { name: string; score: number }>();

  for (const post of posts) {
    if (kind === "commenters") {
      for (const c of post.comments) {
        if (c.authorId === post.authorId) continue;
        const cur = counts.get(c.authorId) ?? {
          name: c.authorName,
          score: 0,
        };
        cur.score += 1;
        counts.set(c.authorId, cur);
      }
    } else {
      for (const d of post.donations) {
        if (d.fromId === post.authorId) continue;
        const cur = counts.get(d.fromId) ?? {
          name: d.fromName,
          score: 0,
        };
        cur.score += d.amount;
        counts.set(d.fromId, cur);
      }
    }
  }

  const sorted = [...counts.entries()]
    .map(([userId, { name, score }]) => ({ userId, name, score }))
    .sort((a, b) => b.score - a.score);

  if (sorted.length === 0) return [];

  const cutoff = Math.max(1, Math.ceil(sorted.length * (topPercent / 100)));
  return sorted.slice(0, cutoff);
}

export function getPostScore(post: GalleryPost): number {
  const donationSum = post.donations.reduce((s, d) => s + d.amount, 0);
  const othersComments = post.comments.filter(
    (c) => c.authorId !== post.authorId
  ).length;
  return (
    post.upvotes * 2 +
    othersComments * 3 +
    donationSum +
    Math.floor(post.viewCount * 0.5)
  );
}
