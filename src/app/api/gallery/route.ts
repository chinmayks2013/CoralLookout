import { NextResponse } from "next/server";
import { fetchGalleryPostsFromDb } from "@/lib/gallery/db";
import {
  GALLERY_SETUP_MESSAGE,
  getGalleryEnvStatus,
} from "@/lib/supabase/config";

/** Short edge cache so gallery spikes hit CDN instead of Supabase. */
export const revalidate = 60;

const GALLERY_CACHE =
  "public, max-age=0, s-maxage=60, stale-while-revalidate=300";

function galleryJson(body: unknown, init?: { status?: number; cache?: boolean }) {
  const headers: Record<string, string> = {};
  if (init?.cache !== false) {
    headers["Cache-Control"] = GALLERY_CACHE;
    headers["CDN-Cache-Control"] = GALLERY_CACHE;
    headers["Vercel-CDN-Cache-Control"] = GALLERY_CACHE;
  } else {
    headers["Cache-Control"] = "no-store";
  }
  return NextResponse.json(body, { status: init?.status, headers });
}

export async function GET() {
  const env = getGalleryEnvStatus();
  if (!env.configured) {
    return galleryJson({
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
    return galleryJson({ enabled: true, posts });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load gallery";
    const unreachable =
      /ENOTFOUND|fetch failed|getaddrinfo|ECONNREFUSED/i.test(message);
    if (unreachable) {
      return galleryJson({
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
      return galleryJson({
        enabled: false,
        reason: "db_setup",
        message:
          "Supabase is connected but gallery tables are missing. Run supabase/schema.sql in the SQL Editor, then npm run check:gallery.",
        posts: [],
        error: message,
      });
    }
    return galleryJson(
      { enabled: true, posts: [], error: message },
      { status: 500, cache: false }
    );
  }
}
