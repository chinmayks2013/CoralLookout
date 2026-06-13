import { NextResponse } from "next/server";
import { insertUserScan, listUserScans, rowToStoredScan } from "@/lib/scans/db";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ScanResult } from "@/lib/types";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase auth is not configured." },
      { status: 503 }
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  try {
    const rows = await listUserScans(supabase, user.id);
    return NextResponse.json({ scans: rows.map(rowToStoredScan) });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load scans";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase auth is not configured." },
      { status: 503 }
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      scanId: string;
      locationName: string;
      lat: number;
      lng: number;
      analysis: ScanResult;
    };

    if (
      !body.scanId ||
      !body.locationName?.trim() ||
      body.lat == null ||
      body.lng == null ||
      !body.analysis
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const row = await insertUserScan(supabase, {
      scanId: body.scanId,
      userId: user.id,
      locationName: body.locationName.trim(),
      lat: body.lat,
      lng: body.lng,
      analysis: body.analysis,
    });

    return NextResponse.json({ scan: rowToStoredScan(row) });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to save scan";
    if (message.includes("duplicate") || message.includes("unique")) {
      return NextResponse.json({ error: "Scan already saved." }, { status: 409 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
