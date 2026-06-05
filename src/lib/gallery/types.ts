import type { ScanResult } from "@/lib/types";

export interface GalleryComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  body: string;
  timestamp: string;
}

export interface GalleryDonation {
  id: string;
  postId: string;
  fromId: string;
  fromName: string;
  amount: number;
  timestamp: string;
}

export type GalleryPostType = "scan" | "discussion";

export interface GalleryPost {
  id: string;
  postType: GalleryPostType;
  scanId: string;
  authorId: string;
  authorName: string;
  authorSchool?: string;
  imageDataUrl: string;
  analysis: ScanResult | null;
  discussionBody?: string;
  locationName: string;
  lat: number;
  lng: number;
  timestamp: string;
  viewCount: number;
  imageRightsConfirmed: boolean;
  upvotes: number;
  upvotedBy: string[];
  comments: GalleryComment[];
  donations: GalleryDonation[];
}

export interface CreatorProfile {
  userId: string;
  displayName: string;
  school?: string;
  region?: string;
  bio?: string;
  tagline?: string;
  joinedAt?: string;
}

export interface CreatorStats {
  userId: string;
  displayName: string;
  school?: string;
  postCount: number;
  totalViews: number;
  totalUpvotes: number;
  totalComments: number;
  coralsReceived: number;
  coralsDonated: number;
}

export interface GalleryStore {
  posts: GalleryPost[];
}

export interface LeaderboardUser {
  userId: string;
  name: string;
  score: number;
}
