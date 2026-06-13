"use client";

import { PlatformProvider } from "@/context/PlatformContext";
import { AuthProvider } from "@/context/AuthContext";
import { GalleryProvider } from "@/context/GalleryContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PlatformProvider>
      <AuthProvider>
        <GalleryProvider>{children}</GalleryProvider>
      </AuthProvider>
    </PlatformProvider>
  );
}
