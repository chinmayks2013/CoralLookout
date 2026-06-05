"use client";

import { useCallback, useState } from "react";
import {
  Upload,
  Loader2,
  AlertCircle,
  MapPin,
  CheckCircle,
  ImageIcon,
  ShieldCheck,
} from "lucide-react";
import { compressImageForGallery } from "@/lib/gallery/image";
import {
  analyzeReefImage,
  getHealthColor,
} from "@/lib/scanner/analyze";
import type { ScanResult } from "@/lib/types";
import { usePlatform } from "@/context/PlatformContext";
import Link from "next/link";

export function CoralScanner() {
  const { recordScan, state } = usePlatform();
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [locating, setLocating] = useState(false);
  const [saved, setSaved] = useState(false);
  const [shareToGallery, setShareToGallery] = useState(false);
  const [imageRightsConfirmed, setImageRightsConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);

  const resetScan = useCallback(() => {
    setPreview(null);
    setResult(null);
    setLocationName("");
    setLat(null);
    setLng(null);
    setSaved(false);
    setShareToGallery(false);
    setImageRightsConfirmed(false);
    setError(null);
  }, []);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPG, PNG, WebP).");
      return;
    }
    setError(null);
    setResult(null);
    setSaved(false);
    setShareToGallery(false);
    setImageRightsConfirmed(false);
    setLocationName("");
    setLat(null);
    setLng(null);
    const url = URL.createObjectURL(file);
    setPreview(url);
    setLoading(true);
    try {
      const analysis = await analyzeReefImage(url);
      setResult(analysis);
    } catch {
      setError("Analysis failed. Please try another image.");
    } finally {
      setLoading(false);
    }
  }, []);

  const useMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported in this browser.");
      return;
    }
    setLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setLocating(false);
      },
      () => {
        setError("Could not get your location. Enter coordinates manually or type a reef name.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const saveToMap = useCallback(async () => {
    if (!result || !preview) return;
    if (!locationName.trim()) {
      setError("Enter a location name (e.g. Great Barrier Reef — Cairns).");
      return;
    }
    if (lat === null || lng === null) {
      setError("Add a map location using “Use my location” or enter latitude/longitude.");
      return;
    }
    if (shareToGallery && !state.profile) {
      setError("Register on Community before sharing to the gallery.");
      return;
    }
    if (shareToGallery && !imageRightsConfirmed) {
      setError(
        "Confirm that you have the rights to share this image before publishing to the gallery."
      );
      return;
    }
    setSaving(true);
    setError(null);
    try {
      let imageDataUrl: string | undefined;
      if (shareToGallery) {
        imageDataUrl = await compressImageForGallery(preview);
      }
      const { galleryPublished, galleryError } = await recordScan(
        result,
        {
          locationName: locationName.trim(),
          lat,
          lng,
        },
        {
          shareToGallery,
          imageDataUrl,
          imageRightsConfirmed: shareToGallery && imageRightsConfirmed,
        }
      );
      if (shareToGallery && !galleryPublished) {
        setError(
          galleryError ??
            "Scan saved to your map, but gallery is offline. Set up Supabase (see Gallery page)."
        );
      }
      setSaved(true);
    } catch {
      setError("Could not save observation.");
    } finally {
      setSaving(false);
    }
  }, [
    result,
    preview,
    locationName,
    lat,
    lng,
    shareToGallery,
    imageRightsConfirmed,
    state.profile,
    recordScan,
  ]);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-4">
        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          className="relative glass rounded-2xl border-2 border-dashed border-cyan-500/30 p-8 text-center min-h-[320px] flex flex-col items-center justify-center hover:border-cyan-400/50 transition-colors"
        >
          <input
            type="file"
            accept="image/*"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          {preview ? (
            <article className="relative w-full aspect-video rounded-xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Reef preview"
                className="w-full h-full object-cover"
              />
              {result &&
                result.damageZones.map((zone, i) => (
                  <div
                    key={i}
                    className="absolute border-2 border-red-400/80 bg-red-500/20 rounded"
                    style={{
                      left: `${zone.x}%`,
                      top: `${zone.y}%`,
                      width: `${zone.w}%`,
                      height: `${zone.h}%`,
                    }}
                  />
                ))}
              {loading && (
                <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center">
                  <Loader2 className="h-10 w-10 text-cyan-400 animate-spin" />
                </div>
              )}
            </article>
          ) : (
            <>
              <Upload className="h-12 w-12 text-cyan-400 mb-4 mx-auto" />
              <p className="text-lg font-medium mb-1">
                Drop a coral reef image here
              </p>
              <p className="text-sm text-slate-400">
                or click to browse — JPG, PNG, WebP
              </p>
            </>
          )}
        </div>
        {error && (
          <p className="flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </p>
        )}
        <p className="text-xs text-slate-500">
          Scans are saved with a real map location — only your observations appear on the Global Map.
        </p>
      </div>

      <div className="space-y-4">
        {loading && !result && (
          <article className="glass rounded-2xl p-8 text-center">
            <Loader2 className="h-8 w-8 text-cyan-400 animate-spin mx-auto mb-4" />
            <p className="text-cyan-300 font-medium">AI analyzing reef health...</p>
          </article>
        )}

        {result && (
          <article className="glass rounded-2xl p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span
                className="text-xl sm:text-2xl font-bold"
                style={{ color: getHealthColor(result.health) }}
              >
                {result.label}
              </span>
              <span className="rounded-full bg-slate-800 px-3 sm:px-4 py-1 text-xs sm:text-sm font-semibold text-cyan-300 shrink-0">
                {result.confidence}% confidence
              </span>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed">{result.explanation}</p>

            {!saved ? (
              <section className="border-t border-cyan-500/20 pt-4 space-y-3">
                <h3 className="text-sm font-semibold text-cyan-300 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Pin this observation on the map
                </h3>
                <input
                  type="text"
                  placeholder="Reef / site name"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full rounded-lg bg-slate-800/50 border border-cyan-500/20 px-4 py-2 text-sm"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    step="any"
                    placeholder="Latitude"
                    value={lat ?? ""}
                    onChange={(e) =>
                      setLat(e.target.value ? Number(e.target.value) : null)
                    }
                    className="rounded-lg bg-slate-800/50 border border-cyan-500/20 px-3 py-2 text-sm"
                  />
                  <input
                    type="number"
                    step="any"
                    placeholder="Longitude"
                    value={lng ?? ""}
                    onChange={(e) =>
                      setLng(e.target.value ? Number(e.target.value) : null)
                    }
                    className="rounded-lg bg-slate-800/50 border border-cyan-500/20 px-3 py-2 text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={useMyLocation}
                  disabled={locating}
                  className="w-full rounded-lg border border-cyan-500/40 py-2 text-sm text-cyan-300 hover:bg-cyan-500/10"
                >
                  {locating ? "Getting location…" : "Use my location"}
                </button>
                <label className="flex items-start gap-3 rounded-lg border border-violet-500/30 bg-violet-500/10 p-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shareToGallery}
                    onChange={(e) => {
                      setShareToGallery(e.target.checked);
                      if (!e.target.checked) setImageRightsConfirmed(false);
                    }}
                    className="mt-1 accent-violet-500"
                  />
                  <span className="text-sm text-left">
                    <span className="font-medium text-violet-200 flex items-center gap-1">
                      <ImageIcon className="h-4 w-4" />
                      Display on Reef Gallery?
                    </span>
                    <span className="text-slate-400 block text-xs mt-1">
                      Share publicly so others can comment, donate corals, and view
                      your post (+15 corals). Grows your Coral Enthusiast profile and view count.
                    </span>
                  </span>
                </label>
                {shareToGallery && (
                  <label className="flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-950/30 p-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={imageRightsConfirmed}
                      onChange={(e) => setImageRightsConfirmed(e.target.checked)}
                      className="mt-1 accent-amber-500"
                      required
                    />
                    <span className="text-sm text-left">
                      <span className="font-medium text-amber-200 flex items-center gap-1">
                        <ShieldCheck className="h-4 w-4 shrink-0" />
                        Image rights confirmation (required)
                      </span>
                      <span className="text-amber-100/80 block text-xs mt-1 leading-relaxed">
                        I confirm that I took this photo myself, or I have explicit
                        permission from the copyright holder to publish it on Coral
                        Lookout. I understand that posting images without proper rights
                        may violate others&apos; intellectual property.
                      </span>
                    </span>
                  </label>
                )}
                <button
                  type="button"
                  onClick={saveToMap}
                  disabled={
                    saving ||
                    (shareToGallery && !imageRightsConfirmed)
                  }
                  className="w-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 py-3 font-semibold text-slate-900 disabled:opacity-60"
                >
                  {saving
                    ? "Saving…"
                    : shareToGallery
                      ? "Save & publish to gallery"
                      : "Save observation (+50 pts)"}
                </button>
              </section>
            ) : (
              <section className="border-t border-teal-500/30 pt-4 space-y-2">
                <p className="flex items-center gap-2 text-teal-400 text-sm font-medium">
                  <CheckCircle className="h-4 w-4" />
                  Saved to your map and research dashboard
                </p>
                <p className="text-sm text-slate-400">
                  {locationName} · {lat?.toFixed(4)}, {lng?.toFixed(4)}
                </p>
                <div className="flex gap-3 flex-wrap text-sm">
                  <Link href="/map" className="text-cyan-300 underline">
                    View on map
                  </Link>
                  {shareToGallery && (
                    <Link href="/gallery" className="text-violet-300 underline">
                      Reef Gallery
                    </Link>
                  )}
                  <Link href="/research" className="text-cyan-300 underline">
                    Research
                  </Link>
                  <button
                    type="button"
                    onClick={resetScan}
                    className="text-slate-400 underline"
                  >
                    Scan another
                  </button>
                </div>
              </section>
            )}
          </article>
        )}

        {!loading && !result && (
          <article className="glass rounded-2xl p-8 text-center text-slate-400">
            <p>Upload a reef image to analyze and pin on your map.</p>
          </article>
        )}
      </div>
    </div>
  );
}
