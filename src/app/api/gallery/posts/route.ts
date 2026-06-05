import { NextResponse } from "next/server";
import { insertGalleryPost } from "@/lib/gallery/db";
import { isGalleryCloudEnabled, GALLERY_SETUP_MESSAGE } from "@/lib/supabase/config";
import type { ScanResult } from "@/lib/types";

export async function POST(request: Request) {
  if (!isGalleryCloudEnabled()) {
    return NextResponse.json({ error: GALLERY_SETUP_MESSAGE }, { status: 503 });
  }

  try {
    const body = (await request.json()) as {
      postId: string;
      scanId: string;
      authorId: string;
      authorName: string;
      authorSchool?: string;
      imageDataUrl: string;
      analysis: ScanResult;
      locationName: string;
      lat: number;
      lng: number;
      imageRightsConfirmed?: boolean;
    };

    if (
      !body.postId ||
      !body.authorId ||
      !body.authorName ||
      !body.imageDataUrl ||
      !body.analysis ||
      !body.locationName
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!body.imageRightsConfirmed) {
      return NextResponse.json(
        {
          error:
            "You must confirm that you have the rights to share this image.",
        },
        { status: 400 }
      );
    }

    const post = await insertGalleryPost({
      ...body,
      imageRightsConfirmed: true,
    });
    return NextResponse.json({ post });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to publish post";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
