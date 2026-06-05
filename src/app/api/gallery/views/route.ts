import { NextResponse } from "next/server";
import { recordGalleryPostView } from "@/lib/gallery/db";
import { isGalleryCloudEnabled, GALLERY_SETUP_MESSAGE } from "@/lib/supabase/config";

export async function POST(request: Request) {
  if (!isGalleryCloudEnabled()) {
    return NextResponse.json({ error: GALLERY_SETUP_MESSAGE }, { status: 503 });
  }

  try {
    const body = (await request.json()) as {
      postId: string;
      viewerId: string;
      authorId: string;
    };
    if (!body.postId || !body.viewerId || !body.authorId) {
      return NextResponse.json(
        { error: "Missing postId, viewerId, or authorId" },
        { status: 400 }
      );
    }

    const result = await recordGalleryPostView(
      body.postId,
      body.viewerId,
      body.authorId
    );
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to record view";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
