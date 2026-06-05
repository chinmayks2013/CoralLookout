import { NextResponse } from "next/server";
import { fetchRoster } from "@/lib/school/db";
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
    const roster = await fetchRoster(chapterId);
    return NextResponse.json({ roster });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load roster";
    const status = message.includes("subscription") ? 402 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Students join with the class code on My Class — teachers cannot add roster members manually.",
    },
    { status: 403 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    {
      error:
        "Roster is managed by student self-join only. Students appear when they use the class code.",
    },
    { status: 403 }
  );
}
