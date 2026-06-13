/**
 * Verify Supabase gallery connection (tables + storage bucket).
 * Run: npm run check:gallery
 */
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { resolve } from "node:path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });
dotenv.config();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!url || !serviceKey) {
  console.error("\n❌ Missing env vars in .env.local:");
  if (!url) console.error("   - NEXT_PUBLIC_SUPABASE_URL");
  if (!serviceKey) console.error("   - SUPABASE_SERVICE_ROLE_KEY");
  console.error("\nIf the live site shows 'not connected', add the same vars on Vercel/hosting too.\n");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

console.log("\nChecking Coral Lookout gallery…");
console.log("Project:", url);

let ok = true;

const { error: tableError } = await supabase.from("gallery_posts").select("id").limit(1);
if (tableError) {
  ok = false;
  console.error("\n❌ gallery_posts table:", tableError.message);
  console.error("   → Run supabase/schema.sql in Supabase SQL Editor (or npm run setup:gallery)\n");
} else {
  console.log("✅ gallery_posts table");
}

const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
if (bucketError) {
  ok = false;
  console.error("\n❌ Storage:", bucketError.message);
} else {
  const gallery = buckets?.find((b) => b.name === "gallery");
  if (!gallery) {
    ok = false;
    console.error("\n❌ Storage bucket 'gallery' not found");
    console.error("   → Run supabase/schema.sql (creates the bucket) or create it in Storage\n");
  } else {
    console.log(`✅ gallery storage bucket (public: ${gallery.public})`);
  }
}

if (ok) {
  console.log("\n✅ Gallery is ready. Restart dev server if it was already running:\n   npm run dev\n");
} else {
  process.exit(1);
}
