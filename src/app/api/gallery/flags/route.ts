import { NextResponse } from "next/server";
import { insertGalleryFlag, listGalleryFlags, type GalleryFlagStatus } from "@/lib/gallery/flags";
import { fetchChapterByTeacherId } from "@/lib/school/db";
import { verifyAdminRequest } from "@/lib/admin/auth";
import { isGalleryCloudEnabled, GALLERY_SETUP_MESSAGE } from "@/lib/supabase/config";

export async function POST(request: Request) {
  if (!isGalleryCloudEnabled()) {
    return NextResponse.json({ error: GALLERY_SETUP_MESSAGE }, { status: 503 });
  }

  try {
    const body = (await request.json()) as {
      postId: string;
      reason: string;
      reporterUserId?: string;
      reporterName?: string;
    };

    if (!body.postId || !body.reason?.trim()) {
      return NextResponse.json({ error: "Missing postId or reason" }, { status: 400 });
    }

    const flag = await insertGalleryFlag(body);
    return NextResponse.json({ flag });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to report post";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Moderation queue — accessible either with the ADMIN_SECRET bearer token,
// or (stub) a teacherUserId + chapterId pair proving they own a chapter.
export async function GET(request: Request) {
  if (!isGalleryCloudEnabled()) {
    return NextResponse.json({ error: GALLERY_SETUP_MESSAGE }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const status = (searchParams.get("status") ?? "open") as GalleryFlagStatus;
  const teacherUserId = searchParams.get("teacherUserId");
  const chapterId = searchParams.get("chapterId");

  const admin = verifyAdminRequest(request);
  if (!admin.ok) {
    if (!teacherUserId || !chapterId) {
      return NextResponse.json(
        {
          error:
            "Provide the admin bearer token, or teacherUserId + chapterId to view your chapter's queue.",
        },
        { status: 401 }
      );
    }
    try {
      const chapter = await fetchChapterByTeacherId(teacherUserId);
      if (!chapter || chapter.id !== chapterId) {
        return NextResponse.json({ error: "Chapter not found or access denied" }, { status: 403 });
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Access check failed";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  try {
    const flags = await listGalleryFlags(status);
    return NextResponse.json({ flags });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load flags";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
