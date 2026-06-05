"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { platformReducer } from "@/lib/platform/reducer";
import { loadState, saveState } from "@/lib/platform/storage";
import {
  DEFAULT_STATE,
  type PlatformAction,
  type PlatformState,
  type ScanLocation,
  type UserProfile,
} from "@/lib/platform/types";
import type { ScanResult } from "@/lib/types";
import { publishPostToCloud, upsertCreatorProfileToCloud } from "@/lib/gallery/cloud";
function isGalleryConfiguredClient(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim());
}

interface PlatformContextValue {
  state: PlatformState;
  hydrated: boolean;
  register: (profile: UserProfile) => string;
  recordScan: (
    result: ScanResult,
    location: ScanLocation,
    options?: {
      shareToGallery?: boolean;
      imageDataUrl?: string;
      imageRightsConfirmed?: boolean;
    }
  ) => Promise<{ galleryPublished: boolean; galleryError?: string }>;
  completeLesson: (lessonId: string) => void;
  markAwareness: () => void;
  markCleanup: () => void;
  markStem: () => void;
  resetProgress: () => void;
  dispatch: (action: PlatformAction) => void;
}

const PlatformContext = createContext<PlatformContextValue | null>(null);

export function PlatformProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(platformReducer, DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    dispatch({ type: "HYDRATE", state: loadState() });
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveState(state);
  }, [state, hydrated]);

  const register = useCallback((profile: UserProfile): string => {
    const userId = state.userId || crypto.randomUUID();
    dispatch({ type: "REGISTER", profile, userId });
    if (isGalleryConfiguredClient()) {
      void upsertCreatorProfileToCloud({
        userId,
        displayName: profile.name,
        school: profile.school,
        region: profile.region,
        bio: profile.bio,
        tagline: profile.tagline,
        joinedAt: profile.joinedAt ?? new Date().toISOString(),
      });
    }
    return userId;
  }, [state.userId]);

  const recordScan = useCallback(
    async (
      result: ScanResult,
      location: ScanLocation,
      options?: {
        shareToGallery?: boolean;
        imageDataUrl?: string;
        imageRightsConfirmed?: boolean;
      }
    ) => {
      const scanId = crypto.randomUUID();
      dispatch({
        type: "RECORD_SCAN",
        scanId,
        result,
        location,
      });

      if (
        !options?.shareToGallery ||
        !options.imageDataUrl ||
        !options.imageRightsConfirmed ||
        !state.profile ||
        !state.userId
      ) {
        return { galleryPublished: false };
      }

      try {
        await publishPostToCloud({
          postId: scanId,
          scanId,
          authorId: state.userId,
          authorName: state.profile.name,
          authorSchool: state.profile.school,
          imageDataUrl: options.imageDataUrl,
          analysis: result,
          locationName: location.locationName,
          lat: location.lat,
          lng: location.lng,
          imageRightsConfirmed: true,
        });
        dispatch({ type: "ADD_CORALS", amount: 15 });
        return { galleryPublished: true };
      } catch (e) {
        return {
          galleryPublished: false,
          galleryError:
            e instanceof Error ? e.message : "Could not publish to gallery",
        };
      }
    },
    [state.profile, state.userId, dispatch]
  );

  const completeLesson = useCallback((lessonId: string) => {
    dispatch({ type: "COMPLETE_LESSON", lessonId });
  }, []);

  const markAwareness = useCallback(() => {
    dispatch({ type: "MARK_AWARENESS" });
  }, []);

  const markCleanup = useCallback(() => {
    dispatch({ type: "MARK_CLEANUP" });
  }, []);

  const markStem = useCallback(() => {
    dispatch({ type: "MARK_STEM" });
  }, []);

  const resetProgress = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  const value = useMemo(
    () => ({
      state,
      hydrated,
      register,
      recordScan,
      completeLesson,
      markAwareness,
      markCleanup,
      markStem,
      resetProgress,
      dispatch,
    }),
    [
      state,
      hydrated,
      register,
      recordScan,
      completeLesson,
      markAwareness,
      markCleanup,
      markStem,
      resetProgress,
    ]
  );

  return (
    <PlatformContext.Provider value={value}>
      {children}
    </PlatformContext.Provider>
  );
}

export function usePlatform() {
  const ctx = useContext(PlatformContext);
  if (!ctx) {
    throw new Error("usePlatform must be used within PlatformProvider");
  }
  return ctx;
}
