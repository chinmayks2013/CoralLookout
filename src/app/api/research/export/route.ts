import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

interface ExportScanRow {
  scan_id: string;
  lat: number;
  lng: number;
  health: string;
  label: string;
  confidence: number;
  model_version: string | null;
  cohort: string | null;
  region: string | null;
  created_at: string;
  observed_at: string | null;
}

const CSV_HEADERS = [
  "Scan ID",
  "Health",
  "Label",
  "Confidence",
  "Model Version",
  "Latitude",
  "Longitude",
  "Cohort",
  "Region",
  "Created At",
  "Observed At",
];

function escapeCsv(v: string): string {
  if (v.includes(",") || v.includes('"') || v.includes("\n")) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

function rowsToCsv(rows: ExportScanRow[]): string {
  const body = rows.map((r) => [
    r.scan_id,
    r.health,
    r.label,
    String(r.confidence),
    r.model_version ?? "",
    String(r.lat),
    String(r.lng),
    r.cohort ?? "",
    r.region ?? "",
    r.created_at,
    r.observed_at ?? "",
  ]);
  return [CSV_HEADERS, ...body].map((r) => r.map(escapeCsv).join(",")).join("\n");
}

function rowsToGeoJson(rows: ExportScanRow[]) {
  return {
    type: "FeatureCollection" as const,
    features: rows.map((r) => ({
      type: "Feature" as const,
      geometry: { type: "Point" as const, coordinates: [r.lng, r.lat] },
      properties: {
        scanId: r.scan_id,
        health: r.health,
        label: r.label,
        confidence: r.confidence,
        modelVersion: r.model_version,
        cohort: r.cohort,
        region: r.region,
        createdAt: r.created_at,
        observedAt: r.observed_at,
      },
    })),
  };
}

/**
 * Public research export — anonymized aggregate scan data (no user_id).
 * ?format=csv|geojson (default csv). Falls back to empty results with a
 * helpful message when Supabase isn't configured, rather than erroring.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") === "geojson" ? "geojson" : "csv";

  const supabase = getSupabaseAdmin();
  let rows: ExportScanRow[] = [];
  let message: string | undefined;

  if (!supabase) {
    message =
      "Supabase is not configured on this deployment — showing empty export headers.";
  } else {
    const { data, error } = await supabase
      .from("user_scans")
      .select(
        "scan_id, lat, lng, health, label, confidence, model_version, cohort, region, created_at, observed_at"
      )
      .order("created_at", { ascending: false })
      .limit(5000);

    if (error) {
      message = `Could not load scans: ${error.message}`;
    } else {
      rows = (data ?? []) as ExportScanRow[];
    }
  }

  if (format === "geojson") {
    const geojson = rowsToGeoJson(rows);
    return NextResponse.json(message ? { ...geojson, message } : geojson);
  }

  const csv = rowsToCsv(rows);
  return new NextResponse(message ? `# ${message}\n${csv}` : csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="coral-lookout-research-export.csv"',
    },
  });
}
