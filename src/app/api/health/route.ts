import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthEnvStatus, getGalleryEnvStatus } from "@/lib/supabase/config";

export async function GET() {
  const env = getGalleryEnvStatus();
  const auth = getAuthEnvStatus();
  const result: {
    galleryReady: boolean;
    authReady: boolean;
    missingEnv: string[];
    missingAuthEnv: string[];
    tablesOk: boolean;
    storageOk: boolean;
    error?: string;
  } = {
    galleryReady: false,
    authReady: auth.configured,
    missingEnv: env.missing,
    missingAuthEnv: auth.missing,
    tablesOk: false,
    storageOk: false,
  };

  if (!env.configured) {
    return NextResponse.json({
      ...result,
      message:
        "Add Supabase env vars on your host (Vercel/production), then redeploy.",
    });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!.trim();
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error: tableError } = await supabase
    .from("gallery_posts")
    .select("id")
    .limit(1);
  result.tablesOk = !tableError;
  if (tableError) result.error = tableError.message;

  const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
  if (!bucketError) {
    result.storageOk = Boolean(buckets?.some((b) => b.name === "gallery"));
  }

  result.galleryReady = result.tablesOk && result.storageOk && env.configured;

  return NextResponse.json({
    ...result,
    message: result.galleryReady
      ? "Gallery, forum, leaderboard, auth, and school tools are cloud-ready."
      : auth.configured
        ? "Auth env OK — gallery may still need DB setup or service role key."
        : "Add Supabase env vars on Vercel, then redeploy.",
  });
}
