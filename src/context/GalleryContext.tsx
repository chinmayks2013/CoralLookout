"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  fetchGalleryFeed,
  deleteCommentFromCloud,
  postCommentToCloud,
  postDonationToCloud,
  postUpvoteToCloud,
  publishDiscussionToCloud,
  recordViewToCloud,
} from "@/lib/gallery/cloud";
import { getGalleryViewerId } from "@/lib/gallery/viewer";
import type {
  GalleryComment,
  GalleryDonation,
  GalleryPost,
} from "@/lib/gallery/types";
import { safeNumber } from "@/lib/platform/numbers";
import { usePlatform } from "@/context/PlatformContext";

interface GalleryContextValue {
  posts: GalleryPost[];
  hydrated: boolean;
  cloudEnabled: boolean;
  cloudError: string | null;
  setupMessage: string | null;
  refresh: () => Promise<void>;
  upvote: (postId: string) => Promise<void>;
  comment: (postId: string, body: string) => Promise<boolean>;
  deleteComment: (postId: string, commentId: string) => Promise<boolean>;
  donate: (
    postId: string,
    amount: number,
    authorId?: string
  ) => Promise<boolean>;
  recordView: (postId: string, authorId: string) => Promise<void>;
  publishDiscussion: (
    title: string,
    body: string,
    options?: { imageDataUrl?: string; imageRightsConfirmed?: boolean }
  ) => Promise<boolean>;
}

const GalleryContext = createContext<GalleryContextValue | null>(null);

const POLL_MS = 12_000;

export function GalleryProvider({ children }: { children: React.ReactNode }) {
  const { state, dispatch } = usePlatform();
  const [posts, setPosts] = useState<GalleryPost[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [cloudEnabled, setCloudEnabled] = useState(false);
  const [cloudError, setCloudError] = useState<string | null>(null);
  const [setupMessage, setSetupMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await fetchGalleryFeed();
      setCloudEnabled(data.enabled);
      setSetupMessage(data.enabled ? null : (data.message ?? null));
      setCloudError(data.error ?? null);
      setPosts(data.posts ?? []);
    } catch (e) {
      setCloudError(e instanceof Error ? e.message : "Failed to load gallery");
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    dispatch({ type: "ENSURE_USER_ID" });
    void refresh();
    const interval = setInterval(() => void refresh(), POLL_MS);
    return () => clearInterval(interval);
  }, [dispatch, refresh]);

  useEffect(() => {
    if (!state.userId || !hydrated || !cloudEnabled) return;
    const received = posts
      .filter((p) => p.authorId === state.userId)
      .flatMap((p) => p.donations)
      .reduce((s, d) => s + (Number.isFinite(d.amount) ? d.amount : 0), 0);
    if (received > state.coralsReceived) {
      dispatch({ type: "SYNC_CORALS_RECEIVED", total: received });
    }
  }, [posts, state.userId, state.coralsReceived, hydrated, cloudEnabled, dispatch]);

  const upvote = useCallback(
    async (postId: string) => {
      if (!state.userId || !cloudEnabled) return;
      const post = posts.find((p) => p.id === postId);
      if (!post || post.upvotedBy.includes(state.userId)) return;
      try {
        await postUpvoteToCloud(postId, state.userId);
        await refresh();
      } catch (e) {
        setCloudError(e instanceof Error ? e.message : "Upvote failed");
      }
    },
    [state.userId, cloudEnabled, posts, refresh]
  );

  const comment = useCallback(
    async (postId: string, body: string): Promise<boolean> => {
      if (!state.profile || !state.userId || !body.trim() || !cloudEnabled) {
        return false;
      }

      const post = posts.find((p) => p.id === postId);
      const isOwnPost = post?.authorId === state.userId;

      const trimmed = body.trim();
      const optimisticId = `pending-${crypto.randomUUID()}`;
      const optimistic: GalleryComment = {
        id: optimisticId,
        postId,
        authorId: state.userId,
        authorName: state.profile.name,
        body: trimmed,
        timestamp: new Date().toISOString(),
      };

      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, comments: [...p.comments, optimistic] }
            : p
        )
      );

      try {
        const saved = await postCommentToCloud({
          postId,
          authorId: state.userId,
          authorName: state.profile.name,
          body: trimmed,
        });
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  comments: p.comments.map((c) =>
                    c.id === optimisticId ? saved : c
                  ),
                }
              : p
          )
        );
        if (!isOwnPost) {
          dispatch({ type: "RECORD_COMMENT" });
        }
        return true;
      } catch (e) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  comments: p.comments.filter((c) => c.id !== optimisticId),
                }
              : p
          )
        );
        setCloudError(e instanceof Error ? e.message : "Comment failed");
        return false;
      }
    },
    [state.profile, state.userId, cloudEnabled, posts, dispatch]
  );

  const deleteComment = useCallback(
    async (postId: string, commentId: string): Promise<boolean> => {
      if (!state.userId || !cloudEnabled) return false;

      const post = posts.find((p) => p.id === postId);
      const target = post?.comments.find((c) => c.id === commentId);
      if (!target || target.authorId !== state.userId) return false;

      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, comments: p.comments.filter((c) => c.id !== commentId) }
            : p
        )
      );

      if (commentId.startsWith("pending-")) return true;

      try {
        await deleteCommentFromCloud(commentId, state.userId);
        return true;
      } catch (e) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  comments: [...p.comments, target].sort(
                    (a, b) =>
                      new Date(a.timestamp).getTime() -
                      new Date(b.timestamp).getTime()
                  ),
                }
              : p
          )
        );
        setCloudError(e instanceof Error ? e.message : "Delete failed");
        return false;
      }
    },
    [state.userId, cloudEnabled, posts]
  );

  const donate = useCallback(
    async (
      postId: string,
      amount: number,
      authorId?: string
    ): Promise<boolean> => {
      if (
        !state.profile ||
        !state.userId ||
        !Number.isInteger(amount) ||
        amount < 1 ||
        !cloudEnabled
      ) {
        return false;
      }
      if (safeNumber(state.corals) < amount) {
        setCloudError("You do not have enough corals for that donation.");
        return false;
      }

      const post = posts.find((p) => p.id === postId);
      const targetAuthorId = post?.authorId ?? authorId;
      if (!targetAuthorId) {
        setCloudError("Post not found. Refresh the page and try again.");
        return false;
      }
      if (targetAuthorId === state.userId) {
        setCloudError("You cannot donate to your own post.");
        return false;
      }

      const optimistic: GalleryDonation = {
        id: `pending-${crypto.randomUUID()}`,
        postId,
        fromId: state.userId,
        fromName: state.profile.name,
        amount,
        timestamp: new Date().toISOString(),
      };

      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, donations: [...p.donations, optimistic] }
            : p
        )
      );

      try {
        const saved = await postDonationToCloud({
          postId,
          fromId: state.userId,
          fromName: state.profile.name,
          amount,
        });
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  donations: p.donations.map((d) =>
                    d.id === optimistic.id ? saved : d
                  ),
                }
              : p
          )
        );
        dispatch({ type: "RECORD_DONATION", amount });
        void refresh();
        return true;
      } catch (e) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  donations: p.donations.filter((d) => d.id !== optimistic.id),
                }
              : p
          )
        );
        setCloudError(e instanceof Error ? e.message : "Donation failed");
        return false;
      }
    },
    [state.profile, state.userId, state.corals, cloudEnabled, posts, dispatch, refresh]
  );

  const publishDiscussion = useCallback(
    async (
      title: string,
      body: string,
      options?: { imageDataUrl?: string; imageRightsConfirmed?: boolean }
    ): Promise<boolean> => {
      if (!state.profile || !state.userId || !cloudEnabled) return false;
      const trimmedTitle = title.trim();
      const trimmedBody = body.trim();
      if (!trimmedTitle || trimmedBody.length < 20) return false;

      try {
        const post = await publishDiscussionToCloud({
          postId: crypto.randomUUID(),
          authorId: state.userId,
          authorName: state.profile.name,
          authorSchool: state.profile.school,
          title: trimmedTitle,
          discussionBody: trimmedBody,
          coralTopicConfirmed: true,
          imageDataUrl: options?.imageDataUrl,
          imageRightsConfirmed: options?.imageRightsConfirmed,
        });
        setPosts((prev) => [post, ...prev]);
        dispatch({ type: "ADD_CORALS", amount: 5 });
        return true;
      } catch (e) {
        setCloudError(e instanceof Error ? e.message : "Discussion failed");
        return false;
      }
    },
    [state.profile, state.userId, cloudEnabled, dispatch]
  );

  const recordView = useCallback(
    async (postId: string, authorId: string) => {
      if (!cloudEnabled) return;
      const viewerId = getGalleryViewerId(state.userId || undefined);
      if (viewerId === authorId) return;
      try {
        const { viewCount } = await recordViewToCloud(
          postId,
          viewerId,
          authorId
        );
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, viewCount } : p))
        );
      } catch {
        /* non-blocking */
      }
    },
    [cloudEnabled, state.userId]
  );

  const value = useMemo(
    () => ({
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
      publishDiscussion,
    }),
    [
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
      publishDiscussion,
    ]
  );

  return (
    <GalleryContext.Provider value={value}>{children}</GalleryContext.Provider>
  );
}

export function useGallery() {
  const ctx = useContext(GalleryContext);
  if (!ctx) throw new Error("useGallery must be used within GalleryProvider");
  return ctx;
}

export function getGalleryPostFromList(
  posts: GalleryPost[],
  id: string
): GalleryPost | undefined {
  return posts.find((p) => p.id === id);
}
