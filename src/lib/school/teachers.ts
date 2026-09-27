import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { fetchChapterByTeacherId } from "./db";

export type CoTeacherRole = "owner" | "co_teacher" | "ta";

export interface CoTeacher {
  id: string;
  chapterId: string;
  userId: string;
  displayName: string;
  email: string | null;
  role: CoTeacherRole;
  createdAt: string;
}

interface CoTeacherRow {
  id: string;
  chapter_id: string;
  user_id: string;
  display_name: string;
  email: string | null;
  role: CoTeacherRole;
  created_at: string;
}

function rowToCoTeacher(row: CoTeacherRow): CoTeacher {
  return {
    id: row.id,
    chapterId: row.chapter_id,
    userId: row.user_id,
    displayName: row.display_name,
    email: row.email,
    role: row.role,
    createdAt: row.created_at,
  };
}

export async function listCoTeachers(chapterId: string): Promise<CoTeacher[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("school_chapter_teachers")
    .select("*")
    .eq("chapter_id", chapterId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data as CoTeacherRow[]).map(rowToCoTeacher);
}

export async function addCoTeacher(input: {
  chapterId: string;
  teacherUserId: string;
  displayName: string;
  email?: string;
  role?: CoTeacherRole;
}): Promise<CoTeacher> {
  const chapter = await fetchChapterByTeacherId(input.teacherUserId);
  if (!chapter || chapter.id !== input.chapterId) {
    throw new Error("Chapter not found or access denied");
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase not configured");

  // Co-teachers are invited by email — a stub identifier stands in for the
  // real user id until they sign in and are matched. This keeps things
  // functional without a full invite/accept email flow.
  const inviteUserId = `invite:${input.email?.trim().toLowerCase() || crypto.randomUUID()}`;

  const { data, error } = await supabase
    .from("school_chapter_teachers")
    .insert({
      chapter_id: input.chapterId,
      user_id: inviteUserId,
      display_name: input.displayName.trim(),
      email: input.email?.trim() || null,
      role: input.role ?? "co_teacher",
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return rowToCoTeacher(data as CoTeacherRow);
}
