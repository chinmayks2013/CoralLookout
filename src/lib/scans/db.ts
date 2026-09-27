import type { SupabaseClient } from "@supabase/supabase-js";
import type { ScanResult } from "@/lib/types";
import type { StoredScan } from "@/lib/platform/types";

export interface UserScanRow {
  scan_id: string;
  user_id: string;
  location_name: string;
  lat: number;
  lng: number;
  health: string;
  label: string;
  confidence: number;
  analysis: ScanResult;
  created_at: string;
}

export function rowToStoredScan(row: UserScanRow): StoredScan {
  return {
    id: row.scan_id,
    timestamp: row.created_at,
    health: row.health as StoredScan["health"],
    label: row.label,
    confidence: row.confidence,
    locationName: row.location_name,
    lat: row.lat,
    lng: row.lng,
  };
}

export async function insertUserScan(
  supabase: SupabaseClient,
  input: {
    scanId: string;
    userId: string;
    locationName: string;
    lat: number;
    lng: number;
    analysis: ScanResult;
    contributorName?: string;
    notes?: string;
    modelVersion?: string;
  }
): Promise<UserScanRow> {
  const { data, error } = await supabase
    .from("user_scans")
    .insert({
      scan_id: input.scanId,
      user_id: input.userId,
      location_name: input.locationName,
      lat: input.lat,
      lng: input.lng,
      health: input.analysis.health,
      label: input.analysis.label,
      confidence: input.analysis.confidence,
      analysis: input.analysis,
      // Columns added in supabase/migrations/008_sales_sprint.sql; only set
      // when provided so deployments that haven't run that migration yet
      // still work for the base insert.
      ...(input.contributorName ? { contributor_name: input.contributorName } : {}),
      ...(input.notes ? { notes: input.notes } : {}),
      ...(input.modelVersion ? { model_version: input.modelVersion } : {}),
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as UserScanRow;
}

export async function listUserScans(
  supabase: SupabaseClient,
  userId: string
): Promise<UserScanRow[]> {
  const { data, error } = await supabase
    .from("user_scans")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as UserScanRow[];
}
