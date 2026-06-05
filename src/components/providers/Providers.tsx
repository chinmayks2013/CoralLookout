"use client";

import { PlatformProvider } from "@/context/PlatformContext";
import { GalleryProvider } from "@/context/GalleryContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PlatformProvider>
      <GalleryProvider>{children}</GalleryProvider>
    </PlatformProvider>
  );
}
