const ANON_VIEWER_KEY = "coral_lookout_viewer_id";

/** Stable id for deduplicating gallery views (logged-in or anonymous). */
export function getGalleryViewerId(userId: string | undefined): string {
  if (userId) return userId;
  if (typeof window === "undefined") return "anonymous";
  let id = localStorage.getItem(ANON_VIEWER_KEY);
  if (!id) {
    id = `anon_${crypto.randomUUID()}`;
    localStorage.setItem(ANON_VIEWER_KEY, id);
  }
  return id;
}
