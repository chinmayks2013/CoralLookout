import { NextResponse } from "next/server";
import { listCompletions, markComplete } from "@/lib/school/assignments";
import { isGalleryCloudEnabled, GALLERY_SETUP_MESSAGE } from "@/lib/supabase/config";

export async function GET(request: Request) {
  if (!isGalleryCloudEnabled()) {
    return NextResponse.json({ error: GALLERY_SETUP_MESSAGE }, { status: 503 });
  }

  const assignmentId = new URL(request.url).searchParams.get("assignmentId");
  if (!assignmentId) {
    return NextResponse.json({ error: "Missing assignmentId" }, { status: 400 });
  }

  try {
    const completions = await listCompletions(assignmentId);
    return NextResponse.json({ completions });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load completions";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isGalleryCloudEnabled()) {
    return NextResponse.json({ error: GALLERY_SETUP_MESSAGE }, { status: 503 });
  }

  try {
    const body = (await request.json()) as {
      assignmentId: string;
      userId: string;
      scanId?: string;
    };

    if (!body.assignmentId || !body.userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const completion = await markComplete(body);
    return NextResponse.json({ completion });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to mark complete";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
