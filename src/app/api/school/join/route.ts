import { NextResponse } from "next/server";
import { joinChapterWithCode } from "@/lib/school/db";
import { isGalleryCloudEnabled, GALLERY_SETUP_MESSAGE } from "@/lib/supabase/config";

export async function POST(request: Request) {
  if (!isGalleryCloudEnabled()) {
    return NextResponse.json({ error: GALLERY_SETUP_MESSAGE }, { status: 503 });
  }

  try {
    const body = (await request.json()) as {
      joinCode: string;
      userId: string;
      displayName: string;
      email?: string;
    };

    if (!body.joinCode?.trim() || !body.userId || !body.displayName?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await joinChapterWithCode({
      joinCode: body.joinCode.trim(),
      userId: body.userId,
      displayName: body.displayName.trim(),
      email: body.email,
    });

    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not join chapter";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
