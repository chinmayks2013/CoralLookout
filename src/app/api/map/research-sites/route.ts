import { NextResponse } from "next/server";
import { NOAA_WMS, RESEARCH_SITES } from "@/lib/data/world-research";

/** Public reef-map research sites — aggressively edge-cached. */
export const revalidate = 86400;

const CACHE_CONTROL =
  "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800";

export async function GET() {
  return NextResponse.json(
    {
      sites: RESEARCH_SITES,
      noaa: NOAA_WMS,
      generatedAt: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": CACHE_CONTROL,
        "CDN-Cache-Control": CACHE_CONTROL,
        "Vercel-CDN-Cache-Control": CACHE_CONTROL,
      },
    }
  );
}
