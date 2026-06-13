"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface LocationPinPickerInnerProps {
  lat: number | null;
  lng: number | null;
  onPick: (lat: number, lng: number) => void;
}

function MapClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function FlyToPin({ lat, lng }: { lat: number | null; lng: number | null }) {
  const map = useMap();
  useEffect(() => {
    if (lat !== null && lng !== null) {
      map.flyTo([lat, lng], Math.max(map.getZoom(), 4), { duration: 0.6 });
    }
  }, [lat, lng, map]);
  return null;
}

export function LocationPinPickerInner({
  lat,
  lng,
  onPick,
}: LocationPinPickerInnerProps) {
  const center: [number, number] =
    lat !== null && lng !== null ? [lat, lng] : [10, 0];
  const zoom = lat !== null && lng !== null ? 5 : 2;

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="h-full w-full rounded-lg"
      scrollWheelZoom
      worldCopyJump
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <MapClickHandler onPick={onPick} />
      <FlyToPin lat={lat} lng={lng} />
      {lat !== null && lng !== null && (
        <CircleMarker
          center={[lat, lng]}
          radius={10}
          pathOptions={{
            color: "#22d3ee",
            fillColor: "#06b6d4",
            fillOpacity: 0.9,
            weight: 3,
          }}
        />
      )}
    </MapContainer>
  );
}
