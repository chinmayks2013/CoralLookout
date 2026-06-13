import type { GuideProgressState, LessonProgress } from "./types";

export async function fetchGuideProgressFromCloud(
  userId: string
): Promise<GuideProgressState | null> {
  const res = await fetch(
    `/api/academy/progress?userId=${encodeURIComponent(userId)}`
  );
  if (!res.ok) return null;
  const data = (await res.json()) as { progress: GuideProgressState | null };
  return data.progress;
}

export async function syncVideoWatched(input: {
  userId: string;
  displayName: string;
  email?: string | null;
  school?: string | null;
  moduleId: string;
}): Promise<LessonProgress | null> {
  const res = await fetch("/api/academy/progress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "watch", ...input }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { module: LessonProgress };
  return { ...data.module, lessonId: data.module.lessonId ?? input.moduleId };
}

export async function syncQuizSubmission(input: {
  userId: string;
  displayName: string;
  email?: string | null;
  school?: string | null;
  moduleId: string;
  answers: Record<number, number>;
}): Promise<{
  module: LessonProgress;
  result: { score: number; passed: boolean; correct: number; total: number };
  certificateCode?: string;
  certificateIssuedAt?: string;
} | null> {
  const res = await fetch("/api/academy/progress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "quiz", ...input }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? "Quiz submission failed");
  }
  return (await res.json()) as {
    module: LessonProgress;
    result: { score: number; passed: boolean; correct: number; total: number };
    certificateCode?: string;
    certificateIssuedAt?: string;
  };
}

export async function fetchAdminAcademyReport(
  adminSecret: string
): Promise<{ learners: import("./types").AdminLearnerRow[]; cloudEnabled: boolean }> {
  const res = await fetch("/api/admin/academy", {
    headers: { Authorization: `Bearer ${adminSecret}` },
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? "Failed to load admin report");
  }
  return (await res.json()) as {
    learners: import("./types").AdminLearnerRow[];
    cloudEnabled: boolean;
  };
}
