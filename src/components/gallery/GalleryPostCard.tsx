"use client";

import {
  MessageCircle,
  ArrowBigUp,
  Gem,
  Eye,
  MessageSquareText,
} from "lucide-react";
import type { GalleryPost } from "@/lib/gallery/types";
import { isDiscussionPost } from "@/lib/gallery/post-helpers";
import type { TopPercentTiers } from "@/lib/gallery/leaderboard";
import { GalleryAuthorLine } from "@/components/gallery/GalleryTitleBadge";
import { GalleryCommentsList } from "@/components/gallery/GalleryCommentsList";
import { GalleryCommentInput } from "@/components/gallery/GalleryCommentInput";
import { DonateButton } from "@/components/gallery/DonateButton";
import { getHealthColor } from "@/lib/scanner/analyze";

interface GalleryPostCardProps {
  post: GalleryPost;
  tiers: TopPercentTiers;
  voted: boolean;
  cloudEnabled: boolean;
  currentUserId: string;
  hasProfile: boolean;
  maxCorals: number;
  commentDraft: string;
  onCommentDraftChange: (value: string) => void;
  onCommentSubmit: (body: string) => void;
  onDeleteComment: (commentId: string) => void;
  onUpvote: () => void;
  onDonate: (
    postId: string,
    amount: number,
    authorId: string
  ) => Promise<boolean>;
  onOpenPost: () => void;
  postDetailHref?: string;
  forumStyle?: boolean;
}

export function GalleryPostCard({
  post,
  tiers,
  voted,
  cloudEnabled,
  currentUserId,
  hasProfile,
  maxCorals,
  commentDraft,
  onCommentDraftChange,
  onCommentSubmit,
  onDeleteComment,
  onUpvote,
  onDonate,
  onOpenPost,
  postDetailHref,
  forumStyle = false,
}: GalleryPostCardProps) {
  const detailHref = postDetailHref ?? `/gallery/${post.id}`;
  const donated = post.donations.reduce((s, d) => s + d.amount, 0);
  const isOwnPost = post.authorId === currentUserId;
  const discussion = isDiscussionPost(post);

  return (
    <article className="flex border-b border-cyan-500/15 bg-slate-900/30 hover:bg-slate-900/50 transition-colors min-h-[140px]">
      <div className="w-11 shrink-0 flex flex-col items-center py-2.5 px-1 bg-slate-950/50 border-r border-cyan-500/10">
        <button
          type="button"
          onClick={onUpvote}
          disabled={voted || !currentUserId || !cloudEnabled}
          className={`p-1 rounded hover:bg-cyan-500/10 disabled:opacity-40 ${
            voted ? "text-orange-400" : "text-slate-400 hover:text-orange-300"
          }`}
          aria-label="Upvote"
        >
          <ArrowBigUp className="h-6 w-6" />
        </button>
        <span className="text-xs font-bold text-slate-300 py-0.5">
          {post.upvotes}
        </span>
      </div>

      <div className="flex-1 min-w-0 py-2.5 pr-3 pl-2.5 flex flex-col">
        <div className="flex gap-3 flex-1">
          {discussion && post.imageDataUrl ? (
            <button
              type="button"
              onClick={onOpenPost}
              className="shrink-0 w-24 sm:w-32 h-20 sm:h-24 rounded overflow-hidden border border-violet-500/25 hover:border-violet-500/50"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.imageDataUrl}
                alt={post.locationName}
                className="w-full h-full object-cover"
              />
            </button>
          ) : discussion ? (
            <div className="shrink-0 w-24 sm:w-28 h-20 sm:h-24 rounded border border-violet-500/25 bg-violet-500/10 flex flex-col items-center justify-center text-violet-300">
              <MessageSquareText className="h-8 w-8 mb-1" />
              <span className="text-[10px] font-semibold uppercase">Forum</span>
            </div>
          ) : post.imageDataUrl ? (
            <button
              type="button"
              onClick={onOpenPost}
              className="shrink-0 w-24 sm:w-32 h-20 sm:h-24 rounded overflow-hidden border border-cyan-500/15 hover:border-cyan-500/40"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.imageDataUrl}
                alt={post.locationName}
                className="w-full h-full object-cover"
              />
            </button>
          ) : null}

          <div className="flex-1 min-w-0">
            <button
              type="button"
              onClick={onOpenPost}
              className="text-left w-full group"
            >
              <h2 className="font-semibold text-[15px] leading-snug group-hover:text-cyan-300 line-clamp-2">
                {post.locationName}
              </h2>
            </button>

            <p className="text-[11px] text-slate-500 mt-0.5 flex flex-wrap items-center gap-x-1 gap-y-1">
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
              <span>{new Date(post.timestamp).toLocaleDateString()}</span>
            </p>

            {discussion ? (
              <p className="text-sm text-slate-300 mt-1.5 line-clamp-3 leading-relaxed">
                {post.discussionBody}
              </p>
            ) : post.analysis ? (
              <>
                <p
                  className="text-xs font-medium mt-1"
                  style={{ color: getHealthColor(post.analysis.health) }}
                >
                  {post.analysis.label} · {post.analysis.confidence}% confidence
                </p>
                <p className="text-sm text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {post.analysis.explanation}
                </p>
              </>
            ) : null}

            <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5 text-violet-400" />
                {post.viewCount} views
              </span>
              <button
                type="button"
                onClick={onOpenPost}
                className="flex items-center gap-1 hover:text-cyan-300"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                {post.comments.length} comments
              </button>
              <span className="flex items-center gap-1">
                <Gem className="h-3.5 w-3.5 text-teal-400" />
                {donated} corals
              </span>
              <button
                type="button"
                onClick={onOpenPost}
                className="text-cyan-400 hover:underline font-medium"
              >
                Open post →
              </button>
              {!isOwnPost && (
                <DonateButton
                  postId={post.id}
                  authorId={post.authorId}
                  locationName={post.locationName}
                  maxCorals={maxCorals}
                  disabled={!hasProfile || !cloudEnabled}
                  label="Donate"
                  className={
                    forumStyle
                      ? "inline-flex items-center gap-1 rounded-full border border-violet-500/40 px-2.5 py-0.5 text-[11px] font-medium text-violet-200 hover:bg-violet-500/15 disabled:opacity-50"
                      : "inline-flex items-center gap-1 rounded-full border border-teal-500/40 px-2.5 py-0.5 text-[11px] font-medium text-teal-300 hover:bg-teal-500/10 disabled:opacity-50"
                  }
                  onDonate={onDonate}
                />
              )}
            </div>
          </div>
        </div>

        {post.comments.length > 0 && (
          <GalleryCommentsList
            comments={post.comments}
            tiers={tiers}
            variant="feed-preview"
            postId={post.id}
            postDetailHref={detailHref}
            currentUserId={currentUserId}
            onDeleteComment={onDeleteComment}
          />
        )}

        <div className="mt-2 space-y-2">
          <GalleryCommentInput
            value={commentDraft}
            onChange={onCommentDraftChange}
            onSubmit={onCommentSubmit}
            disabled={!hasProfile || !cloudEnabled}
            placeholder={
              !cloudEnabled
                ? "Connect Supabase to comment"
                : isOwnPost
                  ? "Reply on your post (no corals earned) — Enter"
                  : hasProfile
                    ? "Add a comment (+2 corals) — Enter"
                    : "Register to comment"
            }
          />
          {isOwnPost && hasProfile && cloudEnabled && (
            <p className="text-[11px] text-slate-500">
              You can comment on your own posts, but you won&apos;t earn corals from
              self-comments.
            </p>
          )}
          {!isOwnPost && !forumStyle && (
            <DonateButton
              postId={post.id}
              authorId={post.authorId}
              locationName={post.locationName}
              maxCorals={maxCorals}
              disabled={!hasProfile || !cloudEnabled}
              onDonate={onDonate}
            />
          )}
          {isOwnPost && forumStyle && (
            <p className="text-[11px] text-slate-500">
              Others can donate corals to support your thread.
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
