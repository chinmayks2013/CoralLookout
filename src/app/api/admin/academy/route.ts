import { NextResponse } from "next/server";
import { fetchAdminLearners } from "@/lib/academy/db";
import { GUIDE_LESSON_COUNT } from "@/lib/academy/course";
import { verifyAdminRequest } from "@/lib/admin/auth";
import { isGalleryCloudEnabled, GALLERY_SETUP_MESSAGE } from "@/lib/supabase/config";

export async function GET(request: Request) {
  const auth = verifyAdminRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
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
