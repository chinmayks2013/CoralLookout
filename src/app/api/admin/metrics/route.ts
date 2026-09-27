import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { countOpenGalleryFlags } from "@/lib/gallery/flags";
import { countPartnerLeads } from "@/lib/partners/leads";
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

  const supabase = getSupabaseAdmin();
  let scansToday = 0;
  let activeChapters = 0;

  if (supabase) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [scanCount, chapterCount] = await Promise.all([
      supabase
        .from("user_scans")
        .select("id", { count: "exact", head: true })
        .gte("created_at", todayStart.toISOString()),
      supabase
        .from("school_chapters")
        .select("id", { count: "exact", head: true })
        .in("subscription_status", ["active", "trialing"]),
    ]);
    scansToday = scanCount.count ?? 0;
    activeChapters = chapterCount.count ?? 0;
  }

  const [openFlags, partnerLeads] = await Promise.all([
    countOpenGalleryFlags(),
    countPartnerLeads(),
  ]);

  return NextResponse.json({
    scansToday,
    activeChapters,
    openFlags,
    partnerLeads,
  });
}
