"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { usePlatform } from "@/context/PlatformContext";
import { academyLessons } from "@/lib/data/academy-lessons";
import { LESSON_CONTENT } from "@/lib/platform/lesson-content";
import { BookOpen, CheckCircle, Clock, X } from "lucide-react";

export function AcademyView() {
  const { state, completeLesson, hydrated } = usePlatform();
  const [activeLesson, setActiveLesson] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [quizError, setQuizError] = useState<string | null>(null);

  const completed = state.completedLessons.length;
  const total = academyLessons.length;
  const certReady = completed >= total;

  const content = activeLesson ? LESSON_CONTENT[activeLesson] : null;
  const lessonMeta = academyLessons.find((l) => l.id === activeLesson);

  function submitQuiz() {
    if (!content || !activeLesson) return;
    const allCorrect = content.quiz.every(
      (q, i) => answers[i] === q.correctIndex
    );
    if (!allCorrect) {
      setQuizError("Not all answers are correct. Review the lesson and try again.");
      return;
    }
    setQuizError(null);
    completeLesson(activeLesson);
    setActiveLesson(null);
    setAnswers({});
  }

  if (!hydrated) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-12 text-center text-slate-400">
        Loading academy...
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <PageHeader
        badge="Education"
        title="Reef Academy"
        subtitle="Read lessons, pass quizzes, and earn +100 points per completion."
      />

      <article className="glass rounded-2xl p-6 mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">Your progress</p>
          <p className="text-2xl font-bold text-cyan-300">
            {completed} / {total} lessons
          </p>
        </div>
        <span
          className={`rounded-full px-4 py-2 text-sm ${
            certReady
              ? "bg-teal-500/20 text-teal-300"
              : "bg-slate-800 text-slate-400"
          }`}
        >
          {certReady
            ? "Reef Explorer Certificate earned"
            : "Complete all lessons for certification"}
        </span>
      </article>

      <section className="grid gap-4">
        {academyLessons.map((lesson) => {
          const done = state.completedLessons.includes(lesson.id);
          return (
            <article
              key={lesson.id}
              className="glass rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex gap-4 items-start">
                <span className="rounded-lg bg-cyan-500/20 p-3">
                  <BookOpen className="h-5 w-5 text-cyan-400" />
                </span>
                <span>
                  <span className="text-xs text-cyan-400 font-medium">
                    {lesson.category}
                  </span>
                  <h3 className="font-semibold text-lg">{lesson.title}</h3>
                  <span className="flex items-center gap-3 mt-1 text-sm text-slate-400">
                    <Clock className="h-4 w-4" />
                    {lesson.duration}
                    {lesson.quizQuestions && (
                      <span>{lesson.quizQuestions} quiz questions</span>
                    )}
                  </span>
                </span>
              </div>
              {done ? (
                <span className="flex items-center gap-1 text-teal-400 text-sm font-medium">
                  <CheckCircle className="h-4 w-4" />
                  Completed
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setActiveLesson(lesson.id);
                    setAnswers({});
                    setQuizError(null);
                  }}
                  className="rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 px-5 py-2 text-sm font-semibold text-slate-900"
                >
                  Start Lesson
                </button>
              )}
            </article>
          );
        })}
      </section>

      {activeLesson && content && lessonMeta && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80"
          role="dialog"
          aria-modal="true"
        >
          <article className="glass rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <header className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">{lessonMeta.title}</h2>
              <button
                type="button"
                onClick={() => setActiveLesson(null)}
                className="text-slate-400 hover:text-white"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            {content.sections.map((sec) => (
              <section key={sec.heading} className="mb-4">
                <h3 className="font-semibold text-cyan-300 mb-1">{sec.heading}</h3>
                <p className="text-sm text-slate-300 leading-relaxed">{sec.body}</p>
              </section>
            ))}

            <section className="border-t border-cyan-500/20 pt-4 mt-4">
              <h3 className="font-semibold mb-3">Quiz</h3>
              {content.quiz.map((q, qi) => (
                <fieldset key={qi} className="mb-4">
                  <legend className="text-sm mb-2">{q.question}</legend>
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => (
                      <label
                        key={oi}
                        className="flex items-center gap-2 text-sm cursor-pointer"
                      >
                        <input
                          type="radio"
                          name={`q-${qi}`}
                          checked={answers[qi] === oi}
                          onChange={() =>
                            setAnswers((prev) => ({ ...prev, [qi]: oi }))
                          }
                          className="accent-cyan-500"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}
              {quizError && (
                <p className="text-red-400 text-sm mb-2">{quizError}</p>
              )}
              <button
                type="button"
                onClick={submitQuiz}
                disabled={
                  Object.keys(answers).length < content.quiz.length
                }
                className="w-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 py-3 font-semibold text-slate-900 disabled:opacity-40"
              >
                Submit Quiz (+100 pts)
              </button>
            </section>
          </article>
        </div>
      )}
    </section>
  );
}
