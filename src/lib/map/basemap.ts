/**
 * Free public basemap tiles (no API key).
 * CARTO dark_all now returns "API KEY REQUIRED" stubs — do not use cartocdn.
 * Esri tile path is {z}/{y}/{x} (not Leaflet's default {z}/{x}/{y}).
 */
export const BASEMAP = {
  url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
  attribution:
    "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ",
  maxZoom: 16,
} as const;
