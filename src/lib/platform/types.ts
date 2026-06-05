import type { ReefHealth, ScanResult } from "@/lib/types";

export interface UserProfile {
  name: string;
  school: string;
  email: string;
  region?: string;
  bio?: string;
  tagline?: string;
  joinedAt?: string;
}

export interface ScanLocation {
  locationName: string;
  lat: number;
  lng: number;
}

export interface StoredScan {
  id: string;
  timestamp: string;
  health: ReefHealth;
  label: string;
  confidence: number;
  locationName: string;
  lat: number;
  lng: number;
}

export type SchoolChapterRole = "teacher" | "student";

export interface PlatformState {
  userId: string;
  profile: UserProfile | null;
  schoolChapterId?: string;
  schoolChapterRole?: SchoolChapterRole;
  points: number;
  corals: number;
  streak: number;
  lastActiveDate: string | null;
  scans: StoredScan[];
  completedLessons: string[];
  challengeProgress: Record<string, number>;
  awarenessPosted: boolean;
  cleanupLogged: boolean;
  stemSubmitted: boolean;
  commentsMade: number;
  coralsDonated: number;
  coralsReceived: number;
}

export const DEFAULT_STATE: PlatformState = {
  userId: "",
  profile: null,
  points: 0,
  corals: 0,
  streak: 0,
  lastActiveDate: null,
  scans: [],
  completedLessons: [],
  challengeProgress: {},
  awarenessPosted: false,
  cleanupLogged: false,
  stemSubmitted: false,
  commentsMade: 0,
  coralsDonated: 0,
  coralsReceived: 0,
};

export type PlatformAction =
  | { type: "HYDRATE"; state: PlatformState }
  | { type: "REGISTER"; profile: UserProfile; userId?: string }
  | {
      type: "RECORD_SCAN";
      scanId: string;
      result: ScanResult;
      location: ScanLocation;
    }
  | { type: "ADD_CORALS"; amount: number }
  | { type: "SPEND_CORALS"; amount: number }
  | { type: "RECORD_COMMENT" }
  | { type: "RECORD_DONATION"; amount: number }
  | { type: "RECEIVE_DONATION"; amount: number }
  | { type: "SYNC_CORALS_RECEIVED"; total: number }
  | { type: "ENSURE_USER_ID" }
  | { type: "COMPLETE_LESSON"; lessonId: string }
  | { type: "MARK_AWARENESS" }
  | { type: "MARK_CLEANUP" }
  | { type: "MARK_STEM" }
  | { type: "RESET" }
  | {
      type: "SET_SCHOOL_CHAPTER";
      chapterId: string;
      role: SchoolChapterRole;
    }
  | { type: "CLEAR_SCHOOL_CHAPTER" };
