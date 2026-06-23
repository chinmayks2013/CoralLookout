import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAnonKey, getSupabaseUrl } from "./config";
import { supabaseFetch } from "./fetch";

function hasSupabaseAuthCookies(request: NextRequest): boolean {
  return request.cookies.getAll().some((c) => c.name.startsWith("sb-"));
}

let reachabilityCache: { ok: boolean; checkedAt: number } | null = null;
const REACHABILITY_TTL_MS = 60_000;

async function isSupabaseReachable(url: string): Promise<boolean> {
  const now = Date.now();
  if (
    reachabilityCache &&
    now - reachabilityCache.checkedAt < REACHABILITY_TTL_MS
  ) {
    return reachabilityCache.ok;
  }

  try {
    await supabaseFetch(`${url}/auth/v1/health`);
    reachabilityCache = { ok: true, checkedAt: now };
    return true;
  } catch {
    reachabilityCache = { ok: false, checkedAt: now };
    return false;
  }
}

export async function updateSession(request: NextRequest) {
  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();

  let response = NextResponse.next({ request });

  if (!url || !anonKey || !hasSupabaseAuthCookies(request)) {
    return response;
  }

  if (!(await isSupabaseReachable(url))) {
    return response;
  }

  const supabase = createServerClient(url, anonKey, {
    global: { fetch: supabaseFetch },
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  try {
    await supabase.auth.getUser();
  } catch {
    /* stale session or network — don't block the page */
  }

  return response;
}
