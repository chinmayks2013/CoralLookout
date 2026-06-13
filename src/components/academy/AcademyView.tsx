"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { usePlatform } from "@/context/PlatformContext";
import {
  CORAL_GUIDE_COURSE,
  CORAL_GUIDE_LESSONS,
} from "@/lib/academy/course";
import { useAcademyGuide } from "@/lib/academy/useAcademyGuide";
import { CertificateCard } from "@/components/academy/CertificateCard";
import { CertificateCelebration } from "@/components/academy/CertificateCelebration";
import { GuideQuiz } from "@/components/academy/GuideQuiz";
import { VideoGuidePlayer } from "@/components/academy/VideoGuidePlayer";
import {
  Award,
  CheckCircle,
  Clock,
  GraduationCap,
  Lock,
  PlayCircle,
  Settings,
  X,
} from "lucide-react";

type Step = "video" | "quiz";

export function AcademyView() {
  const { state, dispatch } = usePlatform();
  const {
    guide,
    ready,
    passedCount,
    totalLessons,
    certReady,
    continueToQuiz,
    submitQuiz,
    isLessonUnlocked,
    passThreshold,
  } = useAcademyGuide();

  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("video");
  const [showCelebration, setShowCelebration] = useState(false);
  const [certificateName, setCertificateName] = useState("");

  const learnerName = useMemo(
    () => certificateName || state.profile?.name?.trim() || "Reef Explorer",
    [certificateName, state.profile?.name]
  );

  const allowNameEdit = !state.profile?.name?.trim();

  useEffect(() => {
    if (state.profile?.name?.trim()) {
      setCertificateName(state.profile.name.trim());
    }
  }, [state.profile?.name]);

  useEffect(() => {
    if (!certReady || !ready) return;
    const key = `cert-celebration-${guide.certificateCode ?? state.userId}`;
    if (!sessionStorage.getItem(key)) {
      setShowCelebration(true);
      sessionStorage.setItem(key, "1");
    }
  }, [certReady, ready, guide.certificateCode, state.userId]);

  function openLesson(id: string) {
    setActiveLessonId(id);
    const prog = guide.lessons[id];
    setStep(prog?.videoWatched && !prog?.quizPassed ? "quiz" : "video");
  }

  function closeLesson() {
    setActiveLessonId(null);
    setStep("video");
  }

  function handleNameConfirm(name: string) {
    setCertificateName(name);
    if (state.profile) {
      dispatch({
        type: "REGISTER",
        profile: { ...state.profile, name },
      });
    }
  }

  function handleQuizClose(passed: boolean, lessonOrder: number) {
    if (passed) {
      const earnedCert = lessonOrder === totalLessons;
      closeLesson();
      if (earnedCert) {
        setShowCelebration(true);
      }
    } else {
      setStep("video");
    }
  }

  if (!ready) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-12 text-center text-slate-400">
        Loading academy...
      </section>
    );
  }

  const activeLesson = CORAL_GUIDE_LESSONS.find((l) => l.id === activeLessonId);

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <CertificateCelebration
        open={showCelebration}
        onClose={() => setShowCelebration(false)}
        learnerName={learnerName}
        issuedAt={guide.certificateIssuedAt}
        allowNameEdit={allowNameEdit}
        onNameConfirm={handleNameConfirm}
      />

      <PageHeader
        badge="Core feature"
        title="Reef Academy"
        subtitle="Learn to save corals in minutes — watch two short videos, pass two easy quizzes (40% to pass), and earn your conservation certificate."
      />

      <div className="flex flex-wrap items-center justify-end gap-3 mb-4">
        <Link
          href="/admin/academy"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-cyan-300"
        >
          <Settings className="h-3.5 w-3.5" />
          Admin progress panel
        </Link>
      </div>

      <article className="glass rounded-2xl p-6 mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">Your progress</p>
          <p className="text-2xl font-bold text-cyan-300">
            {passedCount} / {totalLessons} quizzes passed
          </p>
        </div>
        <span
          className={`rounded-full px-4 py-2 text-sm flex items-center gap-2 ${
            certReady
              ? "bg-teal-500/20 text-teal-300"
              : "bg-slate-800 text-slate-400"
          }`}
        >
          {certReady ? (
            <>
              <Award className="h-4 w-4" />
              Certificate earned
            </>
          ) : (
            "Complete the guide for certification"
          )}
        </span>
      </article>

      {certReady && (
        <div className="mb-8">
          <CertificateCard
            learnerName={learnerName}
            onViewFull={() => setShowCelebration(true)}
          />
        </div>
      )}

      <article className="glass rounded-2xl p-6 sm:p-8">
        <header className="flex flex-wrap items-start gap-4 mb-6 pb-6 border-b border-cyan-500/15">
          <span className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 p-3 shrink-0">
            <GraduationCap className="h-6 w-6 text-white" />
          </span>
          <div>
            <p className="text-xs text-cyan-400 font-medium uppercase tracking-wide">
              Guided module
            </p>
            <h2 className="text-2xl font-bold mt-1">{CORAL_GUIDE_COURSE.title}</h2>
            <p className="text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
              {CORAL_GUIDE_COURSE.description}
            </p>
          </div>
        </header>

        <section className="grid gap-4">
          {CORAL_GUIDE_LESSONS.map((lesson) => {
            const unlocked = isLessonUnlocked(lesson);
            const prog = guide.lessons[lesson.id];
            const passed = Boolean(prog?.quizPassed);
            const watched = Boolean(prog?.videoWatched);

            return (
              <article
                key={lesson.id}
                className={`rounded-xl border border-slate-700/50 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  !unlocked ? "opacity-60" : "bg-slate-900/30"
                }`}
              >
                <div className="flex gap-4 items-start">
                  <span className="rounded-lg bg-cyan-500/20 p-3 shrink-0">
                    {unlocked ? (
                      <PlayCircle className="h-5 w-5 text-cyan-400" />
                    ) : (
                      <Lock className="h-5 w-5 text-slate-500" />
                    )}
                  </span>
                  <span>
                    <span className="text-xs text-cyan-400 font-medium">
                      Video {lesson.order} of {totalLessons}
                    </span>
                    <h3 className="font-semibold text-lg">{lesson.title}</h3>
                    <p className="text-sm text-slate-400 mt-0.5">
                      {lesson.description}
                    </p>
                    <span className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {lesson.duration}
                      </span>
                      <span>{lesson.quiz.length} quiz questions</span>
                      {watched && !passed && (
                        <span className="text-amber-400">Quiz pending</span>
                      )}
                    </span>
                  </span>
                </div>
                {passed ? (
                  <span className="flex items-center gap-1 text-teal-400 text-sm font-medium shrink-0">
                    <CheckCircle className="h-4 w-4" />
                    Passed
                    {prog?.quizScore != null && (
                      <span className="text-slate-500">
                        ({Math.round(prog.quizScore * 100)}%)
                      </span>
                    )}
                  </span>
                ) : unlocked ? (
                  <button
                    type="button"
                    onClick={() => openLesson(lesson.id)}
                    className="rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 px-5 py-2 text-sm font-semibold text-slate-900 shrink-0"
                  >
                    {watched ? "Take quiz" : "Watch & learn"}
                  </button>
                ) : (
                  <span className="text-sm text-slate-500 shrink-0">
                    Pass video {lesson.order - 1} first
                  </span>
                )}
              </article>
            );
          })}
        </section>
      </article>

      {activeLesson && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80"
          role="dialog"
          aria-modal="true"
        >
          <article className="glass rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <header className="flex justify-between items-start mb-4 gap-4">
              <div>
                <p className="text-xs text-cyan-400 font-medium">
                  Video {activeLesson.order} · {CORAL_GUIDE_COURSE.title}
                </p>
                <h2 className="text-xl font-bold">{activeLesson.title}</h2>
              </div>
              <button
                type="button"
                onClick={closeLesson}
                className="text-slate-400 hover:text-white shrink-0"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            {step === "video" && (
              <VideoGuidePlayer
                lesson={activeLesson}
                onContinue={async () => {
                  await continueToQuiz(activeLesson.id);
                  setStep("quiz");
                }}
              />
            )}

            {step === "quiz" && (
              <GuideQuiz
                lesson={activeLesson}
                passThreshold={passThreshold}
                onSubmit={(answers) => submitQuiz(activeLesson, answers)}
                onClose={(passed) =>
                  handleQuizClose(passed, activeLesson.order)
                }
              />
            )}
          </article>
        </div>
      )}
    </section>
  );
}
