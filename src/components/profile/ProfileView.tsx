"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  Gem,
  Heart,
  ImageIcon,
  MessageCircle,
  ArrowBigUp,
  Sparkles,
  Calendar,
  School,
  MapPin,
} from "lucide-react";
import { useGallery } from "@/context/GalleryContext";
import { usePlatform } from "@/context/PlatformContext";
import { PageHeader } from "@/components/ui/PageHeader";
import { buildCreatorStatsFromPosts } from "@/lib/gallery/creator-stats";
import { fetchCreatorProfileFromCloud } from "@/lib/gallery/cloud";
import type { CreatorProfile } from "@/lib/gallery/types";
import { getHealthColor } from "@/lib/scanner/analyze";
import { isDiscussionPost } from "@/lib/gallery/post-helpers";
import { safeNumber } from "@/lib/platform/numbers";

function profileInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ProfileView({ userId }: { userId: string }) {
  const { posts, hydrated, cloudEnabled } = useGallery();
  const { state } = usePlatform();
  const [cloudProfile, setCloudProfile] = useState<CreatorProfile | null>(null);

  const isSelf = state.userId === userId;
  const localProfile = isSelf ? state.profile : null;

  useEffect(() => {
    if (!cloudEnabled) return;
    void fetchCreatorProfileFromCloud(userId).then(setCloudProfile);
  }, [userId, cloudEnabled]);

  const stats = useMemo(
    () => buildCreatorStatsFromPosts(posts, userId),
    [posts, userId]
  );

  const authorPosts = useMemo(
    () =>
      posts
        .filter((p) => p.authorId === userId)
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ),
    [posts, userId]
  );

  const displayName =
    cloudProfile?.displayName ??
    localProfile?.name ??
    stats?.displayName ??
    "Coral Enthusiast";

  const school =
    cloudProfile?.school ?? localProfile?.school ?? stats?.school;
  const region = cloudProfile?.region ?? localProfile?.region;
  const bio = cloudProfile?.bio ?? localProfile?.bio;
  const tagline = cloudProfile?.tagline ?? localProfile?.tagline;
  const joinedAt =
    cloudProfile?.joinedAt ?? localProfile?.joinedAt;

  if (!hydrated) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-12 text-center text-slate-400">
        Loading profile…
      </section>
    );
  }

  if (!stats && authorPosts.length === 0 && !localProfile && !cloudProfile) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-12 text-center">
        <p className="text-slate-400 mb-4">This Coral Enthusiast has not joined the community yet.</p>
        <Link href="/gallery" className="text-cyan-300 underline">
          Back to gallery
        </Link>
      </section>
    );
  }

  const postCount = stats?.postCount ?? authorPosts.length;
  const totalViews = stats?.totalViews ?? 0;
  const coralsReceived = stats?.coralsReceived ?? 0;
  const coralsDonated = stats?.coralsDonated ?? 0;

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <Link
        href="/gallery"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Reef Gallery
      </Link>

      <PageHeader
        badge={isSelf ? "Your profile" : "Coral Enthusiast"}
        title={displayName}
        subtitle={
          tagline ??
          "Coral Enthusiasts earn corals when the community views, comments, and donates on their posts."
        }
      />

      <article className="glass rounded-2xl overflow-hidden mb-8">
        <div className="h-28 bg-gradient-to-r from-cyan-600/40 via-teal-600/30 to-violet-600/30" />
        <div className="px-6 pb-6 -mt-12">
          <div className="flex flex-wrap items-end gap-4">
            <span className="h-24 w-24 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center text-3xl font-bold text-slate-900 border-4 border-slate-900 shadow-lg">
              {profileInitials(displayName)}
            </span>
            <div className="flex-1 min-w-0 pb-1">
              <h2 className="text-2xl font-bold">{displayName}</h2>
              {school && (
                <p className="flex items-center gap-1.5 text-sm text-cyan-300 mt-1">
                  <School className="h-4 w-4 shrink-0" />
                  {school}
                </p>
              )}
              {region && (
                <p className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {region}
                </p>
              )}
              {joinedAt && (
                <p className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                  Member since {new Date(joinedAt).toLocaleDateString()}
                </p>
              )}
            </div>
            {isSelf && (
              <Link
                href="/community"
                className="rounded-full border border-cyan-500/40 px-4 py-2 text-sm text-cyan-300 hover:bg-cyan-500/10"
              >
                Edit profile
              </Link>
            )}
          </div>

          {bio && (
            <p className="mt-5 text-sm text-slate-300 leading-relaxed max-w-2xl">
              {bio}
            </p>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            <StatCard
              icon={ImageIcon}
              label="Posts"
              value={String(postCount)}
              accent="cyan"
            />
            <StatCard
              icon={Eye}
              label="Total views"
              value={totalViews.toLocaleString()}
              accent="violet"
            />
            <StatCard
              icon={Gem}
              label="Corals earned"
              value={String(coralsReceived)}
              accent="teal"
            />
            <StatCard
              icon={Heart}
              label="Corals given"
              value={String(coralsDonated)}
              accent="amber"
            />
          </div>

          {isSelf && (
            <aside className="mt-5 rounded-xl border border-teal-500/30 bg-teal-950/30 p-4 text-sm text-teal-100/90">
              <p className="flex items-center gap-2 font-medium text-teal-200">
                <Sparkles className="h-4 w-4" />
                Your wallet: {safeNumber(state.corals)} corals
              </p>
              <p className="text-xs text-teal-100/70 mt-2">
                Publish reef scans to the gallery (+15 corals), earn +2 per comment on
                others&apos; posts, and receive donations from supporters.
              </p>
            </aside>
          )}
        </div>
      </article>

      {stats && (
        <div className="grid grid-cols-3 gap-3 mb-8 text-center text-sm">
          <div className="glass rounded-xl py-3">
            <ArrowBigUp className="h-5 w-5 text-orange-400 mx-auto mb-1" />
            <p className="font-bold">{stats.totalUpvotes}</p>
            <p className="text-xs text-slate-500">Upvotes received</p>
          </div>
          <div className="glass rounded-xl py-3">
            <MessageCircle className="h-5 w-5 text-cyan-400 mx-auto mb-1" />
            <p className="font-bold">{stats.totalComments}</p>
            <p className="text-xs text-slate-500">Comments on posts</p>
          </div>
          <div className="glass rounded-xl py-3">
            <Eye className="h-5 w-5 text-violet-400 mx-auto mb-1" />
            <p className="font-bold">
              {postCount > 0 ? Math.round(totalViews / postCount) : 0}
            </p>
            <p className="text-xs text-slate-500">Avg views / post</p>
          </div>
        </div>
      )}

      <h3 className="text-lg font-bold mb-4">Gallery posts</h3>
      {authorPosts.length === 0 ? (
        <p className="text-sm text-slate-500">
          {isSelf ? (
            <>
              No public posts yet.{" "}
              <Link href="/scanner" className="text-cyan-300 underline">
                Share a reef scan
              </Link>{" "}
              to start earning corals.
            </>
          ) : (
            "No gallery posts from this enthusiast yet."
          )}
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {authorPosts.map((post) => {
            const donated = post.donations.reduce((s, d) => s + d.amount, 0);
            return (
              <li key={post.id}>
                <Link
                  href={
                    isDiscussionPost(post)
                      ? `/forum/${post.id}`
                      : `/gallery/${post.id}`
                  }
                  className="glass rounded-xl overflow-hidden block hover:ring-1 hover:ring-cyan-500/40 transition-shadow"
                >
                  {post.imageDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.imageDataUrl}
                      alt={post.locationName}
                      className="w-full h-36 object-cover"
                    />
                  ) : (
                    <div className="h-36 bg-slate-800/50" />
                  )}
                  <div className="p-4">
                    <p className="font-medium truncate">{post.locationName}</p>
                    {isDiscussionPost(post) ? (
                      <p className="text-xs mt-1 text-violet-300">Forum discussion</p>
                    ) : post.analysis ? (
                      <p
                        className="text-xs mt-1"
                        style={{ color: getHealthColor(post.analysis.health) }}
                      >
                        {post.analysis.label}
                      </p>
                    ) : null}
                    <p className="flex flex-wrap gap-3 text-xs text-slate-500 mt-2">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {post.viewCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Gem className="h-3 w-3 text-teal-400" />
                        {donated}
                      </span>
                      <span>{post.comments.length} comments</span>
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Eye;
  label: string;
  value: string;
  accent: "cyan" | "teal" | "violet" | "amber";
}) {
  const colors = {
    cyan: "text-cyan-400",
    teal: "text-teal-400",
    violet: "text-violet-400",
    amber: "text-amber-400",
  };
  return (
    <div className="rounded-xl bg-slate-900/50 border border-cyan-500/10 p-3">
      <Icon className={`h-5 w-5 ${colors[accent]} mb-1`} />
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
