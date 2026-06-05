import type { ScanResult } from "@/lib/types";
import type {
  CreatorProfile,
  GalleryComment,
  GalleryDonation,
  GalleryPost,
} from "./types";

export interface GalleryFeedResponse {
  enabled: boolean;
  posts: GalleryPost[];
  message?: string;
  error?: string;
}

export async function fetchGalleryFeed(): Promise<GalleryFeedResponse> {
  const res = await fetch("/api/gallery", { cache: "no-store" });
  return res.json() as Promise<GalleryFeedResponse>;
}

export async function publishDiscussionToCloud(input: {
  postId: string;
  authorId: string;
  authorName: string;
  authorSchool?: string;
  title: string;
  discussionBody: string;
  coralTopicConfirmed: boolean;
  imageDataUrl?: string;
  imageRightsConfirmed?: boolean;
}): Promise<GalleryPost> {
  const res = await fetch("/api/gallery/discussions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error ?? "Failed to publish discussion");
  }
  return data.post as GalleryPost;
}

export async function publishPostToCloud(input: {
  postId: string;
  scanId: string;
  authorId: string;
  authorName: string;
  authorSchool?: string;
  imageDataUrl: string;
  analysis: ScanResult;
  locationName: string;
  lat: number;
  lng: number;
  imageRightsConfirmed: boolean;
}): Promise<GalleryPost> {
  const res = await fetch("/api/gallery/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error ?? "Failed to publish to gallery");
  }
  return data.post as GalleryPost;
}

export async function postCommentToCloud(input: {
  postId: string;
  authorId: string;
  authorName: string;
  body: string;
}): Promise<GalleryComment> {
  const res = await fetch("/api/gallery/comments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to comment");
  return data.comment as GalleryComment;
}

export async function deleteCommentFromCloud(
  commentId: string,
  userId: string
): Promise<void> {
  const res = await fetch("/api/gallery/comments", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ commentId, userId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to delete comment");
}

export async function postUpvoteToCloud(
  postId: string,
  userId: string
): Promise<void> {
  const res = await fetch("/api/gallery/upvotes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ postId, userId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to upvote");
}

export async function postDonationToCloud(input: {
  postId: string;
  fromId: string;
  fromName: string;
  amount: number;
}): Promise<GalleryDonation> {
  const res = await fetch("/api/gallery/donations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to donate");
  return data.donation as GalleryDonation;
}

export async function recordViewToCloud(
  postId: string,
  viewerId: string,
  authorId: string
): Promise<{ viewCount: number; recorded: boolean }> {
  const res = await fetch("/api/gallery/views", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ postId, viewerId, authorId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to record view");
  return data as { viewCount: number; recorded: boolean };
}

export async function fetchCreatorProfileFromCloud(
  userId: string
): Promise<CreatorProfile | null> {
  const res = await fetch(
    `/api/gallery/profiles?userId=${encodeURIComponent(userId)}`,
    { cache: "no-store" }
  );
  const data = await res.json();
  if (!res.ok) return null;
  return (data.profile as CreatorProfile | null) ?? null;
}

export async function upsertCreatorProfileToCloud(input: {
  userId: string;
  displayName: string;
  school?: string;
  region?: string;
  bio?: string;
  tagline?: string;
  joinedAt?: string;
}): Promise<CreatorProfile | null> {
  const res = await fetch("/api/gallery/profiles", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok) return null;
  return data.profile as CreatorProfile;
}
