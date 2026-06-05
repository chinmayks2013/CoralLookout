import { NextResponse } from "next/server";
import { insertGalleryDiscussion } from "@/lib/gallery/db";
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
      authorSchool?: string;
      title: string;
      discussionBody: string;
      coralTopicConfirmed?: boolean;
      imageDataUrl?: string;
      imageRightsConfirmed?: boolean;
    };

    if (
      !body.postId ||
      !body.authorId ||
      !body.authorName ||
      !body.title?.trim() ||
      !body.discussionBody?.trim()
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!body.coralTopicConfirmed) {
      return NextResponse.json(
        {
          error:
            "Confirm that your post is about corals, reefs, or related marine conservation.",
        },
        { status: 400 }
      );
    }

    if (body.discussionBody.trim().length < 20) {
      return NextResponse.json(
        { error: "Write at least 20 characters for your discussion." },
        { status: 400 }
      );
    }

    if (body.imageDataUrl && !body.imageRightsConfirmed) {
      return NextResponse.json(
        {
          error:
            "Confirm that you have the rights to share any attached image.",
        },
        { status: 400 }
      );
    }

    const post = await insertGalleryDiscussion({
      postId: body.postId,
      authorId: body.authorId,
      authorName: body.authorName,
      authorSchool: body.authorSchool,
      title: body.title,
      body: body.discussionBody,
      imageDataUrl: body.imageDataUrl,
      imageRightsConfirmed: body.imageRightsConfirmed,
    });

    return NextResponse.json({ post });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to publish discussion";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
