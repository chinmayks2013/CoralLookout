import { NextResponse } from "next/server";
import {
  fetchGalleryPostByIdFromDb,
  insertGalleryDonation,
} from "@/lib/gallery/db";
import { isGalleryCloudEnabled, GALLERY_SETUP_MESSAGE } from "@/lib/supabase/config";

export async function POST(request: Request) {
  if (!isGalleryCloudEnabled()) {
    return NextResponse.json({ error: GALLERY_SETUP_MESSAGE }, { status: 503 });
  }

  try {
    const body = (await request.json()) as {
      postId: string;
      fromId: string;
      fromName: string;
      amount: number;
    };

    if (!body.postId || !body.fromId || !body.fromName || body.amount < 1) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!Number.isInteger(body.amount)) {
      return NextResponse.json(
        { error: "Amount must be a whole number" },
        { status: 400 }
      );
    }

    const post = await fetchGalleryPostByIdFromDb(body.postId);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    if (post.authorId === body.fromId) {
      return NextResponse.json(
        { error: "You cannot donate to your own post" },
        { status: 400 }
      );
    }

    const donation = await insertGalleryDonation(body);
    return NextResponse.json({ donation });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to donate";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
