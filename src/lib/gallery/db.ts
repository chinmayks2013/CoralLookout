import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { ScanResult } from "@/lib/types";
import type {
  CreatorProfile,
  GalleryComment,
  GalleryDonation,
  GalleryPost,
} from "./types";

const BUCKET = "gallery";

interface PostRow {
  id: string;
  scan_id: string;
  post_type?: string;
  author_id: string;
  author_name: string;
  author_school: string | null;
  image_url: string | null;
  analysis: ScanResult | null;
  discussion_body?: string | null;
  location_name: string;
  lat: number | null;
  lng: number | null;
  view_count: number;
  image_rights_confirmed: boolean;
  created_at: string;
}

function rowToGalleryPost(
  row: PostRow,
  extras: {
    viewCount: number;
    upvotes: number;
    upvotedBy: string[];
    comments: GalleryComment[];
    donations: GalleryDonation[];
    imageRightsConfirmed?: boolean;
  }
): GalleryPost {
  const postType =
    row.post_type === "discussion" ? "discussion" : "scan";
  return {
    id: row.id,
    postType,
    scanId: row.scan_id,
    authorId: row.author_id,
    authorName: row.author_name,
    authorSchool: row.author_school ?? undefined,
    imageDataUrl: row.image_url ?? "",
    analysis: row.analysis ?? null,
    discussionBody: row.discussion_body ?? undefined,
    locationName: row.location_name,
    lat: row.lat ?? 0,
    lng: row.lng ?? 0,
    timestamp: row.created_at,
    viewCount: extras.viewCount,
    imageRightsConfirmed:
      extras.imageRightsConfirmed ?? row.image_rights_confirmed ?? false,
    upvotes: extras.upvotes,
    upvotedBy: extras.upvotedBy,
    comments: extras.comments,
    donations: extras.donations,
  };
}

interface CreatorProfileRow {
  user_id: string;
  display_name: string;
  school: string | null;
  region: string | null;
  bio: string | null;
  tagline: string | null;
  joined_at: string;
  updated_at: string;
}

interface CommentRow {
  id: string;
  post_id: string;
  author_id: string;
  author_name: string;
  body: string;
  created_at: string;
}

interface DonationRow {
  id: string;
  post_id: string;
  from_id: string;
  from_name: string;
  amount: number;
  created_at: string;
}

interface UpvoteRow {
  post_id: string;
  user_id: string;
}

/** PostgREST / Supabase when a column is absent or schema cache is stale. */
function isMissingSchemaColumn(error: { message?: string; code?: string }): boolean {
  return (
    error.code === "PGRST204" ||
    (error.message?.includes("schema cache") ?? false) ||
    (error.message?.includes("Could not find") ?? false)
  );
}

function isMissingViewsTable(error: { message?: string; code?: string }): boolean {
  return (
    error.code === "42P01" ||
    (error.message?.includes("gallery_post_views") ?? false)
  );
}

interface ViewRow {
  post_id: string;
}

async function fetchViewCountsByPostIds(
  supabase: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  postIds: string[]
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  if (postIds.length === 0) return counts;

  const { data, error } = await supabase
    .from("gallery_post_views")
    .select("post_id")
    .in("post_id", postIds);

  if (error) {
    if (isMissingViewsTable(error)) return counts;
    throw new Error(error.message);
  }

  for (const row of (data ?? []) as ViewRow[]) {
    counts.set(row.post_id, (counts.get(row.post_id) ?? 0) + 1);
  }
  return counts;
}

async function countViewsForPost(
  supabase: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  postId: string
): Promise<number> {
  const { count, error } = await supabase
    .from("gallery_post_views")
    .select("*", { count: "exact", head: true })
    .eq("post_id", postId);

  if (!error) return count ?? 0;

  if (isMissingViewsTable(error)) {
    const { data } = await supabase
      .from("gallery_posts")
      .select("view_count")
      .eq("id", postId)
      .maybeSingle();
    return (data as { view_count?: number } | null)?.view_count ?? 0;
  }
  throw new Error(error.message);
}

function assemblePosts(
  posts: PostRow[],
  comments: CommentRow[],
  donations: DonationRow[],
  upvotes: UpvoteRow[],
  viewCounts: Map<string, number> = new Map()
): GalleryPost[] {
  const commentsByPost = new Map<string, GalleryComment[]>();
  for (const c of comments) {
    const list = commentsByPost.get(c.post_id) ?? [];
    list.push({
      id: c.id,
      postId: c.post_id,
      authorId: c.author_id,
      authorName: c.author_name,
      body: c.body,
      timestamp: c.created_at,
    });
    commentsByPost.set(c.post_id, list);
  }

  const donationsByPost = new Map<string, GalleryDonation[]>();
  for (const d of donations) {
    const list = donationsByPost.get(d.post_id) ?? [];
    list.push({
      id: d.id,
      postId: d.post_id,
      fromId: d.from_id,
      fromName: d.from_name,
      amount: d.amount,
      timestamp: d.created_at,
    });
    donationsByPost.set(d.post_id, list);
  }

  const upvotesByPost = new Map<string, string[]>();
  for (const u of upvotes) {
    const list = upvotesByPost.get(u.post_id) ?? [];
    list.push(u.user_id);
    upvotesByPost.set(u.post_id, list);
  }

  return posts.map((p) => {
    const upvotedBy = upvotesByPost.get(p.id) ?? [];
    return rowToGalleryPost(p, {
      viewCount: viewCounts.get(p.id) ?? p.view_count ?? 0,
      upvotes: upvotedBy.length,
      upvotedBy,
      comments: commentsByPost.get(p.id) ?? [],
      donations: donationsByPost.get(p.id) ?? [],
    });
  });
}

export async function fetchGalleryPostsFromDb(): Promise<GalleryPost[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data: posts, error: postsError } = await supabase
    .from("gallery_posts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (postsError) throw new Error(postsError.message);
  if (!posts?.length) return [];

  const postIds = posts.map((p) => p.id);

  const [commentsRes, donationsRes, upvotesRes, viewCounts] = await Promise.all([
    supabase.from("gallery_comments").select("*").in("post_id", postIds),
    supabase.from("gallery_donations").select("*").in("post_id", postIds),
    supabase.from("gallery_upvotes").select("*").in("post_id", postIds),
    fetchViewCountsByPostIds(supabase, postIds),
  ]);

  if (commentsRes.error) throw new Error(commentsRes.error.message);
  if (donationsRes.error) throw new Error(donationsRes.error.message);
  if (upvotesRes.error) throw new Error(upvotesRes.error.message);

  return assemblePosts(
    posts as PostRow[],
    (commentsRes.data ?? []) as CommentRow[],
    (donationsRes.data ?? []) as DonationRow[],
    (upvotesRes.data ?? []) as UpvoteRow[],
    viewCounts
  );
}

export async function fetchGalleryPostByIdFromDb(
  id: string
): Promise<GalleryPost | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data: post, error } = await supabase
    .from("gallery_posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!post) return null;

  const [commentsRes, donationsRes, upvotesRes, viewCounts] = await Promise.all([
    supabase.from("gallery_comments").select("*").eq("post_id", id),
    supabase.from("gallery_donations").select("*").eq("post_id", id),
    supabase.from("gallery_upvotes").select("*").eq("post_id", id),
    fetchViewCountsByPostIds(supabase, [id]),
  ]);

  const [assembled] = assemblePosts(
    [post as PostRow],
    (commentsRes.data ?? []) as CommentRow[],
    (donationsRes.data ?? []) as DonationRow[],
    (upvotesRes.data ?? []) as UpvoteRow[],
    viewCounts
  );
  return assembled ?? null;
}

async function uploadGalleryImage(
  postId: string,
  imageDataUrl: string
): Promise<string> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase not configured");

  const match = imageDataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
  const mime = match?.[1] ?? "image/jpeg";
  const base64 = match?.[2] ?? imageDataUrl;
  const buffer = Buffer.from(base64, "base64");

  if (buffer.length > 4 * 1024 * 1024) {
    throw new Error("Image too large (max 4MB)");
  }

  const ext = mime.includes("png") ? "png" : "jpg";
  const path = `posts/${postId}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: mime, upsert: true });

  if (uploadError) throw new Error(uploadError.message);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

function rowToCreatorProfile(row: CreatorProfileRow): CreatorProfile {
  return {
    userId: row.user_id,
    displayName: row.display_name,
    school: row.school ?? undefined,
    region: row.region ?? undefined,
    bio: row.bio ?? undefined,
    tagline: row.tagline ?? undefined,
    joinedAt: row.joined_at,
  };
}

export async function fetchCreatorProfileFromDb(
  userId: string
): Promise<CreatorProfile | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("gallery_creator_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return rowToCreatorProfile(data as CreatorProfileRow);
}

export async function upsertCreatorProfileInDb(input: {
  userId: string;
  displayName: string;
  school?: string;
  region?: string;
  bio?: string;
  tagline?: string;
  joinedAt?: string;
}): Promise<CreatorProfile> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase not configured");

  const existing = await fetchCreatorProfileFromDb(input.userId);
  const joinedAt = existing?.joinedAt ?? input.joinedAt ?? new Date().toISOString();

  const { data, error } = await supabase
    .from("gallery_creator_profiles")
    .upsert(
      {
        user_id: input.userId,
        display_name: input.displayName,
        school: input.school ?? null,
        region: input.region ?? null,
        bio: input.bio?.trim() || null,
        tagline: input.tagline?.trim() || null,
        joined_at: joinedAt,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    )
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return rowToCreatorProfile(data as CreatorProfileRow);
}

export async function recordGalleryPostView(
  postId: string,
  viewerId: string,
  authorId: string
): Promise<{ viewCount: number; recorded: boolean }> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase not configured");

  if (viewerId === authorId) {
    return { viewCount: await countViewsForPost(supabase, postId), recorded: false };
  }

  const { error: viewError } = await supabase
    .from("gallery_post_views")
    .insert({ post_id: postId, viewer_id: viewerId });

  if (viewError) {
    if (viewError.code === "23505") {
      return {
        viewCount: await countViewsForPost(supabase, postId),
        recorded: false,
      };
    }
    if (isMissingViewsTable(viewError)) {
      const { data: post } = await supabase
        .from("gallery_posts")
        .select("view_count")
        .eq("id", postId)
        .single();
      const current = (post as { view_count?: number } | null)?.view_count ?? 0;
      const next = current + 1;
      await supabase
        .from("gallery_posts")
        .update({ view_count: next })
        .eq("id", postId);
      return { viewCount: next, recorded: true };
    }
    throw new Error(viewError.message);
  }

  const viewCount = await countViewsForPost(supabase, postId);

  await supabase
    .from("gallery_posts")
    .update({ view_count: viewCount })
    .eq("id", postId);

  return { viewCount, recorded: true };
}

export async function insertGalleryPost(input: {
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
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase not configured");

  const imageUrl = await uploadGalleryImage(input.postId, input.imageDataUrl);

  const baseRow = {
    id: input.postId,
    scan_id: input.scanId,
    author_id: input.authorId,
    author_name: input.authorName,
    author_school: input.authorSchool ?? null,
    image_url: imageUrl,
    analysis: input.analysis,
    location_name: input.locationName,
    lat: input.lat,
    lng: input.lng,
  };

  let { data, error } = await supabase
    .from("gallery_posts")
    .insert({
      ...baseRow,
      post_type: "scan",
      image_rights_confirmed: input.imageRightsConfirmed,
      view_count: 0,
    })
    .select("*")
    .single();

  if (error && isMissingSchemaColumn(error)) {
    ({ data, error } = await supabase
      .from("gallery_posts")
      .insert(baseRow)
      .select("*")
      .single());
  }

  if (error) throw new Error(error.message);

  const row = data as PostRow;
  return rowToGalleryPost(row, {
    viewCount: row.view_count ?? 0,
    imageRightsConfirmed:
      row.image_rights_confirmed ?? input.imageRightsConfirmed,
    upvotes: 0,
    upvotedBy: [],
    comments: [],
    donations: [],
  });
}

export async function insertGalleryDiscussion(input: {
  postId: string;
  authorId: string;
  authorName: string;
  authorSchool?: string;
  title: string;
  body: string;
  imageDataUrl?: string;
  imageRightsConfirmed?: boolean;
}): Promise<GalleryPost> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase not configured");

  let imageUrl: string | null = null;
  if (input.imageDataUrl) {
    imageUrl = await uploadGalleryImage(input.postId, input.imageDataUrl);
  }

  const payload: Record<string, unknown> = {
    id: input.postId,
    scan_id: input.postId,
    author_id: input.authorId,
    author_name: input.authorName,
    author_school: input.authorSchool ?? null,
    location_name: input.title.trim(),
    discussion_body: input.body.trim(),
    post_type: "discussion",
    image_url: imageUrl,
    analysis: null,
    lat: null,
    lng: null,
    view_count: 0,
    image_rights_confirmed: Boolean(input.imageRightsConfirmed && imageUrl),
  };

  let { data, error } = await supabase
    .from("gallery_posts")
    .insert(payload)
    .select("*")
    .single();

  if (error && isMissingSchemaColumn(error)) {
    throw new Error(
      "Discussion posts need a database update. Run supabase/migrations/004_gallery_discussions.sql"
    );
  }
  if (error) throw new Error(error.message);

  return rowToGalleryPost(data as PostRow, {
    viewCount: 0,
    upvotes: 0,
    upvotedBy: [],
    comments: [],
    donations: [],
  });
}

export async function deleteGalleryComment(
  commentId: string,
  userId: string
): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase not configured");

  const { data, error } = await supabase
    .from("gallery_comments")
    .select("author_id")
    .eq("id", commentId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Comment not found");
  if ((data as { author_id: string }).author_id !== userId) {
    throw new Error("You can only delete your own comments");
  }

  const { error: deleteError } = await supabase
    .from("gallery_comments")
    .delete()
    .eq("id", commentId)
    .eq("author_id", userId);

  if (deleteError) throw new Error(deleteError.message);
}

export async function insertGalleryComment(input: {
  postId: string;
  authorId: string;
  authorName: string;
  body: string;
}): Promise<GalleryComment> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase not configured");

  const { data: postRow, error: postError } = await supabase
    .from("gallery_posts")
    .select("author_id")
    .eq("id", input.postId)
    .maybeSingle();

  if (postError) throw new Error(postError.message);
  if (!postRow) throw new Error("Post not found");

  const { data, error } = await supabase
    .from("gallery_comments")
    .insert({
      post_id: input.postId,
      author_id: input.authorId,
      author_name: input.authorName,
      body: input.body.trim(),
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  const row = data as CommentRow;
  return {
    id: row.id,
    postId: row.post_id,
    authorId: row.author_id,
    authorName: row.author_name,
    body: row.body,
    timestamp: row.created_at,
  };
}

export async function insertGalleryDonation(input: {
  postId: string;
  fromId: string;
  fromName: string;
  amount: number;
}): Promise<GalleryDonation> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase not configured");

  const { data, error } = await supabase
    .from("gallery_donations")
    .insert({
      post_id: input.postId,
      from_id: input.fromId,
      from_name: input.fromName,
      amount: input.amount,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  const row = data as DonationRow;
  return {
    id: row.id,
    postId: row.post_id,
    fromId: row.from_id,
    fromName: row.from_name,
    amount: row.amount,
    timestamp: row.created_at,
  };
}

export async function insertGalleryUpvote(
  postId: string,
  userId: string
): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase not configured");

  const { error } = await supabase
    .from("gallery_upvotes")
    .insert({ post_id: postId, user_id: userId });

  if (error) {
    if (error.code === "23505") return false;
    throw new Error(error.message);
  }
  return true;
}
