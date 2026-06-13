import type { ScanResult } from "@/lib/types";
import type { StoredScan } from "@/lib/platform/types";

export async function saveScanToCloud(input: {
  scanId: string;
  locationName: string;
  lat: number;
  lng: number;
  analysis: ScanResult;
}): Promise<{ saved: boolean; error?: string }> {
  const res = await fetch("/api/scans", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok) {
    return { saved: false, error: data.error ?? "Could not save scan" };
  }
  return { saved: true };
}

export async function fetchScansFromCloud(): Promise<{
  scans: StoredScan[];
  error?: string;
}> {
  const res = await fetch("/api/scans", { cache: "no-store" });
  const data = await res.json();
  if (!res.ok) {
    return { scans: [], error: data.error ?? "Could not load scans" };
  }
  return { scans: (data.scans as StoredScan[]) ?? [] };
}
