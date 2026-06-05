import type { CreatorStats, GalleryPost } from "./types";

export function buildCreatorStatsFromPosts(
  posts: GalleryPost[],
  userId: string
): CreatorStats | null {
  const authorPosts = posts.filter((p) => p.authorId === userId);
  if (authorPosts.length === 0) return null;

  const first = authorPosts[0];

  let coralsReceived = 0;
  let totalUpvotes = 0;
  let totalComments = 0;
  let totalViews = 0;

  for (const post of authorPosts) {
    coralsReceived += post.donations.reduce((s, d) => s + d.amount, 0);
    totalUpvotes += post.upvotes;
    totalComments += post.comments.length;
    totalViews += post.viewCount;
  }

  let coralsDonated = 0;
  for (const post of posts) {
    for (const d of post.donations) {
      if (d.fromId === userId) coralsDonated += d.amount;
    }
  }

  return {
    userId,
    displayName: first.authorName,
    school: first.authorSchool,
    postCount: authorPosts.length,
    totalViews,
    totalUpvotes,
    totalComments,
    coralsReceived,
    coralsDonated,
  };
}

export function getTopCreatorsByViews(
  posts: GalleryPost[],
  limit = 10
): CreatorStats[] {
  const byAuthor = new Map<string, CreatorStats>();

  for (const post of posts) {
    const existing = byAuthor.get(post.authorId);
    if (existing) {
      existing.postCount += 1;
      existing.totalViews += post.viewCount;
      existing.totalUpvotes += post.upvotes;
      existing.totalComments += post.comments.length;
      existing.coralsReceived += post.donations.reduce(
        (s, d) => s + d.amount,
        0
      );
    } else {
      byAuthor.set(post.authorId, {
        userId: post.authorId,
        displayName: post.authorName,
        school: post.authorSchool,
        postCount: 1,
        totalViews: post.viewCount,
        totalUpvotes: post.upvotes,
        totalComments: post.comments.length,
        coralsReceived: post.donations.reduce((s, d) => s + d.amount, 0),
        coralsDonated: 0,
      });
    }
  }

  for (const post of posts) {
    for (const d of post.donations) {
      const donor = byAuthor.get(d.fromId);
      if (donor) donor.coralsDonated += d.amount;
    }
  }

  return [...byAuthor.values()]
    .sort((a, b) => b.totalViews - a.totalViews || b.coralsReceived - a.coralsReceived)
    .slice(0, limit);
}
