import { NextResponse } from "next/server";
import {
  fetchCreatorProfileFromDb,
  upsertCreatorProfileInDb,
} from "@/lib/gallery/db";
import { isGalleryCloudEnabled, GALLERY_SETUP_MESSAGE } from "@/lib/supabase/config";

export async function GET(request: Request) {
  if (!isGalleryCloudEnabled()) {
    return NextResponse.json({ error: GALLERY_SETUP_MESSAGE }, { status: 503 });
  }

  const userId = new URL(request.url).searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  try {
    const profile = await fetchCreatorProfileFromDb(userId);
    return NextResponse.json({ profile });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load profile";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!isGalleryCloudEnabled()) {
    return NextResponse.json({ error: GALLERY_SETUP_MESSAGE }, { status: 503 });
  }

  try {
    const body = (await request.json()) as {
      userId: string;
      displayName: string;
      school?: string;
      region?: string;
      bio?: string;
      tagline?: string;
      joinedAt?: string;
    };

    if (!body.userId || !body.displayName?.trim()) {
      return NextResponse.json({ error: "userId and displayName required" }, { status: 400 });
    }

    const profile = await upsertCreatorProfileInDb({
      userId: body.userId,
      displayName: body.displayName.trim(),
      school: body.school?.trim(),
      region: body.region?.trim(),
      bio: body.bio?.trim(),
      tagline: body.tagline?.trim(),
      joinedAt: body.joinedAt,
    });

    return NextResponse.json({ profile });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to save profile";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
