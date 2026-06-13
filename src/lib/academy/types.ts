export interface GuideQuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface GuideLesson {
  id: string;
  order: number;
  title: string;
  description: string;
  /** YouTube video ID */
  videoId: string;
  duration: string;
  quiz: GuideQuizQuestion[];
}

/** @deprecated Use GuideLesson — kept for progress record shape */
export type GuideModule = GuideLesson;

export interface LessonProgress {
  lessonId: string;
  videoWatched: boolean;
  videoWatchedAt?: string;
  quizScore?: number;
  quizPassed?: boolean;
  quizAttemptedAt?: string;
  completedAt?: string;
}

/** @deprecated Use LessonProgress */
export interface ModuleProgress extends LessonProgress {
  moduleId: string;
}

export interface GuideProgressState {
  lessons: Record<string, LessonProgress>;
  /** @deprecated migrated from older saves */
  modules?: Record<string, LessonProgress & { moduleId?: string }>;
  certificateIssuedAt?: string;
  certificateCode?: string;
}

export interface AdminLearnerRow {
  userId: string;
  displayName: string;
  email: string | null;
  school: string | null;
  lessonsCompleted: number;
  totalLessons: number;
  /** @deprecated */
  modulesCompleted: number;
  /** @deprecated */
  totalModules: number;
  certificateIssued: boolean;
  certificateCode: string | null;
  lastActivityAt: string | null;
  lessonDetails: LessonProgress[];
  /** @deprecated */
  moduleDetails: LessonProgress[];
}

export const GUIDE_PASS_THRESHOLD = 0.4;

export function scoreQuiz(
  questions: GuideQuizQuestion[],
  answers: Record<number, number>
): { score: number; passed: boolean; correct: number; total: number } {
  const total = questions.length;
  let correct = 0;
  questions.forEach((q, i) => {
    if (answers[i] === q.correctIndex) correct++;
  });
  const score = total > 0 ? correct / total : 0;
  return {
    score,
    passed: score >= GUIDE_PASS_THRESHOLD,
    correct,
    total,
  };
}
