import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { fetchChapterByTeacherId } from "./db";

export type ReviewStatus = "none" | "needs_review" | "educator_verified";

/** Student self-service: flag their own scan for a teacher to look at. */
export async function requestReviewForScan(input: {
  scanId: string;
  userId: string;
}): Promise<ReviewStatus> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase not configured");

  const { data, error } = await supabase
    .from("user_scans")
    .update({ review_status: "needs_review" satisfies ReviewStatus })
    .eq("scan_id", input.scanId)
    .eq("user_id", input.userId)
    .select("review_status")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Scan not found for this user");
  return data.review_status as ReviewStatus;
}

/** Teacher-only: set a review status on any scan (e.g. mark verified). */
export async function setScanReviewStatus(input: {
  scanId: string;
  teacherUserId: string;
  chapterId: string;
  reviewStatus: ReviewStatus;
}): Promise<ReviewStatus> {
  const chapter = await fetchChapterByTeacherId(input.teacherUserId);
  if (!chapter || chapter.id !== input.chapterId) {
    throw new Error("Chapter not found or access denied");
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase not configured");

  const { data, error } = await supabase
    .from("user_scans")
    .update({ review_status: input.reviewStatus })
    .eq("scan_id", input.scanId)
    .select("review_status")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Scan not found");
  return data.review_status as ReviewStatus;
}
