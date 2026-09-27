"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Upload,
  Loader2,
  AlertCircle,
  MapPin,
  CheckCircle,
  ImageIcon,
  ShieldCheck,
  ClipboardList,
} from "lucide-react";
import { compressImageForGallery } from "@/lib/gallery/image";
import { getHealthColor } from "@/lib/scanner/analyze";
import { fileFromDropSnapshot, isImageDrag, snapshotDataTransfer } from "@/lib/scanner/drop-image";
import { runPipelineAnalysis, PipelineAnalysisError } from "@/lib/pipeline/client";
import type { ConservationPlan, PipelineStepTrace, ReefValidationResult } from "@/lib/pipeline/types";
import type { ScanResult } from "@/lib/types";
import { usePlatform } from "@/context/PlatformContext";
import Link from "next/link";
import { PipelineProgress } from "@/components/scanner/PipelineProgress";
import { ConservationPlanCard } from "@/components/scanner/ConservationPlanCard";
import { LocationPinPicker } from "@/components/scanner/LocationPinPicker";
import { AiTrustPanel } from "@/components/scanner/AiTrustPanel";
import { useAuth } from "@/context/AuthContext";
import { ReviewBadge, type ReviewStatus } from "@/components/ui/ReviewBadge";
import { GraduationCap } from "lucide-react";
import {
  completeAssignment,
  fetchAssignment,
  fetchStudentClass,
  type SchoolAssignmentDto,
} from "@/lib/school/cloud";

export function CoralScanner() {
  const searchParams = useSearchParams();
  const assignmentIdFromUrl = searchParams.get("assignmentId");
  const { recordScan, state } = usePlatform();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragDepthRef = useRef(0);
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
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStepTrace[]>([]);
  const [conservationPlan, setConservationPlan] = useState<ConservationPlan | null>(null);
  const [modelVersion, setModelVersion] = useState<string | null>(null);
  const [wandbRunUrl, setWandbRunUrl] = useState<string | undefined>();
  const [rejection, setRejection] = useState<ReefValidationResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [notes, setNotes] = useState("");
  const [requestReview, setRequestReview] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>("none");
  const [activeAssignmentId, setActiveAssignmentId] = useState<string | null>(
    assignmentIdFromUrl
  );
  const [activeAssignment, setActiveAssignment] =
    useState<SchoolAssignmentDto | null>(null);
  const [openAssignments, setOpenAssignments] = useState<SchoolAssignmentDto[]>(
    []
  );
  const [assignmentCompleteNote, setAssignmentCompleteNote] = useState<
    string | null
  >(null);

  useEffect(() => {
    void fetch("/api/pipeline/analyze").catch(() => {});
  }, []);

  useEffect(() => {
    setActiveAssignmentId(assignmentIdFromUrl);
  }, [assignmentIdFromUrl]);

  useEffect(() => {
    if (!activeAssignmentId) {
      setActiveAssignment(null);
      return;
    }
    let cancelled = false;
    void fetchAssignment(activeAssignmentId)
      .then((a) => {
        if (!cancelled) setActiveAssignment(a);
      })
      .catch(() => {
        if (!cancelled) setActiveAssignment(null);
      });
    return () => {
      cancelled = true;
    };
  }, [activeAssignmentId]);

  useEffect(() => {
    if (!state.userId || activeAssignmentId) {
      setOpenAssignments([]);
      return;
    }
    let cancelled = false;
    void fetchStudentClass(state.userId)
      .then((data) => {
        if (cancelled || !data.enrolled) return;
        const done = new Set(
          (data.myCompletions ?? []).map((c) => c.assignmentId)
        );
        setOpenAssignments(
          (data.assignments ?? []).filter((a) => !done.has(a.id))
        );
      })
      .catch(() => {
        if (!cancelled) setOpenAssignments([]);
      });
    return () => {
      cancelled = true;
    };
  }, [state.userId, activeAssignmentId]);

  const resetScan = useCallback(() => {
    setPreview(null);
    setResult(null);
    setPipelineSteps([]);
    setConservationPlan(null);
    setModelVersion(null);
    setWandbRunUrl(undefined);
    setRejection(null);
    setLocationName("");
    setLat(null);
    setLng(null);
    setSaved(false);
    setShareToGallery(false);
    setImageRightsConfirmed(false);
    setError(null);
    setIsDragging(false);
    setNotes("");
    setRequestReview(false);
    setReviewStatus("none");
    setAssignmentCompleteNote(null);
    dragDepthRef.current = 0;
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleFile = useCallback(async (file: File) => {
    const looksLikeImage =
      file.type.startsWith("image/") ||
      /\.(jpe?g|png|webp|gif|bmp|heic|avif)$/i.test(file.name);
    if (!looksLikeImage) {
      setError("Please upload an image file (JPG, PNG, WebP).");
      setLoading(false);
      return;
    }
    const imageFile = file.type.startsWith("image/")
      ? file
      : new File([file], file.name || "reef-image.jpg", {
          type: "image/jpeg",
        });
    setError(null);
    setResult(null);
    setPipelineSteps([]);
    setConservationPlan(null);
    setModelVersion(null);
    setWandbRunUrl(undefined);
    setRejection(null);
    setSaved(false);
    setShareToGallery(false);
    setImageRightsConfirmed(false);
    setLocationName("");
    setLat(null);
    setLng(null);
    setIsDragging(false);
    setNotes("");
    setRequestReview(false);
    setReviewStatus("none");
    dragDepthRef.current = 0;
    const url = URL.createObjectURL(imageFile);
    setPreview(url);
    setLoading(true);
    try {
      const pipeline = await runPipelineAnalysis(imageFile, state.userId);
      setResult(pipeline.scan);
      setPipelineSteps(pipeline.steps);
      setConservationPlan(pipeline.plan);
      setModelVersion(pipeline.modelVersion);
      setWandbRunUrl(pipeline.wandbRunUrl);
    } catch (err) {
      if (err instanceof PipelineAnalysisError && err.validation) {
        setRejection(err.validation);
        setError(err.message);
      } else {
        setError(
          err instanceof Error ? err.message : "Pipeline analysis failed."
        );
      }
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [state.userId]);

  const ingestSnapshot = useCallback(
    async (snapshot: ReturnType<typeof snapshotDataTransfer>) => {
      if (loading) return;
      setError(null);
      setIsDragging(false);
      dragDepthRef.current = 0;
      setLoading(true);
      try {
        const file = await fileFromDropSnapshot(snapshot);
        if (!file) {
          setError(
            "Could not read that image. Drop a photo file, or drag an image from another browser tab."
          );
          setLoading(false);
          return;
        }
        await handleFile(file);
      } catch {
        setError(
          "Could not load the dropped image. Try saving it and dropping the file."
        );
        setLoading(false);
      }
    },
    [handleFile, loading]
  );

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
      setError("Drop a pin on the map, use “Use my location”, or enter coordinates.");
      return;
    }
    if (shareToGallery && !user) {
      setError("Sign in to share scans to the gallery.");
      return;
    }
    if (shareToGallery && !state.profile?.name?.trim()) {
      setError("Add a display name on Community before sharing to the gallery.");
      return;
    }
    if (shareToGallery && !imageRightsConfirmed) {
      setError(
        "Confirm that you have the rights to share this image before publishing to the gallery."
      );
      return;
    }
    if (
      activeAssignment?.requiresPin &&
      (lat === null || lng === null)
    ) {
      setError("This assignment requires a pinned location before you can turn it in.");
      return;
    }
    setSaving(true);
    setError(null);
    setAssignmentCompleteNote(null);
    try {
      let imageDataUrl: string | undefined;
      if (shareToGallery) {
        imageDataUrl = await compressImageForGallery(preview);
      }
      const { scanId, galleryPublished, galleryError, cloudSaved, cloudError } =
        await recordScan(
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
          notes: notes.trim() || undefined,
          modelVersion: modelVersion ?? undefined,
        }
      );
      if (!cloudSaved && user) {
        setError(
          cloudError ??
            "Scan saved on this device, but could not sync to your account. Run supabase/migrations/007_user_scans.sql if the table is missing."
        );
      } else if (shareToGallery && !galleryPublished) {
        setError(
          galleryError ??
            "Scan saved to your map, but gallery is offline. Set up Supabase (see Gallery page)."
        );
      }
      if (requestReview && cloudSaved && user) {
        try {
          const res = await fetch("/api/school/reviews", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ scanId, userId: user.id }),
          });
          const data = await res.json();
          if (res.ok) setReviewStatus(data.reviewStatus as ReviewStatus);
        } catch {
          // Non-fatal — review request is a bonus, save already succeeded.
        }
      }
      if (activeAssignmentId && cloudSaved && user) {
        const pinOk = !activeAssignment?.requiresPin || (lat !== null && lng !== null);
        const scanOk = activeAssignment?.requiresScan !== false;
        if (pinOk && scanOk) {
          try {
            await completeAssignment({
              assignmentId: activeAssignmentId,
              userId: user.id,
              scanId,
            });
            setAssignmentCompleteNote(
              activeAssignment?.title
                ? `Marked complete for “${activeAssignment.title}”.`
                : "Marked complete for your class assignment."
            );
          } catch {
            setError(
              "Scan saved, but class assignment could not be marked complete. Try again from My Class."
            );
          }
        }
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
    notes,
    modelVersion,
    requestReview,
    state.profile,
    user,
    recordScan,
    activeAssignmentId,
    activeAssignment,
  ]);

  const onDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (loading || !isImageDrag(e.dataTransfer)) return;
      dragDepthRef.current += 1;
      setIsDragging(true);
    },
    [loading]
  );

  const onDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (loading || !isImageDrag(e.dataTransfer)) return;
      e.dataTransfer.dropEffect = "copy";
    },
    [loading]
  );

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
    if (dragDepthRef.current === 0) setIsDragging(false);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      // Snapshot synchronously — browsers clear DataTransfer after this handler returns.
      const snapshot = snapshotDataTransfer(e.dataTransfer);
      void ingestSnapshot(snapshot);
    },
    [ingestSnapshot]
  );

  const openFilePicker = useCallback(() => {
    if (loading) return;
    fileInputRef.current?.click();
  }, [loading]);

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      if (loading || !e.clipboardData) return;
      const dt = e.clipboardData;
      const hasImage =
        Array.from(dt.items || []).some(
          (item) => item.kind === "file" && item.type.startsWith("image/")
        ) ||
        Array.from(dt.files || []).some((f) => f.type.startsWith("image/"));
      if (!hasImage) return;
      e.preventDefault();
      const snapshot = snapshotDataTransfer(dt);
      void ingestSnapshot(snapshot);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [ingestSnapshot, loading]);

  return (
    <div className="space-y-4">
      {activeAssignment && (
        <aside className="rounded-xl border border-teal-500/30 bg-teal-950/25 px-4 py-3 text-sm text-teal-100">
          <p className="font-semibold flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-teal-300" />
            Class assignment: {activeAssignment.title}
          </p>
          <p className="text-xs text-teal-200/80 mt-1">
            {activeAssignment.requiresScan ? "Scan a reef photo" : "Scan optional"}
            {" · "}
            {activeAssignment.requiresPin
              ? "Pin it on the map before saving"
              : "Pin optional"}
            . Saving a matching observation will mark this work complete.
          </p>
          <Link href="/class" className="text-xs text-cyan-300 underline mt-2 inline-block">
            Back to My Class
          </Link>
        </aside>
      )}

      {!activeAssignmentId && openAssignments.length > 0 && (
        <aside className="rounded-xl border border-cyan-500/25 bg-cyan-950/20 px-4 py-3 text-sm">
          <label className="block text-cyan-100 font-medium mb-1.5">
            Attach to open class assignment (optional)
          </label>
          <select
            value=""
            onChange={(e) => {
              const id = e.target.value;
              if (id) setActiveAssignmentId(id);
            }}
            className="w-full rounded-lg bg-slate-900/60 border border-cyan-500/25 px-3 py-2 text-sm text-slate-200"
          >
            <option value="">Don&apos;t attach</option>
            {openAssignments.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title}
              </option>
            ))}
          </select>
        </aside>
      )}

    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/*"
          className="sr-only"
          tabIndex={-1}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload coral reef image. Drop an image here or press Enter to browse."
          onDrop={onDrop}
          onDragEnter={onDragEnter}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={openFilePicker}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openFilePicker();
            }
          }}
          className={`relative glass rounded-2xl border-2 border-dashed p-8 text-center min-h-[320px] flex flex-col items-center justify-center transition-colors cursor-pointer ${
            isDragging
              ? "border-cyan-300 bg-cyan-500/15 scale-[1.01]"
              : "border-cyan-500/30 hover:border-cyan-400/50"
          } ${loading ? "pointer-events-none" : ""}`}
        >
          {isDragging && (
            <div className="pointer-events-none absolute inset-3 z-10 flex items-center justify-center rounded-xl border-2 border-dashed border-cyan-300/80 bg-slate-950/80">
              <p className="text-cyan-200 font-medium">Drop image to analyze</p>
            </div>
          )}
          {preview ? (
            <article className="relative w-full aspect-video rounded-xl overflow-hidden pointer-events-none">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Reef preview"
                className="w-full h-full object-cover"
                draggable={false}
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
              {!loading && !isDragging && (
                <p className="absolute bottom-2 inset-x-2 rounded-lg bg-slate-950/75 px-2 py-1 text-xs text-slate-300">
                  Drop a new image or click to replace
                </p>
              )}
            </article>
          ) : (
            <>
              <Upload className="h-12 w-12 text-cyan-400 mb-4 mx-auto" />
              <p className="text-lg font-medium mb-1">
                Drop a coral reef image here
              </p>
              <p className="text-sm text-slate-400">
                From your files or another browser tab — or click to browse / paste
              </p>
            </>
          )}
        </div>
        {error && (
          <div className="space-y-2">
            <p className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </p>
            {rejection && (
              <article className="rounded-xl border border-red-500/30 bg-red-950/20 p-4 text-sm space-y-2">
                <p className="font-semibold text-red-200">
                  Not recognized as a coral reef
                </p>
                <p className="text-slate-300">
                  Detected: <span className="text-red-100">{rejection.detectedSubject}</span>
                </p>
                <p className="text-slate-400 text-xs">
                  {rejection.reason} · {Math.round(rejection.confidence * 100)}% confidence ·{" "}
                  {rejection.provider}/{rejection.model}
                </p>
                <p className="text-slate-500 text-xs">
                  Try a clearer underwater coral photo (blue/green water, coral structures). Non-reef images are blocked before health analysis.
                </p>
              </article>
            )}
          </div>
        )}
        <p className="text-xs text-slate-500">
          Runs the AI coral-saving pipeline: preprocess → AI reef detection → classify → localize → conserve.
        </p>
      </div>

      <div className="space-y-4">
        {loading && !result && (
          <>
            <PipelineProgress steps={[]} active modelVersion="running…" />
            <article className="glass rounded-2xl p-8 text-center">
              <Loader2 className="h-8 w-8 text-violet-400 animate-spin mx-auto mb-4" />
              <p className="text-violet-200 font-medium">
                Orchestrating coral-saving pipeline…
              </p>
              <p className="text-slate-500 text-sm mt-2">
                Preprocess → AI reef check → classify → localize → conserve
              </p>
            </article>
          </>
        )}

        {(pipelineSteps.length > 0 || loading) && result && (
          <PipelineProgress
            steps={pipelineSteps}
            modelVersion={modelVersion ?? undefined}
            wandbRunUrl={wandbRunUrl}
          />
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

            <AiTrustPanel
              confidence={result.confidence}
              modelVersion={modelVersion}
              compact
            />

            {conservationPlan && (
              <ConservationPlanCard plan={conservationPlan} />
            )}

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
                <LocationPinPicker
                  lat={lat}
                  lng={lng}
                  onPick={(pickLat, pickLng) => {
                    setLat(pickLat);
                    setLng(pickLng);
                    setError(null);
                  }}
                />
                {lat === null || lng === null ? (
                  <p className="text-xs text-amber-200/90 rounded-lg border border-amber-500/30 bg-amber-950/20 px-3 py-2">
                    A pinned location makes this observation useful for research,
                    the map, and your class leaderboard. Drop a pin above, tap
                    &ldquo;Use my location&rdquo;, or enter coordinates manually —
                    it&apos;s required before saving.
                  </p>
                ) : null}
                <details className="text-sm">
                  <summary className="cursor-pointer text-slate-400 hover:text-slate-300">
                    Or enter coordinates manually
                  </summary>
                  <div className="grid grid-cols-2 gap-2 mt-2">
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
                </details>
                <button
                  type="button"
                  onClick={useMyLocation}
                  disabled={locating}
                  className="w-full rounded-lg border border-cyan-500/40 py-2 text-sm text-cyan-300 hover:bg-cyan-500/10"
                >
                  {locating ? "Getting location…" : "Use my location"}
                </button>
                <label className="block text-sm text-slate-400">
                  Notes (optional)
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Anything worth flagging for teachers or researchers — e.g. recent storm, visible bleaching edge, current strength."
                    rows={2}
                    maxLength={500}
                    className="mt-1.5 w-full rounded-lg bg-slate-800/50 border border-cyan-500/20 px-3 py-2 text-sm text-slate-200 resize-none"
                  />
                </label>
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
                {!user && (
                  <p className="text-xs text-amber-200/90 rounded-lg border border-amber-500/30 bg-amber-950/20 px-3 py-2">
                    <Link href="/login?next=/scanner" className="underline text-amber-100">
                      Sign in
                    </Link>{" "}
                    to save scans to your account and sync across devices.
                  </p>
                )}
                {user && (
                  <label className="flex items-start gap-3 rounded-lg border border-cyan-500/25 bg-cyan-500/5 p-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requestReview}
                      onChange={(e) => setRequestReview(e.target.checked)}
                      className="mt-1 accent-cyan-500"
                    />
                    <span className="text-sm text-left">
                      <span className="font-medium text-cyan-200 flex items-center gap-1">
                        <GraduationCap className="h-4 w-4" />
                        Request educator review (optional)
                      </span>
                      <span className="text-slate-400 block text-xs mt-1">
                        Flags this scan for your teacher to verify — useful for
                        assignments where a human check matters.
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
                  {user
                    ? "Saved to your account, map, and research dashboard"
                    : "Saved on this device — sign in to sync to your account"}
                </p>
                {assignmentCompleteNote && (
                  <p className="flex items-center gap-2 text-cyan-300 text-sm font-medium rounded-lg border border-cyan-500/30 bg-cyan-950/30 px-3 py-2">
                    <ClipboardList className="h-4 w-4 shrink-0" />
                    {assignmentCompleteNote}{" "}
                    <Link href="/class" className="underline">
                      View My Class
                    </Link>
                  </p>
                )}
                <p className="text-sm text-slate-400">
                  {locationName} · {lat?.toFixed(4)}, {lng?.toFixed(4)}
                </p>
                {reviewStatus !== "none" && <ReviewBadge status={reviewStatus} />}
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
          <article className="glass rounded-2xl p-8 text-center text-slate-400 space-y-2">
            <p>Upload a reef image to run the AI conservation pipeline.</p>
            <p className="text-xs text-slate-500">
              Non-reef images are rejected by AI vision before health analysis runs.
            </p>
          </article>
        )}
      </div>
    </div>
    </div>
  );
}
