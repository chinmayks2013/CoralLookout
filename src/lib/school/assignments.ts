import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { fetchChapterByTeacherId } from "./db";

export interface SchoolAssignment {
  id: string;
  chapterId: string;
  title: string;
  description: string | null;
  requiresScan: boolean;
  requiresPin: boolean;
  dueAt: string | null;
  createdBy: string;
  createdAt: string;
}

export interface AssignmentCompletion {
  id: string;
  assignmentId: string;
  userId: string;
  scanId: string | null;
  completedAt: string;
}

interface AssignmentRow {
  id: string;
  chapter_id: string;
  title: string;
  description: string | null;
  requires_scan: boolean;
  requires_pin: boolean;
  due_at: string | null;
  created_by: string;
  created_at: string;
}

interface CompletionRow {
  id: string;
  assignment_id: string;
  user_id: string;
  scan_id: string | null;
  completed_at: string;
}

function rowToAssignment(row: AssignmentRow): SchoolAssignment {
  return {
    id: row.id,
    chapterId: row.chapter_id,
    title: row.title,
    description: row.description,
    requiresScan: row.requires_scan,
    requiresPin: row.requires_pin,
    dueAt: row.due_at,
    createdBy: row.created_by,
    createdAt: row.created_at,
  };
}

function rowToCompletion(row: CompletionRow): AssignmentCompletion {
  return {
    id: row.id,
    assignmentId: row.assignment_id,
    userId: row.user_id,
    scanId: row.scan_id,
    completedAt: row.completed_at,
  };
}

export async function createAssignment(input: {
  chapterId: string;
  teacherUserId: string;
  title: string;
  description?: string;
  requiresScan?: boolean;
  requiresPin?: boolean;
  dueAt?: string | null;
}): Promise<SchoolAssignment> {
  const chapter = await fetchChapterByTeacherId(input.teacherUserId);
  if (!chapter || chapter.id !== input.chapterId) {
    throw new Error("Chapter not found or access denied");
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase not configured");

  const { data, error } = await supabase
    .from("school_assignments")
    .insert({
      chapter_id: input.chapterId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      requires_scan: input.requiresScan ?? true,
      requires_pin: input.requiresPin ?? true,
      due_at: input.dueAt ?? null,
      created_by: input.teacherUserId,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return rowToAssignment(data as AssignmentRow);
}

export async function listAssignments(
  chapterId: string
): Promise<SchoolAssignment[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("school_assignments")
    .select("*")
    .eq("chapter_id", chapterId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as AssignmentRow[]).map(rowToAssignment);
}

export async function getAssignment(
  assignmentId: string
): Promise<SchoolAssignment | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("school_assignments")
    .select("*")
    .eq("id", assignmentId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return rowToAssignment(data as AssignmentRow);
}

export async function listCompletions(
  assignmentId: string
): Promise<AssignmentCompletion[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("school_assignment_completions")
    .select("*")
    .eq("assignment_id", assignmentId)
    .order("completed_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as CompletionRow[]).map(rowToCompletion);
}

export async function listUserCompletions(
  userId: string,
  assignmentIds: string[]
): Promise<AssignmentCompletion[]> {
  if (assignmentIds.length === 0) return [];
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("school_assignment_completions")
    .select("*")
    .eq("user_id", userId)
    .in("assignment_id", assignmentIds)
    .order("completed_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as CompletionRow[]).map(rowToCompletion);
}

export async function listCompletionsForChapter(
  chapterId: string
): Promise<AssignmentCompletion[]> {
  const assignments = await listAssignments(chapterId);
  const ids = assignments.map((a) => a.id);
  if (ids.length === 0) return [];

  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("school_assignment_completions")
    .select("*")
    .in("assignment_id", ids)
    .order("completed_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as CompletionRow[]).map(rowToCompletion);
}

export async function markComplete(input: {
  assignmentId: string;
  userId: string;
  scanId?: string;
}): Promise<AssignmentCompletion> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase not configured");

  const { data, error } = await supabase
    .from("school_assignment_completions")
    .upsert(
      {
        assignment_id: input.assignmentId,
        user_id: input.userId,
        scan_id: input.scanId ?? null,
        completed_at: new Date().toISOString(),
      },
      { onConflict: "assignment_id,user_id" }
    )
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return rowToCompletion(data as CompletionRow);
}
