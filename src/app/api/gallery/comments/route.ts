import { NextResponse } from "next/server";
import { deleteGalleryComment, insertGalleryComment } from "@/lib/gallery/db";
import { isGalleryCloudEnabled, GALLERY_SETUP_MESSAGE } from "@/lib/supabase/config";

export async function POST(request: Request) {
  if (!isGalleryCloudEnabled()) {
    return NextResponse.json({ error: GALLERY_SETUP_MESSAGE }, { status: 503 });
  }

  try {
    const body = (await request.json()) as {
      postId: string;
      authorId: string;
      authorName: string;
      body: string;
    };

    if (!body.postId || !body.authorId || !body.authorName || !body.body?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const comment = await insertGalleryComment({
      postId: body.postId,
      authorId: body.authorId,
      authorName: body.authorName,
      body: body.body,
    });
    return NextResponse.json({ comment });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to post comment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!isGalleryCloudEnabled()) {
    return NextResponse.json({ error: GALLERY_SETUP_MESSAGE }, { status: 503 });
  }

  try {
    const body = (await request.json()) as {
      commentId: string;
      userId: string;
    };

    if (!body.commentId || !body.userId) {
      return NextResponse.json({ error: "Missing commentId or userId" }, { status: 400 });
    }

    await deleteGalleryComment(body.commentId, body.userId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to delete comment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
