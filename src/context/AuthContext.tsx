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
import type { User, Session } from "@supabase/supabase-js";
import { createSupabaseBrowserClient, isSupabaseAuthConfigured } from "@/lib/supabase/browser";
import { fetchScansFromCloud } from "@/lib/scans/cloud";
import { usePlatform } from "@/context/PlatformContext";
import type { UserProfile } from "@/lib/platform/types";

interface AuthContextValue {
  configured: boolean;
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
  const configured = isSupabaseAuthConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(configured);
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
    if (!configured) {
      setLoading(false);
      return;
    }

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      handleSession(s);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      handleSession(s);
    });

    return () => subscription.unsubscribe();
  }, [configured, handleSession]);

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return { error: "Auth is not configured." };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message };
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, displayName?: string) => {
      const supabase = createSupabaseBrowserClient();
      if (!supabase) return { error: "Auth is not configured." };
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: displayName?.trim() ? { full_name: displayName.trim() } : undefined,
        },
      });
      return { error: error?.message };
    },
    []
  );

  const signInWithGoogle = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return { error: "Auth is not configured." };
    const redirectTo = `${window.location.origin}/auth/callback`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    return { error: error?.message };
  }, []);

  const signOut = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({
      configured,
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
