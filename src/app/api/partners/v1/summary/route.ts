import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

/**
 * Partner API — private preview.
 *
 * Auth: header `x-api-key` must match the server env `PARTNER_API_KEY`.
 * This endpoint is intentionally minimal (aggregate counts only, no PII)
 * while we validate demand with design partners. Expect breaking changes;
 * do not build production integrations against this yet.
 *
 * Example:
 *   curl -H "x-api-key: $PARTNER_API_KEY" https://corallookout.org/api/partners/v1/summary
 */
export async function GET(request: Request) {
  const expected = process.env.PARTNER_API_KEY?.trim();
  if (!expected) {
    return NextResponse.json(
      { error: "Partner API is not enabled on this deployment." },
      { status: 503 }
    );
  }

  const provided = request.headers.get("x-api-key");
  if (provided !== expected) {
    return NextResponse.json({ error: "Invalid or missing x-api-key" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  let scans = 0;
  let chapters = 0;

  if (supabase) {
    const [scanCount, chapterCount] = await Promise.all([
      supabase.from("user_scans").select("id", { count: "exact", head: true }),
      supabase.from("school_chapters").select("id", { count: "exact", head: true }),
    ]);
    scans = scanCount.count ?? 0;
    chapters = chapterCount.count ?? 0;
  }

  return NextResponse.json({
    scans,
    chapters,
    note: "private preview",
  });
}
