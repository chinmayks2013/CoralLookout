import type { Challenge } from "@/lib/types";

export const challenges: Challenge[] = [
  {
    id: "c1",
    title: "Reef Condition Identifier",
    description:
      "Upload and correctly classify 5 reef images using the AI Coral Scanner this week.",
    points: 250,
    deadline: "May 25, 2026",
    category: "identify",
    progress: 3,
    total: 5,
  },
  {
    id: "c2",
    title: "Coastal Cleanup Mission",
    description:
      "Organize or join a local beach cleanup and document your impact with photos.",
    points: 400,
    deadline: "May 31, 2026",
    category: "cleanup",
    progress: 0,
    total: 1,
  },
  {
    id: "c3",
    title: "#SaveOurReefs Awareness Campaign",
    description:
      "Create an educational post about coral bleaching and share it with your school.",
    points: 150,
    deadline: "May 22, 2026",
    category: "awareness",
    progress: 1,
    total: 1,
  },
  {
    id: "c4",
    title: "STEM Innovation: Reef Sensor",
    description:
      "Design a low-cost water temperature sensor concept for reef monitoring.",
    points: 500,
    deadline: "Jun 15, 2026",
    category: "stem",
    progress: 0,
    total: 1,
  },
  {
    id: "c5",
    title: "Academy Sprint",
    description: "Complete 3 Reef Academy lessons and pass their quizzes.",
    points: 300,
    deadline: "May 28, 2026",
    category: "identify",
    progress: 1,
    total: 3,
  },
];
