import { NextResponse } from "next/server";
import { fetchGalleryPostsFromDb } from "@/lib/gallery/db";
import {
  GALLERY_SETUP_MESSAGE,
  getGalleryEnvStatus,
  isGalleryCloudEnabled,
} from "@/lib/supabase/config";

export async function GET() {
  const env = getGalleryEnvStatus();
  if (!env.configured) {
    return NextResponse.json({
      enabled: false,
      reason: "missing_env",
      missingEnv: env.missing,
      message:
        env.missing.length > 0
          ? `Missing: ${env.missing.join(", ")}. ${GALLERY_SETUP_MESSAGE}`
          : GALLERY_SETUP_MESSAGE,
      posts: [],
    });
  }

  try {
    const posts = await fetchGalleryPostsFromDb();
    return NextResponse.json({ enabled: true, posts });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load gallery";
    const unreachable =
      /ENOTFOUND|fetch failed|getaddrinfo|ECONNREFUSED/i.test(message);
    if (unreachable) {
      return NextResponse.json({
        enabled: false,
        reason: "unreachable",
        message:
          "Cannot reach Supabase. Check NEXT_PUBLIC_SUPABASE_URL in .env.local — open Supabase Dashboard → Settings → API and copy the Project URL. Run npm run check:gallery to verify.",
        posts: [],
        error: message,
      });
    }
    const schemaMissing =
      /relation|schema cache|does not exist|gallery_posts/i.test(message);
    if (schemaMissing) {
      return NextResponse.json({
        enabled: false,
        reason: "db_setup",
        message:
          "Supabase is connected but gallery tables are missing. Run supabase/schema.sql in the SQL Editor, then npm run check:gallery.",
        posts: [],
        error: message,
      });
    }
    return NextResponse.json({ enabled: true, posts: [], error: message }, { status: 500 });
  }
}
