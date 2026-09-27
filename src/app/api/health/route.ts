import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthEnvStatus, getGalleryEnvStatus } from "@/lib/supabase/config";
import { isStripeConfigured } from "@/lib/school/stripe";
import { isSchoolDemoMode } from "@/lib/school/config";

export async function GET() {
  const env = getGalleryEnvStatus();
  const auth = getAuthEnvStatus();
  const stripeConfigured = isStripeConfigured();
  const schoolDemoMode = isSchoolDemoMode();
  const pipelineReady = Boolean(process.env.AI_VISION_PROVIDER?.trim());

  const result: {
    ok: boolean;
    galleryReady: boolean;
    authReady: boolean;
    stripeConfigured: boolean;
    schoolDemoMode: boolean;
    pipelineReady: boolean;
    missingEnv: string[];
    missingAuthEnv: string[];
    tablesOk: boolean;
    storageOk: boolean;
    uptime: number;
    timestamp: string;
    error?: string;
  } = {
    ok: env.configured,
    galleryReady: false,
    authReady: auth.configured,
    stripeConfigured,
    schoolDemoMode,
    pipelineReady,
    missingEnv: env.missing,
    missingAuthEnv: auth.missing,
    tablesOk: false,
    storageOk: false,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
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
  result.ok = env.configured && result.tablesOk;

  return NextResponse.json({
    ...result,
    message: result.galleryReady
      ? "Gallery, forum, leaderboard, auth, and school tools are cloud-ready."
      : auth.configured
        ? "Auth env OK — gallery may still need DB setup or service role key."
        : "Add Supabase env vars on Vercel, then redeploy.",
  });
}
