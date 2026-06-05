"use client";

import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  WMSTileLayer,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { ReefMarker } from "@/lib/types";
import type { ResearchSite } from "@/lib/data/world-research";
import {
  ALERT_COLORS,
  ALERT_LABELS,
  NOAA_WMS,
} from "@/lib/data/world-research";
import { getHealthColor, getHealthLabel } from "@/lib/scanner/analyze";

interface ReefMapInnerProps {
  userMarkers: ReefMarker[];
  researchSites: ResearchSite[];
  center: [number, number];
  zoom: number;
  showNoaaLayer: boolean;
  showUserPins: boolean;
  showResearchPins: boolean;
}

export function ReefMapInner({
  userMarkers,
  researchSites,
  center,
  zoom,
  showNoaaLayer,
  showUserPins,
  showResearchPins,
}: ReefMapInnerProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="h-full w-full rounded-xl"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      {showNoaaLayer && (
        <WMSTileLayer
          url={NOAA_WMS.url}
          layers={NOAA_WMS.layers}
          format="image/png"
          transparent
          opacity={0.65}
          version="1.3.0"
          attribution={NOAA_WMS.attribution}
        />
      )}

      {showResearchPins &&
        researchSites.map((site) => (
          <CircleMarker
            key={site.id}
            center={[site.lat, site.lng]}
            radius={9}
            pathOptions={{
              color: ALERT_COLORS[site.alertLevel],
              fillColor: ALERT_COLORS[site.alertLevel],
              fillOpacity: 0.85,
              weight: 2,
              dashArray: "4 4",
            }}
          >
            <Popup maxWidth={280}>
              <strong>{site.name}</strong>
              <br />
              <span style={{ color: ALERT_COLORS[site.alertLevel] }}>
                {ALERT_LABELS[site.alertLevel]}
              </span>
              <br />
              <span style={{ fontSize: "12px" }}>
                SST anomaly ~+{site.sstAnomalyC}°C · {site.asOf}
              </span>
              <p style={{ fontSize: "11px", marginTop: "6px" }}>
                {site.summary}
              </p>
              <a
                href={site.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: "11px" }}
              >
                {site.source}
              </a>
            </Popup>
          </CircleMarker>
        ))}

      {showUserPins &&
        userMarkers.map((marker) => (
          <CircleMarker
            key={marker.id}
            center={[marker.lat, marker.lng]}
            radius={11}
            pathOptions={{
              color: getHealthColor(marker.health),
              fillColor: getHealthColor(marker.health),
              fillOpacity: 0.85,
              weight: 3,
            }}
          >
            <Popup>
              <strong>{marker.name}</strong>
              <br />
              {getHealthLabel(marker.health)}
              <br />
              <span style={{ fontSize: "12px" }}>
                Your observation · {marker.lastUpdated}
              </span>
            </Popup>
          </CircleMarker>
        ))}
    </MapContainer>
  );
}
