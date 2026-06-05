import { NextResponse } from "next/server";
import { chapterHasPremiumAccess } from "@/lib/school/config";
import { fetchStudentClassDashboard } from "@/lib/school/db";
import { isGalleryCloudEnabled, GALLERY_SETUP_MESSAGE } from "@/lib/supabase/config";

export async function GET(request: Request) {
  if (!isGalleryCloudEnabled()) {
    return NextResponse.json({ error: GALLERY_SETUP_MESSAGE }, { status: 503 });
  }

  const userId = new URL(request.url).searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  try {
    const data = await fetchStudentClassDashboard(userId);
    if (!data) {
      return NextResponse.json({ enrolled: false });
    }

    const classActive = chapterHasPremiumAccess(data.chapter);

    return NextResponse.json({
      enrolled: true,
      classActive,
      chapter: data.chapter,
      classmates: data.classmates,
      leaderboard: classActive ? data.leaderboard : [],
      myRank: classActive ? data.myRank : 0,
      myStats: classActive ? data.myStats : null,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load class";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
