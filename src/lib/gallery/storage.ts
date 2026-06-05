import type { GalleryPost, GalleryStore } from "./types";

const GALLERY_KEY = "coral-lookout-gallery-v1";

export function loadGallery(): GalleryStore {
  if (typeof window === "undefined") return { posts: [] };
  try {
    const raw = localStorage.getItem(GALLERY_KEY);
    if (!raw) return { posts: [] };
    const parsed = JSON.parse(raw) as GalleryStore;
    return { posts: parsed.posts ?? [] };
  } catch {
    return { posts: [] };
  }
}

export function saveGallery(store: GalleryStore): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(GALLERY_KEY, JSON.stringify(store));
}

export function getPostById(id: string): GalleryPost | undefined {
  return loadGallery().posts.find((p) => p.id === id);
}

export function upsertPost(post: GalleryPost): void {
  const store = loadGallery();
  const idx = store.posts.findIndex((p) => p.id === post.id);
  if (idx >= 0) store.posts[idx] = post;
  else store.posts.unshift(post);
  saveGallery(store);
}
