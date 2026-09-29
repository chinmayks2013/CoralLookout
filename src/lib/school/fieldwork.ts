import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { fetchChapterByTeacherId } from "./db";
import type { SchoolFieldwork, SchoolFieldworkInput } from "./types";

interface FieldworkRow {
  id: string;
  chapter_id: string;
  title: string;
  location: string;
  visit_at: string;
  transportation: string;
  group_size: number;
  equipment: string[];
  safety_notes: string;
  sample_label: string;
  sampled_at: string | null;
  water_temp_c: number | null;
  ph: number | null;
  salinity_ppt: number | null;
  dissolved_oxygen_mg_l: number | null;
  nitrate_mg_l: number | null;
  phosphate_mg_l: number | null;
  alkalinity_mg_l_caco3: number | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

function rowToFieldwork(row: FieldworkRow): SchoolFieldwork {
  return {
    id: row.id,
    chapterId: row.chapter_id,
    title: row.title,
    location: row.location,
    visitAt: row.visit_at,
    transportation: row.transportation,
    groupSize: row.group_size,
    equipment: row.equipment ?? [],
    safetyNotes: row.safety_notes,
    sampleLabel: row.sample_label,
    sampledAt: row.sampled_at,
    waterTempC: row.water_temp_c,
    pH: row.ph,
    salinityPpt: row.salinity_ppt,
    dissolvedOxygenMgL: row.dissolved_oxygen_mg_l,
    nitrateMgL: row.nitrate_mg_l,
    phosphateMgL: row.phosphate_mg_l,
    alkalinityMgLCaCO3: row.alkalinity_mg_l_caco3,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function inputToRow(input: SchoolFieldworkInput): Record<string, unknown> {
  return {
    title: input.title.trim(),
    location: input.location.trim(),
    visit_at: input.visitAt,
    transportation: input.transportation.trim(),
    group_size: input.groupSize,
    equipment: input.equipment,
    safety_notes: input.safetyNotes.trim(),
    sample_label: input.sampleLabel.trim(),
    sampled_at: input.sampledAt,
    water_temp_c: input.waterTempC,
    ph: input.pH,
    salinity_ppt: input.salinityPpt,
    dissolved_oxygen_mg_l: input.dissolvedOxygenMgL,
    nitrate_mg_l: input.nitrateMgL,
    phosphate_mg_l: input.phosphateMgL,
    alkalinity_mg_l_caco3: input.alkalinityMgLCaCO3,
  };
}

export async function listFieldwork(chapterId: string): Promise<SchoolFieldwork[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase not configured");

  const { data, error } = await supabase
    .from("school_fieldwork")
    .select("*")
    .eq("chapter_id", chapterId)
    .order("visit_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as FieldworkRow[]).map(rowToFieldwork);
}

export async function createFieldwork(input: {
  chapterId: string;
  teacherUserId: string;
  fieldwork: SchoolFieldworkInput;
}): Promise<SchoolFieldwork> {
  const chapter = await fetchChapterByTeacherId(input.teacherUserId);
  if (!chapter || chapter.id !== input.chapterId) {
    throw new Error("Chapter not found or access denied");
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase not configured");

  const { data, error } = await supabase
    .from("school_fieldwork")
    .insert({
      chapter_id: input.chapterId,
      created_by: input.teacherUserId,
      ...inputToRow(input.fieldwork),
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return rowToFieldwork(data as FieldworkRow);
}

export async function updateFieldwork(input: {
  id: string;
  chapterId: string;
  teacherUserId: string;
  fieldwork: SchoolFieldworkInput;
}): Promise<SchoolFieldwork> {
  const chapter = await fetchChapterByTeacherId(input.teacherUserId);
  if (!chapter || chapter.id !== input.chapterId) {
    throw new Error("Chapter not found or access denied");
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase not configured");

  const { data, error } = await supabase
    .from("school_fieldwork")
    .update({ ...inputToRow(input.fieldwork), updated_at: new Date().toISOString() })
    .eq("id", input.id)
    .eq("chapter_id", input.chapterId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return rowToFieldwork(data as FieldworkRow);
}