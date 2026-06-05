export type ReefHealth =
  | "healthy"
  | "mild_stress"
  | "bleaching"
  | "severe_damage";

export interface ScanResult {
  health: ReefHealth;
  label: string;
  confidence: number;
  damageZones: { x: number; y: number; w: number; h: number }[];
  explanation: string;
  recommendations: string[];
}

export interface ReefMarker {
  id: string;
  lat: number;
  lng: number;
  name: string;
  health: ReefHealth;
  type: "upload" | "hotspot" | "restoration" | "activity";
  students: number;
  lastUpdated: string;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earned: boolean;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  points: number;
  deadline: string;
  category: "identify" | "cleanup" | "awareness" | "stem";
  progress: number;
  total: number;
}

export interface Lesson {
  id: string;
  title: string;
  category: string;
  duration: string;
  completed: boolean;
  quizQuestions?: number;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  school: string;
  points: number;
  streak: number;
  badgeCount: number;
}

export interface CommunityTeam {
  id: string;
  name: string;
  school: string;
  members: number;
  uploads: number;
  region: string;
}
