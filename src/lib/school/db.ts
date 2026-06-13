import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { fetchGalleryPostsFromDb } from "@/lib/gallery/db";
import type { GalleryPost } from "@/lib/gallery/types";
import { initialSubscriptionStatusForNewChapter } from "./config";
import { generateJoinCode } from "./join-code";
import {
  addHealth,
  buildInsightNarratives,
  emptyHealthBreakdown,
  lessonTitles,
  percentChange,
  scanConceptMastery,
  type ChapterInsights,
  type LessonMasteryRow,
} from "./insights";
import type {
  ChapterLeaderboardEntry,
  SchoolChapter,
  SchoolRosterMember,
  SubscriptionStatus,
} from "./types";

interface ChapterRow {
  id: string;
  teacher_user_id: string;
  teacher_name: string;
  teacher_email: string;
  school_name: string;
  join_code: string;
  branding_tagline: string | null;
  branding_accent: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: SubscriptionStatus;
  subscription_current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

interface RosterRow {
  id: string;
  chapter_id: string;
  user_id: string | null;
  display_name: string;
  email: string | null;
  status: "pending" | "active";
  joined_at: string | null;
  created_at: string;
}

function rowToChapter(row: ChapterRow): SchoolChapter {
  return {
    id: row.id,
    teacherUserId: row.teacher_user_id,
    teacherName: row.teacher_name,
    teacherEmail: row.teacher_email,
    schoolName: row.school_name,
    joinCode: row.join_code,
    brandingTagline: row.branding_tagline,
    brandingAccent: row.branding_accent ?? "cyan",
    subscriptionStatus: row.subscription_status,
    subscriptionCurrentPeriodEnd: row.subscription_current_period_end,
    stripeCustomerId: row.stripe_customer_id,
    createdAt: row.created_at,
  };
}

function rowToRoster(row: RosterRow): SchoolRosterMember {
  return {
    id: row.id,
    chapterId: row.chapter_id,
    userId: row.user_id,
    displayName: row.display_name,
    email: row.email,
    status: row.status,
    joinedAt: row.joined_at,
    createdAt: row.created_at,
  };
}

function isMissingSchoolTables(error: { message?: string; code?: string }): boolean {
  return (
    error.code === "42P01" ||
    (error.message?.includes("school_chapters") ?? false) ||
    (error.message?.includes("schema cache") ?? false)
  );
}

export async function fetchChapterByTeacherId(
  teacherUserId: string
): Promise<SchoolChapter | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("school_chapters")
    .select("*")
    .eq("teacher_user_id", teacherUserId)
    .maybeSingle();

  if (error) {
    if (isMissingSchoolTables(error)) {
      throw new Error(
        "School chapters need a database update. Run supabase/migrations/005_school_chapters.sql"
      );
    }
    throw new Error(error.message);
  }
  if (!data) return null;
  return rowToChapter(data as ChapterRow);
}

export async function fetchChapterByJoinCode(
  joinCode: string
): Promise<SchoolChapter | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("school_chapters")
    .select("*")
    .eq("join_code", joinCode.trim().toUpperCase())
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return rowToChapter(data as ChapterRow);
}

export async function createSchoolChapter(input: {
  teacherUserId: string;
  teacherName: string;
  teacherEmail: string;
  schoolName: string;
}): Promise<SchoolChapter> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase not configured");

  const existing = await fetchChapterByTeacherId(input.teacherUserId);
  if (existing) return existing;

  let joinCode = generateJoinCode();
  for (let attempt = 0; attempt < 5; attempt++) {
    const subscriptionStatus = initialSubscriptionStatusForNewChapter();

    const { data, error } = await supabase
      .from("school_chapters")
      .insert({
        teacher_user_id: input.teacherUserId,
        teacher_name: input.teacherName,
        teacher_email: input.teacherEmail,
        school_name: input.schoolName.trim(),
        join_code: joinCode,
        subscription_status: subscriptionStatus,
      })
      .select("*")
      .single();

    if (!error) return rowToChapter(data as ChapterRow);
    if (error.code === "23505" && error.message.includes("join_code")) {
      joinCode = generateJoinCode();
      continue;
    }
    if (isMissingSchoolTables(error)) {
      throw new Error(
        "School chapters need a database update. Run supabase/migrations/005_school_chapters.sql"
      );
    }
    throw new Error(error.message);
  }
  throw new Error("Could not generate a unique join code");
}

export async function updateChapterBranding(input: {
  chapterId: string;
  teacherUserId: string;
  schoolName?: string;
  brandingTagline?: string | null;
  brandingAccent?: string;
}): Promise<SchoolChapter> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase not configured");

  const chapter = await fetchChapterByTeacherId(input.teacherUserId);
  if (!chapter || chapter.id !== input.chapterId) {
    throw new Error("Chapter not found or access denied");
  }

  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (input.schoolName !== undefined) payload.school_name = input.schoolName.trim();
  if (input.brandingTagline !== undefined) {
    payload.branding_tagline = input.brandingTagline;
  }
  if (input.brandingAccent !== undefined) {
    payload.branding_accent = input.brandingAccent;
  }

  const { data, error } = await supabase
    .from("school_chapters")
    .update(payload)
    .eq("id", input.chapterId)
    .eq("teacher_user_id", input.teacherUserId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return rowToChapter(data as ChapterRow);
}

export async function updateChapterSubscription(input: {
  chapterId: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  subscriptionStatus: SubscriptionStatus;
  subscriptionCurrentPeriodEnd?: string | null;
}): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase not configured");

  const payload: Record<string, unknown> = {
    subscription_status: input.subscriptionStatus,
    subscription_current_period_end: input.subscriptionCurrentPeriodEnd ?? null,
    updated_at: new Date().toISOString(),
  };
  if (input.stripeCustomerId !== undefined) {
    payload.stripe_customer_id = input.stripeCustomerId;
  }
  if (input.stripeSubscriptionId !== undefined) {
    payload.stripe_subscription_id = input.stripeSubscriptionId;
  }

  const { error } = await supabase
    .from("school_chapters")
    .update(payload)
    .eq("id", input.chapterId);

  if (error) throw new Error(error.message);
}

export async function fetchChapterById(chapterId: string): Promise<SchoolChapter | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("school_chapters")
    .select("*")
    .eq("id", chapterId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return rowToChapter(data as ChapterRow);
}

export async function fetchRoster(chapterId: string): Promise<SchoolRosterMember[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("school_roster")
    .select("*")
    .eq("chapter_id", chapterId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data as RosterRow[]).map(rowToRoster);
}

export async function addRosterMember(input: {
  chapterId: string;
  teacherUserId: string;
  displayName: string;
  email?: string;
}): Promise<SchoolRosterMember> {
  const chapter = await fetchChapterByTeacherId(input.teacherUserId);
  if (!chapter || chapter.id !== input.chapterId) {
    throw new Error("Chapter not found or access denied");
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase not configured");

  const { data, error } = await supabase
    .from("school_roster")
    .insert({
      chapter_id: input.chapterId,
      display_name: input.displayName.trim(),
      email: input.email?.trim() || null,
      status: "pending",
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return rowToRoster(data as RosterRow);
}

export async function bulkAddRosterMembers(input: {
  chapterId: string;
  teacherUserId: string;
  members: { displayName: string; email?: string }[];
}): Promise<SchoolRosterMember[]> {
  const chapter = await fetchChapterByTeacherId(input.teacherUserId);
  if (!chapter || chapter.id !== input.chapterId) {
    throw new Error("Chapter not found or access denied");
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase not configured");

  const rows = input.members
    .filter((m) => m.displayName.trim())
    .map((m) => ({
      chapter_id: input.chapterId,
      display_name: m.displayName.trim(),
      email: m.email?.trim() || null,
      status: "pending" as const,
    }));

  if (rows.length === 0) return [];

  const { data, error } = await supabase
    .from("school_roster")
    .insert(rows)
    .select("*");

  if (error) throw new Error(error.message);
  return (data as RosterRow[]).map(rowToRoster);
}

export async function removeRosterMember(input: {
  rosterId: string;
  chapterId: string;
  teacherUserId: string;
}): Promise<void> {
  const chapter = await fetchChapterByTeacherId(input.teacherUserId);
  if (!chapter || chapter.id !== input.chapterId) {
    throw new Error("Chapter not found or access denied");
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase not configured");

  const { error } = await supabase
    .from("school_roster")
    .delete()
    .eq("id", input.rosterId)
    .eq("chapter_id", input.chapterId);

  if (error) throw new Error(error.message);
}

export async function joinChapterWithCode(input: {
  joinCode: string;
  userId: string;
  displayName: string;
  email?: string;
}): Promise<{ chapter: SchoolChapter; roster: SchoolRosterMember }> {
  const chapter = await fetchChapterByJoinCode(input.joinCode);
  if (!chapter) throw new Error("Invalid join code");

  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase not configured");

  const { data: existing } = await supabase
    .from("school_roster")
    .select("*")
    .eq("chapter_id", chapter.id)
    .eq("user_id", input.userId)
    .maybeSingle();

  if (existing) {
    return {
      chapter,
      roster: rowToRoster(existing as RosterRow),
    };
  }

  const emailNorm = input.email?.trim().toLowerCase();
  let rosterRow: RosterRow | null = null;

  if (emailNorm) {
    const { data: pending } = await supabase
      .from("school_roster")
      .select("*")
      .eq("chapter_id", chapter.id)
      .ilike("email", emailNorm)
      .is("user_id", null)
      .maybeSingle();

    if (pending) {
      const { data: updated, error: upErr } = await supabase
        .from("school_roster")
        .update({
          user_id: input.userId,
          display_name: input.displayName.trim(),
          status: "active",
          joined_at: new Date().toISOString(),
        })
        .eq("id", (pending as RosterRow).id)
        .select("*")
        .single();
      if (upErr) throw new Error(upErr.message);
      rosterRow = updated as RosterRow;
    }
  }

  if (!rosterRow) {
    const { data: inserted, error } = await supabase
      .from("school_roster")
      .insert({
        chapter_id: chapter.id,
        user_id: input.userId,
        display_name: input.displayName.trim(),
        email: emailNorm || null,
        status: "active",
        joined_at: new Date().toISOString(),
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    rosterRow = inserted as RosterRow;
  }

  return { chapter, roster: rowToRoster(rosterRow) };
}

export async function fetchStudentClassDashboard(userId: string): Promise<{
  chapter: SchoolChapter;
  classmates: SchoolRosterMember[];
  leaderboard: ChapterLeaderboardEntry[];
  myRank: number;
  myStats: ChapterLeaderboardEntry | null;
} | null> {
  const membership = await fetchStudentChapter(userId);
  if (!membership) return null;

  const roster = await fetchRoster(membership.chapter.id);
  const classmates = roster.filter((r) => r.status === "active");
  const leaderboard = await fetchChapterLeaderboard(membership.chapter.id);
  const myStats = leaderboard.find((e) => e.userId === userId) ?? null;
  const myRank =
    myStats === null
      ? 0
      : leaderboard.findIndex((e) => e.userId === userId) + 1;

  return {
    chapter: membership.chapter,
    classmates,
    leaderboard,
    myRank,
    myStats,
  };
}

export async function fetchStudentChapter(
  userId: string
): Promise<{ chapter: SchoolChapter; roster: SchoolRosterMember } | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("school_roster")
    .select("*, school_chapters(*)")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    if (isMissingSchoolTables(error)) return null;
    throw new Error(error.message);
  }
  if (!data) return null;

  const row = data as RosterRow & { school_chapters: ChapterRow };
  return {
    chapter: rowToChapter(row.school_chapters),
    roster: rowToRoster(row),
  };
}

function buildLeaderboardFromPosts(
  posts: GalleryPost[],
  memberMap: Map<string, string>
): ChapterLeaderboardEntry[] {
  const stats = new Map<
    string,
    {
      displayName: string;
      postCount: number;
      totalViews: number;
      commentCount: number;
      coralsReceived: number;
      upvotesReceived: number;
    }
  >();

  for (const [userId, name] of memberMap) {
    stats.set(userId, {
      displayName: name,
      postCount: 0,
      totalViews: 0,
      commentCount: 0,
      coralsReceived: 0,
      upvotesReceived: 0,
    });
  }

  for (const post of posts) {
    if (!memberMap.has(post.authorId)) continue;
    const s = stats.get(post.authorId)!;
    s.postCount += 1;
    s.totalViews += post.viewCount;
    s.upvotesReceived += post.upvotes;
    s.coralsReceived += post.donations.reduce((sum, d) => sum + d.amount, 0);
    s.commentCount += post.comments.length;
  }

  for (const post of posts) {
    for (const c of post.comments) {
      if (!memberMap.has(c.authorId) || c.authorId === post.authorId) continue;
      const s = stats.get(c.authorId);
      if (s) s.commentCount += 1;
    }
  }

  return [...stats.entries()]
    .map(([userId, s]) => ({
      userId,
      displayName: s.displayName,
      postCount: s.postCount,
      totalViews: s.totalViews,
      commentCount: s.commentCount,
      coralsReceived: s.coralsReceived,
      upvotesReceived: s.upvotesReceived,
      score:
        s.totalViews +
        s.postCount * 10 +
        s.commentCount * 3 +
        s.coralsReceived +
        s.upvotesReceived * 2,
    }))
    .sort((a, b) => b.score - a.score);
}

export async function fetchChapterLeaderboard(
  chapterId: string
): Promise<ChapterLeaderboardEntry[]> {
  const roster = await fetchRoster(chapterId);
  const active = roster.filter((r) => r.userId && r.status === "active");
  const memberMap = new Map<string, string>();
  for (const m of active) {
    if (m.userId) memberMap.set(m.userId, m.displayName);
  }
  if (memberMap.size === 0) return [];

  const posts = await fetchGalleryPostsFromDb();
  return buildLeaderboardFromPosts(posts, memberMap);
}

export function buildChapterExportCsv(
  roster: SchoolRosterMember[],
  leaderboard: ChapterLeaderboardEntry[],
  chapter: SchoolChapter
): string {
  const byUser = new Map(leaderboard.map((e) => [e.userId, e]));
  const headers = [
    "School",
    "Student Name",
    "Email",
    "Status",
    "Joined",
    "Posts",
    "Views",
    "Comments",
    "Corals Received",
    "Upvotes",
    "Engagement Score",
  ];
  const rows = roster.map((m) => {
    const stats = m.userId ? byUser.get(m.userId) : undefined;
    return [
      chapter.schoolName,
      m.displayName,
      m.email ?? "",
      m.status,
      m.joinedAt ? new Date(m.joinedAt).toISOString().slice(0, 10) : "",
      String(stats?.postCount ?? 0),
      String(stats?.totalViews ?? 0),
      String(stats?.commentCount ?? 0),
      String(stats?.coralsReceived ?? 0),
      String(stats?.upvotesReceived ?? 0),
      String(stats?.score ?? 0),
    ];
  });
  const escape = (v: string) => {
    if (v.includes(",") || v.includes('"') || v.includes("\n")) {
      return `"${v.replace(/"/g, '""')}"`;
    }
    return v;
  };
  return [headers, ...rows].map((r) => r.map(escape).join(",")).join("\n");
}

export async function fetchChapterInsights(
  chapterId: string
): Promise<ChapterInsights> {
  const roster = await fetchRoster(chapterId);
  const active = roster.filter((r) => r.userId && r.status === "active");
  const rosterUserIds = new Set(
    active.map((m) => m.userId!).filter(Boolean)
  );
  const rosterSize = rosterUserIds.size;

  const now = Date.now();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const thisWeekStart = new Date(now - weekMs).toISOString();
  const priorWeekStart = new Date(now - 2 * weekMs).toISOString();

  let healthThisWeek = emptyHealthBreakdown();
  let healthPriorWeek = emptyHealthBreakdown();
  let scansThisWeek = 0;
  let scansPriorWeek = 0;

  const supabase = getSupabaseAdmin();
  const textsByUser = new Map<string, string[]>();

  const pushText = (userId: string, text: string) => {
    if (!text.trim()) return;
    const list = textsByUser.get(userId) ?? [];
    list.push(text);
    textsByUser.set(userId, list);
  };

  if (supabase && rosterSize > 0) {
    const ids = [...rosterUserIds];

    const { data: scans } = await supabase
      .from("user_scans")
      .select("user_id, health, created_at")
      .in("user_id", ids);

    for (const row of scans ?? []) {
      const created = row.created_at as string;
      const health = row.health as string;
      if (created >= thisWeekStart) {
        scansThisWeek += 1;
        healthThisWeek = addHealth(healthThisWeek, health);
      } else if (created >= priorWeekStart && created < thisWeekStart) {
        scansPriorWeek += 1;
        healthPriorWeek = addHealth(healthPriorWeek, health);
      }
    }

    const posts = await fetchGalleryPostsFromDb();
    for (const post of posts) {
      if (!rosterUserIds.has(post.authorId)) continue;
      const ts = post.timestamp;
      if (post.postType === "scan" && post.analysis?.health) {
        if (ts >= thisWeekStart) {
          scansThisWeek += 1;
          healthThisWeek = addHealth(healthThisWeek, post.analysis.health);
        } else if (ts >= priorWeekStart && ts < thisWeekStart) {
          scansPriorWeek += 1;
          healthPriorWeek = addHealth(healthPriorWeek, post.analysis.health);
        }
      }
      if (post.postType === "discussion" && post.discussionBody) {
        pushText(post.authorId, post.discussionBody);
      }
      for (const c of post.comments) {
        if (rosterUserIds.has(c.authorId)) {
          pushText(c.authorId, c.body);
        }
      }
    }

    const { data: progressRows } = await supabase
      .from("academy_module_progress")
      .select("user_id, module_id, quiz_score, quiz_passed, completed_at")
      .in("user_id", ids);

    const titles = lessonTitles();
    const lessonMastery: LessonMasteryRow[] = Object.entries(titles).map(
      ([lessonId, title]) => {
        const rows =
          progressRows?.filter((r) => r.module_id === lessonId) ?? [];
        const attempted = rows.filter((r) => r.quiz_score != null).length;
        const passed = rows.filter((r) => r.quiz_passed).length;
        const avgScore =
          attempted > 0
            ? rows.reduce((s, r) => s + Number(r.quiz_score ?? 0), 0) / attempted
            : 0;
        return {
          lessonId,
          title,
          studentsPassed: passed,
          studentsAttempted: attempted,
          passRate:
            rosterSize > 0 ? Math.round((passed / rosterSize) * 100) : 0,
          avgScore,
        };
      }
    );

    let academyGraduates = 0;
    for (const userId of rosterUserIds) {
      const userRows =
        progressRows?.filter((r) => r.user_id === userId && r.quiz_passed) ?? [];
      if (userRows.length >= Object.keys(titles).length) academyGraduates += 1;
    }
    const academyCompletionRate =
      rosterSize > 0 ? Math.round((academyGraduates / rosterSize) * 100) : 0;

    const conceptMastery = scanConceptMastery(rosterUserIds, textsByUser);
    const mildStressChangePercent = percentChange(
      healthThisWeek.mild_stress,
      healthPriorWeek.mild_stress
    );

    const narrativeBullets = buildInsightNarratives({
      rosterSize,
      scansThisWeek,
      mildStressChangePercent,
      healthThisWeek,
      conceptMastery,
      lessonMastery,
      academyCompletionRate,
    });

    return {
      rosterSize,
      scansThisWeek,
      scansPriorWeek,
      healthThisWeek,
      healthPriorWeek,
      mildStressChangePercent,
      academyCompletionRate,
      lessonMastery,
      conceptMastery,
      narrativeBullets,
      generatedAt: new Date().toISOString(),
    };
  }

  return {
    rosterSize,
    scansThisWeek: 0,
    scansPriorWeek: 0,
    healthThisWeek: emptyHealthBreakdown(),
    healthPriorWeek: emptyHealthBreakdown(),
    mildStressChangePercent: null,
    academyCompletionRate: 0,
    lessonMastery: [],
    conceptMastery: [],
    narrativeBullets: buildInsightNarratives({
      rosterSize,
      scansThisWeek: 0,
      mildStressChangePercent: null,
      healthThisWeek: emptyHealthBreakdown(),
      conceptMastery: [],
      lessonMastery: [],
      academyCompletionRate: 0,
    }),
    generatedAt: new Date().toISOString(),
  };
}
