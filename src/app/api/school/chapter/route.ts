import { NextResponse } from "next/server";
import {
  createSchoolChapter,
  fetchChapterByTeacherId,
  updateChapterBranding,
} from "@/lib/school/db";
import { isSchoolDemoMode } from "@/lib/school/config";
import { isChapterSubscriptionActive } from "@/lib/school/types";
import { isGalleryCloudEnabled, GALLERY_SETUP_MESSAGE } from "@/lib/supabase/config";

export async function GET(request: Request) {
  if (!isGalleryCloudEnabled()) {
    return NextResponse.json({ error: GALLERY_SETUP_MESSAGE }, { status: 503 });
  }

  const teacherUserId = new URL(request.url).searchParams.get("teacherUserId");
  if (!teacherUserId) {
    return NextResponse.json({ error: "Missing teacherUserId" }, { status: 400 });
  }

  try {
    const demoMode = isSchoolDemoMode();
    let chapter = await fetchChapterByTeacherId(teacherUserId);
    if (
      chapter &&
      demoMode &&
      !isChapterSubscriptionActive(chapter.subscriptionStatus)
    ) {
      chapter = { ...chapter, subscriptionStatus: "active" };
    }
    return NextResponse.json({ chapter, demoMode });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load chapter";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isGalleryCloudEnabled()) {
    return NextResponse.json({ error: GALLERY_SETUP_MESSAGE }, { status: 503 });
  }

  try {
    const body = (await request.json()) as {
      teacherUserId: string;
      teacherName: string;
      teacherEmail: string;
      schoolName: string;
    };

    if (
      !body.teacherUserId ||
      !body.teacherName ||
      !body.teacherEmail ||
      !body.schoolName?.trim()
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const chapter = await createSchoolChapter({
      teacherUserId: body.teacherUserId,
      teacherName: body.teacherName.trim(),
      teacherEmail: body.teacherEmail.trim(),
      schoolName: body.schoolName.trim(),
    });

    return NextResponse.json({ chapter, demoMode: isSchoolDemoMode() });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create chapter";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!isGalleryCloudEnabled()) {
    return NextResponse.json({ error: GALLERY_SETUP_MESSAGE }, { status: 503 });
  }

  try {
    const body = (await request.json()) as {
      chapterId: string;
      teacherUserId: string;
      schoolName?: string;
      brandingTagline?: string | null;
      brandingAccent?: string;
    };

    if (!body.chapterId || !body.teacherUserId) {
      return NextResponse.json({ error: "Missing chapterId or teacherUserId" }, { status: 400 });
    }

    const chapter = await updateChapterBranding(body);
    return NextResponse.json({ chapter });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to update chapter";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
