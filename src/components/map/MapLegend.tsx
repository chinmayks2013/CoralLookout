import {
  ALERT_COLORS,
  ALERT_LABELS,
  NOAA_WMS,
} from "@/lib/data/world-research";

export function MapLegend({ showNoaa }: { showNoaa: boolean }) {
  return (
    <aside className="glass rounded-xl p-4 text-xs space-y-3">
      <p className="font-semibold text-cyan-300">Map legend</p>
      {showNoaa && (
        <div>
          <p className="text-slate-400 mb-2">NOAA heat-stress overlay</p>
          <p className="text-slate-500 leading-relaxed">
            Satellite Bleaching Alert Area (7-day max). Warmer colors = higher
            alert.{" "}
            <a
              href={NOAA_WMS.infoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 underline"
            >
              CRW docs
            </a>
          </p>
        </div>
      )}
      <div>
        <p className="text-slate-400 mb-2">Research monitoring sites</p>
        <ul className="space-y-1">
          {([4, 3, 2, 1] as const).map((level) => (
            <li key={level} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full border border-dashed border-white/30"
                style={{ backgroundColor: ALERT_COLORS[level] }}
              />
              <span className="text-slate-300">{ALERT_LABELS[level]}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="text-slate-400 mb-1">Your observations</p>
        <p className="flex items-center gap-2 text-slate-300">
          <span className="h-3 w-3 rounded-full bg-cyan-400" />
          Solid pin = your AI scan
        </p>
      </div>
    </aside>
  );
}
