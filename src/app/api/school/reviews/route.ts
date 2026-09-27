import { NextResponse } from "next/server";
import { requestReviewForScan, setScanReviewStatus, type ReviewStatus } from "@/lib/school/reviews";
import { isGalleryCloudEnabled, GALLERY_SETUP_MESSAGE } from "@/lib/supabase/config";

const SETTABLE_STATUSES: ReviewStatus[] = ["needs_review", "educator_verified"];

// Student self-service: request an educator review on their own scan.
export async function POST(request: Request) {
  if (!isGalleryCloudEnabled()) {
    return NextResponse.json({ error: GALLERY_SETUP_MESSAGE }, { status: 503 });
  }

  try {
    const body = (await request.json()) as { scanId: string; userId: string };
    if (!body.scanId || !body.userId) {
      return NextResponse.json({ error: "Missing scanId or userId" }, { status: 400 });
    }

    const reviewStatus = await requestReviewForScan(body);
    return NextResponse.json({ reviewStatus });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to request review";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Teacher-only: set a scan's review status (e.g. mark educator_verified).
export async function PATCH(request: Request) {
  if (!isGalleryCloudEnabled()) {
    return NextResponse.json({ error: GALLERY_SETUP_MESSAGE }, { status: 503 });
  }

  try {
    const body = (await request.json()) as {
      scanId: string;
      teacherUserId: string;
      chapterId: string;
      reviewStatus: ReviewStatus;
    };

    if (!body.scanId || !body.teacherUserId || !body.chapterId || !body.reviewStatus) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!SETTABLE_STATUSES.includes(body.reviewStatus)) {
      return NextResponse.json({ error: "Invalid reviewStatus" }, { status: 400 });
    }

    const reviewStatus = await setScanReviewStatus(body);
    return NextResponse.json({ reviewStatus });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to update review status";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
