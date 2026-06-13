/** True when Supabase env vars are set (gallery uses cloud database). */
export function isGalleryCloudEnabled(): boolean {
  return getGalleryEnvStatus().configured;
}

export const GALLERY_SETUP_MESSAGE =
  "Reef Gallery needs Supabase. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY on Vercel (Settings → Environment Variables), then redeploy.";

export type GalleryDisabledReason = "missing_env" | "db_error";

export function getSupabaseUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || undefined;
}

/** Anon key — NEXT_PUBLIC_* or server-only SUPABASE_ANON_KEY fallback. */
export function getSupabaseAnonKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.SUPABASE_ANON_KEY?.trim() ||
    undefined
  );
}

export function getGalleryEnvStatus(): {
  configured: boolean;
  missing: string[];
} {
  const missing: string[] = [];
  if (!getSupabaseUrl()) {
    missing.push("NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    missing.push("SUPABASE_SERVICE_ROLE_KEY");
  }
  return { configured: missing.length === 0, missing };
}

export function getAuthEnvStatus(): {
  configured: boolean;
  missing: string[];
  supabaseUrl?: string;
  anonKey?: string;
} {
  const missing: string[] = [];
  const supabaseUrl = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();
  if (!supabaseUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!anonKey) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return {
    configured: missing.length === 0,
    missing,
    supabaseUrl,
    anonKey,
  };
}
