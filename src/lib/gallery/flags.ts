import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type GalleryFlagStatus = "open" | "resolved" | "dismissed";

export interface GalleryFlag {
  id: string;
  postId: string;
  reporterUserId: string | null;
  reporterName: string | null;
  reason: string;
  status: GalleryFlagStatus;
  createdAt: string;
}

interface GalleryFlagRow {
  id: string;
  post_id: string;
  reporter_user_id: string | null;
  reporter_name: string | null;
  reason: string;
  status: GalleryFlagStatus;
  created_at: string;
}

function rowToFlag(row: GalleryFlagRow): GalleryFlag {
  return {
    id: row.id,
    postId: row.post_id,
    reporterUserId: row.reporter_user_id,
    reporterName: row.reporter_name,
    reason: row.reason,
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function insertGalleryFlag(input: {
  postId: string;
  reason: string;
  reporterUserId?: string;
  reporterName?: string;
}): Promise<GalleryFlag> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase not configured");

  const { data, error } = await supabase
    .from("gallery_flags")
    .insert({
      post_id: input.postId,
      reason: input.reason.trim(),
      reporter_user_id: input.reporterUserId ?? null,
      reporter_name: input.reporterName ?? null,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return rowToFlag(data as GalleryFlagRow);
}

export async function listGalleryFlags(
  status: GalleryFlagStatus = "open"
): Promise<GalleryFlag[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("gallery_flags")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as GalleryFlagRow[]).map(rowToFlag);
}

export async function countOpenGalleryFlags(): Promise<number> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return 0;

  const { count, error } = await supabase
    .from("gallery_flags")
    .select("id", { count: "exact", head: true })
    .eq("status", "open");

  if (error) return 0;
  return count ?? 0;
}
