import { NextResponse } from "next/server";
import { insertGalleryUpvote } from "@/lib/gallery/db";
import { isGalleryCloudEnabled, GALLERY_SETUP_MESSAGE } from "@/lib/supabase/config";

export async function POST(request: Request) {
  if (!isGalleryCloudEnabled()) {
    return NextResponse.json({ error: GALLERY_SETUP_MESSAGE }, { status: 503 });
  }

  try {
    const body = (await request.json()) as { postId: string; userId: string };
    if (!body.postId || !body.userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const added = await insertGalleryUpvote(body.postId, body.userId);
    return NextResponse.json({ ok: added });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to upvote";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
