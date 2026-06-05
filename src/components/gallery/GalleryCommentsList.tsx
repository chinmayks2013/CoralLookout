"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import type { GalleryComment } from "@/lib/gallery/types";
import type { TopPercentTiers } from "@/lib/gallery/leaderboard";
import { GalleryAuthorLine } from "@/components/gallery/GalleryTitleBadge";

export const GALLERY_FEED_COMMENT_PREVIEW = 5;
export const GALLERY_VIEW_ALL_COMMENTS_MIN = 6;
export const GALLERY_COMMENTS_SCROLL_MIN = 7;

interface GalleryCommentsListProps {
  comments: GalleryComment[];
  tiers: TopPercentTiers;
  variant: "feed-preview" | "full";
  postId?: string;
  postDetailHref?: string;
  currentUserId?: string;
  onDeleteComment?: (commentId: string) => void;
}

function CommentRow({
  comment,
  tiers,
  currentUserId,
  onDelete,
  compact,
}: {
  comment: GalleryComment;
  tiers: TopPercentTiers;
  currentUserId?: string;
  onDelete?: () => void;
  compact?: boolean;
}) {
  const canDelete =
    currentUserId &&
    comment.authorId === currentUserId &&
    onDelete &&
    !comment.id.startsWith("pending-");

  if (compact) {
    return (
      <p className="text-sm text-slate-300 group">
        <span className="inline-flex flex-wrap items-center gap-1.5">
          <GalleryAuthorLine
            userId={comment.authorId}
            name={comment.authorName}
            tiers={tiers}
          />
          {canDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="p-0.5 rounded text-slate-500 hover:text-red-400 transition-colors"
              aria-label="Delete your comment"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </span>{" "}
        {comment.body}
      </p>
    );
  }

  return (
    <li className="text-sm group">
      <div className="flex flex-wrap items-center gap-1.5">
        <GalleryAuthorLine
          userId={comment.authorId}
          name={comment.authorName}
          tiers={tiers}
        />
        <span className="text-slate-500 text-xs">
          {new Date(comment.timestamp).toLocaleString()}
        </span>
        {canDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="ml-auto p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            aria-label="Delete your comment"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <p className="text-slate-300 mt-1">{comment.body}</p>
    </li>
  );
}

export function GalleryCommentsList({
  comments,
  tiers,
  variant,
  postId,
  postDetailHref,
  currentUserId,
  onDeleteComment,
}: GalleryCommentsListProps) {
  const detailHref =
    postDetailHref ?? (postId ? `/gallery/${postId}` : undefined);
  if (comments.length === 0) return null;

  if (variant === "feed-preview") {
    const preview = comments.slice(-GALLERY_FEED_COMMENT_PREVIEW);
    return (
      <div className="space-y-2 rounded-md bg-slate-950/40 border border-cyan-500/10 p-2.5 mt-2">
        {preview.map((c) => (
          <CommentRow
            key={c.id}
            comment={c}
            tiers={tiers}
            currentUserId={currentUserId}
            onDelete={
              onDeleteComment ? () => onDeleteComment(c.id) : undefined
            }
            compact
          />
        ))}
        {comments.length >= GALLERY_VIEW_ALL_COMMENTS_MIN && detailHref && (
          <Link
            href={detailHref}
            className="text-xs text-cyan-400 hover:underline font-medium"
          >
            View all {comments.length} comments →
          </Link>
        )}
      </div>
    );
  }

  const scrollable = comments.length >= GALLERY_COMMENTS_SCROLL_MIN;

  return (
    <ul
      className={`space-y-3 mb-4 ${
        scrollable
          ? "max-h-72 overflow-y-auto overscroll-y-contain rounded-md border border-cyan-500/10 bg-slate-950/40 p-3 pr-2 [scrollbar-width:thin] [scrollbar-color:rgb(34_211_238/0.4)_transparent]"
          : ""
      }`}
    >
      {comments.map((c) => (
        <CommentRow
          key={c.id}
          comment={c}
          tiers={tiers}
          currentUserId={currentUserId}
          onDelete={onDeleteComment ? () => onDeleteComment(c.id) : undefined}
        />
      ))}
    </ul>
  );
}
