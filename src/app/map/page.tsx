import { PageHeader } from "@/components/ui/PageHeader";
import { ReefMap } from "@/components/map/ReefMap";

export default function MapPage() {
  return (
    <div className="mx-auto max-w-7xl px-3 py-8 sm:px-6 sm:py-12 min-w-0">
      <PageHeader
        badge="Global Network"
        title="Global Reef Map"
        subtitle="NOAA satellite bleaching data plus documented research sites — alongside your own scan pins."
      />
      <ReefMap />
    </div>
  );
}
