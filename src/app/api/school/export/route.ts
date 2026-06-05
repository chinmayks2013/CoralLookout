import { NextResponse } from "next/server";
import {
  buildChapterExportCsv,
  fetchChapterLeaderboard,
  fetchRoster,
} from "@/lib/school/db";
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
    const chapter = await requireTeacherChapterWithPremium(
      teacherUserId,
      chapterId
    );

    const [roster, leaderboard] = await Promise.all([
      fetchRoster(chapterId),
      fetchChapterLeaderboard(chapterId),
    ]);

    const csv = buildChapterExportCsv(roster, leaderboard, chapter);
    const filename = `${chapter.schoolName.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-reef-report.csv`;

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Export failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
