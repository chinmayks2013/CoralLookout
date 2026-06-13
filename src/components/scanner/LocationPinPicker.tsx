"use client";

import { useEffect, useState } from "react";
import { Globe } from "lucide-react";

interface LocationPinPickerProps {
  lat: number | null;
  lng: number | null;
  onPick: (lat: number, lng: number) => void;
}

export function LocationPinPicker({ lat, lng, onPick }: LocationPinPickerProps) {
  const [mounted, setMounted] = useState(false);
  const [Picker, setPicker] = useState<
    typeof import("./LocationPinPickerInner").LocationPinPickerInner | null
  >(null);

  useEffect(() => {
    setMounted(true);
    import("./LocationPinPickerInner").then((mod) => {
      setPicker(() => mod.LocationPinPickerInner);
    });
  }, []);

  return (
    <div className="space-y-2">
      <p className="text-xs text-slate-400 flex items-center gap-1.5">
        <Globe className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
        Click anywhere on the map to drop your pin
      </p>
      <div className="h-[220px] sm:h-[260px] rounded-lg overflow-hidden border border-cyan-500/20 bg-slate-900/50">
        {mounted && Picker ? (
          <Picker lat={lat} lng={lng} onPick={onPick} />
        ) : (
          <p className="h-full flex items-center justify-center text-sm text-slate-500">
            Loading map…
          </p>
        )}
      </div>
      {lat !== null && lng !== null && (
        <p className="text-xs text-cyan-300/80 tabular-nums">
          Pin: {lat.toFixed(4)}°, {lng.toFixed(4)}°
        </p>
      )}
    </div>
  );
}
