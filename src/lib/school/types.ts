export type SubscriptionStatus =
  | "inactive"
  | "active"
  | "past_due"
  | "canceled"
  | "trialing";

export type RosterStatus = "pending" | "active";

export interface SchoolChapter {
  id: string;
  teacherUserId: string;
  teacherName: string;
  teacherEmail: string;
  schoolName: string;
  joinCode: string;
  brandingTagline: string | null;
  brandingAccent: string;
  subscriptionStatus: SubscriptionStatus;
  subscriptionCurrentPeriodEnd: string | null;
  stripeCustomerId: string | null;
  createdAt: string;
}

export interface SchoolRosterMember {
  id: string;
  chapterId: string;
  userId: string | null;
  displayName: string;
  email: string | null;
  status: RosterStatus;
  joinedAt: string | null;
  createdAt: string;
}

export interface ChapterLeaderboardEntry {
  userId: string;
  displayName: string;
  postCount: number;
  totalViews: number;
  commentCount: number;
  coralsReceived: number;
  upvotesReceived: number;
  score: number;
}

export function isChapterSubscriptionActive(
  status: SubscriptionStatus
): boolean {
  return status === "active" || status === "trialing";
}
