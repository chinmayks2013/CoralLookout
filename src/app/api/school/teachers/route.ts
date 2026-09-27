import { NextResponse } from "next/server";
import { addCoTeacher, listCoTeachers } from "@/lib/school/teachers";
import { isGalleryCloudEnabled, GALLERY_SETUP_MESSAGE } from "@/lib/supabase/config";

export async function GET(request: Request) {
  if (!isGalleryCloudEnabled()) {
    return NextResponse.json({ error: GALLERY_SETUP_MESSAGE }, { status: 503 });
  }

  const chapterId = new URL(request.url).searchParams.get("chapterId");
  if (!chapterId) {
    return NextResponse.json({ error: "Missing chapterId" }, { status: 400 });
  }

  try {
    const teachers = await listCoTeachers(chapterId);
    return NextResponse.json({ teachers });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load co-teachers";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isGalleryCloudEnabled()) {
    return NextResponse.json({ error: GALLERY_SETUP_MESSAGE }, { status: 503 });
  }

  try {
    const body = (await request.json()) as {
      chapterId: string;
      teacherUserId: string;
      displayName: string;
      email?: string;
    };

    if (!body.chapterId || !body.teacherUserId || !body.displayName?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const teacher = await addCoTeacher(body);
    return NextResponse.json({ teacher });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to invite co-teacher";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
