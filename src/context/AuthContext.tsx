"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { User, Session, SupabaseClient, AuthChangeEvent } from "@supabase/supabase-js";
import { ensureSupabaseBrowserClient } from "@/lib/supabase/browser";
import { fetchScansFromCloud } from "@/lib/scans/cloud";
import { usePlatform } from "@/context/PlatformContext";
import type { UserProfile } from "@/lib/platform/types";

interface AuthContextValue {
  configured: boolean;
  configError: string | null;
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function profileFromUser(user: User): UserProfile {
  const meta = user.user_metadata ?? {};
  const name =
    (meta.full_name as string | undefined)?.trim() ||
    (meta.name as string | undefined)?.trim() ||
    user.email?.split("@")[0] ||
    "Reef Explorer";
  return {
    name,
    email: user.email ?? undefined,
    joinedAt: user.created_at,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { dispatch, state } = usePlatform();
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [configured, setConfigured] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const syncedUserRef = useRef<string | null>(null);

  const syncAuthToPlatform = useCallback(
    async (authUser: User) => {
      const profile = profileFromUser(authUser);
      dispatch({
        type: "LINK_AUTH",
        userId: authUser.id,
        profile: state.profile
          ? {
              ...state.profile,
              name: state.profile.name?.trim() || profile.name,
              email: state.profile.email?.trim() || profile.email,
            }
          : profile,
      });

      const { scans } = await fetchScansFromCloud();
      if (scans.length > 0) {
        dispatch({ type: "SYNC_SCANS", scans });
      }
    },
    [dispatch, state.profile]
  );

  const handleSession = useCallback(
    (s: Session | null) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        if (syncedUserRef.current !== s.user.id) {
          syncedUserRef.current = s.user.id;
          void syncAuthToPlatform(s.user);
        }
      } else {
        syncedUserRef.current = null;
      }
    },
    [syncAuthToPlatform]
  );

  useEffect(() => {
    let cancelled = false;
    let subscription: { unsubscribe: () => void } | null = null;

    void (async () => {
      const client = await ensureSupabaseBrowserClient();
      if (cancelled) return;

      if (!client) {
        try {
          const res = await fetch("/api/auth/config", { cache: "no-store" });
          const data = await res.json();
          if (data.missing?.length) {
            setConfigError(
              `Missing on server: ${data.missing.join(", ")}. Add them in Vercel → Environment Variables (Production), then Redeploy.`
            );
          } else {
            setConfigError(
              "Could not load Supabase auth. Redeploy Vercel after adding env vars."
            );
          }
        } catch {
          setConfigError("Could not reach auth config API.");
        }
        setConfigured(false);
        setLoading(false);
        return;
      }

      setSupabase(client);
      setConfigured(true);
      setConfigError(null);

      const {
        data: { session: s },
      } = await client.auth.getSession();
      if (!cancelled) {
        handleSession(s);
        setLoading(false);
      }

      const {
        data: { subscription: sub },
      } = client.auth.onAuthStateChange(
        (_event: AuthChangeEvent, nextSession: Session | null) => {
          handleSession(nextSession);
        }
      );
      subscription = sub;
    })();

    return () => {
      cancelled = true;
      subscription?.unsubscribe();
    };
  }, [handleSession]);

  const getClient = useCallback(async () => {
    return supabase ?? (await ensureSupabaseBrowserClient());
  }, [supabase]);

  const signInWithPassword = useCallback(
    async (email: string, password: string) => {
      const client = await getClient();
      if (!client) return { error: "Auth is not configured." };
      const { error } = await client.auth.signInWithPassword({ email, password });
      return { error: error?.message };
    },
    [getClient]
  );

  const signUp = useCallback(
    async (email: string, password: string, displayName?: string) => {
      const client = await getClient();
      if (!client) return { error: "Auth is not configured." };
      const { error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: displayName?.trim() ? { full_name: displayName.trim() } : undefined,
        },
      });
      return { error: error?.message };
    },
    [getClient]
  );

  const signInWithGoogle = useCallback(async () => {
    const client = await getClient();
    if (!client) return { error: "Auth is not configured." };
    const redirectTo = `${window.location.origin}/auth/callback`;
    const { error } = await client.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    return { error: error?.message };
  }, [getClient]);

  const signOut = useCallback(async () => {
    const client = await getClient();
    if (client) await client.auth.signOut();
    setUser(null);
    setSession(null);
  }, [getClient]);

  const value = useMemo(
    () => ({
      configured,
      configError,
      user,
      session,
      loading,
      signInWithPassword,
      signUp,
      signInWithGoogle,
      signOut,
    }),
    [
      configured,
      configError,
      user,
      session,
      loading,
      signInWithPassword,
      signUp,
      signInWithGoogle,
      signOut,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
