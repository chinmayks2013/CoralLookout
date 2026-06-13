import { NextResponse } from "next/server";
import { fetchAdminLearners } from "@/lib/academy/db";
import { GUIDE_LESSON_COUNT } from "@/lib/academy/course";
import { isGalleryCloudEnabled, GALLERY_SETUP_MESSAGE } from "@/lib/supabase/config";

function verifyAdminSecret(request: Request): boolean {
  const expected = process.env.ADMIN_SECRET?.trim();
  if (!expected) return false;
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  return auth.slice(7) === expected;
}

export async function GET(request: Request) {
  if (!verifyAdminSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isGalleryCloudEnabled()) {
    return NextResponse.json(
      { error: GALLERY_SETUP_MESSAGE, cloudEnabled: false },
      { status: 503 }
    );
  }

  try {
    const learners = await fetchAdminLearners();
    return NextResponse.json({
      learners,
      cloudEnabled: true,
      totalModules: GUIDE_LESSON_COUNT,
      totalLessons: GUIDE_LESSON_COUNT,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Admin report failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
