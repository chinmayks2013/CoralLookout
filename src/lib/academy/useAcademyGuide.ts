"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePlatform } from "@/context/PlatformContext";
import {
  fetchGuideProgressFromCloud,
  syncQuizSubmission,
  syncVideoWatched,
} from "@/lib/academy/cloud";
import {
  CORAL_GUIDE_LESSONS,
  GUIDE_LESSON_COUNT,
} from "@/lib/academy/course";
import {
  defaultDisplayName,
  ensureUserId,
  loadGuideProgress,
  mergeGuideProgress,
  saveGuideProgress,
} from "@/lib/academy/storage";
import {
  GUIDE_PASS_THRESHOLD,
  scoreQuiz,
  type GuideLesson,
  type GuideProgressState,
} from "@/lib/academy/types";

export function useAcademyGuide() {
  const { state, hydrated, completeLesson, dispatch } = usePlatform();
  const [guide, setGuide] = useState<GuideProgressState>({ lessons: {} });
  const [ready, setReady] = useState(false);

  const userId = useMemo(
    () => (hydrated ? ensureUserId(state.userId) : ""),
    [hydrated, state.userId]
  );

  useEffect(() => {
    if (!hydrated) return;
    if (!state.userId) {
      dispatch({ type: "ENSURE_USER_ID" });
    }
  }, [hydrated, state.userId, dispatch]);

  useEffect(() => {
    if (!hydrated || !userId) return;
    let cancelled = false;

    async function load() {
      const local = loadGuideProgress();
      const remote = await fetchGuideProgressFromCloud(userId);
      if (cancelled) return;
      const merged = mergeGuideProgress(local, remote);
      setGuide(merged);
      saveGuideProgress(merged);
      setReady(true);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [hydrated, userId]);

  const profilePayload = useMemo(
    () => ({
      userId,
      displayName: defaultDisplayName(state.profile?.name),
      email: state.profile?.email ?? null,
      school: state.profile?.school ?? null,
    }),
    [userId, state.profile]
  );

  const passedCount = useMemo(
    () =>
      CORAL_GUIDE_LESSONS.filter((l) => guide.lessons[l.id]?.quizPassed).length,
    [guide]
  );

  const certReady = Boolean(
    guide.certificateCode || passedCount >= GUIDE_LESSON_COUNT
  );

  const markWatched = useCallback(
    async (lessonId: string) => {
      const now = new Date().toISOString();
      setGuide((prev) => {
        const next: GuideProgressState = {
          ...prev,
          lessons: {
            ...prev.lessons,
            [lessonId]: {
              ...prev.lessons[lessonId],
              lessonId,
              videoWatched: true,
              videoWatchedAt: now,
            },
          },
        };
        saveGuideProgress(next);
        return next;
      });

      const synced = await syncVideoWatched({
        ...profilePayload,
        moduleId: lessonId,
      });
      if (synced) {
        setGuide((prev) => {
          const next: GuideProgressState = {
            ...prev,
            lessons: {
              ...prev.lessons,
              [lessonId]: { ...synced, lessonId },
            },
          };
          saveGuideProgress(next);
          return next;
        });
      }
    },
    [profilePayload]
  );

  const continueToQuiz = useCallback(
    async (lessonId: string) => {
      await markWatched(lessonId);
    },
    [markWatched]
  );

  const submitQuiz = useCallback(
    async (lesson: GuideLesson, answers: Record<number, number>) => {
      const localResult = scoreQuiz(lesson.quiz, answers);

      try {
        const response = await syncQuizSubmission({
          ...profilePayload,
          moduleId: lesson.id,
          answers,
        });

        if (response) {
          setGuide((prev) => {
            const next: GuideProgressState = {
              lessons: {
                ...prev.lessons,
                [lesson.id]: { ...response.module, lessonId: lesson.id },
              },
              certificateCode:
                response.certificateCode ?? prev.certificateCode,
              certificateIssuedAt:
                response.certificateIssuedAt ?? prev.certificateIssuedAt,
            };
            saveGuideProgress(next);
            return next;
          });

          if (response.result.passed) {
            completeLesson(lesson.id);
          }
          return response.result;
        }
      } catch {
        // fall through to local-only grading
      }

      const now = new Date().toISOString();
      setGuide((prev) => {
        const next: GuideProgressState = {
          ...prev,
          lessons: {
            ...prev.lessons,
            [lesson.id]: {
              lessonId: lesson.id,
              videoWatched: prev.lessons[lesson.id]?.videoWatched ?? false,
              quizScore: localResult.score,
              quizPassed: localResult.passed,
              quizAttemptedAt: now,
              completedAt: localResult.passed ? now : undefined,
            },
          },
        };
        if (localResult.passed && passedCount + 1 >= GUIDE_LESSON_COUNT) {
          next.certificateCode =
            prev.certificateCode ??
            `REEF-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
          next.certificateIssuedAt = prev.certificateIssuedAt ?? now;
        }
        saveGuideProgress(next);
        return next;
      });

      if (localResult.passed) {
        completeLesson(lesson.id);
      }
      return localResult;
    },
    [profilePayload, completeLesson, passedCount]
  );

  function isLessonUnlocked(lesson: GuideLesson): boolean {
    if (lesson.order === 1) return true;
    const prev = CORAL_GUIDE_LESSONS.find((l) => l.order === lesson.order - 1);
    return prev ? Boolean(guide.lessons[prev.id]?.quizPassed) : false;
  }

  return {
    guide,
    ready: ready && hydrated,
    passedCount,
    totalLessons: GUIDE_LESSON_COUNT,
    certReady,
    markWatched,
    continueToQuiz,
    submitQuiz,
    isLessonUnlocked,
    passThreshold: GUIDE_PASS_THRESHOLD,
  };
}
