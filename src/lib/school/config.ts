import { isStripeConfigured } from "@/lib/school/stripe";
import type { SchoolChapter, SubscriptionStatus } from "./types";
import { isChapterSubscriptionActive } from "./types";

/**
 * Demo mode unlocks the full teacher dashboard without Stripe.
 * Enabled when SCHOOL_DEMO_MODE=true or Stripe is not configured.
 */
export function isSchoolDemoMode(): boolean {
  if (process.env.SCHOOL_DEMO_MODE === "true") return true;
  if (process.env.SCHOOL_DEMO_MODE === "false") return false;
  return !isStripeConfigured();
}

export function chapterHasPremiumAccess(chapter: SchoolChapter): boolean {
  if (isSchoolDemoMode()) return true;
  return isChapterSubscriptionActive(chapter.subscriptionStatus);
}

export function subscriptionBlockedMessage(): string {
  if (isSchoolDemoMode()) {
    return "Chapter not found or access denied";
  }
  return "Active School Chapter subscription required";
}

export function initialSubscriptionStatusForNewChapter(): SubscriptionStatus {
  return isSchoolDemoMode() ? "active" : "inactive";
}
