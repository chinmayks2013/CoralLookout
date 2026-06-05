import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { isGalleryCloudEnabled } from "./config";

let admin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  if (!isGalleryCloudEnabled()) return null;
  if (admin) return admin;
  admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
  return admin;
}
