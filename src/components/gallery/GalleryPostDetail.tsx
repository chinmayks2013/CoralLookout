"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getHealthColor } from "@/lib/scanner/analyze";
import { useGallery } from "@/context/GalleryContext";
import { usePlatform } from "@/context/PlatformContext";
import { safeNumber } from "@/lib/platform/numbers";
import { Gem, ArrowLeft, Eye, ShieldCheck } from "lucide-react";
import { DonateButton } from "@/components/gallery/DonateButton";
import { GalleryAuthorLine } from "@/components/gallery/GalleryTitleBadge";
import { GalleryCommentInput } from "@/components/gallery/GalleryCommentInput";
import { GalleryCommentsList } from "@/components/gallery/GalleryCommentsList";
import { getTopPercentTiers } from "@/lib/gallery/leaderboard";
import { isDiscussionPost } from "@/lib/gallery/post-helpers";

export function GalleryPostDetail({
  postId,
  backHref = "/gallery",
  backLabel = "Reef Gallery",
}: {
  postId: string;
  backHref?: string;
  backLabel?: string;
}) {
  const {
    posts,
    comment,
    deleteComment,
    donate,
    recordView,
    cloudEnabled,
    refresh,
    hydrated,
  } = useGallery();
  const router = useRouter();
  const tiers = useMemo(() => getTopPercentTiers(posts), [posts]);
  const viewRecorded = useRef(false);
  const { state } = usePlatform();
  const [commentText, setCommentText] = useState("");
  const corals = safeNumber(state.corals);

  const post = posts.find((p) => p.id === postId) ?? null;

  useEffect(() => {
    if (!post && hydrated) void refresh();
  }, [postId, post, hydrated, refresh]);

  useEffect(() => {
    if (post && isDiscussionPost(post) && backHref === "/gallery") {
      router.replace(`/forum/${postId}`);
    }
  }, [post, backHref, postId, router]);

  useEffect(() => {
    viewRecorded.current = false;
  }, [postId]);

  useEffect(() => {
    if (!post || !cloudEnabled || viewRecorded.current) return;
    viewRecorded.current = true;
    void recordView(post.id, post.authorId);
  }, [post, cloudEnabled, recordView]);

  if (!hydrated) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-12 text-center text-slate-400">
        Loading post…
      </section>
    );
  }

  if (!post) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-12 text-center">
        <p className="text-slate-400 mb-4">Post not found.</p>
        <Link href="/gallery" className="text-cyan-300 underline">
          Back to gallery
        </Link>
      </section>
    );
  }

  const donated = post.donations.reduce((s, d) => s + d.amount, 0);
  const discussion = isDiscussionPost(post);
  const isOwnPost = post.authorId === state.userId;

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        {backLabel}
      </Link>

      <article className="glass rounded-2xl overflow-hidden">
        {post.imageDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.imageDataUrl}
            alt={post.locationName}
            className="w-full max-h-[420px] object-cover"
          />
        ) : null}

        <div className="p-6 space-y-6">
          <header>
            <h1 className="text-2xl font-bold">{post.locationName}</h1>
            <p className="text-sm text-slate-500 mt-1 flex flex-wrap items-center gap-x-1 gap-y-1">
              <GalleryAuthorLine
                userId={post.authorId}
                name={post.authorName}
                tiers={tiers}
              />
              {post.authorSchool ? (
                <>
                  <span>·</span>
                  <span>{post.authorSchool}</span>
                </>
              ) : null}
              <span>·</span>
              <span>{new Date(post.timestamp).toLocaleString()}</span>
            </p>
            <p className="flex items-center gap-1.5 text-xs text-violet-400 mt-2">
              <Eye className="h-3.5 w-3.5" />
              {post.viewCount} view{post.viewCount === 1 ? "" : "s"}
            </p>
            {!discussion && post.lat !== 0 && post.lng !== 0 && (
              <p className="text-sm text-slate-400 mt-1">
                {post.lat.toFixed(4)}, {post.lng.toFixed(4)}
              </p>
            )}
          </header>

          {discussion ? (
            <section className="rounded-xl bg-violet-500/10 p-5 border border-violet-500/25">
              <p className="text-xs font-semibold text-violet-300 uppercase tracking-wide mb-2">
                Coral forum discussion
              </p>
              <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                {post.discussionBody}
              </p>
            </section>
          ) : post.analysis ? (
            <section className="rounded-xl bg-slate-900/50 p-5 border border-cyan-500/20">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <span
                  className="text-xl font-bold"
                  style={{ color: getHealthColor(post.analysis.health) }}
                >
                  {post.analysis.label}
                </span>
                <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-cyan-300">
                  {post.analysis.confidence}% confidence
                </span>
              </div>
              <h2 className="text-sm font-semibold text-cyan-300 mb-2">
                Scientific explanation
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                {post.analysis.explanation}
              </p>
              {post.analysis.recommendations.length > 0 && (
                <>
                  <h2 className="text-sm font-semibold text-cyan-300 mt-4 mb-2">
                    Recommendations
                  </h2>
                  <ul className="space-y-1 text-sm text-slate-300">
                    {post.analysis.recommendations.map((r, i) => (
                      <li key={i}>→ {r}</li>
                    ))}
                  </ul>
                </>
              )}
            </section>
          ) : null}

          <div className="flex flex-wrap gap-4 text-sm">
            <p className="flex items-center gap-2 text-teal-400">
              <Gem className="h-4 w-4" />
              {donated} corals donated to this post
            </p>
            <Link
              href={`/profile/${post.authorId}`}
              className="text-cyan-400 hover:underline text-sm"
            >
              View Coral Enthusiast profile →
            </Link>
          </div>

          {post.imageRightsConfirmed && (
            <p className="flex items-start gap-2 text-xs text-slate-500 rounded-lg border border-slate-700/50 bg-slate-900/40 px-3 py-2">
              <ShieldCheck className="h-4 w-4 text-amber-500/80 shrink-0 mt-0.5" />
              Author confirmed they have the rights to share this image.
            </p>
          )}

          <section className="border-t border-cyan-500/10 pt-4">
            <h3 className="font-semibold mb-3">Comments ({post.comments.length})</h3>
            <GalleryCommentsList
              comments={post.comments}
              tiers={tiers}
              variant="full"
              currentUserId={state.userId}
              onDeleteComment={(commentId) =>
                void deleteComment(post.id, commentId)
              }
            />
            {state.profile ? (
              <div className="space-y-2">
                <GalleryCommentInput
                  value={commentText}
                  onChange={setCommentText}
                  onSubmit={(body) => {
                    setCommentText("");
                    void comment(post.id, body);
                  }}
                  disabled={!cloudEnabled}
                  placeholder={
                    !cloudEnabled
                      ? "Connect Supabase to comment"
                      : isOwnPost
                        ? "Reply on your post (no corals earned) — Enter"
                        : "Add a comment (+2 corals) — Enter"
                  }
                  buttonLabel="Post"
                />
                {isOwnPost && cloudEnabled && (
                  <p className="text-xs text-slate-500">
                    Comments on your own posts are welcome, but you won&apos;t earn
                    corals from self-comments.
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                <Link href="/community" className="text-cyan-300 underline">
                  Register
                </Link>{" "}
                to comment.
              </p>
            )}
          </section>

          {state.profile && post.authorId !== state.userId && (
            <section>
              <DonateButton
                postId={post.id}
                authorId={post.authorId}
                locationName={post.locationName}
                maxCorals={corals}
                label="Donate corals"
                disabled={!cloudEnabled}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-slate-900 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed ${
                  discussion
                    ? "bg-gradient-to-r from-violet-500 to-cyan-500"
                    : "bg-gradient-to-r from-teal-500 to-cyan-500"
                }`}
                onDonate={donate}
              />
            </section>
          )}
        </div>
      </article>
    </section>
  );
}
