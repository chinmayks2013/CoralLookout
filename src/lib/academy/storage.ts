import type { GuideProgressState, LessonProgress } from "./types";

const STORAGE_KEY = "coral-lookout-academy-guide-v1";

export const EMPTY_GUIDE_PROGRESS: GuideProgressState = {
  lessons: {},
};

function normalizeLesson(id: string, row: LessonProgress & { moduleId?: string }): LessonProgress {
  return {
    ...row,
    lessonId: row.lessonId ?? row.moduleId ?? id,
  };
}

export function normalizeGuideProgress(raw: GuideProgressState): GuideProgressState {
  const lessons: Record<string, LessonProgress> = { ...(raw.lessons ?? {}) };

  if (raw.modules) {
    for (const [id, mod] of Object.entries(raw.modules)) {
      lessons[id] = normalizeLesson(id, mod);
    }
  }

  for (const [id, lesson] of Object.entries(lessons)) {
    lessons[id] = normalizeLesson(id, lesson);
  }

  return {
    lessons,
    certificateCode: raw.certificateCode,
    certificateIssuedAt: raw.certificateIssuedAt,
  };
}

export function loadGuideProgress(): GuideProgressState {
  if (typeof window === "undefined") return EMPTY_GUIDE_PROGRESS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_GUIDE_PROGRESS;
    return normalizeGuideProgress(JSON.parse(raw) as GuideProgressState);
  } catch {
    return EMPTY_GUIDE_PROGRESS;
  }
}

export function saveGuideProgress(state: GuideProgressState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeGuideProgress(state)));
}

export function mergeGuideProgress(
  local: GuideProgressState,
  remote: GuideProgressState | null
): GuideProgressState {
  const base = normalizeGuideProgress(local);
  if (!remote) return base;

  const remoteNorm = normalizeGuideProgress(remote);
  const lessons = { ...base.lessons };

  for (const [id, remoteLesson] of Object.entries(remoteNorm.lessons)) {
    const localLesson = lessons[id];
    if (!localLesson) {
      lessons[id] = remoteLesson;
      continue;
    }
    lessons[id] = {
      ...localLesson,
      ...remoteLesson,
      videoWatched: localLesson.videoWatched || remoteLesson.videoWatched,
      quizPassed: localLesson.quizPassed || remoteLesson.quizPassed,
      quizScore: Math.max(localLesson.quizScore ?? 0, remoteLesson.quizScore ?? 0),
    };
  }

  return {
    lessons,
    certificateCode: remoteNorm.certificateCode ?? base.certificateCode,
    certificateIssuedAt: remoteNorm.certificateIssuedAt ?? base.certificateIssuedAt,
  };
}

export function ensureUserId(existing: string): string {
  if (existing) return existing;
  return crypto.randomUUID();
}

export function defaultDisplayName(profileName?: string | null): string {
  return profileName?.trim() || "Reef Explorer";
}
