import type { GalleryPost } from "./types";

export const GALLERY_POSTS_PER_PAGE = 4;

export function isDiscussionPost(post: GalleryPost): boolean {
  return post.postType === "discussion";
}

export function isScanPost(post: GalleryPost): boolean {
  return post.postType !== "discussion";
}
