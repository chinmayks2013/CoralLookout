import type { Badge, LeaderboardEntry } from "@/lib/types";

export const leaderboard: LeaderboardEntry[] = [
  {
    rank: 1,
    name: "Maya Chen",
    school: "Pacific STEM Academy",
    points: 4850,
    streak: 21,
    badgeCount: 12,
  },
  {
    rank: 2,
    name: "James Okonkwo",
    school: "Lagos Marine Club",
    points: 4620,
    streak: 18,
    badgeCount: 11,
  },
  {
    rank: 3,
    name: "Sofia Reyes",
    school: "Coral Coast High",
    points: 4390,
    streak: 14,
    badgeCount: 10,
  },
  {
    rank: 4,
    name: "Aiden Walsh",
    school: "Sydney Eco School",
    points: 4100,
    streak: 12,
    badgeCount: 9,
  },
  {
    rank: 5,
    name: "Priya Sharma",
    school: "Mumbai Green Initiative",
    points: 3980,
    streak: 9,
    badgeCount: 8,
  },
];

export const badges: Badge[] = [
  {
    id: "b1",
    name: "First Scan",
    icon: "🔬",
    description: "Completed your first AI reef analysis",
    earned: true,
  },
  {
    id: "b2",
    name: "Reef Guardian",
    icon: "🛡️",
    description: "Uploaded 10 reef observations",
    earned: true,
  },
  {
    id: "b3",
    name: "Bleaching Detective",
    icon: "🔍",
    description: "Correctly identified bleaching in 5 scans",
    earned: true,
  },
  {
    id: "b4",
    name: "Academy Scholar",
    icon: "📚",
    description: "Completed 5 Reef Academy lessons",
    earned: false,
  },
  {
    id: "b5",
    name: "Global Mapper",
    icon: "🌍",
    description: "Contributed data from 3 different regions",
    earned: false,
  },
  {
    id: "b6",
    name: "Challenge Champion",
    icon: "🏆",
    description: "Won a monthly conservation challenge",
    earned: false,
  },
];
