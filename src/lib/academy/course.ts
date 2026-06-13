import type { GuideLesson } from "./types";

export const CORAL_GUIDE_COURSE = {
  id: "save-coral-reefs",
  title: "Save Our Coral Reefs",
  description:
    "One quick guide — two short videos and two easy quizzes. Learn the basics of coral bleaching and how we can protect reefs, then earn your conservation certificate.",
};

/** Two short video lessons inside the single Reef Academy module. */
export const CORAL_GUIDE_LESSONS: GuideLesson[] = [
  {
    id: "lesson-1-bleaching",
    order: 1,
    title: "What Is Coral Bleaching?",
    description:
      "See why corals turn white when the ocean gets too warm — and what that means for reef life.",
    videoId: "NYc-lxaFXR4",
    duration: "2:42",
    quiz: [
      {
        question: "When corals bleach, they turn…",
        options: ["White", "Bright red", "Neon purple", "Solid black"],
        correctIndex: 0,
      },
      {
        question: "Bleaching happens when the ocean gets too…",
        options: ["Hot", "Small", "Quiet", "Shallow"],
        correctIndex: 0,
      },
      {
        question: "One way we can help reefs is to…",
        options: [
          "Save energy at home",
          "Throw trash in the sea",
          "Break coral for souvenirs",
          "Ignore climate change",
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    id: "lesson-2-protect",
    order: 2,
    title: "Why Reefs Need Our Help",
    description:
      "A quick look at the Great Barrier Reef and why rising ocean heat is a serious threat.",
    videoId: "MJBwRwMDCRk",
    duration: "1:12",
    quiz: [
      {
        question: "The Great Barrier Reef is near…",
        options: ["Australia", "Canada", "Iceland", "Egypt"],
        correctIndex: 0,
      },
      {
        question: "Warmer oceans are…",
        options: [
          "Bad for coral reefs",
          "Great for all corals forever",
          "Unrelated to reefs",
          "Only a problem on land",
        ],
        correctIndex: 0,
      },
      {
        question: "Healthy reefs can help protect coastlines from…",
        options: ["Waves and storms", "Earthquakes", "Drought", "Snow"],
        correctIndex: 0,
      },
    ],
  },
];

export const GUIDE_LESSON_COUNT = CORAL_GUIDE_LESSONS.length;

/** @deprecated */
export const CORAL_GUIDE_MODULES = CORAL_GUIDE_LESSONS;
/** @deprecated */
export const GUIDE_MODULE_COUNT = GUIDE_LESSON_COUNT;

export function getGuideLesson(id: string): GuideLesson | undefined {
  return CORAL_GUIDE_LESSONS.find((l) => l.id === id);
}

export function getGuideModule(id: string): GuideLesson | undefined {
  return getGuideLesson(id);
}

export function getNextGuideLesson(
  completedIds: string[]
): GuideLesson | undefined {
  return CORAL_GUIDE_LESSONS.find((l) => !completedIds.includes(l.id));
}
