import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { GUIDE_LESSON_COUNT } from "./course";
import type { AdminLearnerRow, GuideProgressState, LessonProgress } from "./types";

function generateCertificateCode(): string {
  const segment = () =>
    Math.random().toString(36).slice(2, 6).toUpperCase();
  return `REEF-${segment()}-${segment()}`;
}

export async function upsertLearnerProfile(input: {
  userId: string;
  displayName: string;
  email?: string | null;
  school?: string | null;
}): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;

  const now = new Date().toISOString();
  const { error } = await supabase.from("academy_learners").upsert(
    {
      user_id: input.userId,
      display_name: input.displayName,
      email: input.email ?? null,
      school: input.school ?? null,
      last_activity_at: now,
      updated_at: now,
    },
    { onConflict: "user_id" }
  );
  if (error) throw new Error(error.message);
}

export async function markVideoWatched(input: {
  userId: string;
  displayName: string;
  email?: string | null;
  school?: string | null;
  moduleId: string;
}): Promise<LessonProgress> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase not configured");

  await upsertLearnerProfile(input);
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("academy_module_progress")
    .upsert(
      {
        user_id: input.userId,
        module_id: input.moduleId,
        video_watched: true,
        video_watched_at: now,
      },
      { onConflict: "user_id,module_id" }
    )
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return rowToLessonProgress(data);
}

export async function submitQuizResult(input: {
  userId: string;
  displayName: string;
  email?: string | null;
  school?: string | null;
  moduleId: string;
  score: number;
  passed: boolean;
}): Promise<{
  module: LessonProgress;
  certificateCode?: string;
  certificateIssuedAt?: string;
}> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase not configured");

  await upsertLearnerProfile(input);
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("academy_module_progress")
    .upsert(
      {
        user_id: input.userId,
        module_id: input.moduleId,
        quiz_score: input.score,
        quiz_passed: input.passed,
        quiz_attempted_at: now,
        completed_at: input.passed ? now : null,
      },
      { onConflict: "user_id,module_id" }
    )
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  let certificateCode: string | undefined;
  let certificateIssuedAt: string | undefined;

  if (input.passed) {
    const cert = await maybeIssueCertificate(input.userId);
    certificateCode = cert.certificateCode ?? undefined;
    certificateIssuedAt = cert.certificateIssuedAt ?? undefined;
  }

  return {
    module: rowToLessonProgress(data),
    certificateCode,
    certificateIssuedAt,
  };
}

async function maybeIssueCertificate(userId: string): Promise<{
  certificateCode: string | null;
  certificateIssuedAt: string | null;
}> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { certificateCode: null, certificateIssuedAt: null };

  const { data: passedRows, error: countError } = await supabase
    .from("academy_module_progress")
    .select("module_id")
    .eq("user_id", userId)
    .eq("quiz_passed", true);

  if (countError) throw new Error(countError.message);
  if ((passedRows?.length ?? 0) < GUIDE_LESSON_COUNT) {
    return { certificateCode: null, certificateIssuedAt: null };
  }

  const { data: learner, error: learnerError } = await supabase
    .from("academy_learners")
    .select("certificate_code, certificate_issued_at")
    .eq("user_id", userId)
    .single();

  if (learnerError) throw new Error(learnerError.message);

  if (learner.certificate_code) {
    return {
      certificateCode: learner.certificate_code,
      certificateIssuedAt: learner.certificate_issued_at,
    };
  }

  const now = new Date().toISOString();
  let code = generateCertificateCode();
  for (let attempt = 0; attempt < 5; attempt++) {
    const { error } = await supabase
      .from("academy_learners")
      .update({
        certificate_code: code,
        certificate_issued_at: now,
        updated_at: now,
      })
      .eq("user_id", userId)
      .is("certificate_code", null);

    if (!error) {
      return { certificateCode: code, certificateIssuedAt: now };
    }
    code = generateCertificateCode();
  }

  throw new Error("Could not issue certificate");
}

export async function fetchLearnerProgress(
  userId: string
): Promise<GuideProgressState | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const [{ data: learner }, { data: modules }] = await Promise.all([
    supabase
      .from("academy_learners")
      .select("certificate_code, certificate_issued_at")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("academy_module_progress")
      .select("*")
      .eq("user_id", userId),
  ]);

  if (!modules?.length && !learner) return null;

  const lessons: Record<string, LessonProgress> = {};
  for (const row of modules ?? []) {
    const lesson = rowToLessonProgress(row);
    lessons[lesson.lessonId] = lesson;
  }

  return {
    lessons,
    certificateCode: learner?.certificate_code ?? undefined,
    certificateIssuedAt: learner?.certificate_issued_at ?? undefined,
  };
}

export async function fetchAdminLearners(): Promise<AdminLearnerRow[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data: learners, error } = await supabase
    .from("academy_learners")
    .select("*")
    .order("last_activity_at", { ascending: false });

  if (error) throw new Error(error.message);
  if (!learners?.length) return [];

  const userIds = learners.map((l) => l.user_id);
  const { data: modules, error: modError } = await supabase
    .from("academy_module_progress")
    .select("*")
    .in("user_id", userIds);

  if (modError) throw new Error(modError.message);

  const byUser = new Map<string, LessonProgress[]>();
  for (const row of modules ?? []) {
    const list = byUser.get(row.user_id) ?? [];
    list.push(rowToLessonProgress(row));
    byUser.set(row.user_id, list);
  }

  return learners.map((l) => {
    const details = byUser.get(l.user_id) ?? [];
    const passed = details.filter((m) => m.quizPassed).length;
    return {
      userId: l.user_id,
      displayName: l.display_name,
      email: l.email,
      school: l.school,
      lessonsCompleted: passed,
      totalLessons: GUIDE_LESSON_COUNT,
      modulesCompleted: passed,
      totalModules: GUIDE_LESSON_COUNT,
      certificateIssued: Boolean(l.certificate_code),
      certificateCode: l.certificate_code,
      lastActivityAt: l.last_activity_at,
      lessonDetails: details,
      moduleDetails: details,
    };
  });
}

function rowToLessonProgress(row: {
  module_id: string;
  video_watched: boolean;
  video_watched_at: string | null;
  quiz_score: number | null;
  quiz_passed: boolean;
  quiz_attempted_at: string | null;
  completed_at: string | null;
}): LessonProgress {
  return {
    lessonId: row.module_id,
    videoWatched: row.video_watched,
    videoWatchedAt: row.video_watched_at ?? undefined,
    quizScore: row.quiz_score ?? undefined,
    quizPassed: row.quiz_passed,
    quizAttemptedAt: row.quiz_attempted_at ?? undefined,
    completedAt: row.completed_at ?? undefined,
  };
}
