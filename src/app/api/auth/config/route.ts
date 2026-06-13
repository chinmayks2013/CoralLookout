import { NextResponse } from "next/server";
import { getAuthEnvStatus } from "@/lib/supabase/config";

export async function GET() {
  const auth = getAuthEnvStatus();

  if (!auth.configured) {
    return NextResponse.json({
      ready: false,
      missing: auth.missing,
      message:
        "Add missing variables in Vercel → Settings → Environment Variables, check Production, then Redeploy.",
    });
  }

  return NextResponse.json({
    ready: true,
    supabaseUrl: auth.supabaseUrl,
    anonKey: auth.anonKey,
    message: "Auth is configured on the server.",
  });
}
