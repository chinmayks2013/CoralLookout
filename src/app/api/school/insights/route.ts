import { NextResponse } from "next/server";
import { fetchChapterInsights } from "@/lib/school/db";
import { requireTeacherChapterWithPremium } from "@/lib/school/access";
import { isGalleryCloudEnabled, GALLERY_SETUP_MESSAGE } from "@/lib/supabase/config";

export async function GET(request: Request) {
  if (!isGalleryCloudEnabled()) {
    return NextResponse.json({ error: GALLERY_SETUP_MESSAGE }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const chapterId = searchParams.get("chapterId");
  const teacherUserId = searchParams.get("teacherUserId");

  if (!chapterId || !teacherUserId) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  try {
    await requireTeacherChapterWithPremium(teacherUserId, chapterId);
    const insights = await fetchChapterInsights(chapterId);
    return NextResponse.json({ insights });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load insights";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
