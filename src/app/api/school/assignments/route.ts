import { NextResponse } from "next/server";
import {
  createAssignment,
  getAssignment,
  listAssignments,
  listCompletionsForChapter,
} from "@/lib/school/assignments";
import { isGalleryCloudEnabled, GALLERY_SETUP_MESSAGE } from "@/lib/supabase/config";

export async function GET(request: Request) {
  if (!isGalleryCloudEnabled()) {
    return NextResponse.json({ error: GALLERY_SETUP_MESSAGE }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const assignmentId = searchParams.get("assignmentId");
  const chapterId = searchParams.get("chapterId");
  const includeCompletions = searchParams.get("includeCompletions") === "1";

  try {
    if (assignmentId) {
      const assignment = await getAssignment(assignmentId);
      if (!assignment) {
        return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
      }
      return NextResponse.json({ assignment });
    }

    if (!chapterId) {
      return NextResponse.json({ error: "Missing chapterId" }, { status: 400 });
    }

    const assignments = await listAssignments(chapterId);
    if (!includeCompletions) {
      return NextResponse.json({ assignments });
    }

    const completions = await listCompletionsForChapter(chapterId);
    return NextResponse.json({ assignments, completions });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load assignments";
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
      title: string;
      description?: string;
      requiresScan?: boolean;
      requiresPin?: boolean;
      dueAt?: string | null;
    };

    if (!body.chapterId || !body.teacherUserId || !body.title?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const assignment = await createAssignment({
      ...body,
      dueAt: body.dueAt?.trim() ? body.dueAt : null,
    });
    return NextResponse.json({ assignment });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create assignment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
