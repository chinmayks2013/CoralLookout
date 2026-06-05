"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGallery } from "@/context/GalleryContext";
import { usePlatform } from "@/context/PlatformContext";
import { PageHeader } from "@/components/ui/PageHeader";
import { getTopPercentTiers, getPostScore } from "@/lib/gallery/leaderboard";
import { GALLERY_POSTS_PER_PAGE, isScanPost } from "@/lib/gallery/post-helpers";
import { GalleryPostCard } from "@/components/gallery/GalleryPostCard";
import { GallerySidebar } from "@/components/gallery/GallerySidebar";
import { GalleryPagination } from "@/components/gallery/GalleryPagination";
import { safeNumber } from "@/lib/platform/numbers";
import {
  ArrowBigUp,
  TrendingUp,
  Clock,
  CloudOff,
  RefreshCw,
} from "lucide-react";

type SortMode = "hot" | "new" | "top";

export function GalleryView() {
  const {
    posts,
    hydrated,
    cloudEnabled,
    cloudError,
    setupMessage,
    refresh,
    upvote,
    comment,
    deleteComment,
    donate,
    recordView,
  } = useGallery();
  const router = useRouter();
  const { state } = usePlatform();
  const [sort, setSort] = useState<SortMode>("hot");
  const [page, setPage] = useState(1);
  const [commentDraft, setCommentDraft] = useState<Record<string, string>>({});
  const [refreshing, setRefreshing] = useState(false);

  const scanPosts = useMemo(() => posts.filter(isScanPost), [posts]);

  const sorted = useMemo(() => {
    const list = [...scanPosts];
    if (sort === "new") {
      return list.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    }
    if (sort === "top") {
      return list.sort((a, b) => getPostScore(b) - getPostScore(a));
    }
    return list.sort((a, b) => getPostScore(b) - getPostScore(a));
  }, [scanPosts, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / GALLERY_POSTS_PER_PAGE));

  const pagePosts = useMemo(() => {
    const start = (page - 1) * GALLERY_POSTS_PER_PAGE;
    return sorted.slice(start, start + GALLERY_POSTS_PER_PAGE);
  }, [sorted, page]);

  useEffect(() => {
    setPage(1);
  }, [sort, scanPosts.length]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const tiers = useMemo(() => getTopPercentTiers(posts), [posts]);

  const openPost = (postId: string, authorId: string) => {
    void recordView(postId, authorId);
    router.push(`/gallery/${postId}`);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  if (!hydrated) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-12 text-center text-slate-400">
        Loading gallery…
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-3 py-8 sm:px-6 sm:py-12 min-w-0">
      <PageHeader
        badge="Community"
        title="Reef Gallery"
        subtitle="Reef scans from the community — 4 posts per page. Views count when others open your post."
      />

      {!cloudEnabled && (
        <aside className="rounded-xl border border-amber-500/40 bg-amber-950/30 p-5 mb-6 text-sm text-amber-100">
          <div className="flex items-start gap-3">
            <CloudOff className="h-6 w-6 shrink-0 text-amber-400" />
            <div>
              <p className="font-semibold text-amber-200 mb-2">
                Gallery is not connected yet
              </p>
              <p className="text-amber-100/90 leading-relaxed">
                {setupMessage ??
                  "Posts and comments only sync when Supabase is configured."}
              </p>
            </div>
          </div>
        </aside>
      )}

      {cloudEnabled && (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <p className="text-sm text-teal-300">
            Live shared feed — refreshes every 12 seconds.
          </p>
          <button
            type="button"
            onClick={() => void handleRefresh()}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/30 px-3 py-1.5 text-sm text-cyan-300 hover:bg-cyan-500/10"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh now
          </button>
        </div>
      )}

      {cloudError && (
        <p className="text-sm text-red-400 mb-4 rounded-lg border border-red-500/30 bg-red-950/20 px-4 py-2">
          {cloudError}
        </p>
      )}

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <GallerySidebar />

        <div className="flex-1 min-w-0 w-full">
          <div className="rounded-xl border border-cyan-500/15 overflow-hidden glass">
            <div className="flex flex-wrap gap-2 p-3 border-b border-cyan-500/15 bg-slate-950/40">
              {(
                [
                  { id: "hot" as const, label: "Hot", icon: TrendingUp },
                  { id: "new" as const, label: "New", icon: Clock },
                  { id: "top" as const, label: "Top", icon: ArrowBigUp },
                ] as const
              ).map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSort(s.id)}
                  className={`inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-sm font-medium ${
                    sort === s.id
                      ? "bg-cyan-500 text-slate-900"
                      : "glass text-slate-300"
                  }`}
                >
                  <s.icon className="h-4 w-4" />
                  {s.label}
                </button>
              ))}
            </div>

            {!cloudEnabled ? (
              <article className="p-8 text-center text-slate-400">
                <p>Connect Supabase to enable the shared gallery.</p>
              </article>
            ) : sorted.length === 0 ? (
              <article className="p-8 text-center text-slate-400">
                <p>No reef scans yet. Be the first to share one.</p>
                <Link href="/scanner" className="text-cyan-300 underline mt-2 inline-block">
                  Analyze a reef
                </Link>
                <span className="text-slate-500 mx-2">·</span>
                <Link href="/forum" className="text-violet-300 underline mt-2 inline-block">
                  Coral forum
                </Link>
              </article>
            ) : (
              <>
                {pagePosts.map((post) => (
                  <GalleryPostCard
                    key={post.id}
                    post={post}
                    tiers={tiers}
                    voted={post.upvotedBy.includes(state.userId)}
                    cloudEnabled={cloudEnabled}
                    currentUserId={state.userId}
                    hasProfile={Boolean(state.profile)}
                    maxCorals={safeNumber(state.corals)}
                    commentDraft={commentDraft[post.id] ?? ""}
                    onCommentDraftChange={(value) =>
                      setCommentDraft((d) => ({ ...d, [post.id]: value }))
                    }
                    onCommentSubmit={(body) => {
                      setCommentDraft((d) => ({ ...d, [post.id]: "" }));
                      void comment(post.id, body);
                    }}
                    onDeleteComment={(commentId) =>
                      void deleteComment(post.id, commentId)
                    }
                    onUpvote={() => void upvote(post.id)}
                    onDonate={donate}
                    onOpenPost={() => openPost(post.id, post.authorId)}
                  />
                ))}
                <GalleryPagination
                  page={page}
                  totalPages={totalPages}
                  totalItems={sorted.length}
                  onPageChange={setPage}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
