import { NextResponse } from "next/server";
import { fetchGalleryPostsFromDb } from "@/lib/gallery/db";
import {
  GALLERY_SETUP_MESSAGE,
  isGalleryCloudEnabled,
} from "@/lib/supabase/config";

export async function GET() {
  if (!isGalleryCloudEnabled()) {
    return NextResponse.json({
      enabled: false,
      message: GALLERY_SETUP_MESSAGE,
      posts: [],
    });
  }

  try {
    const posts = await fetchGalleryPostsFromDb();
    return NextResponse.json({ enabled: true, posts });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load gallery";
    return NextResponse.json({ enabled: true, posts: [], error: message }, { status: 500 });
  }
}
