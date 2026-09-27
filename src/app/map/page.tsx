import { Suspense } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ReefMap } from "@/components/map/ReefMap";

/** Reef map shell + research metadata are safe to edge-cache for a day. */
export const revalidate = 86400;

export default function MapPage() {
  return (
    <div className="mx-auto max-w-7xl px-3 py-8 sm:px-6 sm:py-12 min-w-0">
      <PageHeader
        badge="Global Network"
        title="Global Reef Map"
        subtitle="NOAA satellite bleaching data plus documented research sites — alongside your own scan pins."
      />
      <Suspense fallback={<p className="text-center text-slate-400 py-12">Loading map…</p>}>
        <ReefMap />
      </Suspense>
    </div>
  );
}
