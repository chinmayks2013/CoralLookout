/** True when Supabase env vars are set (gallery uses cloud database). */
export function isGalleryCloudEnabled(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  );
}

export const GALLERY_SETUP_MESSAGE =
  "Reef Gallery needs Supabase. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local, run supabase/schema.sql in your project, and create a public Storage bucket named gallery.";
