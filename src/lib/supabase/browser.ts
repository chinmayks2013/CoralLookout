import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/config";
import { supabaseFetch } from "@/lib/supabase/fetch";

let cachedClient: SupabaseClient | null = null;
let initPromise: Promise<SupabaseClient | null> | null = null;

export function createSupabaseBrowserClient(
  url?: string,
  anonKey?: string
): SupabaseClient | null {
  const resolvedUrl = url?.trim() || getSupabaseUrl();
  const resolvedKey = anonKey?.trim() || getSupabaseAnonKey();
  if (!resolvedUrl || !resolvedKey) return null;
  return createBrowserClient(resolvedUrl, resolvedKey, {
    global: { fetch: supabaseFetch },
  });
}

/** Build-time check only — prefer ensureSupabaseBrowserClient() on Vercel. */
export function isSupabaseAuthConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}

/** Load Supabase client from build env or /api/auth/config (runtime). */
export async function ensureSupabaseBrowserClient(): Promise<SupabaseClient | null> {
  if (cachedClient) return cachedClient;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const local = createSupabaseBrowserClient();
    if (local) {
      cachedClient = local;
      return cachedClient;
    }

    try {
      const res = await fetch("/api/auth/config", { cache: "no-store" });
      const data = (await res.json()) as {
        ready?: boolean;
        supabaseUrl?: string;
        anonKey?: string;
      };
      if (data.ready && data.supabaseUrl && data.anonKey) {
        cachedClient = createSupabaseBrowserClient(
          data.supabaseUrl,
          data.anonKey
        );
        return cachedClient;
      }
    } catch {
      /* offline or API error */
    }
    return null;
  })();

  return initPromise;
}

export function getSupabaseBrowserClient(): SupabaseClient | null {
  return cachedClient ?? createSupabaseBrowserClient();
}
